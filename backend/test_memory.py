"""
OmniAI — Automated Tests for Memory Module & Flask API

Run with:  python -m pytest test_memory.py -v
"""

import json
import unittest
from unittest.mock import patch, MagicMock

from memory import SessionMemory, SYSTEM_PROMPT, MAX_HISTORY_LENGTH
from app import app


# ═══════════════════════════════════════════════
#  Unit tests for SessionMemory
# ═══════════════════════════════════════════════

class TestSessionMemory(unittest.TestCase):
    """Tests for the in-memory session store."""

    def setUp(self):
        self.mem = SessionMemory(max_messages=5)

    # --- basic operations ---

    def test_add_and_get(self):
        self.mem.add_message("s1", "user", "hello")
        history = self.mem.get_history("s1")
        self.assertEqual(len(history), 1)
        self.assertEqual(history[0], {"role": "user", "content": "hello"})

    def test_get_returns_copy(self):
        """Mutating the returned list must not affect internal state."""
        self.mem.add_message("s1", "user", "hi")
        history = self.mem.get_history("s1")
        history.clear()
        self.assertEqual(self.mem.message_count("s1"), 1)

    def test_clear(self):
        self.mem.add_message("s1", "user", "hi")
        self.mem.clear("s1")
        self.assertEqual(self.mem.message_count("s1"), 0)

    # --- trimming ---

    def test_auto_trim(self):
        for i in range(8):
            self.mem.add_message("s1", "user", f"msg {i}")
        # max_messages=5, so only the last 5 should remain
        self.assertEqual(self.mem.message_count("s1"), 5)
        self.assertEqual(self.mem.get_history("s1")[0]["content"], "msg 3")

    # --- session isolation ---

    def test_session_isolation(self):
        self.mem.add_message("alice", "user", "I'm Alice")
        self.mem.add_message("bob", "user", "I'm Bob")
        self.assertEqual(self.mem.message_count("alice"), 1)
        self.assertEqual(self.mem.message_count("bob"), 1)
        self.assertNotEqual(
            self.mem.get_history("alice"),
            self.mem.get_history("bob"),
        )

    # --- system prompt helper ---

    def test_history_with_system_prompt(self):
        self.mem.add_message("s1", "user", "hey")
        messages = self.mem.get_history_with_system_prompt("s1")
        self.assertEqual(messages[0]["role"], "system")
        self.assertEqual(messages[1]["role"], "user")

    # --- session listing ---

    def test_get_session_ids(self):
        self.mem.add_message("a", "user", "x")
        self.mem.add_message("b", "user", "y")
        ids = self.mem.get_session_ids()
        self.assertIn("a", ids)
        self.assertIn("b", ids)


# ═══════════════════════════════════════════════
#  Integration tests for Flask API
# ═══════════════════════════════════════════════

# A fake Ollama response used by all mocked calls
FAKE_OLLAMA_RESPONSE = {
    "message": {"role": "assistant", "content": "I am OmniAI!"},
    "done": True,
}


class TestChatAPI(unittest.TestCase):
    """Tests for /api/chat with Ollama mocked."""

    def setUp(self):
        app.config['TESTING'] = True
        self.client = app.test_client()
        # Clear default session before every test
        self.client.delete('/api/memory?session_id=default')

    @patch('app.requests.post')
    def test_chat_success(self, mock_post):
        mock_resp = MagicMock()
        mock_resp.json.return_value = FAKE_OLLAMA_RESPONSE
        mock_resp.raise_for_status = MagicMock()
        mock_post.return_value = mock_resp

        res = self.client.post('/api/chat',
                               data=json.dumps({"message": "Hi"}),
                               content_type='application/json')
        body = res.get_json()

        self.assertEqual(res.status_code, 200)
        self.assertEqual(body['status'], 'success')
        self.assertEqual(body['response'], 'I am OmniAI!')
        self.assertEqual(body['session_id'], 'default')
        self.assertIn('memory_length', body)

    @patch('app.requests.post')
    def test_chat_builds_context(self, mock_post):
        """Verify that the system prompt + history are sent to Ollama."""
        mock_resp = MagicMock()
        mock_resp.json.return_value = FAKE_OLLAMA_RESPONSE
        mock_resp.raise_for_status = MagicMock()
        mock_post.return_value = mock_resp

        # Send two messages
        self.client.post('/api/chat',
                         data=json.dumps({"message": "My name is Karthi"}),
                         content_type='application/json')
        self.client.post('/api/chat',
                         data=json.dumps({"message": "What is my name?"}),
                         content_type='application/json')

        # Inspect what was sent to Ollama on the second call
        last_call_payload = mock_post.call_args_list[-1]
        sent_messages = last_call_payload.kwargs.get('json', last_call_payload[1].get('json', {}))['messages']

        # First message should be the system prompt
        self.assertEqual(sent_messages[0]['role'], 'system')
        # Should contain prior user + assistant messages + new user message
        roles = [m['role'] for m in sent_messages]
        self.assertIn('user', roles)
        self.assertIn('assistant', roles)

    def test_chat_missing_message(self):
        res = self.client.post('/api/chat',
                               data=json.dumps({}),
                               content_type='application/json')
        self.assertEqual(res.status_code, 400)

    @patch('app.requests.post')
    def test_session_isolation_via_api(self, mock_post):
        mock_resp = MagicMock()
        mock_resp.json.return_value = FAKE_OLLAMA_RESPONSE
        mock_resp.raise_for_status = MagicMock()
        mock_post.return_value = mock_resp

        self.client.post('/api/chat',
                         data=json.dumps({"message": "Hi", "session_id": "user-A"}),
                         content_type='application/json')
        self.client.post('/api/chat',
                         data=json.dumps({"message": "Hello", "session_id": "user-B"}),
                         content_type='application/json')

        res_a = self.client.get('/api/memory?session_id=user-A').get_json()
        res_b = self.client.get('/api/memory?session_id=user-B').get_json()

        # Each session should have 2 messages (user + assistant)
        self.assertEqual(res_a['memory_length'], 2)
        self.assertEqual(res_b['memory_length'], 2)
        self.assertNotEqual(res_a['messages'][0]['content'],
                            res_b['messages'][0]['content'])


class TestMemoryAPI(unittest.TestCase):
    """Tests for /api/memory GET & DELETE."""

    def setUp(self):
        app.config['TESTING'] = True
        self.client = app.test_client()
        self.client.delete('/api/memory?session_id=test')

    @patch('app.requests.post')
    def test_get_memory(self, mock_post):
        mock_resp = MagicMock()
        mock_resp.json.return_value = FAKE_OLLAMA_RESPONSE
        mock_resp.raise_for_status = MagicMock()
        mock_post.return_value = mock_resp

        self.client.post('/api/chat',
                         data=json.dumps({"message": "Hi", "session_id": "test"}),
                         content_type='application/json')

        res = self.client.get('/api/memory?session_id=test')
        body = res.get_json()
        self.assertEqual(body['session_id'], 'test')
        self.assertEqual(body['memory_length'], 2)  # user + assistant
        self.assertIn('system_prompt', body)

    def test_clear_memory(self):
        res = self.client.delete('/api/memory?session_id=test')
        body = res.get_json()
        self.assertEqual(body['status'], 'memory cleared')
        self.assertEqual(body['memory_length'], 0)


class TestHealthAPI(unittest.TestCase):
    """Tests for /api/health."""

    def setUp(self):
        app.config['TESTING'] = True
        self.client = app.test_client()

    def test_health(self):
        res = self.client.get('/api/health')
        body = res.get_json()
        self.assertEqual(res.status_code, 200)
        self.assertEqual(body['status'], 'running')
        self.assertIn('active_sessions', body)


if __name__ == '__main__':
    unittest.main()

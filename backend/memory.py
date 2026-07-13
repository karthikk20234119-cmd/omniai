"""
OmniAI — Session-based Conversation Memory Module

Stores per-session chat histories in memory and provides helper
methods to add, retrieve, trim, and clear messages.
"""

from collections import defaultdict
from typing import List, Dict

# ---------------------------------------------------------------------------
# System Prompt — prepended to every conversation sent to the LLM
# ---------------------------------------------------------------------------
SYSTEM_PROMPT: Dict[str, str] = {
    "role": "system",
    "content": (
        "You are OmniAI, an advanced AI assistant. "
        "You remember previous conversations and provide intelligent, "
        "context-aware responses. Be helpful, accurate, and concise."
    ),
}

# Maximum number of user + assistant messages kept per session
MAX_HISTORY_LENGTH = 10


class SessionMemory:
    """In-memory, session-isolated conversation store.

    Each *session_id* maps to an independent list of messages.
    Messages are automatically trimmed to ``MAX_HISTORY_LENGTH`` after
    every insertion so that context windows stay manageable.

    Example
    -------
    >>> mem = SessionMemory()
    >>> mem.add_message("sess-1", "user", "Hi!")
    >>> mem.get_history("sess-1")
    [{'role': 'user', 'content': 'Hi!'}]
    """

    def __init__(self, max_messages: int = MAX_HISTORY_LENGTH) -> None:
        self.max_messages = max_messages
        # defaultdict so that accessing a new session_id auto-creates an empty list
        self._store: Dict[str, List[Dict[str, str]]] = defaultdict(list)

    # ----- core operations ---------------------------------------------------

    def add_message(self, session_id: str, role: str, content: str) -> None:
        """Append a message and trim to *max_messages*."""
        self._store[session_id].append({"role": role, "content": content})
        self._trim(session_id)

    def get_history(self, session_id: str) -> List[Dict[str, str]]:
        """Return a *copy* of the conversation for *session_id*."""
        return list(self._store[session_id])

    def get_history_with_system_prompt(self, session_id: str) -> List[Dict[str, str]]:
        """Return [system_prompt] + conversation history — ready for Ollama."""
        return [SYSTEM_PROMPT] + self.get_history(session_id)

    def clear(self, session_id: str) -> None:
        """Delete all messages for *session_id*."""
        self._store[session_id] = []

    def get_session_ids(self) -> List[str]:
        """List all known session IDs."""
        return list(self._store.keys())

    def message_count(self, session_id: str) -> int:
        """Number of messages stored for *session_id*."""
        return len(self._store[session_id])

    # ----- internal ----------------------------------------------------------

    def _trim(self, session_id: str) -> None:
        """Keep only the most recent *max_messages* entries."""
        history = self._store[session_id]
        if len(history) > self.max_messages:
            self._store[session_id] = history[-self.max_messages:]

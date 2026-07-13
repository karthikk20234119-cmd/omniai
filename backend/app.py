from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from datetime import datetime

from memory import SessionMemory, SYSTEM_PROMPT

app = Flask(__name__)
# Enable CORS for all routes under /api/ to allow the React frontend to communicate
CORS(app, resources={r"/api/*": {"origins": "*"}})

# URL for local Ollama instance
OLLAMA_API_URL = "http://localhost:11434/api/chat"

# Default model (change to any model you have pulled in Ollama)
DEFAULT_MODEL = "mistral"

# Shared memory instance — one per server process
memory = SessionMemory(max_messages=10)


# ──────────────────────────────────────────────
#  /api/chat  —  Main conversation endpoint
# ──────────────────────────────────────────────

from agent.router import route_and_execute

@app.route('/api/chat', methods=['POST'])
def chat():
    """
    Accept a user message, route it to the appropriate AI Agent,
    execute the task, store the reply, and return it.
    """
    try:
        data = request.get_json()

        if not data or 'message' not in data:
            return jsonify({'error': 'Message field is required'}), 400

        user_message = data['message']
        session_id = data.get('session_id', 'default')

        # 1. Get history BEFORE adding the current message (Agent prompts append the current message manually)
        history = memory.get_history(session_id)

        # 2. Store the user's message in session memory
        memory.add_message(session_id, "user", user_message)

        # Logging
        print(f"\n[OmniAI] Session: {session_id}")
        print(f"[OmniAI] User Message: {user_message}")

        # 3. Route and execute through the Multi-Agent System
        result = route_and_execute(user_message, history)
        
        ai_response = result.get("response", "Error: No response generated.")
        agent_used = result.get("agent", "unknown")

        # 4. Store the AI response in session memory
        memory.add_message(session_id, "assistant", ai_response)

        print(f"[OmniAI] Agent Used: {agent_used.upper()}")
        print(f"[OmniAI] AI Response: {ai_response[:150]}...\n")

        return jsonify({
            'response': ai_response,
            'status': 'success',
            'agent': agent_used,
            'session_id': session_id,
            'memory_length': memory.message_count(session_id),
            'timestamp': datetime.now().isoformat(timespec='seconds')
        })

    except Exception as e:
        return jsonify({'error': f'An unexpected error occurred: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': f'An unexpected error occurred: {str(e)}'}), 500


# ──────────────────────────────────────────────
#  /api/memory  —  View / clear session memory
# ──────────────────────────────────────────────

@app.route('/api/memory', methods=['GET'])
def get_memory():
    """
    Return the conversation history for a session.

    Query params:
        session_id  (optional, defaults to "default")
    """
    session_id = request.args.get('session_id', 'default')
    history = memory.get_history(session_id)
    return jsonify({
        'session_id': session_id,
        'memory_length': len(history),
        'messages': history,
        'system_prompt': SYSTEM_PROMPT['content']
    })


@app.route('/api/memory', methods=['DELETE'])
def clear_memory():
    """
    Clear the conversation history for a session.

    Query params:
        session_id  (optional, defaults to "default")
    """
    session_id = request.args.get('session_id', 'default')
    memory.clear(session_id)
    return jsonify({
        'session_id': session_id,
        'status': 'memory cleared',
        'memory_length': 0
    })


# ──────────────────────────────────────────────
#  /api/health  —  Health check
# ──────────────────────────────────────────────

@app.route('/api/health', methods=['GET'])
def health_check():
    """Simple endpoint to check if the backend is running."""
    return jsonify({
        'status': 'running',
        'service': 'OmniAI Backend',
        'active_sessions': len(memory.get_session_ids())
    })


if __name__ == '__main__':
    print("=" * 50)
    print("  OmniAI Backend — Context-Aware AI Assistant")
    print(f"  System Prompt: {SYSTEM_PROMPT['content'][:60]}...")
    print(f"  Memory Limit : {memory.max_messages} messages / session")
    print("=" * 50)
    app.run(host='0.0.0.0', port=5000, debug=True)

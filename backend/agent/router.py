import json
from langchain_ollama import ChatOllama
from langchain_core.prompts import PromptTemplate

# Import all agent executors
from .coding_agent import execute as coding_execute
from .report_agent import execute as report_execute
from .data_agent import execute as data_execute
from .general_agent import execute as general_execute

# Initialize a low-temperature JSON-enforced model for routing
# Mistral handles `format="json"` very well
route_llm = ChatOllama(model="mistral", temperature=0.0, format="json")

route_prompt = PromptTemplate.from_template(
    """You are the master router for OmniAI. Your job is to classify the user's intent into ONE of four categories.
    
Output pure JSON containing exactly one key "agent" with one of these exact values: 
- "coding": The user is asking to write, debug, explain, or review source code.
- "report": The user wants to write a structured report, document, text file, or PDF and save it.
- "data": The user wants to analyze a CSV, spreadsheet, dataset, or asks for statistics from a file.
- "general": For standard chat, questions, or anything else that doesn't fit the above.

User message to classify: {message}

Return JSON mapping exactly to the schema {{"agent": "..."}}.
"""
)

route_chain = route_prompt | route_llm

def route_and_execute(message: str, history: list) -> dict:
    """
    1. Pass user message to router to decide intent.
    2. Invoke the corresponding agent.
    3. Return execution response to API.
    """
    # 1. Routing phase
    content = ""
    try:
        route_decision = route_chain.invoke({"message": message})
        content = route_decision.content
        
        # Parse standard JSON response
        decision_dict = json.loads(content)
        agent_choice = decision_dict.get("agent", "general").lower()
    except Exception as e:
        print(f"[Router Error] Failed to route ({str(e)}). Defaulting to general. Output: {content}")
        agent_choice = "general"
        
    print(f"\n[OmniAI Router] Extracted intent: >>> {agent_choice.upper()} AGENT <<<")

    # 2. Execution phase
    try:
        if agent_choice == "coding":
            ai_response = coding_execute(message, history)
        elif agent_choice == "report":
            ai_response = report_execute(message, history)
        elif agent_choice == "data":
            ai_response = data_execute(message, history)
        else:
            ai_response = general_execute(message, history)
            
    except Exception as e:
        ai_response = f"Agent '{agent_choice}' encountered an error: {str(e)}"
        
    # Return both the response text and the agent used
    return {
        "response": ai_response,
        "agent": agent_choice
    }

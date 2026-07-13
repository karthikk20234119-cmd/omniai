from langchain_ollama import ChatOllama
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.agents import create_tool_calling_agent, AgentExecutor
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from tools.data_tools import process_csv

llm = ChatOllama(model="mistral", temperature=0.1)

tools = [process_csv]

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are the OmniAI Data Agent. You are an expert data analyst. "
               "You have access to a tool called 'process_csv' which can read a CSV file and return "
               "stats or info (operations: 'summary', 'head', 'columns', 'shape'). "
               "If the user asks about data in a CSV file, ALWAYS use the tool to analyze it, "
               "then explain the results back to the user clearly."),
    MessagesPlaceholder(variable_name="history"),
    ("human", "{message}"),
    MessagesPlaceholder(variable_name="agent_scratchpad"),
])

agent = create_tool_calling_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

def execute(message: str, history: list) -> str:
    """Executes the data agent."""
    try:
        response = agent_executor.invoke({
            "message": message,
            "history": history
        })
        return response.get("output", "Data analysis complete.")
    except Exception as e:
        return f"An error occurred during data analysis: {str(e)}"

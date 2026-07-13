from langchain_ollama import ChatOllama
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.agents import create_tool_calling_agent, AgentExecutor
import sys
import os

# Add the parent directory to the path so we can import tools easily
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from tools.file_tools import write_to_file

# Initialize the LLM explicitly enabling tool calling
llm = ChatOllama(model="mistral", temperature=0.2)

# Define the tools available to this agent
tools = [write_to_file]

# Create the prompt for the report agent
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are the OmniAI Report Agent. Your job is to generate well-structured "
               "reports, summaries, and documents. MUST USE the 'write_to_file' tool to physically save "
               "the report to a .txt or .pdf file on the disk if the user asks you to create or save a report. "
               "When you use the tool, tell the user the file was successfully created. "
               "If no file saving is requested, just provide the report in the chat."),
    MessagesPlaceholder(variable_name="history"),
    ("human", "{message}"),
    MessagesPlaceholder(variable_name="agent_scratchpad"),
])

# Create the specific tool calling agent
agent = create_tool_calling_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

def execute(message: str, history: list) -> str:
    """Executes the report agent with tool access."""
    # Note: AgentExecutor expects "input" but our prompt expects "message".
    # LangChain's create_tool_calling_agent internally maps "input" to the prompt variables usually,
    # but we explicitly defined {message} in our prompt. Let's pass 'message'.
    try:
        response = agent_executor.invoke({
            "message": message,
            "history": history
        })
        return response.get("output", "I completed the report task, but no output was generated.")
    except Exception as e:
        return f"An error occurred while generating the report: {str(e)}"

from langchain_ollama import ChatOllama
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

# Initialize the LLM (Mistral via Ollama)
llm = ChatOllama(model="mistral", temperature=0.7)

# Create the prompt customized for coding
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are the OmniAI Coding Agent. You are an expert Software Engineer. "
               "Your job is to write, debug, and explain code. Always output clean, well-documented, "
               "and efficient code. If the user asks a non-coding question, politely remind them "
               "that you are the coding specialist."),
    MessagesPlaceholder(variable_name="history"),
    ("human", "{message}")
])

# Create the chain
chain = prompt | llm

def execute(message: str, history: list) -> str:
    """Executes the coding agent."""
    response = chain.invoke({
        "message": message,
        "history": history
    })
    return response.content

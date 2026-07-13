from langchain_ollama import ChatOllama
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

llm = ChatOllama(model="mistral", temperature=0.7)

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are OmniAI, a helpful, context-aware general assistant. "
               "You provide intelligent, accurate, and concise answers to any query."),
    MessagesPlaceholder(variable_name="history"),
    ("human", "{message}")
])

chain = prompt | llm

def execute(message: str, history: list) -> str:
    """Executes the standard general chat agent."""
    response = chain.invoke({
        "message": message,
        "history": history
    })
    return response.content

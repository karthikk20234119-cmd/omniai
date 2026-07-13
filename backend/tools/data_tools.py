import os
import pandas as pd
from langchain_core.tools import tool

# Assuming data files are in a specific directory, or using absolute paths
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
os.makedirs(DATA_DIR, exist_ok=True)

@tool
def process_csv(filename: str, operation: str) -> str:
    """
    Reads a CSV file and performs basic data analysis operations.
    
    Args:
        filename: The name of the CSV file to analyze (assumed to be in the 'data' directory or an absolute path).
        operation: The type of operation to perform. Supported values: 'summary', 'head', 'columns', 'shape'.
        
    Returns:
        A string containing the results of the requested operation on the CSV data.
    """
    # If the user provides an absolute path, try to use it, otherwise check the DATA_DIR
    if os.path.isabs(filename):
        filepath = filename
    else:
        filepath = os.path.join(DATA_DIR, filename)
        
    if not os.path.exists(filepath):
        # Let's create a dummy file for testing if it doesn't exist just to show the tool working
        if filename == "sample.csv":
            df = pd.DataFrame({
                "Name": ["Alice", "Bob", "Charlie", "David"],
                "Age": [25, 30, 35, 40],
                "Salary": [50000, 60000, 75000, 90000]
            })
            df.to_csv(filepath, index=False)
        else:
            return f"Error: File '{filepath}' does not exist."
            
    try:
        df = pd.read_csv(filepath)
        
        if operation == 'summary':
            return f"Data Summary:\n{df.describe().to_string()}"
        elif operation == 'head':
            return f"First 5 rows:\n{df.head().to_string()}"
        elif operation == 'columns':
            return f"Columns: {', '.join(df.columns.tolist())}"
        elif operation == 'shape':
            return f"Dataset has {df.shape[0]} rows and {df.shape[1]} columns."
        else:
            return f"Unsupported operation: '{operation}'. Try 'summary', 'head', 'columns', or 'shape'."
            
    except Exception as e:
        return f"Error processing CSV: {str(e)}"

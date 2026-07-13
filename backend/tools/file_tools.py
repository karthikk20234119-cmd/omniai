import os
from langchain_core.tools import tool
from fpdf import FPDF

# Ensure a directory exists for generated files
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "output")
os.makedirs(OUTPUT_DIR, exist_ok=True)

@tool
def write_to_file(filename: str, content: str) -> str:
    """
    Saves text content to a file. Supports .txt and .pdf extensions.
    Always uses this tool when a user asks to generate a report, document, or save information to a file.
    
    Args:
        filename: The name of the file to create (e.g., 'report.pdf' or 'notes.txt').
        content: The text content to write into the file.
        
    Returns:
        A success message indicating where the file was saved.
    """
    filepath = os.path.join(OUTPUT_DIR, filename)
    
    try:
        if filename.lower().endswith('.pdf'):
            # Create a simple PDF
            pdf = FPDF()
            pdf.add_page()
            pdf.set_font("Helvetica", size=12)
            
            # Add text with automatic text wrapping
            pdf.multi_cell(0, 10, txt=content)
            pdf.output(filepath)
        else:
            # Default to plain text
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
                
        return f"Successfully saved file to {filepath}"
        
    except Exception as e:
        return f"Failed to save file {filename}: {str(e)}"

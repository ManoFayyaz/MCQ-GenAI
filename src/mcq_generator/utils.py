#helper file: helpeing functions
import os
import json
import re
import streamlit as st
import PyPDF2
import traceback
import re
from pptx import Presentation
from src.mcq_generator.logger import logging as mcq_logger



def read_file(file):
    if file.name.endswith('.pdf'):
        try:
            pdf_reader=PyPDF2.PdfFileReader(file)
            text=""
            for page in pdf_reader.pages:
                text+=page.extract_text()
            return text
        except Exception as e:
            print("Error reading PDF file:",e)

    elif file.name.endswith('.txt'):
        try:
            text=file.read().decode('utf-8')
            return text
        except Exception as e:
            print("Error reading TXT file:",e)

    elif file.name.endswith('.ppt') or file.name.endswith('.pptx'):
        try:
            prs = Presentation(file)
            text = ""
            for slide in prs.slides:
                for shape in slide.shapes:
                    # For regular text frames
                    if hasattr(shape, "text") and shape.text:
                        text += shape.text + "\n"
                    # Optional: check for tables
                    elif shape.has_table:
                        for row in shape.table.rows:
                            for cell in row.cells:
                                text += cell.text + "\n"
            if not text:
                st.warning("No text found in the PPT/PPTX file.")
            return text
        
        except Exception as e:
             mcq_logger.error("Error generating MCQs: %s", e)
             st.error(f"An error occurred: {e}")



def get_table_data(quiz):
    try:
        quiz_clean = re.sub(r"^```json|```$", "", quiz, flags=re.MULTILINE).strip()

        quiz_dict = json.loads(quiz_clean)
        
        quiz_table=[]
        for key, value in quiz_dict.items():
            question = value.get("question", "")
            options = value.get("options", {})
            correct_answer = value.get("correct_answer", "")
            
            quiz_table.append({
                "Question": question,
                "Option A": options.get("A", ""),
                "Option B": options.get("B", ""),
                "Option C": options.get("C", ""),
                "Option D": options.get("D", ""),
                "Correct Answer": correct_answer
            })
        return quiz_table
    
    except json.JSONDecodeError as e:
        print("Error decoding JSON:", e)
        print("Quiz content:", quiz)
        return []

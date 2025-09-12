#helper file: helpeing functions

import os
import json
import re
import streamlit as st
import PyPDF2
import traceback
from pptx import Presentation
from PIL import Image
import pytesseract
import pytesseract
pytesseract.pytesseract.tesseract_cmd = r"D:\Tesseract-OCR\tesseract.exe"

from pdf2image import convert_from_bytes
from src.mcq_generator.logger import logging as mcq_logger
import io




def read_file(file):
    text = ""

    if file.name.endswith('.pdf'):
        try:
            pdf_reader = PyPDF2.PdfFileReader(file)
            for page in pdf_reader.pages:
                extracted = page.extract_text()
                if extracted:  # normal text
                    text += extracted
                else:  # OCR fallback
                    images = convert_from_bytes(file.getbuffer())
                    for img in images:
                        text += pytesseract.image_to_string(img)
            return text
        except Exception as e:
            mcq_logger.error("Error reading PDF file: %s", e)
            st.error(f"An error occurred while reading PDF: {e}")

    elif file.name.endswith('.txt'):
        try:
            text = file.read().decode('utf-8')
            return text
        except Exception as e:
            mcq_logger.error("Error reading TXT file: %s", e)
            st.error(f"An error occurred while reading TXT: {e}")

    elif file.name.endswith('.ppt') or file.name.endswith('.pptx'):
        try:
            prs = Presentation(file)
            for slide in prs.slides:
                for shape in slide.shapes:
                    if hasattr(shape, "text") and shape.text:
                        text += shape.text + "\n"
                    elif shape.has_table:
                        for row in shape.table.rows:
                            for cell in row.cells:
                                text += cell.text + "\n"
                    elif shape.shape_type == 13:  # Picture
                        image = shape.image
                        image_bytes = image.blob
                        img = Image.open(io.BytesIO(image_bytes))
                        text += pytesseract.image_to_string(img)
            if not text:
                st.warning("No text found in the PPT/PPTX file.")
            return text

        except Exception as e:
            mcq_logger.error("Error reading PPT file: %s", e)
            st.error(f"An error occurred while reading PPT: {e}")

    return text



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

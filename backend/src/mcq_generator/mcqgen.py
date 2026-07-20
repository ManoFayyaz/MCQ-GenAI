import os
import json
import traceback
from dotenv import load_dotenv
from src.mcq_generator.logger import logging
from src.mcq_generator.utils import read_file_and_index, normalize_quiz_json, retrieve_context
from langchain_core.output_parsers import JsonOutputParser
from langchain_groq import ChatGroq  
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser

load_dotenv()

key = os.getenv("GROQ_API_KEY")

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    api_key=key,
    max_tokens=2500,
    temperature=0.7
).bind(response_format={"type": "json_object"})

TEMPLATE = """
Text: {text}

You are an expert in creating engaging and challenging multiple choice questions (MCQs) for educational purposes.

The user may or may not specify a topic.  
- If a topic is provided, generate {number} MCQs and make sure it's **only from that topic** in the text.  
- If no topic is provided, generate {number} MCQs covering the **entire text**.

Topic (if any): {topic}

Keep the complexity level: {level}.

Each question must have exactly 4 options (A, B, C, D) and one correct answer.  
Important: Include a field called "correct_answer" for each question indicating the correct option (A, B, C, or D).

Provide the output in the following JSON format exactly: {response_json}.

Ensure:
- The questions are clear, concise, and relevant to the provided text/topic.  
- Questions should not be repeated.  
- Always include the correct answer.
"""

quiz_prompt = PromptTemplate(
    input_variables=["text", "number", "topic", "level", "response_json"],
    template=TEMPLATE
)

generate_evaluate_chain = quiz_prompt | llm | JsonOutputParser()
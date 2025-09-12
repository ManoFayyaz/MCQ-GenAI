import os
import json
import traceback
from dotenv import load_dotenv
from src.mcq_generator.logger import logging
from src.mcq_generator.utils import read_file, get_table_data

from langchain.chat_models import ChatOpenAI,openai
from langchain.prompts import PromptTemplate    
from langchain.chains import LLMChain
from langchain.chains import SequentialChain

load_dotenv()

key=os.getenv("OPENAI_API_KEY")

llm=ChatOpenAI(
    model="gpt-4o-mini-2024-07-18",
    api_key=key,
    max_tokens=5000,
    temperature=0.7
)

# TEMPLATE = """
# Text: {text}
# You are an expert in creating engaging and challenging multiple choice questions (MCQs) for educational purposes.
# Generate {number} multiple choice questions (MCQs) in the subject of {subject} and then keep the complexity level {level} of the questions. 
# Each question should have 4 options (A, B, C, D) and one correct answer.
# Important: Include a field called "correct_answer" for each question indicating the correct option (A, B, C, or D).
# Provide the output in the following JSON format exactly: {response_json}.
# Ensure the questions are clear, concise, and relevant to the provided text.
# Questions should not be repeated.
# Don't forget to include the correct answer for each question in the "correct_answer" field.
# """


TEMPLATE = """
Text: {text}

You are an expert in creating engaging and challenging multiple choice questions (MCQs) for educational purposes.

The user may or may not specify a topic.  
- If a topic is provided, generate {number} MCQs **only from that topic** in the text.  
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


quiz_prompt=PromptTemplate(
    input_variables=["text","number","topic","level","response_json"],
    template=TEMPLATE
)

quiz_chain = LLMChain(llm=llm, prompt=quiz_prompt, output_key="quiz", verbose=True)

TEMPLATE2="""You are an english expert. Giver multiple choice questions (MCQs) for {subject} \" \
"You need to evaluate the complexity of the questions " \" \
"Update the quiz questions which needs to be simplified or made complex based on the complexity level \" \" \
"Quiz mcqs: {quiz} \" 
you can check from above quiz mcqs and update the questions """

quiz_evaluate_prompt=PromptTemplate(
    input_variables=["quiz","subject"],
    template=TEMPLATE2)

review_chain=LLMChain(llm=llm,prompt=quiz_evaluate_prompt,output_key="reviewed_quiz",verbose=True)

generate_evaluate_chain=SequentialChain(
    chains=[quiz_chain],
    input_variables=["text","number","topic","level","response_json"],
    output_variables=["quiz"],
    verbose=True)


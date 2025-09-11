import os
import json
import traceback
from dotenv import load_dotenv
from src.mcq_generator.logger import logging
from src.mcq_generator.utils import read_file, get_table_data

from src.mcq_generator.mcqgen import generate_evaluate_chain
import streamlit as st
from langchain_community.callbacks import get_openai_callback

with open(r"D:\MCQ-GenAI\response.json", "r") as file:
    response_json = json.load(file)


st.title("MCQ Generator using Generative AI")

with st.form('user_input'):
    uploaded_file = st.file_uploader("Upload your file (PDF, PPT, or TXT)", type=["pdf", "ppt", "pptx", "txt"])
    mcq_count=st.number_input("Number of MCQs to generate", min_value=5, max_value=50)
    subject=st.text_input("subject")
    level=st.selectbox("Select complexity level", ["easy", "medium", "hard"])
    submitted=st.form_submit_button("Generate MCQs")

if submitted and uploaded_file is not None and mcq_count and subject and level:
    try:
        with get_openai_callback() as cb:
            text=read_file(uploaded_file)
            if text:
                logging.info("File read successfully")
                result=generate_evaluate_chain.run(
                    text=text,
                    number=mcq_count,
                    subject=subject,
                    level=level,
                    response_json=json.dumps(response_json)
                )
                quiz_table=get_table_data(result)
                # reviewed_quiz_table=get_table_data(result['reviewed_quiz'])

                st.session_state.quiz_table = quiz_table
                st.session_state.quiz_generated = True

                # st.subheader("Reviewed MCQs")
                # st.table(quiz_table)

                logging.info(f"Tokens used: {cb.total_tokens}")
                logging.info(f"Prompt tokens: {cb.prompt_tokens}")
                logging.info(f"Completion tokens: {cb.completion_tokens}")
                logging.info(f"Total cost (USD): ${cb.total_cost}")

    except Exception as e:
        logging.error("Error generating MCQs: %s", e)
        st.error(f"An error occurred: {e}")

# Render MCQs if they were generated
if st.session_state.get("quiz_generated"):
    st.subheader("Take the Quiz")
    quiz_table = st.session_state.quiz_table

    # Initialize session state storage for answers
    if "user_answers" not in st.session_state:
        st.session_state.user_answers = {}

    # Loop through questions
    for i, q in enumerate(quiz_table):
        st.markdown(f"**Q{i+1}. {q['Question']}**")
        options = [q["Option A"], q["Option B"], q["Option C"], q["Option D"]]
        key = f"q_{i}"

        if key not in st.session_state:
            st.session_state[key] = None

        selected = st.radio(
            f"Select your answer for Question {i+1}:",
            options,
            index=options.index(st.session_state[key]) if st.session_state[key] in options else 0,
            key=key
        )

        st.session_state.user_answers[i] = {
            "selected": selected,
            "correct": q["Correct Answer"]
        }

        st.write("---")

    # Button to submit quiz
if st.button("Submit Quiz"):
    score = 0
    quiz_table = st.session_state.quiz_table
    for i, ans in st.session_state.user_answers.items():
        # Compare selected text with the correct option text
        correct_text = quiz_table[i][f"Option {ans['correct'][-1]}"]  # 'A'->Option A
        if ans["selected"] == correct_text:
            score += 1

    st.success(f"Your Score: {score}/{len(st.session_state.user_answers)}")

    # Reveal correct answers
    st.subheader("Correct Answers")
    for i, q in enumerate(quiz_table):
        user_answer = st.session_state.user_answers[i]["selected"]
        correct_text = q[f"Option {q['Correct Answer']}"]
        if user_answer == correct_text:
            st.markdown(f"**Q{i+1}: ✅ Correct!** Your answer: {user_answer}")
        else:
            st.markdown(f"**Q{i+1}: ❌ Incorrect.** Your answer: {user_answer} → Correct answer: {correct_text}")

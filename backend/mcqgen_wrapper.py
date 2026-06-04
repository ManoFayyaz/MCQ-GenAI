# backend/mcqgen_wrapper.py
import json
from pathlib import Path
from src.mcq_generator.mcqgen import generate_evaluate_chain
from src.mcq_generator.utils import normalize_quiz_json

RESP_JSON_PATH = Path("response.json")
if RESP_JSON_PATH.exists():
    response_json_template = json.dumps(json.load(open(RESP_JSON_PATH)))
else:
    response_json_template = json.dumps({
        "1": {"question":"", "options":{"A":"","B":"","C":"","D":""}, "correct_answer":""}
    })

def generate_mcqs_from_text(text, number, topic, level):
    """
    Calls your LLM chain and returns parsed dict of mcqs.
    """
    result = generate_evaluate_chain.invoke({   # ← changed from .run() to .invoke()
        "text": text,
        "number": number,
        "topic": topic or "",
        "level": level,
        "response_json": response_json_template
    })
    parsed = normalize_quiz_json(result)
    return parsed


# # backend/mcqgen_wrapper.py
# import json
# from pathlib import Path
# from src.mcq_generator.mcqgen import generate_evaluate_chain
# from src.mcq_generator.utils import normalize_quiz_json

# RESP_JSON_PATH = Path("response.json")
# if RESP_JSON_PATH.exists():
#     response_json_template = json.dumps(json.load(open(RESP_JSON_PATH)))
# else:
#     response_json_template = json.dumps({
#         "1": {"question":"", "options":{"A":"","B":"","C":"","D":""}, "correct_answer":""}
#     })

# def generate_mcqs_from_text(text, number, topic, level):
#     """
#     Calls your LLM chain and returns parsed dict of mcqs.
#     """
#     result = generate_evaluate_chain.run(
#         text=text,
#         number=number,
#         topic=topic or "",
#         level=level,
#         response_json=response_json_template
#     )
#     parsed = normalize_quiz_json(result)
#     return parsed

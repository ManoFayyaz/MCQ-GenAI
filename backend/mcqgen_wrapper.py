# backend/mcqgen_wrapper.py
import json
import time
import logging
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

# ---- Safety: track last call time to enforce cooldown ----
_last_call_time = 0
COOLDOWN_SECONDS = 5  # minimum gap between LLM calls

def generate_mcqs_from_text(text, number, topic, level):
    """
    Calls LLM chain with rate limit protection:
    - Enforces a cooldown between calls
    - Retries once on RateLimitError with 20s wait
    - Returns empty dict on failure instead of crashing
    """
    global _last_call_time

    # ---- Global cooldown: ensure minimum gap between calls ----
    elapsed = time.time() - _last_call_time
    if elapsed < COOLDOWN_SECONDS:
        wait = COOLDOWN_SECONDS - elapsed
        logging.info(f"Cooldown active — waiting {wait:.1f}s before calling Groq...")
        time.sleep(wait)

    # ---- Attempt LLM call with retry on rate limit ----
    for attempt in range(2):  # try max 2 times
        try:
            _last_call_time = time.time()

            result = generate_evaluate_chain.invoke({
                "text": text,
                "number": number,
                "topic": topic or "",
                "level": level,
                "response_json": response_json_template
            })

            # Chain now uses JsonOutputParser so result is already a dict
            if isinstance(result, dict):
                return result
            
            # Fallback: if string came back, normalize it
            return normalize_quiz_json(result)

        except Exception as e:
            error_str = str(e).lower()

            # ---- Rate limit hit ----
            if "rate_limit" in error_str or "429" in error_str or "ratelimit" in error_str:
                if attempt == 0:
                    logging.warning(f"Groq rate limit hit — waiting 20 seconds before retry...")
                    time.sleep(20)
                    continue  # retry once
                else:
                    logging.error("Groq rate limit hit on retry too. Giving up.")
                    return {}

            # ---- Model decommissioned ----
            elif "decommissioned" in error_str:
                logging.error(f"Model decommissioned: {e}")
                return {}

            # ---- Any other error ----
            else:
                logging.error(f"LLM call failed (attempt {attempt+1}): {e}")
                if attempt == 0:
                    time.sleep(5)
                    continue  # retry once on generic errors too
                return {}

    return {}  # final fallback



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
#     result = generate_evaluate_chain.invoke({   # ← changed from .run() to .invoke()
#         "text": text,
#         "number": number,
#         "topic": topic or "",
#         "level": level,
#         "response_json": response_json_template
#     })
#     parsed = normalize_quiz_json(result)
#     return parsed


# # # backend/mcqgen_wrapper.py
# # import json
# # from pathlib import Path
# # from src.mcq_generator.mcqgen import generate_evaluate_chain
# # from src.mcq_generator.utils import normalize_quiz_json

# # RESP_JSON_PATH = Path("response.json")
# # if RESP_JSON_PATH.exists():
# #     response_json_template = json.dumps(json.load(open(RESP_JSON_PATH)))
# # else:
# #     response_json_template = json.dumps({
# #         "1": {"question":"", "options":{"A":"","B":"","C":"","D":""}, "correct_answer":""}
# #     })

# # def generate_mcqs_from_text(text, number, topic, level):
# #     """
# #     Calls your LLM chain and returns parsed dict of mcqs.
# #     """
# #     result = generate_evaluate_chain.run(
# #         text=text,
# #         number=number,
# #         topic=topic or "",
# #         level=level,
# #         response_json=response_json_template
# #     )
# #     parsed = normalize_quiz_json(result)
# #     return parsed

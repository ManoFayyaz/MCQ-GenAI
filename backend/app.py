# backend/app.py
from flask import Flask, request, jsonify, session
from flask_bcrypt import Bcrypt
from flask_cors import CORS
import os
import json
from flask import Flask, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
from flask_bcrypt import Bcrypt
from werkzeug.security import generate_password_hash, check_password_hash
from config import SQLALCHEMY_DATABASE_URI, SQLALCHEMY_TRACK_MODIFICATIONS, SECRET_KEY, UPLOAD_FOLDER
from models import db, User, Upload, Quiz, MCQItem, QuizAttempt
from src.mcq_generator.utils import file_hash, read_file_and_index, retrieve_context
from mcqgen_wrapper import generate_mcqs_from_text
from models import db, User, Upload, Quiz, MCQItem, QuizAttempt
import jwt
# from performance import performance_bp

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = SQLALCHEMY_DATABASE_URI
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = SQLALCHEMY_TRACK_MODIFICATIONS
app.config["SECRET_KEY"] = SECRET_KEY
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

CORS(app)
app.config.from_pyfile('config.py')
bcrypt = Bcrypt(app)
db.init_app(app)
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

#performance blueprint
# app.register_blueprint(performance_bp)

# -------------------- User Authentication Routes --------------------
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'User already exists'}), 400

    # Hash password using Flask-Bcrypt
    hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(email=email, password=hashed_pw)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'Registration successful!'}), 201

@app.route("/debug_users")
def debug_users():
    users = User.query.all()
    return jsonify([{"id": u.id, "email": u.email} for u in users])


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()
    if user and bcrypt.check_password_hash(user.password, password.encode('utf-8')):
         return jsonify({
            "message": "Login successful",
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.name if hasattr(user, "name") else None
            }
        }), 200
    else:
        return jsonify({'error': 'Invalid email or password'}), 401


from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

@app.route("/api/auth/google", methods=["POST"])
def google_login():
    data = request.get_json()
    token = data.get("credential")

    try:
        idinfo = id_token.verify_oauth2_token(
            token,
            google_requests.Request(),
            os.environ.get("GOOGLE_CLIENT_ID")
        )

        email = idinfo["email"]
        google_id = idinfo["sub"]
        name = idinfo.get("name", email)

        # Check if user exists
        user = User.query.filter_by(email=email).first()

        if not user:
            # Create new Google user
            user = User(
                email=email,
                google_id=google_id,
                password=None
            )
            db.session.add(user)
            db.session.commit()
        elif not user.google_id:
            # Existing email user — link their google_id
            user.google_id = google_id
            db.session.commit()

        # Issue your normal JWT
        token_data = {
            "user_id": user.id,
            "email": user.email
        }
        jwt_token = jwt.encode(
            token_data,
            os.environ.get("JWT_SECRET"),
            algorithm="HS256"
        )

        return jsonify({
            "token": jwt_token,
            "user": {"id": user.id, "email": user.email}
        }), 200

    except ValueError as e:
        return jsonify({"error": "Invalid Google token"}), 401



@app.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([{'id': u.id, 'email': u.email} for u in users])

@app.route('/delete_user/<int:id>', methods=['DELETE'])
def delete_user(id):
    user = User.query.get(id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted successfully'})

# -------------------- MCQ Generation Routes --------------------

ALLOWED_EXTENSIONS = {"pdf", "docx", "txt", "ppt", "pptx"}


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

def mcq_parsed_list_from_llm(quiz_dict):
    items = []
    for k in sorted(quiz_dict.keys(), key=lambda x: int(x) if str(x).isdigit() else x):
        v = quiz_dict[k]
        question = v.get("question") or v.get("Question") or ""
        options_obj = v.get("options") or v.get("Options") or {}
        if isinstance(options_obj, dict):
            opts = [options_obj.get(kx, "") for kx in ["A","B","C","D"]]
        elif isinstance(options_obj, list):
            opts = options_obj[:4] + [""]*(4-len(options_obj))
        else:
            opts = []
        correct = v.get("correct_answer") or v.get("Correct Answer") or v.get("correct answer") or v.get(" correct answer")
        correct_index = 0
        if isinstance(correct, str) and correct.strip():
            corr = correct.strip()
            if corr.upper() in ["A","B","C","D"]:
                correct_index = ord(corr.upper()) - ord("A")
            else:
                try:
                    correct_index = opts.index(corr)
                except ValueError:
                    correct_index = 0
        items.append({
            "question": question,
            "options": opts,
            "correct_index": int(correct_index)
        })
    return items


#helper route
@app.route("/api/upload", methods=["POST"])
def upload_file():
    file = request.files["file"]
    if not file:
        return jsonify({"error": "No file uploaded"}), 400

    file_path = os.path.join("uploads", file.filename)
    os.makedirs("uploads", exist_ok=True)
    file.save(file_path)

    session["uploaded_file"] = file_path
    return jsonify({"message": "File uploaded successfully", "file_path": file_path})


@app.route("/api/current_file", methods=["GET"])
def get_current_file():
    file_path = session.get("uploaded_file")
    if not file_path:
        return jsonify({"file_path": None})
    return jsonify({"file_path": file_path})



@app.route("/api/upload_generate", methods=["POST"])
def upload_and_generate():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400
    if not allowed_file(file.filename):
        return jsonify({"error": "File type not allowed"}), 400

    user_id = int(request.form.get("user_id", 0))
    num_questions = int(request.form.get("num_questions", 5))
    topic = request.form.get("topic", "")
    difficulty = request.form.get("difficulty", "easy")

#checking---
    user_id = int(request.form.get("user_id", 0))
    num_questions = int(request.form.get("num_questions", 5))
    topic = request.form.get("topic", "")
    difficulty = request.form.get("difficulty", "easy")

    #  New check — make sure the user exists
    user = User.query.filter_by(id=user_id).first()
    if not user:
        print(f" User with ID {user_id} not found in DB")
        return jsonify({"error": "User not found"}), 404
    else:
        print(f" User found: {user.email}")

    filename = secure_filename(file.filename)
    file_hash_id = file_hash(file)
    saved_name = f"{user_id}_{file_hash_id}_{filename}"
    save_path = os.path.join(app.config["UPLOAD_FOLDER"], saved_name)
    file.seek(0)
    file.save(save_path)

    with open(save_path, "rb") as fbin:
        text, collection_name = read_file_and_index(fbin, user_id, file_hash_id)

    existing = Upload.query.filter_by(user_id=user_id, file_hash=file_hash_id).first()
    if existing:
        upload = existing
    else:
        upload = Upload(user_id=user_id, filename=filename, filepath=save_path, file_hash=file_hash_id, collection_name=collection_name)
        db.session.add(upload)
        db.session.commit()

    query_for_retrieval = topic if topic and topic.strip() else "generate questions from the entire document"
    context = retrieve_context(query_for_retrieval, collection_name, top_k=6)
    if not context:
        context = text
    
    parsed_quiz = generate_mcqs_from_text(context, number=num_questions, topic=topic, level=difficulty)
    if not parsed_quiz:
        return jsonify({"error": "MCQ generation failed due to rate limiting. Please wait 30 seconds and try again."}), 429
    mcq_items = mcq_parsed_list_from_llm(parsed_quiz)

    quiz_row = Quiz(user_id=user_id, upload_id=upload.id, topic=topic, difficulty=difficulty, num_questions=num_questions, source="rag_pipeline_v1")
    db.session.add(quiz_row)
    db.session.commit()

    for it in mcq_items:
        mcq_db = MCQItem(quiz_id=quiz_row.id, question_text=it["question"], options=it["options"], correct_index=it["correct_index"])
        db.session.add(mcq_db)
    db.session.commit()

    response_mcqs = []
    mcq_db_rows = MCQItem.query.filter_by(quiz_id=quiz_row.id).all()
    for m in mcq_db_rows:
        response_mcqs.append({
            "id": m.id,
            "question": m.question_text,
            "options": m.options,
            "correct": m.options[m.correct_index]
        })

    return jsonify({"quiz_id": quiz_row.id, "upload_id": upload.id, "mcqs": response_mcqs}), 201

@app.route("/api/quiz/<int:quiz_id>", methods=["GET"])
def get_quiz(quiz_id):
    quiz = Quiz.query.get_or_404(quiz_id)
    mcqs = MCQItem.query.filter_by(quiz_id=quiz.id).all()
    resp = []
    for m in mcqs:
        resp.append({"id": m.id, "question": m.question_text, "options": m.options})
    return jsonify({"quiz_id": quiz.id, "topic": quiz.topic, "difficulty": quiz.difficulty, "mcqs": resp})



@app.route("/api/quiz/<int:quiz_id>/submit", methods=["POST"])
def submit_quiz(quiz_id):
    try:
        data = request.get_json()
        answers = data.get("answers", [])
        user_id = int(data.get("user_id", 0))
        
        from datetime import datetime, timedelta
        # --- STREAK LOGIC ---
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        today = datetime.utcnow().date()
        last = user.last_quiz_at.date() if user.last_quiz_at else None

        streak_to_send = None  # only send streak if first attempt today

        if last == today:
            # Already attempted today — streak unchanged, don't send
            streak = user.streak
        elif last == today - timedelta(days=1):
            # Yesterday had a quiz — increment streak
            user.streak = (user.streak or 0) + 1
            streak = user.streak
            streak_to_send = streak  # first attempt today, send streak
        else:
            # Missed a day — reset streak
            user.streak = 1
            streak = 1
            streak_to_send = streak  # first attempt today, send streak

        # Update last quiz time
        user.last_quiz_at = datetime.utcnow()
        db.session.commit()
        # --- END STREAK LOGIC ---


        # Fetch MCQs for this quiz
        mcqs = MCQItem.query.filter_by(quiz_id=quiz_id).order_by(MCQItem.id).all()
        if len(mcqs) != len(answers):
            return jsonify({"error": "Number of answers does not match number of questions"}), 400

        correct_count = 0
        details = []

        for idx, mcq in enumerate(mcqs):
                sel = answers[idx]
                # except (TypeError, ValueError):
                #     sel = -1  # Handle invalid selections gracefully
                if sel is None or not isinstance(sel, int) or sel < 0 or sel >= len(mcq.options):
                    sel = -1

                is_correct = (sel == mcq.correct_index)
                if is_correct:
                    correct_count += 1

    
                details.append({
                    "mcq_id": mcq.id,
                    "question": mcq.question_text,
                    "selected": sel,
                    "selected_option": mcq.options[sel] if 0 <= sel < len(mcq.options) else None,
                    "correct_index": mcq.correct_index,
                    "correct_option": mcq.options[mcq.correct_index],
                    "is_correct": is_correct
                })
                
        wrong_count = len(mcqs) - correct_count
        percentage = round((correct_count / len(mcqs)) * 100, 2)

        # Optional suggestion logic
        if percentage >= 80:
            suggestion = "Good — try a harder level."
        elif percentage >= 50:
            suggestion = "Practice more at this level."
        else:
            suggestion = "Review the material and try again."

        # Save attempt in DB
        attempt = QuizAttempt(
            quiz_id=quiz_id,
            user_id=user_id,
            answers=answers,
            correct_count=correct_count,
            wrong_count=wrong_count,
            percentage=percentage,
            suggestion=suggestion
        )
        db.session.add(attempt)
        db.session.commit()

        return jsonify({
            "correct_count": correct_count,
            "wrong_count": wrong_count,
            "percentage": percentage,
            "suggestion": suggestion,
            "details": details,
            "streak": streak_to_send if streak_to_send else None


        })
    except Exception as e:
        print("Error in submit_quiz:", e)
        return jsonify({"error": str(e)}), 500

   
@app.route("/api/retake", methods=["POST"])
def retake_quiz():
    data = request.get_json()
    user_id = int(data.get("user_id", 0))
    upload_id = int(data.get("upload_id", 0))
    num_q = int(data.get("num_questions", 5))
    topic = data.get("topic", "")
    difficulty = data.get("difficulty", "easy")

    upload = Upload.query.get_or_404(upload_id)
    collection_name = upload.collection_name

    query_for_retrieval = topic if topic else "generate questions from the entire document"
    context = retrieve_context(query_for_retrieval, collection_name, top_k=6)


    parsed_quiz = generate_mcqs_from_text(context, number=num_q, topic=topic, level=difficulty)
    if not parsed_quiz:
        return jsonify({"error": "MCQ generation failed due to rate limiting. Please wait 30 seconds and try again."}), 429
    
    mcq_items = mcq_parsed_list_from_llm(parsed_quiz)

    quiz_row = Quiz(user_id=user_id, upload_id=upload.id, topic=topic, difficulty=difficulty, num_questions=num_q, source="rag_pipeline_v1")
    db.session.add(quiz_row)
    db.session.commit()

    for it in mcq_items:
        mcq_db = MCQItem(quiz_id=quiz_row.id, question_text=it["question"], options=it["options"], correct_index=it["correct_index"])
        db.session.add(mcq_db)
    db.session.commit()

    response_mcqs = [{"id": m.id, "question": m.question_text, "options": m.options} for m in MCQItem.query.filter_by(quiz_id=quiz_row.id).all()]
    return jsonify({"quiz_id": quiz_row.id, "mcqs": response_mcqs}), 201

@app.route("/api/user/<int:user_id>/quizzes", methods=["GET"])
def user_quizzes(user_id):
    quizzes = Quiz.query.filter_by(user_id=user_id).order_by(Quiz.created_at.desc()).all()
    out = []
    for q in quizzes:
        attempts = QuizAttempt.query.filter_by(quiz_id=q.id).order_by(QuizAttempt.created_at.desc()).all()
        last_pct = attempts[0].percentage if attempts else None
        out.append({
            "quiz_id": q.id,
            "upload_id": q.upload_id,
            "topic": q.topic,
            "difficulty": q.difficulty,
            "num_questions": q.num_questions,
            "created_at": q.created_at.isoformat(),
            "last_percentage": last_pct
        })
    return jsonify(out)


@app.route("/api/user/<int:user_id>/attempts", methods=["GET"])
def user_attempts(user_id):
    results = db.session.query(
        QuizAttempt,
        Upload.filename
    ).join(
        Quiz, QuizAttempt.quiz_id == Quiz.id
    ).outerjoin(
        Upload, Quiz.upload_id == Upload.id
    ).filter(
        QuizAttempt.user_id == user_id
    ).order_by(QuizAttempt.created_at.asc()).all()

    data = [
        {
            "created_at": a.created_at.isoformat(),
            "percentage": a.percentage,
            "correct": a.correct_count,
            "wrong": a.wrong_count,
            "total": a.correct_count + a.wrong_count,
            "filename": filename or "No document"
        }
        for a, filename in results
    ]

    return jsonify(data)

# @app.route("/api/user/<int:user_id>/attempts", methods=["GET"])
# def user_attempts(user_id):
#     # Fetch all attempts by user, ordered by date
#     attempts = QuizAttempt.query.filter_by(user_id=user_id).order_by(QuizAttempt.created_at.asc()).all()
    
#     data = [
#         {
#             "created_at": a.created_at.isoformat(),
#             "percentage": a.percentage,
#             "correct": a.correct_count,
#             "wrong": a.wrong_count,
#             "total": a.correct_count + a.wrong_count,
#             "filename": filename or "No document"

#         }
#         for a, filename in attempts
#     ]
    
#     return jsonify(data)



@app.route("/uploads/<path:filename>")
def uploaded_file(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)


@app.route("/api/user/<int:user_id>/quiz_attempts", methods=["GET"])
def get_user_quiz_attempts(user_id):
    try:
        attempts = QuizAttempt.query.filter_by(user_id=user_id).order_by(QuizAttempt.created_at).all()
        data = []
        for a in attempts:
            data.append({
                "quiz_id": a.quiz_id,
                "correct_count": a.correct_count,
                "wrong_count": a.wrong_count,
                "percentage": a.percentage,
                "created_at": a.created_at.isoformat()
            })
        return jsonify(data)
    except Exception as e:
        print("Error fetching attempts:", e)
        return jsonify({"error": str(e)}), 500


@app.route("/api/user/<int:user_id>/difficulty_trend", methods=["GET"])
def difficulty_trend(user_id):
    attempts = (
        db.session.query(
            QuizAttempt.created_at,
            QuizAttempt.percentage,
            Quiz.difficulty
        )
        .join(Quiz, QuizAttempt.quiz_id == Quiz.id)
        .filter(QuizAttempt.user_id == user_id)
        .order_by(QuizAttempt.created_at.asc())
        .all()
    )

    result = []
    for a in attempts:
        result.append({
            "date": a.created_at.date().isoformat(),
            "percentage": a.percentage,
            "difficulty": a.difficulty
        })

    return jsonify(result)


@app.route("/api/user/<int:user_id>", methods=["GET"])
def get_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "id": user.id,
        "email": user.email,
        "streak": user.streak,
        "last_quiz_at": user.last_quiz_at.isoformat() if user.last_quiz_at else None
    })

@app.route("/api/user/<int:user_id>/update", methods=["POST"])
def update_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()
    # new_email = data.get("email")
    new_password = data.get("password")

    # if new_email:
    #     user.email = new_email

    if new_password:
        user.password = bcrypt.generate_password_hash(new_password).decode("utf-8")

    db.session.commit()

    return jsonify({"message": "User updated successfully"})


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)

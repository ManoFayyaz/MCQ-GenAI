from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime

db = SQLAlchemy()

# class User(db.Model):
#     __tablename__ = 'users'
#     id = db.Column(db.Integer, primary_key=True, autoincrement=True)
#     email = db.Column(db.String(100), unique=True, nullable=False)
#     password = db.Column(db.String(200), nullable=False)
#     streak = db.Column(db.Integer, default=0)
#     last_quiz_at = db.Column(db.DateTime, default=None)

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=True)  # changed
    google_id = db.Column(db.String(255), unique=True, nullable=True)  # new
    streak = db.Column(db.Integer, default=0)
    last_quiz_at = db.Column(db.DateTime, default=None)

class Upload(db.Model):
    __tablename__ = "uploads"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    filename = db.Column(db.String(255), nullable=False)
    filepath = db.Column(db.String(1024), nullable=False)
    file_hash = db.Column(db.String(64), nullable=False)
    collection_name = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Quiz(db.Model):
    __tablename__ = "quizzes"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    upload_id = db.Column(db.Integer, db.ForeignKey("uploads.id"), nullable=True)
    topic = db.Column(db.String(255))
    difficulty = db.Column(db.String(20))
    num_questions = db.Column(db.Integer)
    source = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class MCQItem(db.Model):
    __tablename__ = "mcq_items"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey("quizzes.id"), nullable=False)
    question_text = db.Column(db.Text, nullable=False)
    options = db.Column(JSONB, nullable=False)
    correct_index = db.Column(db.Integer, nullable=False)
    mcq_metadata  = db.Column(JSONB)

class QuizAttempt(db.Model):
    __tablename__ = "quiz_attempts"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey("quizzes.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    answers = db.Column(JSONB)
    correct_count = db.Column(db.Integer)
    wrong_count = db.Column(db.Integer)
    percentage = db.Column(db.Float)
    suggestion = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
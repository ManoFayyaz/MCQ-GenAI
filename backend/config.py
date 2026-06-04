# backend/config.py
import os

SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "postgresql+psycopg2://postgres:admin@localhost:5432/prepwise_db")

# Render gives "postgres://" but SQLAlchemy needs "postgresql+psycopg2://"
if SQLALCHEMY_DATABASE_URI.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URI = SQLALCHEMY_DATABASE_URI.replace("postgres://", "postgresql+psycopg2://", 1)

SQLALCHEMY_TRACK_MODIFICATIONS = False
SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")
UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "/tmp/uploads")  # ← works on any server


# # backend/config.py
# import os

# DB_USER = os.getenv("DB_USER", "postgres")
# DB_PASS = os.getenv("DB_PASS", "admin")
# DB_HOST = os.getenv("DB_HOST", "localhost")
# DB_PORT = os.getenv("DB_PORT", "5432")
# DB_NAME = os.getenv("DB_NAME", "prepwise_db")

# SQLALCHEMY_DATABASE_URI = f"postgresql+psycopg2://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
# SQLALCHEMY_TRACK_MODIFICATIONS = False
# SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")
# UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", r"D:\MCQ-GenAI\uploads")

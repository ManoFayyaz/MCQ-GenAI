import os

DB_USER = "postgres"           # your PostgreSQL username
DB_PASSWORD = "admin"  # replace with your real password
DB_HOST = "localhost"
DB_PORT = "5432"
DB_NAME = "prepwise_db"

SQLALCHEMY_DATABASE_URI = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
SQLALCHEMY_TRACK_MODIFICATIONS = False
# backend/create_db.py
from mcq_app import app
from models import db

with app.app_context():
    db.create_all()
    print(" DB tables created")

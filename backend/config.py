import os

class Config:
    # PostgreSQL connection
    # Format: postgresql://username:password@host:port/database
    SQLALCHEMY_DATABASE_URI = "postgresql://prepwise_user:admin@localhost:5432/prepwise_db"
    
    # Disable modification tracking (optional)
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Secret key for session management (login)
    SECRET_KEY = os.urandom(24)
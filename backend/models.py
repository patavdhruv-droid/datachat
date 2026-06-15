"""
DataChat - Database Models
Defines all SQLite tables using SQLAlchemy ORM.
"""

from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, ForeignKey, Float, Boolean
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./database/datachat.db")

# Create database directory if not exists
os.makedirs("./database", exist_ok=True)
os.makedirs("./uploads", exist_ok=True)
os.makedirs("./charts", exist_ok=True)

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}  # Needed for SQLite
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# ==================== USER TABLE ====================
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    plan = Column(String(20), default="free")  # free, pro, enterprise
    is_active = Column(Boolean, default=True)

    # Relationships
    datasets = relationship("Dataset", back_populates="owner", cascade="all, delete-orphan")
    analyses = relationship("Analysis", back_populates="owner", cascade="all, delete-orphan")


# ==================== DATASET TABLE ====================
class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    filename = Column(String(255), nullable=False)
    original_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size_mb = Column(Float, default=0.0)
    rows = Column(Integer, default=0)
    columns = Column(Integer, default=0)
    column_names = Column(Text)  # JSON string of column names
    column_types = Column(Text)  # JSON string of column data types
    missing_values = Column(Integer, default=0)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    owner = relationship("User", back_populates="datasets")
    analyses = relationship("Analysis", back_populates="dataset", cascade="all, delete-orphan")


# ==================== ANALYSIS TABLE (Chat Sessions) ====================
class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    dataset_id = Column(Integer, ForeignKey("datasets.id"))
    title = Column(String(255), default="Untitled Analysis")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    owner = relationship("User", back_populates="analyses")
    dataset = relationship("Dataset", back_populates="analyses")
    messages = relationship("Message", back_populates="analysis", cascade="all, delete-orphan")
    insights = relationship("Insight", back_populates="analysis", cascade="all, delete-orphan")


# ==================== MESSAGE TABLE (Chat Messages) ====================
class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, ForeignKey("analyses.id"))
    role = Column(String(20))  # "user" or "assistant"
    content = Column(Text, nullable=False)
    code = Column(Text, nullable=True)  # Generated Python code
    chart_path = Column(String(500), nullable=True)  # Path to chart image
    result_data = Column(Text, nullable=True)  # JSON result (tables, numbers)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    analysis = relationship("Analysis", back_populates="messages")


# ==================== INSIGHT TABLE (AI-Generated Insights) ====================
class Insight(Base):
    __tablename__ = "insights"

    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, ForeignKey("analyses.id"))
    title = Column(String(255))
    description = Column(Text)
    category = Column(String(50))  # trend, anomaly, growth, decline, etc.
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    analysis = relationship("Analysis", back_populates="insights")


# ==================== INIT DB ====================
def init_db():
    """Create all tables in database."""
    Base.metadata.create_all(bind=engine)
    print("✅ Database initialized successfully")


def get_db():
    """Dependency to get DB session in FastAPI routes."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


if __name__ == "__main__":
    init_db()
"""
Database connection and models for MedOptix API

This module provides SQLAlchemy database connection and ORM models.
"""

from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
import os

# Get the database path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, 'medoptix.db')
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

# Create base class for models
Base = declarative_base()

# Create SQLAlchemy engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# Create sessionmaker
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Define SQLAlchemy ORM models
class AppointmentModel(Base):
    __tablename__ = "appointments"

    appointment_id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, index=True)
    department = Column(String)
    appointment_date = Column(String)
    scheduled_time = Column(String, nullable=True)
    arrival_time = Column(String, nullable=True)
    group_name = Column(String)
    wait_time_minutes = Column(Integer, nullable=True)
    was_seen = Column(Integer)

    # Relationships
    feedback = relationship("FeedbackModel", back_populates="appointment")

class FeedbackModel(Base):
    __tablename__ = "feedback_data"

    id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(Integer, ForeignKey("appointments.appointment_id"))
    patient_id = Column(Integer)
    satisfaction_score = Column(Integer)
    comments = Column(String, nullable=True)
    group_name = Column(String)

    # Relationships
    appointment = relationship("AppointmentModel", back_populates="feedback")

class ServiceModel(Base):
    __tablename__ = "service_data"

    id = Column(Integer, primary_key=True, index=True)
    department = Column(String)
    date = Column(String)
    patients_seen = Column(Integer)
    avg_service_time_minutes = Column(Float)
    equipment_downtime_hours = Column(Float)

class StaffModel(Base):
    __tablename__ = "staff_logs"

    id = Column(Integer, primary_key=True, index=True)
    department = Column(String)
    date = Column(String)
    shift_start_time = Column(String)
    shift_end_time = Column(String)
    staff_count = Column(Integer)

# Create tables
Base.metadata.create_all(bind=engine)

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

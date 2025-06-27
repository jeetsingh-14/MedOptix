"""
feedback_logger.py - Script to log ML model predictions and actual outcomes

This script provides functionality to log predictions from the no-show prediction model
and the actual outcomes, which can be used for model evaluation and retraining.
"""

import os
import sqlite3
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, Float, String, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

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

# Define SQLAlchemy ORM model for model feedback
class ModelFeedbackModel(Base):
    __tablename__ = "model_feedback"

    id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(Integer, index=True)
    prediction = Column(Float)  # Probability of no-show
    actual_outcome = Column(Boolean)  # True for no_show, False for showed_up
    timestamp = Column(DateTime, default=datetime.now)
    model_version = Column(String)

# Create the model_feedback table if it doesn't exist
Base.metadata.create_all(bind=engine)

def log_prediction(appointment_id, prediction, model_version="v1.0"):
    """
    Log a prediction from the no-show prediction model.
    
    Args:
        appointment_id (int): The ID of the appointment
        prediction (float): The predicted probability of a no-show (0-1)
        model_version (str): The version of the model used for prediction
        
    Returns:
        int: The ID of the created log entry
    """
    db = SessionLocal()
    try:
        # Create a new model feedback entry with just the prediction
        model_feedback = ModelFeedbackModel(
            appointment_id=appointment_id,
            prediction=prediction,
            model_version=model_version
        )
        db.add(model_feedback)
        db.commit()
        db.refresh(model_feedback)
        return model_feedback.id
    finally:
        db.close()

def log_actual_outcome(appointment_id, actual_outcome):
    """
    Log the actual outcome for an appointment.
    
    Args:
        appointment_id (int): The ID of the appointment
        actual_outcome (bool): True for no_show, False for showed_up
        
    Returns:
        bool: True if the outcome was successfully logged, False otherwise
    """
    db = SessionLocal()
    try:
        # Find the most recent prediction for this appointment
        model_feedback = db.query(ModelFeedbackModel).filter(
            ModelFeedbackModel.appointment_id == appointment_id,
            ModelFeedbackModel.actual_outcome == None  # Only update entries without an outcome
        ).order_by(ModelFeedbackModel.timestamp.desc()).first()
        
        if model_feedback:
            # Update the actual outcome
            model_feedback.actual_outcome = actual_outcome
            db.commit()
            return True
        return False
    finally:
        db.close()

def get_feedback_data(limit=1000, model_version=None):
    """
    Get feedback data for model evaluation and retraining.
    
    Args:
        limit (int): Maximum number of records to return
        model_version (str): Filter by model version
        
    Returns:
        list: List of model feedback records
    """
    db = SessionLocal()
    try:
        query = db.query(ModelFeedbackModel).filter(
            ModelFeedbackModel.actual_outcome != None  # Only get entries with outcomes
        )
        
        if model_version:
            query = query.filter(ModelFeedbackModel.model_version == model_version)
            
        return query.order_by(ModelFeedbackModel.timestamp.desc()).limit(limit).all()
    finally:
        db.close()

if __name__ == "__main__":
    # Example usage
    print("Logging a prediction...")
    log_id = log_prediction(appointment_id=12345, prediction=0.75)
    print(f"Logged prediction with ID: {log_id}")
    
    print("Logging actual outcome...")
    success = log_actual_outcome(appointment_id=12345, actual_outcome=True)
    print(f"Logged actual outcome: {success}")
    
    print("Getting feedback data...")
    feedback_data = get_feedback_data(limit=10)
    for item in feedback_data:
        print(f"Appointment {item.appointment_id}: Predicted {item.prediction}, Actual {item.actual_outcome}")
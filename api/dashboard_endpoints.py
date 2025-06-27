"""
dashboard_endpoints.py - Additional API endpoints for MedOptix dashboard

This module provides the additional RESTful API endpoints required for the MedOptix dashboard,
including endpoints for dashboard summary, A/B testing results, predicted appointments,
recent alerts, rescheduling recommendations, feedback logging, and model status.
"""

import os
import sqlite3
import random
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel

# Import models from server.py
from server.models import (
    ABTestingInsight, 
    Appointment, 
    Feedback, 
    StreamAppointment, 
    Service, 
    Insights, 
    Staff
)

# Create API router
router = APIRouter()

# Path to the SQLite database
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, 'data', 'healthcare.db')

# Helper function to connect to the database
def get_db_connection():
    """
    Get a connection to the SQLite database
    
    Returns:
        sqlite3.Connection: Connection to the database
    """
    if not os.path.exists(DB_PATH):
        raise HTTPException(status_code=503, detail="Database not available")
    
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# Define Pydantic models for API responses
class DashboardSummary(BaseModel):
    total_appointments: int
    show_up_rate: float
    no_show_rate: float
    high_risk_appointments: int
    ab_test_winner: str

class PredictedAppointment(BaseModel):
    id: int
    patient_name: str
    appointment_time: str
    no_show_probability: float
    risk_level: str

class Alert(BaseModel):
    id: int
    patient_name: str
    appointment_time: str
    risk_level: str
    created_at: str

class RescheduleRecommendation(BaseModel):
    id: int
    original_appointment: str
    original_time: str
    suggested_time: str
    doctor: str
    confidence_score: float

class FeedbackLog(BaseModel):
    appointment_id: int
    prediction: str
    actual: str
    is_correct: bool

class ModelStatus(BaseModel):
    version: str
    last_retrain_date: str
    f1_score: float
    data_size: int

# Dashboard summary endpoint
@router.get("/dashboard/summary", response_model=DashboardSummary)
async def get_dashboard_summary():
    """
    Get dashboard summary data
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get total appointments
    cursor.execute("SELECT COUNT(*) FROM appointments")
    total_appointments = cursor.fetchone()[0]
    
    # Get show-up and no-show rates
    cursor.execute("SELECT COUNT(*) FROM appointments WHERE was_seen = 1")
    show_ups = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM appointments WHERE was_seen = 0")
    no_shows = cursor.fetchone()[0]
    
    show_up_rate = show_ups / total_appointments if total_appointments > 0 else 0
    no_show_rate = no_shows / total_appointments if total_appointments > 0 else 0
    
    # Get high-risk appointments (mock data)
    high_risk_appointments = int(total_appointments * 0.15)
    
    # Get A/B test winner (mock data)
    ab_test_winner = "SMS Reminders"
    
    conn.close()
    
    return {
        "total_appointments": total_appointments,
        "show_up_rate": show_up_rate,
        "no_show_rate": no_show_rate,
        "high_risk_appointments": high_risk_appointments,
        "ab_test_winner": ab_test_winner
    }

# A/B testing results endpoint
@router.get("/ab-testing/results")
async def get_ab_testing_results():
    """
    Get A/B testing results
    """
    # Mock data for A/B testing results
    return {
        "variants": [
            {
                "name": "SMS Reminders",
                "sample_size": 1250,
                "show_up_rate": 0.85,
                "no_show_rate": 0.15,
                "p_value": 0.032,
                "result": "Winner"
            },
            {
                "name": "Email Reminders",
                "sample_size": 1250,
                "show_up_rate": 0.78,
                "no_show_rate": 0.22,
                "p_value": 0.032,
                "result": "Control"
            }
        ],
        "chart_data": [
            {"variant": "SMS Reminders", "show_up_rate": 0.85},
            {"variant": "Email Reminders", "show_up_rate": 0.78}
        ]
    }

# Predicted appointments endpoint
@router.get("/appointments/predicted", response_model=List[PredictedAppointment])
async def get_predicted_appointments():
    """
    Get predicted appointments with no-show probabilities
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get appointments
    cursor.execute("SELECT appointment_id, patient_id, appointment_date, scheduled_time FROM appointments LIMIT 20")
    appointments = cursor.fetchall()
    
    conn.close()
    
    # Generate mock prediction data
    predicted_appointments = []
    for appointment in appointments:
        no_show_probability = random.uniform(0.05, 0.95)
        risk_level = "High" if no_show_probability > 0.7 else "Medium" if no_show_probability > 0.4 else "Low"
        
        predicted_appointments.append({
            "id": appointment["appointment_id"],
            "patient_name": f"Patient {appointment['patient_id']}",
            "appointment_time": f"{appointment['appointment_date']} {appointment['scheduled_time']}",
            "no_show_probability": no_show_probability,
            "risk_level": risk_level
        })
    
    return predicted_appointments

# Recent alerts endpoint
@router.get("/alerts/recent", response_model=List[Alert])
async def get_recent_alerts():
    """
    Get recent high-risk appointment alerts
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get appointments
    cursor.execute("SELECT appointment_id, patient_id, appointment_date, scheduled_time FROM appointments LIMIT 10")
    appointments = cursor.fetchall()
    
    conn.close()
    
    # Generate mock alert data
    alerts = []
    for i, appointment in enumerate(appointments):
        if i % 3 == 0:  # Only make 1/3 of appointments high risk
            alerts.append({
                "id": appointment["appointment_id"],
                "patient_name": f"Patient {appointment['patient_id']}",
                "appointment_time": f"{appointment['appointment_date']} {appointment['scheduled_time']}",
                "risk_level": "High",
                "created_at": (datetime.now() - timedelta(minutes=random.randint(5, 55))).strftime("%Y-%m-%d %H:%M:%S")
            })
    
    return alerts

# Rescheduling recommendations endpoint
@router.get("/recommendations/reschedule", response_model=List[RescheduleRecommendation])
async def get_reschedule_recommendations():
    """
    Get rescheduling recommendations for high-risk appointments
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get appointments
    cursor.execute("SELECT appointment_id, patient_id, appointment_date, scheduled_time FROM appointments LIMIT 10")
    appointments = cursor.fetchall()
    
    conn.close()
    
    # Generate mock recommendation data
    recommendations = []
    doctors = ["Dr. Smith", "Dr. Johnson", "Dr. Williams", "Dr. Brown", "Dr. Jones"]
    
    for appointment in appointments:
        original_date = datetime.strptime(appointment["appointment_date"], "%Y-%m-%d")
        original_time = appointment["scheduled_time"]
        
        # Generate a suggested time 1-3 days later
        suggested_date = original_date + timedelta(days=random.randint(1, 3))
        suggested_time = f"{random.randint(9, 16)}:{random.choice(['00', '30'])}"
        
        recommendations.append({
            "id": appointment["appointment_id"],
            "original_appointment": f"Patient {appointment['patient_id']}",
            "original_time": f"{appointment['appointment_date']} {original_time}",
            "suggested_time": f"{suggested_date.strftime('%Y-%m-%d')} {suggested_time}",
            "doctor": random.choice(doctors),
            "confidence_score": random.uniform(0.7, 0.95)
        })
    
    return recommendations

# Feedback log endpoint
@router.post("/feedback/log")
async def log_feedback(feedback: FeedbackLog):
    """
    Log feedback about prediction accuracy
    """
    # In a real implementation, this would store the feedback in the database
    return {"status": "success", "message": "Feedback logged successfully"}

# Model status endpoint
@router.get("/model/status", response_model=ModelStatus)
async def get_model_status():
    """
    Get current model status
    """
    return {
        "version": "1.2.3",
        "last_retrain_date": (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d"),
        "f1_score": 0.87,
        "data_size": 15420
    }
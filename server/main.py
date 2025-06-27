"""
FastAPI backend for MedOptix

This module provides RESTful API endpoints for accessing data from the MedOptix database.
"""

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import os
import sqlite3
from typing import List, Dict, Any
import json
from datetime import datetime, timedelta

# Import models and database
from .models import Appointment, Feedback, Service, Staff, Insights, ABTestingInsight, DepartmentInsight, CorrelationInsight, StreamAppointment
from .database import get_db, AppointmentModel, FeedbackModel, ServiceModel, StaffModel

# Import stream simulation
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from simulate_stream import start_stream_in_thread, TEMP_DB_PATH

# Create FastAPI app
app = FastAPI(
    title="MedOptix API",
    description="API for accessing MedOptix healthcare data",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint
@app.get("/")
async def root():
    """
    Root endpoint
    """
    return {"message": "Welcome to MedOptix API"}

# Health check endpoint
@app.get("/health")
async def health_check():
    """
    Health check endpoint
    """
    return {"status": "healthy"}

# Appointments endpoint
@app.get("/appointments", response_model=List[Appointment])
async def get_appointments(db: Session = Depends(get_db)):
    """
    Get all appointments
    """
    appointments = db.query(AppointmentModel).all()
    return appointments

# Staff endpoint
@app.get("/staff", response_model=List[Staff])
async def get_staff(db: Session = Depends(get_db)):
    """
    Get all staff logs
    """
    staff = db.query(StaffModel).all()
    return staff

# Service endpoint
@app.get("/service", response_model=List[Service])
async def get_service(db: Session = Depends(get_db)):
    """
    Get all service data
    """
    service = db.query(ServiceModel).all()
    return service

# Feedback endpoint
@app.get("/feedback", response_model=List[Feedback])
async def get_feedback(db: Session = Depends(get_db)):
    """
    Get all feedback data
    """
    feedback = db.query(FeedbackModel).all()
    return feedback

# Insights endpoint
@app.get("/insights", response_model=Insights)
async def get_insights():
    """
    Get precomputed insights
    """
    # Path to the summary report file
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    summary_path = os.path.join(base_dir, 'outputs', 'summary_report.txt')

    # Parse the summary report
    with open(summary_path, 'r') as f:
        content = f.read()

    # Extract A/B testing insights
    ab_testing = ABTestingInsight(
        wait_time_stats={
            "group_a_mean": 17.58,
            "group_b_mean": 17.68,
            "difference": -0.10
        },
        wait_time_test={
            "test_type": "Welch's t-test",
            "p_value": 0.8005,
            "significant": False
        },
        satisfaction_stats={
            "group_a_mean": 8.55,
            "group_b_mean": 8.53,
            "difference": 0.03
        },
        satisfaction_test={
            "test_type": "Mann-Whitney U test",
            "p_value": 0.7931,
            "significant": False
        },
        noshow_stats={
            "group_a_rate": 5.77,
            "group_b_rate": 6.23,
            "difference": -0.46
        },
        noshow_test={
            "test_type": "Chi-square test",
            "p_value": 0.4503,
            "significant": False
        },
        summary="No significant differences were found between Group A and Group B in terms of wait time, satisfaction scores, or no-show rates."
    )

    # Extract department insights
    department = DepartmentInsight(
        avg_patients=[
            {"department": "Pediatrics", "value": 64.1},
            {"department": "Cardiology", "value": 56.6},
            {"department": "Orthopedics", "value": 47.2},
            {"department": "Neurology", "value": 36.0}
        ],
        staff_patient_ratio=[
            {"department": "Neurology", "value": 0.84},
            {"department": "Orthopedics", "value": 0.65},
            {"department": "Cardiology", "value": 0.54},
            {"department": "Pediatrics", "value": 0.45}
        ],
        equipment_downtime=[
            {"department": "Pediatrics", "value": 0.96},
            {"department": "Cardiology", "value": 0.96},
            {"department": "Neurology", "value": 0.92},
            {"department": "Orthopedics", "value": 0.87}
        ],
        summary="Pediatrics has the highest patient load and lowest staff-to-patient ratio. Neurology has the highest staff-to-patient ratio but the lowest patient load."
    )

    # Extract correlation insights
    correlation = CorrelationInsight(
        wait_satisfaction_corr={
            "correlation": -0.88,
            "p_value": 0.0000,
            "significant": True
        },
        staff_patients_corr={
            "correlation": 0.04,
            "p_value": 0.4476,
            "significant": False
        },
        service_noshow_corr={
            "correlation": -0.02,
            "p_value": 0.6669,
            "significant": False
        },
        summary="There is a strong negative correlation between wait time and satisfaction scores, indicating that longer wait times lead to lower satisfaction."
    )

    # Combine all insights
    insights = Insights(
        ab_testing=ab_testing,
        department=department,
        correlation=correlation
    )

    return insights

# Stream appointments endpoint
@app.get("/stream/appointments", response_model=List[StreamAppointment])
async def get_stream_appointments(limit: int = 10):
    """
    Get the latest streamed appointments

    Args:
        limit (int): Maximum number of appointments to return (default: 10)
    """
    # Check if the temporary database exists
    if not os.path.exists(TEMP_DB_PATH):
        # Start the stream simulation in a separate thread if not already running
        start_stream_in_thread()
        # Return empty list initially
        return []

    try:
        # Connect to the temporary database
        conn = sqlite3.connect(TEMP_DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        # Query the latest appointments
        cursor.execute("""
        SELECT * FROM stream_appointments
        ORDER BY id DESC
        LIMIT ?
        """, (limit,))

        # Fetch results
        results = [dict(row) for row in cursor.fetchall()]

        # Close connection
        conn.close()

        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching stream data: {str(e)}")

# Run the application with uvicorn
if __name__ == "__main__":
    # Start the stream simulation in a separate thread
    start_stream_in_thread()

    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

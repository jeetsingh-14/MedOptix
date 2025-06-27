"""
server.py - FastAPI server for MedOptix dashboard

This module provides RESTful API endpoints for the MedOptix dashboard,
including a last_updated endpoint for the real-time ETL watcher.
"""

import os
import sqlite3
from typing import List, Dict, Any, Optional
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Import the ETL watcher to get the last updated timestamp
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from scripts.realtime_etl_watcher import get_last_updated, start_watcher
import threading

# Import the dashboard endpoints
from api.dashboard_endpoints import router as dashboard_router

# Create FastAPI app
app = FastAPI(
    title="MedOptix API",
    description="API for MedOptix dashboard with real-time ETL updates",
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

# Path to the SQLite database
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, 'data', 'healthcare.db')

# Define Pydantic models for API responses
class LastUpdated(BaseModel):
    timestamp: str
    formatted: str

class Appointment(BaseModel):
    appointment_id: int
    patient_id: int
    department: str
    appointment_date: str
    scheduled_time: str
    arrival_time: Optional[str] = None
    group_name: str
    wait_time_minutes: int
    was_seen: int

class Feedback(BaseModel):
    id: int
    appointment_id: int
    patient_id: int
    satisfaction_score: int
    comments: Optional[str] = None
    group_name: str

class Service(BaseModel):
    id: int
    department: str
    date: str
    patients_seen: int
    avg_service_time_minutes: float
    equipment_downtime_hours: float

class Staff(BaseModel):
    id: int
    department: str
    date: str
    shift_start_time: str
    shift_end_time: str
    staff_count: int

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

# Last updated endpoint
@app.get("/last_updated", response_model=LastUpdated)
async def last_updated():
    """
    Get the timestamp of the last ETL update
    """
    last_update = get_last_updated()
    return {
        "timestamp": last_update.isoformat(),
        "formatted": last_update.strftime("%Y-%m-%d %H:%M:%S")
    }

# Appointments endpoint
@app.get("/appointments", response_model=List[Appointment])
async def get_appointments():
    """
    Get all appointments
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM appointments")
    appointments = [dict(row) for row in cursor.fetchall()]

    conn.close()
    return appointments

# Feedback endpoint
@app.get("/feedback", response_model=List[Feedback])
async def get_feedback():
    """
    Get all feedback data
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM feedback_data")
    feedback = [dict(row) for row in cursor.fetchall()]

    conn.close()
    return feedback

# Service endpoint
@app.get("/service", response_model=List[Service])
async def get_service():
    """
    Get all service data
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM service_data")
    service = [dict(row) for row in cursor.fetchall()]

    conn.close()
    return service

# Staff endpoint
@app.get("/staff", response_model=List[Staff])
async def get_staff():
    """
    Get all staff logs
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM staff_logs")
    staff = [dict(row) for row in cursor.fetchall()]

    conn.close()
    return staff

# Include the dashboard router
app.include_router(dashboard_router, tags=["dashboard"])

# Start the file watcher in a separate thread when the app starts
@app.on_event("startup")
async def startup_event():
    """
    Start the file watcher when the app starts
    """
    # Start the file watcher in a separate thread
    watcher_thread = threading.Thread(target=start_watcher, daemon=True)
    watcher_thread.start()

# Run the application with uvicorn
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)

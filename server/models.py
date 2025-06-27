"""
Pydantic models for MedOptix API

This module defines the data models used for validation and serialization in the API.
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import date, time

# Appointment model
class Appointment(BaseModel):
    appointment_id: int
    patient_id: int
    department: str
    appointment_date: str
    scheduled_time: Optional[str] = None
    arrival_time: Optional[str] = None
    group_name: str
    wait_time_minutes: Optional[int] = None
    was_seen: int

    class Config:
        orm_mode = True

# Feedback model
class Feedback(BaseModel):
    id: int
    appointment_id: int
    patient_id: int
    satisfaction_score: int
    comments: Optional[str] = None
    group_name: str

    class Config:
        orm_mode = True

# Service model
class Service(BaseModel):
    id: int
    department: str
    date: str
    patients_seen: int
    avg_service_time_minutes: float
    equipment_downtime_hours: float

    class Config:
        orm_mode = True

# Staff model
class Staff(BaseModel):
    id: int
    department: str
    date: str
    shift_start_time: str
    shift_end_time: str
    staff_count: int

    class Config:
        orm_mode = True

# Insights model for A/B testing results
class ABTestingInsight(BaseModel):
    wait_time_stats: Dict[str, float]
    wait_time_test: Dict[str, Any]
    satisfaction_stats: Dict[str, float]
    satisfaction_test: Dict[str, Any]
    noshow_stats: Dict[str, float]
    noshow_test: Dict[str, Any]
    summary: str

# Insights model for department analysis
class DepartmentInsight(BaseModel):
    avg_patients: List[Dict[str, Any]]
    staff_patient_ratio: List[Dict[str, Any]]
    equipment_downtime: List[Dict[str, Any]]
    summary: str

# Insights model for correlation analysis
class CorrelationInsight(BaseModel):
    wait_satisfaction_corr: Dict[str, Any]
    staff_patients_corr: Dict[str, Any]
    service_noshow_corr: Dict[str, Any]
    summary: str

# Stream appointment model
class StreamAppointment(BaseModel):
    id: int
    appointment_id: int
    patient_id: int
    department: str
    appointment_date: str
    scheduled_time: Optional[str] = None
    arrival_time: Optional[str] = None
    group_name: Optional[str] = None
    wait_time_minutes: int
    was_seen: int
    satisfaction_score: int
    comments: Optional[str] = None
    timestamp: str

    class Config:
        orm_mode = True

# Combined insights model
class Insights(BaseModel):
    ab_testing: ABTestingInsight
    department: DepartmentInsight
    correlation: CorrelationInsight

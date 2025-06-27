import pandas as pd
import numpy as np
import datetime
import random
from datetime import datetime, timedelta

# Set random seed for reproducibility
np.random.seed(42)
random.seed(42)

# Constants
DEPARTMENTS = ['Cardiology', 'Orthopedics', 'Neurology', 'Pediatrics']
NUM_PATIENTS = 1000
NUM_APPOINTMENTS = 7000
NUM_DAYS = 90
OUTPUT_DIR = './data/raw/'

# Generate date range for the last 90 days
end_date = datetime.now()
start_date = end_date - timedelta(days=NUM_DAYS)
date_range = [start_date + timedelta(days=x) for x in range(NUM_DAYS)]

# Helper functions
def random_time(start_hour=8, end_hour=18):
    """Generate a random time between start_hour and end_hour"""
    hour = random.randint(start_hour, end_hour-1)
    minute = random.choice([0, 15, 30, 45])
    return f"{hour:02d}:{minute:02d}"

def generate_arrival_time(scheduled_time):
    """Generate arrival time based on scheduled time with some variability"""
    scheduled_hour, scheduled_minute = map(int, scheduled_time.split(':'))
    scheduled_minutes = scheduled_hour * 60 + scheduled_minute
    
    # Patients can be early (negative), on time (0), or late (positive)
    arrival_offset = np.random.normal(0, 15)  # mean 0, std 15 minutes
    arrival_minutes = max(8*60, min(18*60, int(scheduled_minutes + arrival_offset)))
    
    arrival_hour = arrival_minutes // 60
    arrival_minute = arrival_minutes % 60
    return f"{arrival_hour:02d}:{arrival_minute:02d}"

def calculate_wait_time(scheduled_time, arrival_time):
    """Calculate wait time in minutes"""
    scheduled_hour, scheduled_minute = map(int, scheduled_time.split(':'))
    arrival_hour, arrival_minute = map(int, arrival_time.split(':'))
    
    scheduled_minutes = scheduled_hour * 60 + scheduled_minute
    arrival_minutes = arrival_hour * 60 + arrival_minute
    
    # Base wait time depends on arrival time relative to scheduled time
    if arrival_minutes <= scheduled_minutes:
        # If early or on time, wait time is based on queue and random factors
        base_wait = max(0, scheduled_minutes - arrival_minutes) + np.random.exponential(15)
    else:
        # If late, wait time is typically shorter but still has some queue time
        base_wait = np.random.exponential(10)
    
    return max(0, int(base_wait))

def generate_comment(satisfaction_score, wait_time):
    """Generate a comment based on satisfaction score and wait time"""
    # Most entries will have NA for comments
    if random.random() < 0.8:
        return "NA"
    
    positive_comments = [
        "Great service!",
        "Staff was very helpful.",
        "Doctor was knowledgeable and caring.",
        "Very efficient process.",
        "Excellent care provided."
    ]
    
    negative_comments = [
        "Waited too long.",
        "Staff seemed rushed.",
        "Doctor didn't address all my concerns.",
        "The facility needs updating.",
        "Appointment felt rushed."
    ]
    
    if satisfaction_score >= 7:
        return random.choice(positive_comments)
    else:
        return random.choice(negative_comments)

# 1. Generate appointments.csv
def generate_appointments():
    print("Generating appointments.csv...")
    
    # Generate patient IDs
    patient_ids = list(range(1, NUM_PATIENTS + 1))
    
    # Generate appointment data
    appointments = []
    for appointment_id in range(1, NUM_APPOINTMENTS + 1):
        appointment_date = random.choice(date_range)
        scheduled_time = random_time()
        arrival_time = generate_arrival_time(scheduled_time)
        department = random.choice(DEPARTMENTS)
        group = random.choice(['A', 'B'])
        patient_id = random.choice(patient_ids)
        
        # Calculate wait time
        wait_time = calculate_wait_time(scheduled_time, arrival_time)
        
        # Determine if patient was seen (no-show probability increases with longer wait times)
        no_show_prob = 0.05 + (0.01 * (wait_time // 15))  # Increase no-show chance by 1% for every 15 min of wait
        was_seen = 0 if random.random() < no_show_prob else 1
        
        appointments.append({
            'appointment_id': appointment_id,
            'patient_id': patient_id,
            'department': department,
            'appointment_date': appointment_date.strftime('%Y-%m-%d'),
            'scheduled_time': scheduled_time,
            'arrival_time': arrival_time,
            'group': group,
            'wait_time_minutes': wait_time,
            'was_seen': was_seen
        })
    
    # Create DataFrame and save to CSV
    df_appointments = pd.DataFrame(appointments)
    df_appointments.to_csv(f"{OUTPUT_DIR}appointments.csv", index=False)
    
    return df_appointments

# 2. Generate staff_logs.csv
def generate_staff_logs():
    print("Generating staff_logs.csv...")
    
    staff_logs = []
    for department in DEPARTMENTS:
        for date in date_range:
            # Morning shift
            morning_staff = random.randint(5, 20)
            staff_logs.append({
                'department': department,
                'date': date.strftime('%Y-%m-%d'),
                'shift_start_time': '08:00',
                'shift_end_time': '16:00',
                'staff_count': morning_staff
            })
            
            # Evening shift
            evening_staff = random.randint(5, 20)
            staff_logs.append({
                'department': department,
                'date': date.strftime('%Y-%m-%d'),
                'shift_start_time': '16:00',
                'shift_end_time': '00:00',
                'staff_count': evening_staff
            })
    
    # Create DataFrame and save to CSV
    df_staff_logs = pd.DataFrame(staff_logs)
    df_staff_logs.to_csv(f"{OUTPUT_DIR}staff_logs.csv", index=False)
    
    return df_staff_logs

# 3. Generate service_data.csv
def generate_service_data():
    print("Generating service_data.csv...")
    
    service_data = []
    for department in DEPARTMENTS:
        # Set department-specific ranges
        if department == 'Cardiology':
            patients_range = (20, 100)
            service_time_range = (20, 60)
        elif department == 'Orthopedics':
            patients_range = (15, 80)
            service_time_range = (15, 45)
        elif department == 'Neurology':
            patients_range = (10, 60)
            service_time_range = (30, 60)
        else:  # Pediatrics
            patients_range = (30, 100)
            service_time_range = (10, 30)
        
        for date in date_range:
            # Simulate equipment downtime with occasional spikes
            if random.random() < 0.05:  # 5% chance of significant downtime
                equipment_downtime = round(random.uniform(2, 4), 1)
            else:
                equipment_downtime = round(random.uniform(0, 1.5), 1)
            
            service_data.append({
                'department': department,
                'date': date.strftime('%Y-%m-%d'),
                'patients_seen': random.randint(*patients_range),
                'avg_service_time_minutes': random.randint(*service_time_range),
                'equipment_downtime_hours': equipment_downtime
            })
    
    # Create DataFrame and save to CSV
    df_service_data = pd.DataFrame(service_data)
    df_service_data.to_csv(f"{OUTPUT_DIR}service_data.csv", index=False)
    
    return df_service_data

# 4. Generate feedback_data.csv
def generate_feedback_data(appointments_df):
    print("Generating feedback_data.csv...")
    
    feedback_data = []
    
    # Not all appointments will have feedback
    feedback_appointments = appointments_df[appointments_df['was_seen'] == 1].sample(
        frac=0.8, random_state=42)
    
    for _, appointment in feedback_appointments.iterrows():
        # Satisfaction score inversely related to wait time
        base_satisfaction = 10 - min(9, appointment['wait_time_minutes'] // 10)
        # Add some randomness
        satisfaction = max(1, min(10, int(base_satisfaction + random.randint(-1, 1))))
        
        feedback_data.append({
            'appointment_id': appointment['appointment_id'],
            'patient_id': appointment['patient_id'],
            'satisfaction_score': satisfaction,
            'comments': generate_comment(satisfaction, appointment['wait_time_minutes']),
            'group': appointment['group']
        })
    
    # Create DataFrame and save to CSV
    df_feedback = pd.DataFrame(feedback_data)
    df_feedback.to_csv(f"{OUTPUT_DIR}feedback_data.csv", index=False)
    
    return df_feedback

# Main execution
def main():
    print("Starting dataset generation...")
    
    # Generate all datasets
    appointments_df = generate_appointments()
    generate_staff_logs()
    generate_service_data()
    generate_feedback_data(appointments_df)
    
    print("All datasets generated successfully!")

if __name__ == "__main__":
    main()
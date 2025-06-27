"""
simulate_stream.py - Simulate streaming data for MedOptix

This script randomly selects entries from the 4 base datasets and streams them
into a temporary SQLite table every 5-10 seconds. It includes new appointment IDs,
simulated feedback, and wait times.
"""

import os
import time
import random
import sqlite3
import pandas as pd
from datetime import datetime, timedelta
import threading

# Import extraction functions
from scripts.extract import extract_all_data

# Path to the temporary database
TEMP_DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'temp_stream.db')

def create_stream_table():
    """
    Create a temporary SQLite database with a stream_appointments table
    
    Returns:
        sqlite3.Connection: Connection to the database
    """
    # Remove existing database if it exists
    if os.path.exists(TEMP_DB_PATH):
        os.remove(TEMP_DB_PATH)
    
    # Create new database
    conn = sqlite3.connect(TEMP_DB_PATH)
    
    # Create stream_appointments table
    conn.execute('''
    CREATE TABLE IF NOT EXISTS stream_appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        appointment_id INTEGER,
        patient_id INTEGER,
        department TEXT,
        appointment_date TEXT,
        scheduled_time TEXT,
        arrival_time TEXT,
        group_name TEXT,
        wait_time_minutes INTEGER,
        was_seen INTEGER,
        satisfaction_score INTEGER,
        comments TEXT,
        timestamp TEXT
    )
    ''')
    
    conn.commit()
    return conn

def generate_random_appointment(appointments_df, feedback_df):
    """
    Generate a random appointment by selecting and combining data from the datasets
    
    Args:
        appointments_df (pandas.DataFrame): Appointments data
        feedback_df (pandas.DataFrame): Feedback data
        
    Returns:
        dict: A dictionary with the appointment data
    """
    # Select a random appointment
    appointment = appointments_df.sample(1).iloc[0].to_dict()
    
    # Generate a new unique appointment ID
    appointment['appointment_id'] = int(time.time() * 1000) % 1000000
    
    # Update appointment date to be recent
    today = datetime.now()
    random_days = random.randint(0, 7)
    appointment_date = today - timedelta(days=random_days)
    appointment['appointment_date'] = appointment_date.strftime('%Y-%m-%d')
    
    # Simulate wait time (5-60 minutes)
    appointment['wait_time_minutes'] = random.randint(5, 60)
    
    # Simulate feedback
    # Lower satisfaction for longer wait times
    max_satisfaction = 10 - min(5, appointment['wait_time_minutes'] // 10)
    appointment['satisfaction_score'] = random.randint(max(1, max_satisfaction - 2), max_satisfaction)
    
    # Select a random comment from the feedback dataset or use a generic one
    if not feedback_df.empty and 'comments' in feedback_df.columns:
        comments = feedback_df['comments'].dropna().tolist()
        if comments:
            appointment['comments'] = random.choice(comments)
        else:
            appointment['comments'] = "No comment provided."
    else:
        appointment['comments'] = "No comment provided."
    
    # Add timestamp
    appointment['timestamp'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    return appointment

def stream_data_to_db(conn, appointments_df, feedback_df):
    """
    Stream a random appointment to the database
    
    Args:
        conn (sqlite3.Connection): Connection to the database
        appointments_df (pandas.DataFrame): Appointments data
        feedback_df (pandas.DataFrame): Feedback data
    """
    # Generate random appointment
    appointment = generate_random_appointment(appointments_df, feedback_df)
    
    # Insert into database
    cursor = conn.cursor()
    cursor.execute('''
    INSERT INTO stream_appointments (
        appointment_id, patient_id, department, appointment_date, 
        scheduled_time, arrival_time, group_name, wait_time_minutes, 
        was_seen, satisfaction_score, comments, timestamp
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        appointment['appointment_id'],
        appointment['patient_id'],
        appointment['department'],
        appointment['appointment_date'],
        appointment.get('scheduled_time', None),
        appointment.get('arrival_time', None),
        appointment.get('group_name', 'A'),
        appointment['wait_time_minutes'],
        appointment.get('was_seen', 1),
        appointment['satisfaction_score'],
        appointment['comments'],
        appointment['timestamp']
    ))
    
    conn.commit()
    print(f"Streamed appointment {appointment['appointment_id']} at {appointment['timestamp']}")

def run_stream_simulation():
    """
    Run the streaming simulation
    """
    print("Starting stream simulation...")
    
    # Extract data from CSV files
    appointments_df, feedback_df, _, _ = extract_all_data()
    
    # Create stream table
    conn = create_stream_table()
    
    try:
        # Run indefinitely
        while True:
            # Stream data to database
            stream_data_to_db(conn, appointments_df, feedback_df)
            
            # Wait for random interval (5-10 seconds)
            wait_time = random.uniform(5, 10)
            time.sleep(wait_time)
    except KeyboardInterrupt:
        print("\nStream simulation stopped.")
    finally:
        conn.close()

def start_stream_in_thread():
    """
    Start the stream simulation in a separate thread
    
    Returns:
        threading.Thread: The thread running the simulation
    """
    stream_thread = threading.Thread(target=run_stream_simulation)
    stream_thread.daemon = True
    stream_thread.start()
    return stream_thread

if __name__ == "__main__":
    run_stream_simulation()
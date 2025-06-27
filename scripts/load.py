"""
load.py - Load transformed data into SQLite database

This script contains functions to load the transformed data into a SQLite database.
"""

import os
import sqlite3
import pandas as pd

def get_db_path():
    """
    Get the full path to the SQLite database
    
    Returns:
        str: Full path to the database
    """
    current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    db_dir = os.path.join(current_dir, 'data')
    
    # Create the data directory if it doesn't exist
    if not os.path.exists(db_dir):
        os.makedirs(db_dir)
    
    return os.path.join(db_dir, 'healthcare.db')

def create_database():
    """
    Create the SQLite database and tables
    
    Returns:
        sqlite3.Connection: Connection to the database
    """
    db_path = get_db_path()
    conn = sqlite3.connect(db_path)
    
    # Create tables with appropriate schema and foreign key constraints
    
    # Appointments table
    conn.execute('''
    CREATE TABLE IF NOT EXISTS appointments (
        appointment_id INTEGER PRIMARY KEY,
        patient_id INTEGER,
        department TEXT,
        appointment_date TEXT,
        scheduled_time TEXT,
        arrival_time TEXT,
        group_name TEXT,
        wait_time_minutes INTEGER,
        was_seen INTEGER
    )
    ''')
    
    # Feedback data table with foreign key to appointments
    conn.execute('''
    CREATE TABLE IF NOT EXISTS feedback_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        appointment_id INTEGER,
        patient_id INTEGER,
        satisfaction_score INTEGER,
        comments TEXT,
        group_name TEXT,
        FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id),
        FOREIGN KEY (patient_id) REFERENCES appointments(patient_id)
    )
    ''')
    
    # Service data table
    conn.execute('''
    CREATE TABLE IF NOT EXISTS service_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        department TEXT,
        date TEXT,
        patients_seen INTEGER,
        avg_service_time_minutes REAL,
        equipment_downtime_hours REAL
    )
    ''')
    
    # Staff logs table
    conn.execute('''
    CREATE TABLE IF NOT EXISTS staff_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        department TEXT,
        date TEXT,
        shift_start_time TEXT,
        shift_end_time TEXT,
        staff_count INTEGER
    )
    ''')
    
    conn.commit()
    return conn

def load_appointments(conn, df):
    """
    Load appointments data into the database
    
    Args:
        conn (sqlite3.Connection): Connection to the database
        df (pandas.DataFrame): Transformed appointments data
    """
    # Rename 'group' column to 'group_name' to avoid SQL keyword conflict
    df = df.rename(columns={'group': 'group_name'})
    
    # Convert datetime objects to strings for SQLite
    if isinstance(df['appointment_date'].iloc[0], pd.Timestamp):
        df['appointment_date'] = df['appointment_date'].dt.strftime('%Y-%m-%d')
    
    if hasattr(df['scheduled_time'].iloc[0], 'strftime'):
        df['scheduled_time'] = df['scheduled_time'].apply(lambda x: x.strftime('%H:%M') if x else None)
    
    if hasattr(df['arrival_time'].iloc[0], 'strftime'):
        df['arrival_time'] = df['arrival_time'].apply(lambda x: x.strftime('%H:%M') if x else None)
    
    # Load data into the database
    df.to_sql('appointments', conn, if_exists='replace', index=False)

def load_feedback_data(conn, df):
    """
    Load feedback data into the database
    
    Args:
        conn (sqlite3.Connection): Connection to the database
        df (pandas.DataFrame): Transformed feedback data
    """
    # Rename 'group' column to 'group_name' to avoid SQL keyword conflict
    df = df.rename(columns={'group': 'group_name'})
    
    # Load data into the database
    df.to_sql('feedback_data', conn, if_exists='replace', index=False)

def load_service_data(conn, df):
    """
    Load service data into the database
    
    Args:
        conn (sqlite3.Connection): Connection to the database
        df (pandas.DataFrame): Transformed service data
    """
    # Convert datetime objects to strings for SQLite
    if isinstance(df['date'].iloc[0], pd.Timestamp):
        df['date'] = df['date'].dt.strftime('%Y-%m-%d')
    
    # Load data into the database
    df.to_sql('service_data', conn, if_exists='replace', index=False)

def load_staff_logs(conn, df):
    """
    Load staff logs data into the database
    
    Args:
        conn (sqlite3.Connection): Connection to the database
        df (pandas.DataFrame): Transformed staff logs data
    """
    # Convert datetime objects to strings for SQLite
    if isinstance(df['date'].iloc[0], pd.Timestamp):
        df['date'] = df['date'].dt.strftime('%Y-%m-%d')
    
    if hasattr(df['shift_start_time'].iloc[0], 'strftime'):
        df['shift_start_time'] = df['shift_start_time'].apply(lambda x: x.strftime('%H:%M') if x else None)
    
    if hasattr(df['shift_end_time'].iloc[0], 'strftime'):
        df['shift_end_time'] = df['shift_end_time'].apply(lambda x: x.strftime('%H:%M') if x else None)
    
    # Load data into the database
    df.to_sql('staff_logs', conn, if_exists='replace', index=False)

def load_all_data(appointments_df, feedback_df, service_df, staff_df):
    """
    Load all transformed data into the database
    
    Args:
        appointments_df (pandas.DataFrame): Transformed appointments data
        feedback_df (pandas.DataFrame): Transformed feedback data
        service_df (pandas.DataFrame): Transformed service data
        staff_df (pandas.DataFrame): Transformed staff logs data
        
    Returns:
        str: Path to the created database
    """
    # Create database and get connection
    conn = create_database()
    
    # Load data into tables
    load_appointments(conn, appointments_df)
    load_feedback_data(conn, feedback_df)
    load_service_data(conn, service_df)
    load_staff_logs(conn, staff_df)
    
    # Close connection
    conn.close()
    
    return get_db_path()

if __name__ == "__main__":
    # Test loading with some sample data
    from extract import extract_all_data
    from transform import transform_all_data
    
    # Extract data
    appointments_df, feedback_df, service_df, staff_df = extract_all_data()
    
    # Transform data
    appointments_clean, feedback_clean, service_clean, staff_clean = transform_all_data(
        appointments_df, feedback_df, service_df, staff_df
    )
    
    # Load data
    db_path = load_all_data(appointments_clean, feedback_clean, service_clean, staff_clean)
    
    print(f"Data loaded successfully into {db_path}")
    
    # Verify data was loaded by querying the database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Get row counts for each table
    cursor.execute("SELECT COUNT(*) FROM appointments")
    appointments_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM feedback_data")
    feedback_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM service_data")
    service_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM staff_logs")
    staff_count = cursor.fetchone()[0]
    
    conn.close()
    
    print(f"Appointments table: {appointments_count} rows")
    print(f"Feedback data table: {feedback_count} rows")
    print(f"Service data table: {service_count} rows")
    print(f"Staff logs table: {staff_count} rows")
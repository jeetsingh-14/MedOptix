import os
import time
import sqlite3
from scripts.extract import extract_all_data
from scripts.transform import transform_all_data
from scripts.load import load_all_data

def run_etl_pipeline():
    print("Starting ETL pipeline...")
    start_time = time.time()

    print("\nStep 1: Extracting data from CSV files...")
    extract_start = time.time()
    appointments_df, feedback_df, service_df, staff_df = extract_all_data()
    extract_end = time.time()
    print(f"Extraction completed in {extract_end - extract_start:.2f} seconds")
    print(f"Appointments data shape: {appointments_df.shape}")
    print(f"Feedback data shape: {feedback_df.shape}")
    print(f"Service data shape: {service_df.shape}")
    print(f"Staff logs data shape: {staff_df.shape}")

    print("\nStep 2: Transforming and cleaning data...")
    transform_start = time.time()
    appointments_clean, feedback_clean, service_clean, staff_clean = transform_all_data(
        appointments_df, feedback_df, service_df, staff_df
    )
    transform_end = time.time()
    print(f"Transformation completed in {transform_end - transform_start:.2f} seconds")

    print("\nStep 3: Loading data into SQLite database...")
    load_start = time.time()
    db_path = load_all_data(appointments_clean, feedback_clean, service_clean, staff_clean)
    load_end = time.time()
    print(f"Loading completed in {load_end - load_start:.2f} seconds")

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM appointments")
    appointments_count = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM feedback_data")
    feedback_count = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM service_data")
    service_count = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM staff_logs")
    staff_count = cursor.fetchone()[0]

    conn.close()

    print("\nDatabase created successfully!")
    print(f"Database location: {db_path}")
    print(f"Appointments table: {appointments_count} rows")
    print(f"Feedback data table: {feedback_count} rows")
    print(f"Service data table: {service_count} rows")
    print(f"Staff logs table: {staff_count} rows")

    end_time = time.time()
    print(f"\nTotal ETL process completed in {end_time - start_time:.2f} seconds")

    return db_path

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(current_dir, 'data')
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)

    db_path = run_etl_pipeline()

    print("\nETL pipeline completed successfully!")
    print(f"The cleaned data is now available in the SQLite database: {db_path}")
    print("You can query this database using any SQLite client or Python's sqlite3 module.")

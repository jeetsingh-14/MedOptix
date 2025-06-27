"""
realtime_etl_watcher.py - Real-time ETL watcher for MedOptix

This script monitors the ./data/raw/ folder for new or updated CSV files
and triggers the ETL process when changes are detected.
"""

import os
import time
import sqlite3
import logging
from datetime import datetime
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# Import ETL functions
from scripts.extract import extract_all_data
from scripts.transform import transform_all_data
from scripts.load import load_all_data

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# Path to the data directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW_DATA_DIR = os.path.join(BASE_DIR, 'data', 'raw')
DB_PATH = os.path.join(BASE_DIR, 'data', 'healthcare.db')

# Store the last updated timestamp
last_updated = datetime.now()

class CSVFileHandler(FileSystemEventHandler):
    """
    Handler for CSV file events in the watched directory
    """
    def __init__(self):
        self.last_processed = time.time()
        # Minimum time between processing events (to avoid multiple triggers)
        self.cooldown = 5  # seconds

    def on_any_event(self, event):
        # Skip directory events and non-CSV files
        if event.is_directory or not event.src_path.endswith('.csv'):
            return
        
        # Skip events during cooldown period
        current_time = time.time()
        if current_time - self.last_processed < self.cooldown:
            return
        
        self.last_processed = current_time
        
        logger.info(f"Change detected in {event.src_path}")
        logger.info("Triggering ETL process...")
        
        try:
            # Run the ETL process
            run_etl_pipeline()
            
            # Update the last updated timestamp
            global last_updated
            last_updated = datetime.now()
            
            logger.info(f"ETL process completed successfully. Last updated: {last_updated}")
        except Exception as e:
            logger.error(f"Error in ETL process: {str(e)}")

def run_etl_pipeline():
    """
    Run the complete ETL pipeline
    """
    logger.info("Starting ETL pipeline...")
    
    # Step 1: Extract data from CSV files
    logger.info("Step 1: Extracting data from CSV files...")
    appointments_df, feedback_df, service_df, staff_df = extract_all_data()
    
    # Step 2: Transform and clean the data
    logger.info("Step 2: Transforming and cleaning data...")
    appointments_clean, feedback_clean, service_clean, staff_clean = transform_all_data(
        appointments_df, feedback_df, service_df, staff_df
    )
    
    # Step 3: Load the data into a SQLite database
    logger.info("Step 3: Loading data into SQLite database...")
    db_path = load_all_data(appointments_clean, feedback_clean, service_clean, staff_clean)
    
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
    
    logger.info(f"Database updated successfully!")
    logger.info(f"Appointments table: {appointments_count} rows")
    logger.info(f"Feedback data table: {feedback_count} rows")
    logger.info(f"Service data table: {service_count} rows")
    logger.info(f"Staff logs table: {staff_count} rows")
    
    return db_path

def get_last_updated():
    """
    Get the timestamp of the last ETL update
    
    Returns:
        datetime: Timestamp of the last update
    """
    return last_updated

def start_watcher():
    """
    Start the file watcher to monitor the raw data directory
    """
    # Create the raw data directory if it doesn't exist
    if not os.path.exists(RAW_DATA_DIR):
        os.makedirs(RAW_DATA_DIR)
        logger.info(f"Created directory: {RAW_DATA_DIR}")
    
    # Create an observer and event handler
    event_handler = CSVFileHandler()
    observer = Observer()
    observer.schedule(event_handler, RAW_DATA_DIR, recursive=False)
    
    # Start the observer
    observer.start()
    logger.info(f"Started watching directory: {RAW_DATA_DIR}")
    
    try:
        # Run the ETL pipeline once at startup
        run_etl_pipeline()
        
        # Keep the observer running
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
        logger.info("File watcher stopped")
    
    observer.join()

if __name__ == "__main__":
    logger.info("Starting real-time ETL watcher...")
    start_watcher()
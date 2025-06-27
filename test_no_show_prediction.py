"""
test_no_show_prediction.py - Test script for the no-show prediction system

This script demonstrates the complete workflow of the no-show prediction system:
1. Making predictions
2. Logging feedback
3. Retraining the model
"""

import os
import sqlite3
import random
from datetime import datetime, timedelta

from scripts.no_show_predictor import NoShowPredictor, predict_no_show, update_appointment_outcomes
from scripts.feedback_logger import log_prediction, log_actual_outcome, get_feedback_data
from scripts.retrain_model import retrain_model

def test_prediction_workflow():
    """Test the complete prediction workflow."""
    print("\n=== Testing No-Show Prediction Workflow ===\n")
    
    # Get database path
    base_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(base_dir, 'medoptix.db')
    
    # 1. Check if database exists
    if not os.path.exists(db_path):
        print(f"Error: Database not found at {db_path}")
        print("Please run main.py first to create the database.")
        return
    
    # 2. Get a sample appointment
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT appointment_id FROM appointments LIMIT 5")
        appointment_ids = [row[0] for row in cursor.fetchall()]
        
        if not appointment_ids:
            print("Error: No appointments found in the database.")
            return
            
        print(f"Found {len(appointment_ids)} appointments for testing.")
    except sqlite3.OperationalError as e:
        print(f"Error accessing database: {e}")
        return
    finally:
        conn.close()
    
    # 3. Train the model if it doesn't exist
    models_dir = os.path.join(base_dir, 'models')
    if not os.path.exists(models_dir) or not os.listdir(models_dir):
        print("\n--- Initial Model Training ---")
        predictor = NoShowPredictor()
        accuracy = predictor.train(db_path)
        print(f"Initial model trained with accuracy: {accuracy:.2f}")
    else:
        print("\n--- Using existing model ---")
    
    # 4. Make predictions for sample appointments
    print("\n--- Making Predictions ---")
    for appointment_id in appointment_ids:
        try:
            no_show_prob = predict_no_show(appointment_id, db_path)
            print(f"Appointment {appointment_id}: {no_show_prob:.2%} probability of no-show")
        except Exception as e:
            print(f"Error predicting for appointment {appointment_id}: {e}")
    
    # 5. Simulate actual outcomes and log them
    print("\n--- Logging Actual Outcomes ---")
    for appointment_id in appointment_ids:
        # Randomly generate an outcome (for demonstration)
        actual_outcome = random.choice([True, False])
        outcome_str = "no-show" if actual_outcome else "showed up"
        
        success = log_actual_outcome(appointment_id, actual_outcome)
        if success:
            print(f"Logged outcome for appointment {appointment_id}: {outcome_str}")
        else:
            print(f"Failed to log outcome for appointment {appointment_id}")
    
    # 6. Get feedback data
    print("\n--- Retrieving Feedback Data ---")
    feedback_data = get_feedback_data(limit=10)
    for item in feedback_data:
        outcome_str = "no-show" if item.actual_outcome else "showed up"
        print(f"Appointment {item.appointment_id}: Predicted {item.prediction:.2%}, Actual: {outcome_str}")
    
    # 7. Retrain the model
    print("\n--- Retraining Model ---")
    retrained, accuracy = retrain_model(force=True)
    
    if retrained and accuracy is not None:
        print(f"Model retrained successfully with accuracy: {accuracy:.2f}")
    else:
        print("Model retraining skipped or failed.")
    
    print("\n=== No-Show Prediction Workflow Test Complete ===")

if __name__ == "__main__":
    test_prediction_workflow()
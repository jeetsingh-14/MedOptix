"""
retrain_model.py - Script to retrain the no-show prediction model

This script reads feedback data from the model_feedback table and retrains
the no-show prediction model. It can be scheduled to run periodically.
"""

import os
import sys
import argparse
from datetime import datetime, timedelta
import sqlite3
import pandas as pd

from scripts.no_show_predictor import NoShowPredictor
from scripts.feedback_logger import get_feedback_data

# Default model directory
MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'models')
if not os.path.exists(MODELS_DIR):
    os.makedirs(MODELS_DIR)

def get_last_training_date():
    """
    Get the date of the last model training from the models directory.
    
    Returns:
        datetime: Date of the last training, or None if no models exist
    """
    if not os.path.exists(MODELS_DIR):
        return None
    
    # Get all model files
    model_files = [f for f in os.listdir(MODELS_DIR) if f.startswith('no_show_model_v') and f.endswith('.pkl')]
    
    if not model_files:
        return None
    
    # Extract dates from filenames (format: no_show_model_vYYYYMMDD.pkl)
    dates = []
    for model_file in model_files:
        try:
            date_str = model_file.split('_v')[1].split('.pkl')[0]
            date = datetime.strptime(date_str, '%Y%m%d')
            dates.append(date)
        except (IndexError, ValueError):
            continue
    
    return max(dates) if dates else None

def should_retrain(days_between_training):
    """
    Determine if the model should be retrained based on the last training date.
    
    Args:
        days_between_training (int): Number of days between training sessions
        
    Returns:
        bool: True if the model should be retrained, False otherwise
    """
    last_training_date = get_last_training_date()
    
    # If no previous training, should train
    if last_training_date is None:
        return True
    
    # Check if enough days have passed since last training
    days_since_last_training = (datetime.now() - last_training_date).days
    return days_since_last_training >= days_between_training

def retrain_model(force=False, days=30, db_path=None):
    """
    Retrain the no-show prediction model if needed.
    
    Args:
        force (bool): Force retraining regardless of last training date
        days (int): Number of days between training sessions
        db_path (str): Path to the SQLite database
        
    Returns:
        tuple: (bool, float) - (whether model was retrained, accuracy if retrained)
    """
    # Check if retraining is needed
    if not force and not should_retrain(days):
        print(f"Model was trained less than {days} days ago. Skipping retraining.")
        return False, None
    
    # Set database path
    if db_path is None:
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        db_path = os.path.join(base_dir, 'medoptix.db')
    
    # Create a new model version with today's date
    today = datetime.now().strftime('%Y%m%d')
    model_path = os.path.join(MODELS_DIR, f'no_show_model_v{today}.pkl')
    
    # Also save as latest for easy access
    latest_path = os.path.join(MODELS_DIR, 'no_show_model_latest.pkl')
    
    # Create and train the model
    predictor = NoShowPredictor(model_path=model_path)
    accuracy = predictor.train(db_path)
    
    # Copy the model to latest
    import shutil
    shutil.copy2(model_path, latest_path)
    
    print(f"Model retrained with accuracy: {accuracy:.2f}")
    print(f"Model saved to: {model_path}")
    print(f"Model also saved as latest version: {latest_path}")
    
    return True, accuracy

def get_model_performance_metrics(db_path=None):
    """
    Calculate performance metrics for the current model.
    
    Args:
        db_path (str): Path to the SQLite database
        
    Returns:
        dict: Dictionary of performance metrics
    """
    # Set database path
    if db_path is None:
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        db_path = os.path.join(base_dir, 'medoptix.db')
    
    # Get feedback data with actual outcomes
    feedback_data = get_feedback_data(limit=10000)
    
    if not feedback_data:
        return {
            'count': 0,
            'accuracy': None,
            'precision': None,
            'recall': None
        }
    
    # Calculate metrics
    true_positives = 0  # Predicted no-show and was no-show
    false_positives = 0  # Predicted no-show but showed up
    true_negatives = 0  # Predicted show-up and showed up
    false_negatives = 0  # Predicted show-up but was no-show
    
    for item in feedback_data:
        predicted_no_show = item.prediction >= 0.5
        actual_no_show = item.actual_outcome
        
        if predicted_no_show and actual_no_show:
            true_positives += 1
        elif predicted_no_show and not actual_no_show:
            false_positives += 1
        elif not predicted_no_show and not actual_no_show:
            true_negatives += 1
        elif not predicted_no_show and actual_no_show:
            false_negatives += 1
    
    # Calculate metrics
    total = len(feedback_data)
    accuracy = (true_positives + true_negatives) / total if total > 0 else 0
    precision = true_positives / (true_positives + false_positives) if (true_positives + false_positives) > 0 else 0
    recall = true_positives / (true_positives + false_negatives) if (true_positives + false_negatives) > 0 else 0
    
    return {
        'count': total,
        'accuracy': accuracy,
        'precision': precision,
        'recall': recall
    }

def main():
    """Main function to handle command-line arguments and retrain the model."""
    parser = argparse.ArgumentParser(description='Retrain the no-show prediction model')
    parser.add_argument('--force', action='store_true', help='Force retraining regardless of last training date')
    parser.add_argument('--days', type=int, default=30, help='Number of days between training sessions')
    parser.add_argument('--db-path', type=str, help='Path to the SQLite database')
    parser.add_argument('--metrics', action='store_true', help='Show model performance metrics')
    
    args = parser.parse_args()
    
    # Show metrics if requested
    if args.metrics:
        metrics = get_model_performance_metrics(args.db_path)
        print("\nModel Performance Metrics:")
        print(f"Number of feedback records: {metrics['count']}")
        if metrics['accuracy'] is not None:
            print(f"Accuracy: {metrics['accuracy']:.2f}")
            print(f"Precision: {metrics['precision']:.2f}")
            print(f"Recall: {metrics['recall']:.2f}")
        else:
            print("No feedback data with outcomes available for metrics calculation.")
        return
    
    # Retrain the model
    retrained, accuracy = retrain_model(force=args.force, days=args.days, db_path=args.db_path)
    
    if not retrained:
        last_training_date = get_last_training_date()
        if last_training_date:
            next_training_date = last_training_date + timedelta(days=args.days)
            print(f"Next scheduled training: {next_training_date.strftime('%Y-%m-%d')}")
        else:
            print("No previous training found. Use --force to train now.")

if __name__ == "__main__":
    main()
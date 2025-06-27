"""
no_show_predictor.py - Script to predict appointment no-shows

This script implements a machine learning model to predict the likelihood
of a patient not showing up for their appointment.
"""

import os
import pickle
import numpy as np
import pandas as pd
from datetime import datetime
import sqlite3
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import OneHotEncoder
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer

from scripts.feedback_logger import log_prediction

# Default model path
MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'models')
if not os.path.exists(MODELS_DIR):
    os.makedirs(MODELS_DIR)

DEFAULT_MODEL_PATH = os.path.join(MODELS_DIR, 'no_show_model_latest.pkl')

class NoShowPredictor:
    """
    Class to predict appointment no-shows using machine learning.
    """
    
    def __init__(self, model_path=None):
        """
        Initialize the predictor with a trained model or create a new one.
        
        Args:
            model_path (str): Path to a saved model file
        """
        self.model_path = model_path or DEFAULT_MODEL_PATH
        self.model = self._load_model() if os.path.exists(self.model_path) else None
        
    def _load_model(self):
        """Load the trained model from disk."""
        with open(self.model_path, 'rb') as f:
            return pickle.load(f)
    
    def _save_model(self):
        """Save the trained model to disk."""
        with open(self.model_path, 'wb') as f:
            pickle.dump(self.model, f)
    
    def _get_training_data(self, db_path):
        """
        Get training data from the database.
        
        Args:
            db_path (str): Path to the SQLite database
            
        Returns:
            pandas.DataFrame: DataFrame containing appointment data
        """
        conn = sqlite3.connect(db_path)
        
        # Query to get appointment data
        query = """
        SELECT 
            a.appointment_id,
            a.patient_id,
            a.department,
            a.appointment_date,
            a.scheduled_time,
            a.arrival_time,
            a.group_name,
            a.wait_time_minutes,
            a.was_seen,
            COUNT(f.id) as feedback_count,
            AVG(f.satisfaction_score) as avg_satisfaction
        FROM 
            appointments a
        LEFT JOIN 
            feedback_data f ON a.appointment_id = f.appointment_id
        GROUP BY 
            a.appointment_id
        """
        
        df = pd.read_sql_query(query, conn)
        conn.close()
        
        # Convert appointment_date to datetime
        df['appointment_date'] = pd.to_datetime(df['appointment_date'])
        
        # Extract features from date
        df['day_of_week'] = df['appointment_date'].dt.dayofweek
        df['month'] = df['appointment_date'].dt.month
        
        # Convert was_seen to target variable (0 = no-show, 1 = showed up)
        df['showed_up'] = df['was_seen']
        
        return df
    
    def train(self, db_path):
        """
        Train the model using data from the database.
        
        Args:
            db_path (str): Path to the SQLite database
            
        Returns:
            float: Model accuracy on test data
        """
        # Get training data
        df = self._get_training_data(db_path)
        
        # Define features and target
        X = df.drop(['appointment_id', 'was_seen', 'showed_up', 'appointment_date', 
                     'scheduled_time', 'arrival_time'], axis=1)
        y = df['showed_up']
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Define preprocessing for categorical features
        categorical_features = ['department', 'group_name']
        categorical_transformer = Pipeline(steps=[
            ('imputer', SimpleImputer(strategy='constant', fill_value='missing')),
            ('onehot', OneHotEncoder(handle_unknown='ignore'))
        ])
        
        # Define preprocessing for numerical features
        numerical_features = ['patient_id', 'wait_time_minutes', 'feedback_count', 
                             'avg_satisfaction', 'day_of_week', 'month']
        numerical_transformer = Pipeline(steps=[
            ('imputer', SimpleImputer(strategy='median'))
        ])
        
        # Combine preprocessing steps
        preprocessor = ColumnTransformer(
            transformers=[
                ('num', numerical_transformer, numerical_features),
                ('cat', categorical_transformer, categorical_features)
            ])
        
        # Create and train the model
        self.model = Pipeline(steps=[
            ('preprocessor', preprocessor),
            ('classifier', RandomForestClassifier(n_estimators=100, random_state=42))
        ])
        
        self.model.fit(X_train, y_train)
        
        # Save the model
        self._save_model()
        
        # Return accuracy on test data
        return self.model.score(X_test, y_test)
    
    def predict(self, appointment_data, log_to_db=True):
        """
        Predict the likelihood of a no-show for an appointment.
        
        Args:
            appointment_data (dict): Dictionary containing appointment data
            log_to_db (bool): Whether to log the prediction to the database
            
        Returns:
            float: Probability of no-show (0-1)
        """
        if self.model is None:
            raise ValueError("Model not trained. Call train() first.")
        
        # Convert appointment data to DataFrame
        df = pd.DataFrame([appointment_data])
        
        # Convert appointment_date to datetime
        if 'appointment_date' in df.columns:
            df['appointment_date'] = pd.to_datetime(df['appointment_date'])
            df['day_of_week'] = df['appointment_date'].dt.dayofweek
            df['month'] = df['appointment_date'].dt.month
        
        # Drop columns not used for prediction
        for col in ['appointment_id', 'was_seen', 'showed_up', 'appointment_date', 
                   'scheduled_time', 'arrival_time']:
            if col in df.columns:
                df = df.drop(col, axis=1)
        
        # Make prediction
        no_show_prob = 1 - self.model.predict_proba(df)[0][1]  # Probability of no-show
        
        # Log prediction to database if requested
        if log_to_db and 'appointment_id' in appointment_data:
            log_prediction(
                appointment_id=appointment_data['appointment_id'],
                prediction=no_show_prob,
                model_version=os.path.basename(self.model_path)
            )
        
        return no_show_prob

def predict_no_show(appointment_id, db_path=None):
    """
    Predict the likelihood of a no-show for a specific appointment.
    
    Args:
        appointment_id (int): The appointment ID
        db_path (str): Path to the SQLite database
        
    Returns:
        float: Probability of no-show (0-1)
    """
    if db_path is None:
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        db_path = os.path.join(base_dir, 'medoptix.db')
    
    # Connect to database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Get appointment data
    query = """
    SELECT 
        a.appointment_id,
        a.patient_id,
        a.department,
        a.appointment_date,
        a.scheduled_time,
        a.group_name,
        COUNT(f.id) as feedback_count,
        AVG(f.satisfaction_score) as avg_satisfaction
    FROM 
        appointments a
    LEFT JOIN 
        feedback_data f ON a.patient_id = f.patient_id
    WHERE 
        a.appointment_id = ?
    GROUP BY 
        a.appointment_id
    """
    
    cursor.execute(query, (appointment_id,))
    row = cursor.fetchone()
    
    if not row:
        conn.close()
        raise ValueError(f"Appointment with ID {appointment_id} not found")
    
    # Convert row to dictionary
    columns = [col[0] for col in cursor.description]
    appointment_data = dict(zip(columns, row))
    
    # Close connection
    conn.close()
    
    # Load predictor and make prediction
    predictor = NoShowPredictor()
    if predictor.model is None:
        predictor.train(db_path)
    
    return predictor.predict(appointment_data)

def update_appointment_outcomes(db_path=None):
    """
    Update the model_feedback table with actual outcomes for appointments.
    
    Args:
        db_path (str): Path to the SQLite database
        
    Returns:
        int: Number of records updated
    """
    from scripts.feedback_logger import log_actual_outcome
    
    if db_path is None:
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        db_path = os.path.join(base_dir, 'medoptix.db')
    
    # Connect to database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Get appointments with known outcomes
    query = """
    SELECT 
        appointment_id,
        was_seen
    FROM 
        appointments
    WHERE 
        was_seen IS NOT NULL
    """
    
    cursor.execute(query)
    appointments = cursor.fetchall()
    
    # Close connection
    conn.close()
    
    # Update model_feedback with actual outcomes
    updated_count = 0
    for appointment_id, was_seen in appointments:
        # Convert was_seen to boolean (0 = no_show, 1 = showed_up)
        actual_outcome = was_seen == 0
        if log_actual_outcome(appointment_id, actual_outcome):
            updated_count += 1
    
    return updated_count

if __name__ == "__main__":
    # Example usage
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    db_path = os.path.join(base_dir, 'medoptix.db')
    
    # Train the model
    predictor = NoShowPredictor()
    accuracy = predictor.train(db_path)
    print(f"Model trained with accuracy: {accuracy:.2f}")
    
    # Make a prediction for a sample appointment
    try:
        # Get a random appointment ID from the database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT appointment_id FROM appointments LIMIT 1")
        appointment_id = cursor.fetchone()[0]
        conn.close()
        
        no_show_prob = predict_no_show(appointment_id, db_path)
        print(f"Appointment {appointment_id} has a {no_show_prob:.2%} probability of no-show")
    except Exception as e:
        print(f"Error making prediction: {e}")
    
    # Update outcomes
    updated = update_appointment_outcomes(db_path)
    print(f"Updated {updated} appointment outcomes in the feedback table")
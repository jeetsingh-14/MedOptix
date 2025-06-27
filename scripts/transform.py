"""
transform.py - Transform and clean data

This script contains functions to transform and clean the extracted data.
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def transform_appointments(df):
    """
    Transform and clean appointments data
    
    Args:
        df (pandas.DataFrame): Raw appointments data
        
    Returns:
        pandas.DataFrame: Cleaned appointments data
    """
    # Make a copy to avoid modifying the original dataframe
    df = df.copy()
    
    # Standardize column names (lowercase, underscores)
    df.columns = [col.lower().replace(' ', '_') for col in df.columns]
    
    # Convert date and time columns to proper datetime formats
    df['appointment_date'] = pd.to_datetime(df['appointment_date'])
    
    # Convert time columns to datetime.time objects
    df['scheduled_time'] = pd.to_datetime(df['scheduled_time'], format='%H:%M').dt.time
    df['arrival_time'] = pd.to_datetime(df['arrival_time'], format='%H:%M').dt.time
    
    # Calculate wait time in minutes if not already done
    # Note: wait_time_minutes is already in the dataset, so we'll keep it
    
    # Ensure group is consistently typed as string
    df['group'] = df['group'].astype(str)
    
    # Handle missing values
    # Fill missing wait times with 0
    df['wait_time_minutes'] = df['wait_time_minutes'].fillna(0)
    
    # Remove duplicates
    df = df.drop_duplicates()
    
    return df

def transform_feedback_data(df):
    """
    Transform and clean feedback data
    
    Args:
        df (pandas.DataFrame): Raw feedback data
        
    Returns:
        pandas.DataFrame: Cleaned feedback data
    """
    # Make a copy to avoid modifying the original dataframe
    df = df.copy()
    
    # Standardize column names (lowercase, underscores)
    df.columns = [col.lower().replace(' ', '_') for col in df.columns]
    
    # Ensure group is consistently typed as string
    df['group'] = df['group'].astype(str)
    
    # Handle missing values
    # Replace 'NA' in comments with actual NaN
    df['comments'] = df['comments'].replace('NA', np.nan)
    
    # Remove duplicates
    df = df.drop_duplicates()
    
    return df

def transform_service_data(df):
    """
    Transform and clean service data
    
    Args:
        df (pandas.DataFrame): Raw service data
        
    Returns:
        pandas.DataFrame: Cleaned service data
    """
    # Make a copy to avoid modifying the original dataframe
    df = df.copy()
    
    # Standardize column names (lowercase, underscores)
    df.columns = [col.lower().replace(' ', '_') for col in df.columns]
    
    # Convert date column to proper datetime format
    df['date'] = pd.to_datetime(df['date'])
    
    # Handle missing values
    # Fill missing equipment downtime with 0
    df['equipment_downtime_hours'] = df['equipment_downtime_hours'].fillna(0)
    
    # Remove duplicates
    df = df.drop_duplicates()
    
    return df

def transform_staff_logs(df):
    """
    Transform and clean staff logs data
    
    Args:
        df (pandas.DataFrame): Raw staff logs data
        
    Returns:
        pandas.DataFrame: Cleaned staff logs data
    """
    # Make a copy to avoid modifying the original dataframe
    df = df.copy()
    
    # Standardize column names (lowercase, underscores)
    df.columns = [col.lower().replace(' ', '_') for col in df.columns]
    
    # Convert date column to proper datetime format
    df['date'] = pd.to_datetime(df['date'])
    
    # Convert time columns to datetime.time objects
    df['shift_start_time'] = pd.to_datetime(df['shift_start_time'], format='%H:%M').dt.time
    df['shift_end_time'] = pd.to_datetime(df['shift_end_time'], format='%H:%M').dt.time
    
    # Handle missing values
    # Fill missing staff count with 0
    df['staff_count'] = df['staff_count'].fillna(0)
    
    # Remove duplicates
    df = df.drop_duplicates()
    
    return df

def transform_all_data(appointments_df, feedback_df, service_df, staff_df):
    """
    Transform all datasets
    
    Args:
        appointments_df (pandas.DataFrame): Raw appointments data
        feedback_df (pandas.DataFrame): Raw feedback data
        service_df (pandas.DataFrame): Raw service data
        staff_df (pandas.DataFrame): Raw staff logs data
        
    Returns:
        tuple: Tuple containing all cleaned dataframes
    """
    appointments_clean = transform_appointments(appointments_df)
    feedback_clean = transform_feedback_data(feedback_df)
    service_clean = transform_service_data(service_df)
    staff_clean = transform_staff_logs(staff_df)
    
    return appointments_clean, feedback_clean, service_clean, staff_clean

if __name__ == "__main__":
    # Test transformation with some sample data
    from extract import extract_all_data
    
    # Extract data
    appointments_df, feedback_df, service_df, staff_df = extract_all_data()
    
    # Transform data
    appointments_clean, feedback_clean, service_clean, staff_clean = transform_all_data(
        appointments_df, feedback_df, service_df, staff_df
    )
    
    # Print sample of transformed data
    print("Sample of transformed appointments data:")
    print(appointments_clean.head())
    
    print("\nSample of transformed feedback data:")
    print(feedback_clean.head())
    
    print("\nSample of transformed service data:")
    print(service_clean.head())
    
    print("\nSample of transformed staff logs data:")
    print(staff_clean.head())
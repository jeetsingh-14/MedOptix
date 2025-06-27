import os
import pandas as pd

def get_data_path(filename):
    current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(current_dir, 'data', 'raw', filename)

def extract_appointments():
    file_path = get_data_path('appointments.csv')
    return pd.read_csv(file_path)

def extract_feedback_data():
    file_path = get_data_path('feedback_data.csv')
    return pd.read_csv(file_path)

def extract_service_data():
    file_path = get_data_path('service_data.csv')
    return pd.read_csv(file_path)

def extract_staff_logs():
    file_path = get_data_path('staff_logs.csv')
    return pd.read_csv(file_path)

def extract_all_data():
    appointments_df = extract_appointments()
    feedback_df = extract_feedback_data()
    service_df = extract_service_data()
    staff_df = extract_staff_logs()

    return appointments_df, feedback_df, service_df, staff_df

if __name__ == "__main__":
    appointments_df, feedback_df, service_df, staff_df = extract_all_data()

    print(f"Appointments data shape: {appointments_df.shape}")
    print(f"Feedback data shape: {feedback_df.shape}")
    print(f"Service data shape: {service_df.shape}")
    print(f"Staff logs data shape: {staff_df.shape}")

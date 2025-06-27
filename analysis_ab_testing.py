"""
analysis_ab_testing.py - Script for analyzing healthcare data and performing A/B testing

This script performs various analyses on healthcare data stored in a SQLite database:
1. A/B Testing comparing Group A vs Group B
2. Department-level insights
3. Correlation analysis

All visualizations are saved to ./outputs/plots/ and a summary report is generated
at ./outputs/summary_report.txt
"""

import os
import sqlite3
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats
import logging
from datetime import datetime

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('analysis_log.txt')
    ]
)
logger = logging.getLogger(__name__)

# Constants
DB_PATH = './data/healthcare.db'
PLOTS_DIR = './outputs/plots/'
SUMMARY_REPORT_PATH = './outputs/summary_report.txt'

def connect_to_db():
    """Connect to the SQLite database and return connection object"""
    try:
        conn = sqlite3.connect(DB_PATH)
        logger.info(f"Successfully connected to database: {DB_PATH}")
        return conn
    except sqlite3.Error as e:
        logger.error(f"Database connection error: {e}")
        raise

def load_data(conn):
    """Load data from database tables into pandas DataFrames"""
    try:
        # Load appointments data
        appointments_df = pd.read_sql_query("SELECT * FROM appointments", conn)

        # Load feedback data
        feedback_df = pd.read_sql_query("SELECT * FROM feedback_data", conn)

        # Load service data
        service_df = pd.read_sql_query("SELECT * FROM service_data", conn)

        # Load staff logs
        staff_df = pd.read_sql_query("SELECT * FROM staff_logs", conn)

        logger.info("Successfully loaded data from all tables")

        return appointments_df, feedback_df, service_df, staff_df
    except Exception as e:
        logger.error(f"Error loading data: {e}")
        raise

def perform_ab_testing(appointments_df, feedback_df):
    """
    Perform A/B testing analysis on wait times, satisfaction scores, and no-show rates

    Args:
        appointments_df: DataFrame containing appointment data
        feedback_df: DataFrame containing feedback data

    Returns:
        dict: Dictionary containing analysis results
    """
    results = {}
    summary = []

    try:
        # Ensure output directory exists
        if not os.path.exists(PLOTS_DIR):
            os.makedirs(PLOTS_DIR)

        # 1. Compare average wait times
        logger.info("Analyzing wait times by group...")
        group_a_wait = appointments_df[appointments_df['group_name'] == 'A']['wait_time_minutes']
        group_b_wait = appointments_df[appointments_df['group_name'] == 'B']['wait_time_minutes']

        wait_time_stats = {
            'Group A Mean': group_a_wait.mean(),
            'Group A Median': group_a_wait.median(),
            'Group A Std': group_a_wait.std(),
            'Group B Mean': group_b_wait.mean(),
            'Group B Median': group_b_wait.median(),
            'Group B Std': group_b_wait.std(),
            'Difference': group_a_wait.mean() - group_b_wait.mean()
        }
        results['wait_time_stats'] = wait_time_stats

        # Statistical test for wait times (Welch's t-test)
        t_stat, p_value = stats.ttest_ind(group_a_wait, group_b_wait, equal_var=False)
        wait_time_test = {
            'Test': "Welch's t-test",
            't-statistic': t_stat,
            'p-value': p_value,
            'Significant': p_value < 0.05
        }
        results['wait_time_test'] = wait_time_test

        # Create boxplot for wait times
        plt.figure(figsize=(10, 6))
        sns.boxplot(x='group_name', y='wait_time_minutes', data=appointments_df)
        plt.title('Wait Time Distribution by Group')
        plt.xlabel('Group')
        plt.ylabel('Wait Time (minutes)')
        plt.savefig(os.path.join(PLOTS_DIR, 'wait_time_boxplot.png'))
        plt.close()

        summary.append(f"Wait Time Analysis:\n"
                      f"  Group A Mean: {wait_time_stats['Group A Mean']:.2f} minutes\n"
                      f"  Group B Mean: {wait_time_stats['Group B Mean']:.2f} minutes\n"
                      f"  Difference: {wait_time_stats['Difference']:.2f} minutes\n"
                      f"  Statistical Test: {wait_time_test['Test']}\n"
                      f"  p-value: {wait_time_test['p-value']:.4f}\n"
                      f"  Significant Difference: {wait_time_test['Significant']}\n")

        # 2. Compare average satisfaction scores
        logger.info("Analyzing satisfaction scores by group...")
        # Merge feedback with appointments to get group information if not already present
        if 'group_name' not in feedback_df.columns:
            merged_feedback = pd.merge(
                feedback_df, 
                appointments_df[['appointment_id', 'group_name']], 
                on='appointment_id', 
                how='left'
            )
        else:
            merged_feedback = feedback_df

        group_a_satisfaction = merged_feedback[merged_feedback['group_name'] == 'A']['satisfaction_score']
        group_b_satisfaction = merged_feedback[merged_feedback['group_name'] == 'B']['satisfaction_score']

        satisfaction_stats = {
            'Group A Mean': group_a_satisfaction.mean(),
            'Group A Median': group_a_satisfaction.median(),
            'Group A Std': group_a_satisfaction.std(),
            'Group B Mean': group_b_satisfaction.mean(),
            'Group B Median': group_b_satisfaction.median(),
            'Group B Std': group_b_satisfaction.std(),
            'Difference': group_a_satisfaction.mean() - group_b_satisfaction.mean()
        }
        results['satisfaction_stats'] = satisfaction_stats

        # Statistical test for satisfaction (Mann-Whitney U test since satisfaction is ordinal)
        u_stat, p_value = stats.mannwhitneyu(group_a_satisfaction, group_b_satisfaction)
        satisfaction_test = {
            'Test': "Mann-Whitney U test",
            'U-statistic': u_stat,
            'p-value': p_value,
            'Significant': p_value < 0.05
        }
        results['satisfaction_test'] = satisfaction_test

        # Create boxplot for satisfaction scores
        plt.figure(figsize=(10, 6))
        sns.boxplot(x='group_name', y='satisfaction_score', data=merged_feedback)
        plt.title('Satisfaction Score Distribution by Group')
        plt.xlabel('Group')
        plt.ylabel('Satisfaction Score')
        plt.savefig(os.path.join(PLOTS_DIR, 'satisfaction_boxplot.png'))
        plt.close()

        summary.append(f"Satisfaction Score Analysis:\n"
                      f"  Group A Mean: {satisfaction_stats['Group A Mean']:.2f}\n"
                      f"  Group B Mean: {satisfaction_stats['Group B Mean']:.2f}\n"
                      f"  Difference: {satisfaction_stats['Difference']:.2f}\n"
                      f"  Statistical Test: {satisfaction_test['Test']}\n"
                      f"  p-value: {satisfaction_test['p-value']:.4f}\n"
                      f"  Significant Difference: {satisfaction_test['Significant']}\n")

        # 3. Compare no-show rates
        logger.info("Analyzing no-show rates by group...")
        group_a_noshow = appointments_df[appointments_df['group_name'] == 'A']['was_seen'].value_counts(normalize=True).get(0, 0)
        group_b_noshow = appointments_df[appointments_df['group_name'] == 'B']['was_seen'].value_counts(normalize=True).get(0, 0)

        noshow_stats = {
            'Group A Rate': group_a_noshow,
            'Group B Rate': group_b_noshow,
            'Difference': group_a_noshow - group_b_noshow
        }
        results['noshow_stats'] = noshow_stats

        # Chi-square test for no-show rates
        group_a_counts = appointments_df[appointments_df['group_name'] == 'A']['was_seen'].value_counts()
        group_b_counts = appointments_df[appointments_df['group_name'] == 'B']['was_seen'].value_counts()

        # Ensure both groups have counts for both 0 and 1
        if 0 not in group_a_counts:
            group_a_counts[0] = 0
        if 1 not in group_a_counts:
            group_a_counts[1] = 0
        if 0 not in group_b_counts:
            group_b_counts[0] = 0
        if 1 not in group_b_counts:
            group_b_counts[1] = 0

        contingency_table = pd.DataFrame({
            'Group A': [group_a_counts.get(0, 0), group_a_counts.get(1, 0)],
            'Group B': [group_b_counts.get(0, 0), group_b_counts.get(1, 0)]
        }, index=['No-show', 'Showed'])

        chi2, p_value, dof, expected = stats.chi2_contingency(contingency_table)
        noshow_test = {
            'Test': "Chi-square test",
            'chi2': chi2,
            'p-value': p_value,
            'Significant': p_value < 0.05
        }
        results['noshow_test'] = noshow_test

        # Create bar chart for no-show rates
        plt.figure(figsize=(10, 6))
        noshow_df = pd.DataFrame({
            'Group': ['A', 'B'],
            'No-show Rate': [group_a_noshow, group_b_noshow]
        })
        sns.barplot(x='Group', y='No-show Rate', data=noshow_df)
        plt.title('No-show Rate by Group')
        plt.xlabel('Group')
        plt.ylabel('No-show Rate')
        plt.savefig(os.path.join(PLOTS_DIR, 'noshow_rates.png'))
        plt.close()

        summary.append(f"No-show Rate Analysis:\n"
                      f"  Group A Rate: {noshow_stats['Group A Rate']:.2%}\n"
                      f"  Group B Rate: {noshow_stats['Group B Rate']:.2%}\n"
                      f"  Difference: {noshow_stats['Difference']:.2%}\n"
                      f"  Statistical Test: {noshow_test['Test']}\n"
                      f"  p-value: {noshow_test['p-value']:.4f}\n"
                      f"  Significant Difference: {noshow_test['Significant']}\n")

        results['summary'] = '\n'.join(summary)
        logger.info("A/B testing analysis completed successfully")
        return results

    except Exception as e:
        logger.error(f"Error in A/B testing analysis: {e}")
        raise

def analyze_departments(service_df, staff_df):
    """
    Perform department-level analysis

    Args:
        service_df: DataFrame containing service data
        staff_df: DataFrame containing staff logs

    Returns:
        dict: Dictionary containing analysis results
    """
    results = {}
    summary = []

    try:
        # 1. Daily average patients per department
        logger.info("Analyzing average patients per department...")
        avg_patients = service_df.groupby('department')['patients_seen'].mean().reset_index()
        avg_patients = avg_patients.sort_values('patients_seen', ascending=False)

        results['avg_patients'] = avg_patients.to_dict('records')

        # Create bar chart for average patients per department
        plt.figure(figsize=(12, 6))
        sns.barplot(x='department', y='patients_seen', data=avg_patients)
        plt.title('Average Daily Patients by Department')
        plt.xlabel('Department')
        plt.ylabel('Average Patients')
        plt.xticks(rotation=45, ha='right')
        plt.tight_layout()
        plt.savefig(os.path.join(PLOTS_DIR, 'avg_patients_by_dept.png'))
        plt.close()

        summary.append("Average Daily Patients by Department:")
        for record in avg_patients.to_dict('records'):
            summary.append(f"  {record['department']}: {record['patients_seen']:.1f} patients")

        # 2. Staff-to-patient ratio per department per day
        logger.info("Analyzing staff-to-patient ratio...")

        # Prepare staff data - sum staff count by department and date
        staff_daily = staff_df.groupby(['department', 'date'])['staff_count'].sum().reset_index()

        # Merge with service data to calculate ratio
        dept_merged = pd.merge(
            service_df[['department', 'date', 'patients_seen']], 
            staff_daily, 
            on=['department', 'date'], 
            how='inner'
        )

        # Calculate ratio
        dept_merged['staff_patient_ratio'] = dept_merged['staff_count'] / dept_merged['patients_seen']

        # Average ratio by department
        avg_ratio = dept_merged.groupby('department')['staff_patient_ratio'].mean().reset_index()
        avg_ratio = avg_ratio.sort_values('staff_patient_ratio', ascending=False)

        results['staff_patient_ratio'] = avg_ratio.to_dict('records')

        # Create bar chart for staff-to-patient ratio
        plt.figure(figsize=(12, 6))
        sns.barplot(x='department', y='staff_patient_ratio', data=avg_ratio)
        plt.title('Average Staff-to-Patient Ratio by Department')
        plt.xlabel('Department')
        plt.ylabel('Staff-to-Patient Ratio')
        plt.xticks(rotation=45, ha='right')
        plt.tight_layout()
        plt.savefig(os.path.join(PLOTS_DIR, 'staff_patient_ratio.png'))
        plt.close()

        summary.append("\nAverage Staff-to-Patient Ratio by Department:")
        for record in avg_ratio.to_dict('records'):
            summary.append(f"  {record['department']}: {record['staff_patient_ratio']:.2f}")

        # 3. Equipment downtime trends over time
        logger.info("Analyzing equipment downtime trends...")

        # Convert date to datetime
        service_df['date'] = pd.to_datetime(service_df['date'])

        # Group by date and calculate average downtime across departments
        downtime_trend = service_df.groupby('date')['equipment_downtime_hours'].mean().reset_index()

        # Create line chart for equipment downtime
        plt.figure(figsize=(14, 6))
        plt.plot(downtime_trend['date'], downtime_trend['equipment_downtime_hours'])
        plt.title('Average Equipment Downtime Trend')
        plt.xlabel('Date')
        plt.ylabel('Average Downtime (hours)')
        plt.grid(True, linestyle='--', alpha=0.7)
        plt.tight_layout()
        plt.savefig(os.path.join(PLOTS_DIR, 'equipment_downtime_trend.png'))
        plt.close()

        # Also create department-specific downtime trends
        plt.figure(figsize=(14, 8))
        for dept in service_df['department'].unique():
            dept_data = service_df[service_df['department'] == dept]
            plt.plot(dept_data['date'], dept_data['equipment_downtime_hours'], label=dept)

        plt.title('Equipment Downtime Trend by Department')
        plt.xlabel('Date')
        plt.ylabel('Downtime (hours)')
        plt.legend(bbox_to_anchor=(1.05, 1), loc='upper left')
        plt.grid(True, linestyle='--', alpha=0.7)
        plt.tight_layout()
        plt.savefig(os.path.join(PLOTS_DIR, 'equipment_downtime_by_dept.png'))
        plt.close()

        # Calculate average downtime by department
        avg_downtime = service_df.groupby('department')['equipment_downtime_hours'].mean().reset_index()
        avg_downtime = avg_downtime.sort_values('equipment_downtime_hours', ascending=False)

        results['equipment_downtime'] = avg_downtime.to_dict('records')

        summary.append("\nAverage Equipment Downtime by Department:")
        for record in avg_downtime.to_dict('records'):
            summary.append(f"  {record['department']}: {record['equipment_downtime_hours']:.2f} hours")

        results['summary'] = '\n'.join(summary)
        logger.info("Department analysis completed successfully")
        return results

    except Exception as e:
        logger.error(f"Error in department analysis: {e}")
        raise

def perform_correlation_analysis(appointments_df, feedback_df, service_df, staff_df):
    """
    Perform correlation analysis

    Args:
        appointments_df: DataFrame containing appointment data
        feedback_df: DataFrame containing feedback data
        service_df: DataFrame containing service data
        staff_df: DataFrame containing staff logs

    Returns:
        dict: Dictionary containing analysis results
    """
    results = {}
    summary = []

    try:
        # 1. Correlation between wait time and satisfaction
        logger.info("Analyzing correlation between wait time and satisfaction...")

        # Merge appointments and feedback data
        merged_data = pd.merge(
            appointments_df[['appointment_id', 'wait_time_minutes']], 
            feedback_df[['appointment_id', 'satisfaction_score']], 
            on='appointment_id', 
            how='inner'
        )

        # Calculate correlation
        corr_wait_satisfaction, p_value = stats.pearsonr(
            merged_data['wait_time_minutes'], 
            merged_data['satisfaction_score']
        )

        wait_satisfaction_corr = {
            'correlation': corr_wait_satisfaction,
            'p_value': p_value,
            'significant': p_value < 0.05
        }
        results['wait_satisfaction_corr'] = wait_satisfaction_corr

        # Create scatter plot
        plt.figure(figsize=(10, 6))
        sns.scatterplot(x='wait_time_minutes', y='satisfaction_score', data=merged_data, alpha=0.5)
        plt.title(f'Correlation between Wait Time and Satisfaction (r={corr_wait_satisfaction:.2f}, p={p_value:.4f})')
        plt.xlabel('Wait Time (minutes)')
        plt.ylabel('Satisfaction Score')

        # Add regression line
        sns.regplot(x='wait_time_minutes', y='satisfaction_score', data=merged_data, 
                   scatter=False, line_kws={"color": "red"})

        plt.savefig(os.path.join(PLOTS_DIR, 'wait_satisfaction_correlation.png'))
        plt.close()

        summary.append(f"Correlation between Wait Time and Satisfaction:\n"
                      f"  Pearson correlation: {corr_wait_satisfaction:.2f}\n"
                      f"  p-value: {p_value:.4f}\n"
                      f"  Significant: {p_value < 0.05}\n")

        # 2. Correlation between staff count and patients seen
        logger.info("Analyzing correlation between staff count and patients seen...")

        # Make a copy of service_df to avoid modifying the original
        service_df_copy = service_df.copy()

        # If service_df date is already datetime, convert staff_df date to datetime as well
        if pd.api.types.is_datetime64_any_dtype(service_df_copy['date']):
            staff_df = staff_df.copy()
            staff_df['date'] = pd.to_datetime(staff_df['date'])
        # Otherwise, ensure both are string type
        elif isinstance(service_df_copy['date'].iloc[0], str):
            service_df_copy['date'] = service_df_copy['date'].astype(str)
        else:
            # Convert both to datetime to ensure consistency
            service_df_copy['date'] = pd.to_datetime(service_df_copy['date'])
            staff_df = staff_df.copy()
            staff_df['date'] = pd.to_datetime(staff_df['date'])

        # Prepare staff data - sum staff count by department and date
        staff_daily = staff_df.groupby(['department', 'date'])['staff_count'].sum().reset_index()

        # Merge with service data
        staff_patients = pd.merge(
            service_df_copy[['department', 'date', 'patients_seen']], 
            staff_daily, 
            on=['department', 'date'], 
            how='inner'
        )

        # Calculate correlation
        corr_staff_patients, p_value = stats.pearsonr(
            staff_patients['staff_count'], 
            staff_patients['patients_seen']
        )

        staff_patients_corr = {
            'correlation': corr_staff_patients,
            'p_value': p_value,
            'significant': p_value < 0.05
        }
        results['staff_patients_corr'] = staff_patients_corr

        # Create scatter plot
        plt.figure(figsize=(10, 6))
        sns.scatterplot(x='staff_count', y='patients_seen', data=staff_patients, alpha=0.5)
        plt.title(f'Correlation between Staff Count and Patients Seen (r={corr_staff_patients:.2f}, p={p_value:.4f})')
        plt.xlabel('Staff Count')
        plt.ylabel('Patients Seen')

        # Add regression line
        sns.regplot(x='staff_count', y='patients_seen', data=staff_patients, 
                   scatter=False, line_kws={"color": "red"})

        plt.savefig(os.path.join(PLOTS_DIR, 'staff_patients_correlation.png'))
        plt.close()

        summary.append(f"Correlation between Staff Count and Patients Seen:\n"
                      f"  Pearson correlation: {corr_staff_patients:.2f}\n"
                      f"  p-value: {p_value:.4f}\n"
                      f"  Significant: {p_value < 0.05}\n")

        # 3. Correlation between avg_service_time_minutes and no-shows
        logger.info("Analyzing correlation between average service time and no-show rates...")

        # Prepare appointments data - calculate no-show rate by department and date
        appointments_df['appointment_date'] = pd.to_datetime(appointments_df['appointment_date'])
        appointments_df['no_show'] = 1 - appointments_df['was_seen']  # Convert was_seen to no_show (1=no-show, 0=showed)

        # Group by department and date to get no-show rates
        noshow_by_dept_date = appointments_df.groupby(['department', 'appointment_date']).agg(
            no_show_rate=('no_show', 'mean'),
            total_appointments=('appointment_id', 'count')
        ).reset_index()

        # Rename appointment_date to date for merging
        noshow_by_dept_date = noshow_by_dept_date.rename(columns={'appointment_date': 'date'})

        # Ensure service_df date is datetime
        service_df_copy = service_df.copy()
        service_df_copy['date'] = pd.to_datetime(service_df_copy['date'])

        # Merge with service data to get avg_service_time_minutes
        service_noshow = pd.merge(
            service_df_copy[['department', 'date', 'avg_service_time_minutes']], 
            noshow_by_dept_date, 
            on=['department', 'date'], 
            how='inner'
        )

        # Filter to include only departments/dates with sufficient appointments for meaningful analysis
        service_noshow = service_noshow[service_noshow['total_appointments'] >= 5]

        if len(service_noshow) > 1:  # Ensure we have enough data points for correlation
            # Calculate correlation
            corr_service_noshow, p_value = stats.pearsonr(
                service_noshow['avg_service_time_minutes'], 
                service_noshow['no_show_rate']
            )

            service_noshow_corr = {
                'correlation': corr_service_noshow,
                'p_value': p_value,
                'significant': p_value < 0.05
            }
            results['service_noshow_corr'] = service_noshow_corr

            # Create scatter plot
            plt.figure(figsize=(10, 6))
            sns.scatterplot(x='avg_service_time_minutes', y='no_show_rate', 
                           data=service_noshow, alpha=0.5, size='total_appointments',
                           sizes=(20, 200))
            plt.title(f'Correlation between Service Time and No-show Rate (r={corr_service_noshow:.2f}, p={p_value:.4f})')
            plt.xlabel('Average Service Time (minutes)')
            plt.ylabel('No-show Rate')

            # Add regression line
            sns.regplot(x='avg_service_time_minutes', y='no_show_rate', data=service_noshow, 
                       scatter=False, line_kws={"color": "red"})

            plt.savefig(os.path.join(PLOTS_DIR, 'service_noshow_correlation.png'))
            plt.close()

            summary.append(f"Correlation between Average Service Time and No-show Rate:\n"
                          f"  Pearson correlation: {corr_service_noshow:.2f}\n"
                          f"  p-value: {p_value:.4f}\n"
                          f"  Significant: {p_value < 0.05}")
        else:
            logger.warning("Insufficient data for service time vs no-show correlation analysis")
            summary.append("Correlation between Average Service Time and No-show Rate:\n"
                          "  Insufficient data for analysis")
            results['service_noshow_corr'] = {
                'correlation': None,
                'p_value': None,
                'significant': False,
                'error': 'Insufficient data'
            }

        results['summary'] = '\n'.join(summary)
        logger.info("Correlation analysis completed successfully")
        return results

    except Exception as e:
        logger.error(f"Error in correlation analysis: {e}")
        raise

def generate_summary_report(ab_results, dept_results, corr_results):
    """Generate a summary report with all analysis results"""
    try:
        with open(SUMMARY_REPORT_PATH, 'w') as f:
            f.write("=" * 80 + "\n")
            f.write("HEALTHCARE DATA ANALYSIS SUMMARY REPORT\n")
            f.write(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write("=" * 80 + "\n\n")

            f.write("SECTION 1: A/B TESTING RESULTS\n")
            f.write("-" * 80 + "\n")
            f.write(ab_results['summary'])
            f.write("\n\n")

            f.write("SECTION 2: DEPARTMENT-LEVEL INSIGHTS\n")
            f.write("-" * 80 + "\n")
            f.write(dept_results['summary'])
            f.write("\n\n")

            f.write("SECTION 3: CORRELATION ANALYSIS\n")
            f.write("-" * 80 + "\n")
            f.write(corr_results['summary'])
            f.write("\n\n")

            f.write("=" * 80 + "\n")
            f.write("END OF REPORT\n")
            f.write("=" * 80 + "\n")

        logger.info(f"Summary report generated successfully at {SUMMARY_REPORT_PATH}")
    except Exception as e:
        logger.error(f"Error generating summary report: {e}")
        raise

def main():
    """Main function to run the analysis"""
    try:
        # Ensure output directories exist
        if not os.path.exists(PLOTS_DIR):
            os.makedirs(PLOTS_DIR)
            logger.info(f"Created directory: {PLOTS_DIR}")

        # Connect to database
        conn = connect_to_db()

        # Load data
        appointments_df, feedback_df, service_df, staff_df = load_data(conn)

        # Close database connection
        conn.close()

        # Perform A/B testing
        logger.info("Starting A/B testing analysis...")
        ab_results = perform_ab_testing(appointments_df, feedback_df)

        # Perform department-level analysis
        logger.info("Starting department-level analysis...")
        dept_results = analyze_departments(service_df, staff_df)

        # Perform correlation analysis
        logger.info("Starting correlation analysis...")
        corr_results = perform_correlation_analysis(appointments_df, feedback_df, service_df, staff_df)

        # Generate summary report
        logger.info("Generating summary report...")
        generate_summary_report(ab_results, dept_results, corr_results)

        logger.info("Analysis completed successfully!")
        print(f"Analysis completed successfully! Results saved to {PLOTS_DIR} and {SUMMARY_REPORT_PATH}")

    except Exception as e:
        logger.error(f"Error in main analysis: {e}")
        print(f"Error: {e}")
        return 1

    return 0

if __name__ == "__main__":
    main()

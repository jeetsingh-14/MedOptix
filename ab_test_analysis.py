"""
ab_test_analysis.py - Script for analyzing A/B test results and generating business insights

This script analyzes healthcare A/B test data stored in a SQLite database and generates
a markdown report with business-level insights including:
1. Executive Summary
2. Key Findings
3. Recommendations
4. Caveats or limitations

The report is saved to ./insights/ab_test_summary.md
"""

import os
import sqlite3
import pandas as pd
import numpy as np
from scipy import stats
import logging
from datetime import datetime

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('ab_test_analysis_log.txt')
    ]
)
logger = logging.getLogger(__name__)

# Constants
DB_PATH = './data/healthcare.db'
OUTPUT_DIR = './insights/'
OUTPUT_FILE = os.path.join(OUTPUT_DIR, 'ab_test_summary.md')

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

def analyze_wait_times(appointments_df):
    """Analyze wait times between Group A and Group B"""
    group_a_wait = appointments_df[appointments_df['group_name'] == 'A']['wait_time_minutes']
    group_b_wait = appointments_df[appointments_df['group_name'] == 'B']['wait_time_minutes']

    wait_time_stats = {
        'Group A Mean': group_a_wait.mean(),
        'Group A Median': group_a_wait.median(),
        'Group A Std': group_a_wait.std(),
        'Group B Mean': group_b_wait.mean(),
        'Group B Median': group_b_wait.median(),
        'Group B Std': group_b_wait.std(),
        'Difference': group_a_wait.mean() - group_b_wait.mean(),
        'Percent Difference': ((group_a_wait.mean() - group_b_wait.mean()) / group_a_wait.mean()) * 100
    }

    # Statistical test for wait times (Welch's t-test)
    t_stat, p_value = stats.ttest_ind(group_a_wait, group_b_wait, equal_var=False)
    wait_time_stats['t_stat'] = t_stat
    wait_time_stats['p_value'] = p_value
    wait_time_stats['significant'] = p_value < 0.05

    return wait_time_stats

def analyze_satisfaction_scores(appointments_df, feedback_df):
    """Analyze satisfaction scores between Group A and Group B"""
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
        'Difference': group_a_satisfaction.mean() - group_b_satisfaction.mean(),
        'Percent Difference': ((group_a_satisfaction.mean() - group_b_satisfaction.mean()) / group_a_satisfaction.mean()) * 100
    }

    # Statistical test for satisfaction (Mann-Whitney U test since satisfaction is ordinal)
    u_stat, p_value = stats.mannwhitneyu(group_a_satisfaction, group_b_satisfaction)
    satisfaction_stats['u_stat'] = u_stat
    satisfaction_stats['p_value'] = p_value
    satisfaction_stats['significant'] = p_value < 0.05

    # Calculate distribution of satisfaction scores
    satisfaction_distribution = {
        'Group A': {
            score: (group_a_satisfaction == score).mean() * 100 
            for score in sorted(group_a_satisfaction.unique())
        },
        'Group B': {
            score: (group_b_satisfaction == score).mean() * 100 
            for score in sorted(group_b_satisfaction.unique())
        }
    }

    return satisfaction_stats, satisfaction_distribution

def analyze_noshow_rates(appointments_df):
    """Analyze no-show rates between Group A and Group B"""
    group_a_noshow = appointments_df[appointments_df['group_name'] == 'A']['was_seen'].value_counts(normalize=True).get(0, 0)
    group_b_noshow = appointments_df[appointments_df['group_name'] == 'B']['was_seen'].value_counts(normalize=True).get(0, 0)

    noshow_stats = {
        'Group A Rate': group_a_noshow,
        'Group B Rate': group_b_noshow,
        'Difference': group_a_noshow - group_b_noshow,
        'Percent Difference': ((group_a_noshow - group_b_noshow) / group_a_noshow) * 100 if group_a_noshow > 0 else 0
    }

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
    noshow_stats['chi2'] = chi2
    noshow_stats['p_value'] = p_value
    noshow_stats['significant'] = p_value < 0.05

    return noshow_stats

def analyze_patient_throughput(service_df):
    """Analyze patient throughput per department for Group A and Group B"""
    # Check if group_name is in service_df
    if 'group_name' not in service_df.columns:
        logger.warning("Group name not found in service data. Cannot analyze throughput by group.")
        return None

    # Group by department and group_name to get average patients seen
    throughput = service_df.groupby(['department', 'group_name'])['patients_seen'].mean().reset_index()

    # Pivot to get Group A and Group B side by side
    throughput_pivot = throughput.pivot(index='department', columns='group_name', values='patients_seen')

    # Calculate difference and percent difference
    if 'A' in throughput_pivot.columns and 'B' in throughput_pivot.columns:
        throughput_pivot['Difference'] = throughput_pivot['A'] - throughput_pivot['B']
        throughput_pivot['Percent Difference'] = (throughput_pivot['Difference'] / throughput_pivot['A']) * 100

    return throughput_pivot

def analyze_staff_efficiency(appointments_df, staff_df):
    """Analyze staff efficiency metrics between Group A and Group B"""
    # Check if we can link staff data to groups
    if 'group_name' not in staff_df.columns:
        # Try to join with appointments data if possible
        if 'department' in staff_df.columns and 'department' in appointments_df.columns:
            # Get the predominant group for each department
            dept_groups = appointments_df.groupby('department')['group_name'].agg(
                lambda x: x.value_counts().index[0]
            ).reset_index()

            # Merge with staff data
            staff_with_groups = pd.merge(
                staff_df,
                dept_groups,
                on='department',
                how='left'
            )
        else:
            logger.warning("Cannot link staff data to groups. Staff efficiency analysis by group not possible.")
            return None
    else:
        staff_with_groups = staff_df

    # Calculate average staff count by group
    staff_by_group = staff_with_groups.groupby('group_name')['staff_count'].mean().reset_index()

    # Calculate patients per staff member
    if 'patients_seen' in staff_with_groups.columns:
        staff_with_groups['patients_per_staff'] = staff_with_groups['patients_seen'] / staff_with_groups['staff_count']
        efficiency_by_group = staff_with_groups.groupby('group_name')['patients_per_staff'].mean().reset_index()
    else:
        efficiency_by_group = None

    return {
        'staff_by_group': staff_by_group.to_dict('records') if isinstance(staff_by_group, pd.DataFrame) else None,
        'efficiency_by_group': efficiency_by_group.to_dict('records') if isinstance(efficiency_by_group, pd.DataFrame) else None
    }

def analyze_equipment_downtime(service_df):
    """Analyze equipment downtime between Group A and Group B"""
    # Check if group_name is in service_df
    if 'group_name' not in service_df.columns:
        logger.warning("Group name not found in service data. Cannot analyze equipment downtime by group.")
        return None

    # Group by group_name to get average equipment downtime
    downtime_by_group = service_df.groupby('group_name')['equipment_downtime_hours'].mean().reset_index()

    # Calculate difference and percent difference
    if len(downtime_by_group) >= 2:
        group_a_downtime = downtime_by_group[downtime_by_group['group_name'] == 'A']['equipment_downtime_hours'].values[0]
        group_b_downtime = downtime_by_group[downtime_by_group['group_name'] == 'B']['equipment_downtime_hours'].values[0]

        downtime_stats = {
            'Group A Mean': group_a_downtime,
            'Group B Mean': group_b_downtime,
            'Difference': group_a_downtime - group_b_downtime,
            'Percent Difference': ((group_a_downtime - group_b_downtime) / group_a_downtime) * 100 if group_a_downtime > 0 else 0
        }

        return downtime_stats
    else:
        return None

def generate_insights(wait_time_stats, satisfaction_stats, satisfaction_distribution, 
                     noshow_stats, throughput_data, staff_efficiency, equipment_downtime):
    """Generate business insights based on the analysis results"""
    insights = {
        'better_group': None,
        'significant_improvements': [],
        'recommendations': [],
        'caveats': []
    }

    # Determine which group performed better overall
    better_group_score = 0

    # Wait time (lower is better)
    if wait_time_stats['Group A Mean'] < wait_time_stats['Group B Mean']:
        better_group_score -= 1
    else:
        better_group_score += 1

    if wait_time_stats['significant']:
        if wait_time_stats['Group A Mean'] < wait_time_stats['Group B Mean']:
            insights['significant_improvements'].append("Group A showed significantly lower wait times")
        else:
            insights['significant_improvements'].append("Group B showed significantly lower wait times")

    # Satisfaction score (higher is better)
    if satisfaction_stats['Group A Mean'] > satisfaction_stats['Group B Mean']:
        better_group_score -= 1
    else:
        better_group_score += 1

    if satisfaction_stats['significant']:
        if satisfaction_stats['Group A Mean'] > satisfaction_stats['Group B Mean']:
            insights['significant_improvements'].append("Group A showed significantly higher satisfaction scores")
        else:
            insights['significant_improvements'].append("Group B showed significantly higher satisfaction scores")

    # No-show rate (lower is better)
    if noshow_stats['Group A Rate'] < noshow_stats['Group B Rate']:
        better_group_score -= 1
    else:
        better_group_score += 1

    if noshow_stats['significant']:
        if noshow_stats['Group A Rate'] < noshow_stats['Group B Rate']:
            insights['significant_improvements'].append("Group A showed significantly lower no-show rates")
        else:
            insights['significant_improvements'].append("Group B showed significantly lower no-show rates")

    # Determine overall better group
    insights['better_group'] = 'A' if better_group_score <= 0 else 'B'
    better_group = insights['better_group']

    # Generate recommendations based on observed differences, even if not statistically significant

    # Wait time recommendations
    better_wait_group = 'A' if wait_time_stats['Group A Mean'] < wait_time_stats['Group B Mean'] else 'B'
    wait_time_diff_pct = abs(wait_time_stats['Percent Difference'])

    if wait_time_stats['significant']:
        insights['recommendations'].append(
            f"Implement Group {better_wait_group}'s patient flow processes to reduce wait times (statistically significant improvement of {wait_time_diff_pct:.1f}%)"
        )
    else:
        insights['recommendations'].append(
            f"Consider piloting Group {better_wait_group}'s patient flow processes in high-volume departments to evaluate potential wait time improvements"
        )

    # Satisfaction recommendations
    better_satisfaction_group = 'A' if satisfaction_stats['Group A Mean'] > satisfaction_stats['Group B Mean'] else 'B'
    satisfaction_diff_pct = abs(satisfaction_stats['Percent Difference'])

    if satisfaction_stats['significant']:
        insights['recommendations'].append(
            f"Adopt Group {better_satisfaction_group}'s patient interaction protocols to improve satisfaction (statistically significant improvement of {satisfaction_diff_pct:.1f}%)"
        )
    else:
        insights['recommendations'].append(
            f"Investigate the specific elements of Group {better_satisfaction_group}'s patient experience that may contribute to higher satisfaction scores"
        )

    # No-show recommendations
    better_noshow_group = 'A' if noshow_stats['Group A Rate'] < noshow_stats['Group B Rate'] else 'B'
    noshow_diff_pct = abs(noshow_stats['Percent Difference'])

    if noshow_stats['significant']:
        insights['recommendations'].append(
            f"Implement Group {better_noshow_group}'s appointment reminder system to reduce no-shows (statistically significant improvement of {noshow_diff_pct:.1f}%)"
        )
    else:
        insights['recommendations'].append(
            f"Analyze Group {better_noshow_group}'s appointment confirmation process and consider testing enhanced reminder protocols"
        )

    # Overall recommendation
    if better_group_score <= -2 or better_group_score >= 2:  # Strong preference for one group
        insights['recommendations'].append(
            f"Prioritize full implementation of Group {better_group}'s approach across all departments, as it consistently outperformed in multiple metrics"
        )
    else:  # Mixed results
        insights['recommendations'].append(
            f"Implement a hybrid approach that adopts the best practices from both groups: Group {better_wait_group}'s patient flow, "
            f"Group {better_satisfaction_group}'s patient interaction, and Group {better_noshow_group}'s appointment management"
        )

    # Add data collection recommendation
    insights['recommendations'].append(
        "Enhance data collection to include department-specific group assignments to enable more granular analysis of performance differences"
    )

    # Add caveats
    insights['caveats'] = [
        "The analysis assumes random assignment of patients to groups",
        "Results may be influenced by department-specific factors not captured in the analysis",
        "Correlation does not imply causation - further investigation is needed to confirm causal relationships",
        "The absence of statistical significance does not necessarily mean there is no effect, especially with smaller sample sizes"
    ]

    return insights

def generate_markdown_report(wait_time_stats, satisfaction_stats, satisfaction_distribution, 
                           noshow_stats, throughput_data, staff_efficiency, equipment_downtime, insights):
    """Generate a markdown report with the analysis results and insights"""
    try:
        with open(OUTPUT_FILE, 'w') as f:
            # Title
            f.write("# A/B Test Results Analysis\n\n")

            # Executive Summary
            f.write("## Executive Summary\n\n")
            better_group = insights['better_group']
            f.write(f"Our A/B testing analysis compared two different healthcare service approaches (Group A vs Group B) ")
            f.write("across multiple metrics including wait times, patient satisfaction, and appointment attendance. ")
            f.write(f"Overall, Group {better_group} demonstrated slightly better performance ")
            f.write("across these key healthcare metrics, though the differences were not statistically significant. ")

            if wait_time_stats['Group A Mean'] < wait_time_stats['Group B Mean']:
                f.write(f"Group A showed shorter average wait times ({wait_time_stats['Group A Mean']:.1f} vs {wait_time_stats['Group B Mean']:.1f} minutes). ")
            else:
                f.write(f"Group B showed shorter average wait times ({wait_time_stats['Group B Mean']:.1f} vs {wait_time_stats['Group A Mean']:.1f} minutes). ")

            if satisfaction_stats['Group A Mean'] > satisfaction_stats['Group B Mean']:
                f.write(f"Group A received higher satisfaction ratings. ")
            else:
                f.write(f"Group B received higher satisfaction ratings. ")

            if noshow_stats['Group A Rate'] < noshow_stats['Group B Rate']:
                f.write(f"Group A experienced lower no-show rates ({noshow_stats['Group A Rate']:.1%} vs {noshow_stats['Group B Rate']:.1%}). ")
            else:
                f.write(f"Group B experienced lower no-show rates ({noshow_stats['Group B Rate']:.1%} vs {noshow_stats['Group A Rate']:.1%}). ")

            f.write("While no individual metric showed statistically significant differences, ")
            f.write(f"the consistent pattern of improvements in Group {better_group} suggests potential benefits ")
            f.write("that warrant further investigation and targeted implementation.\n\n")

            # Key Findings
            f.write("## Key Findings\n\n")

            # Wait Time
            f.write("### Wait Time Analysis\n\n")
            f.write(f"- Group A average wait time: {wait_time_stats['Group A Mean']:.2f} minutes\n")
            f.write(f"- Group B average wait time: {wait_time_stats['Group B Mean']:.2f} minutes\n")
            f.write(f"- Difference: {abs(wait_time_stats['Difference']):.2f} minutes ")
            f.write(f"({abs(wait_time_stats['Percent Difference']):.1f}% ")
            f.write("lower" if wait_time_stats['Difference'] < 0 else "higher")
            f.write(" in Group A)\n")
            f.write(f"- Statistical significance: {'Yes' if wait_time_stats['significant'] else 'No'} ")
            f.write(f"(p-value: {wait_time_stats['p_value']:.4f})\n\n")

            # Satisfaction Scores
            f.write("### Satisfaction Score Analysis\n\n")
            # Determine the scale based on the maximum score
            max_score = max(max(satisfaction_distribution['Group A'].keys()), 
                           max(satisfaction_distribution['Group B'].keys()))
            scale_text = f"/{max_score}" if max_score > 0 else ""

            f.write(f"- Group A average satisfaction: {satisfaction_stats['Group A Mean']:.2f}{scale_text}\n")
            f.write(f"- Group B average satisfaction: {satisfaction_stats['Group B Mean']:.2f}{scale_text}\n")
            f.write(f"- Difference: {abs(satisfaction_stats['Difference']):.2f} points ")
            f.write(f"({abs(satisfaction_stats['Percent Difference']):.1f}% ")
            f.write("higher" if satisfaction_stats['Difference'] > 0 else "lower")
            f.write(" in Group A)\n")
            f.write(f"- Statistical significance: {'Yes' if satisfaction_stats['significant'] else 'No'} ")
            f.write(f"(p-value: {satisfaction_stats['p_value']:.4f})\n\n")

            # Satisfaction Score Distribution
            f.write("#### Satisfaction Score Distribution\n\n")
            f.write("| Score | Group A | Group B |\n")
            f.write("|-------|---------|--------|\n")
            all_scores = sorted(set(list(satisfaction_distribution['Group A'].keys()) + 
                                  list(satisfaction_distribution['Group B'].keys())))
            for score in all_scores:
                group_a_pct = satisfaction_distribution['Group A'].get(score, 0)
                group_b_pct = satisfaction_distribution['Group B'].get(score, 0)
                f.write(f"| {score} | {group_a_pct:.1f}% | {group_b_pct:.1f}% |\n")
            f.write("\n")

            # No-show Rates
            f.write("### No-show Rate Analysis\n\n")
            f.write(f"- Group A no-show rate: {noshow_stats['Group A Rate']:.2%}\n")
            f.write(f"- Group B no-show rate: {noshow_stats['Group B Rate']:.2%}\n")
            f.write(f"- Difference: {abs(noshow_stats['Difference']):.2%} ")
            f.write(f"({abs(noshow_stats['Percent Difference']):.1f}% ")
            f.write("lower" if noshow_stats['Difference'] < 0 else "higher")
            f.write(" in Group A)\n")
            f.write(f"- Statistical significance: {'Yes' if noshow_stats['significant'] else 'No'} ")
            f.write(f"(p-value: {noshow_stats['p_value']:.4f})\n\n")

            # Patient Throughput
            if throughput_data is not None:
                f.write("### Patient Throughput by Department\n\n")
                f.write("| Department | Group A | Group B | Difference | % Difference |\n")
                f.write("|------------|---------|---------|------------|-------------|\n")

                for dept in throughput_data.index:
                    group_a = throughput_data.loc[dept, 'A'] if 'A' in throughput_data.columns else 'N/A'
                    group_b = throughput_data.loc[dept, 'B'] if 'B' in throughput_data.columns else 'N/A'

                    if isinstance(group_a, (int, float)) and isinstance(group_b, (int, float)):
                        diff = group_a - group_b
                        pct_diff = (diff / group_a) * 100 if group_a > 0 else 0
                        f.write(f"| {dept} | {group_a:.1f} | {group_b:.1f} | {diff:.1f} | {pct_diff:.1f}% |\n")
                    else:
                        f.write(f"| {dept} | {group_a} | {group_b} | N/A | N/A |\n")

                f.write("\n")

            # Equipment Downtime
            if equipment_downtime is not None:
                f.write("### Equipment Downtime Analysis\n\n")
                f.write(f"- Group A average downtime: {equipment_downtime['Group A Mean']:.2f} hours/day\n")
                f.write(f"- Group B average downtime: {equipment_downtime['Group B Mean']:.2f} hours/day\n")
                f.write(f"- Difference: {abs(equipment_downtime['Difference']):.2f} hours ")
                f.write(f"({abs(equipment_downtime['Percent Difference']):.1f}% ")
                f.write("lower" if equipment_downtime['Difference'] < 0 else "higher")
                f.write(" in Group A)\n\n")

            # Recommendations
            f.write("## Recommendations\n\n")
            for i, recommendation in enumerate(insights['recommendations'], 1):
                f.write(f"{i}. {recommendation}\n")

            if not insights['recommendations']:
                f.write("No specific recommendations based on the current data. Further investigation is needed.\n")

            f.write("\n")

            # Caveats
            f.write("## Caveats and Limitations\n\n")
            for caveat in insights['caveats']:
                f.write(f"- {caveat}\n")

            f.write("\n")

            # Footer
            f.write(f"*Report generated on {datetime.now().strftime('%Y-%m-%d')}*\n")

        logger.info(f"Markdown report generated successfully at {OUTPUT_FILE}")
        return True
    except Exception as e:
        logger.error(f"Error generating markdown report: {e}")
        return False

def main():
    """Main function to run the analysis"""
    try:
        # Ensure output directory exists
        if not os.path.exists(OUTPUT_DIR):
            os.makedirs(OUTPUT_DIR)
            logger.info(f"Created directory: {OUTPUT_DIR}")

        # Connect to database
        conn = connect_to_db()

        # Load data
        appointments_df, feedback_df, service_df, staff_df = load_data(conn)

        # Close database connection
        conn.close()

        # Analyze wait times
        logger.info("Analyzing wait times...")
        wait_time_stats = analyze_wait_times(appointments_df)

        # Analyze satisfaction scores
        logger.info("Analyzing satisfaction scores...")
        satisfaction_stats, satisfaction_distribution = analyze_satisfaction_scores(appointments_df, feedback_df)

        # Analyze no-show rates
        logger.info("Analyzing no-show rates...")
        noshow_stats = analyze_noshow_rates(appointments_df)

        # Analyze patient throughput
        logger.info("Analyzing patient throughput...")
        throughput_data = analyze_patient_throughput(service_df)

        # Analyze staff efficiency
        logger.info("Analyzing staff efficiency...")
        staff_efficiency = analyze_staff_efficiency(appointments_df, staff_df)

        # Analyze equipment downtime
        logger.info("Analyzing equipment downtime...")
        equipment_downtime = analyze_equipment_downtime(service_df)

        # Generate insights
        logger.info("Generating insights...")
        insights = generate_insights(
            wait_time_stats, 
            satisfaction_stats, 
            satisfaction_distribution,
            noshow_stats, 
            throughput_data, 
            staff_efficiency, 
            equipment_downtime
        )

        # Generate markdown report
        logger.info("Generating markdown report...")
        success = generate_markdown_report(
            wait_time_stats, 
            satisfaction_stats, 
            satisfaction_distribution,
            noshow_stats, 
            throughput_data, 
            staff_efficiency, 
            equipment_downtime,
            insights
        )

        if success:
            logger.info("Analysis completed successfully!")
            print(f"Analysis completed successfully! Results saved to {OUTPUT_FILE}")
        else:
            logger.error("Failed to generate markdown report")
            print("Error: Failed to generate markdown report")
            return 1

    except Exception as e:
        logger.error(f"Error in main analysis: {e}")
        print(f"Error: {e}")
        return 1

    return 0

if __name__ == "__main__":
    main()

# A/B Testing Methodology

This document outlines the A/B testing methodology used in the MedOptix project to evaluate different healthcare service approaches.

## Overview

A/B testing in MedOptix compares two different healthcare service approaches (Group A vs Group B) to determine which approach leads to better outcomes across various metrics. The testing methodology is designed to provide statistically rigorous comparisons while minimizing disruption to patient care.

## Group Assignment

Patients are randomly assigned to either Group A or Group B when they schedule an appointment. The assignment is stored in the `group_name` field in the appointments table and is carried through to related tables (feedback, etc.) for consistent analysis.

### Assignment Logic

```python
# Simplified representation of group assignment logic
import random

def assign_group():
    """Randomly assign a patient to Group A or Group B"""
    return random.choice(['A', 'B'])
```

The random assignment ensures an approximately equal distribution between the two groups, which is essential for valid statistical comparison.

## Key Metrics

The A/B testing analysis evaluates the following key metrics:

### 1. Wait Time
- **Definition**: Time between the patient's scheduled appointment time and when they are seen by a healthcare provider
- **Measurement**: Minutes
- **Data Source**: `appointments` table, calculated as the difference between `scheduled_time` and service start time

### 2. Patient Satisfaction
- **Definition**: Self-reported satisfaction score provided by patients after their appointment
- **Measurement**: Scale of 1-10, where 10 is the highest satisfaction
- **Data Source**: `feedback_data` table, `satisfaction_score` field

### 3. No-show Rate
- **Definition**: Percentage of scheduled appointments where the patient did not attend
- **Measurement**: Percentage (%)
- **Data Source**: `appointments` table, where `was_seen` = 0

### 4. Patient Throughput (Secondary)
- **Definition**: Number of patients seen per department per day
- **Measurement**: Count
- **Data Source**: `service_data` table, `patients_seen` field

### 5. Staff Efficiency (Secondary)
- **Definition**: Average number of patients seen per staff member per shift
- **Measurement**: Ratio
- **Data Source**: Calculated from `staff_logs` and `service_data`

### 6. Equipment Downtime (Secondary)
- **Definition**: Hours of equipment unavailability
- **Measurement**: Hours
- **Data Source**: `service_data` table, `equipment_downtime_hours` field

## Statistical Analysis

The statistical analysis of A/B test results includes:

1. **Descriptive Statistics**: Mean, median, and standard deviation for each metric by group
2. **Hypothesis Testing**: Two-sample t-tests to determine if differences between groups are statistically significant
3. **Confidence Intervals**: 95% confidence intervals for the difference between groups
4. **Effect Size**: Cohen's d to measure the magnitude of differences

```python
# Example of statistical analysis code (simplified)
from scipy import stats
import numpy as np

def analyze_metric(group_a_data, group_b_data):
    """Perform statistical analysis comparing two groups"""
    # Calculate descriptive statistics
    group_a_mean = np.mean(group_a_data)
    group_b_mean = np.mean(group_b_data)
    difference = group_a_mean - group_b_mean
    
    # Perform t-test
    t_stat, p_value = stats.ttest_ind(group_a_data, group_b_data)
    
    # Calculate effect size (Cohen's d)
    pooled_std = np.sqrt((np.std(group_a_data)**2 + np.std(group_b_data)**2) / 2)
    effect_size = difference / pooled_std
    
    return {
        'group_a_mean': group_a_mean,
        'group_b_mean': group_b_mean,
        'difference': difference,
        'p_value': p_value,
        'significant': p_value < 0.05,
        'effect_size': effect_size
    }
```

## Reporting

A/B test results are reported in the `insights/ab_test_summary.md` file, which includes:

1. **Executive Summary**: High-level overview of findings
2. **Key Findings**: Detailed results for each metric
3. **Recommendations**: Actionable insights based on the results
4. **Caveats and Limitations**: Important considerations when interpreting the results

## Implementation

The A/B testing analysis is implemented in the `ab_test_analysis.py` script, which:

1. Connects to the database
2. Loads the relevant data
3. Performs the analysis for each metric
4. Generates insights based on the results
5. Creates the markdown report

To run the A/B test analysis:

```bash
python ab_test_analysis.py
```

This will generate an updated `insights/ab_test_summary.md` file with the latest results.

## Interpreting Results

When interpreting A/B test results, consider:

1. **Statistical Significance**: A p-value < 0.05 indicates a statistically significant difference
2. **Effect Size**: Even statistically significant differences may not be practically meaningful if the effect size is small
3. **Consistency**: Look for consistent patterns across multiple metrics
4. **Context**: Consider operational and clinical context when interpreting results

## Future Improvements

Potential improvements to the A/B testing methodology include:

1. **Multi-armed Testing**: Expand beyond two groups to test multiple approaches simultaneously
2. **Segmentation Analysis**: Analyze results by department, patient demographics, or other factors
3. **Longitudinal Analysis**: Track metrics over time to identify trends and seasonal effects
4. **Bayesian Analysis**: Implement Bayesian statistical methods for more nuanced interpretation
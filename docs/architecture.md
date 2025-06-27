# MedOptix Architecture

This document provides an overview of the MedOptix system architecture, data flow, and database schema.

## System Architecture

MedOptix follows a three-tier architecture:

1. **Data Layer**: SQLite database storing processed healthcare data
2. **Application Layer**: Python-based ETL pipeline and FastAPI server
3. **Presentation Layer**: React-based dashboard for data visualization

```
+-------------------+      +-------------------+      +-------------------+
|                   |      |                   |      |                   |
|  Data Sources     |      |  ETL Pipeline     |      |  API Server       |
|  (CSV Files)      +----->+  (Python)         +----->+  (FastAPI)        |
|                   |      |                   |      |                   |
+-------------------+      +-------------------+      +--------+----------+
                                                               |
                                                               |
                                                               v
                                                      +-------------------+
                                                      |                   |
                                                      |  Dashboard        |
                                                      |  (React)          |
                                                      |                   |
                                                      +-------------------+
```

## Data Flow

1. **Data Ingestion**:
   - Raw CSV files are placed in the `data/raw/` directory
   - The file watcher (`scripts/realtime_etl_watcher.py`) monitors for changes

2. **ETL Process**:
   - **Extract**: Raw data is read from CSV files (`scripts/extract.py`)
   - **Transform**: Data is cleaned and transformed (`scripts/transform.py`)
   - **Load**: Processed data is loaded into SQLite database (`scripts/load.py`)

3. **Data Serving**:
   - FastAPI server provides RESTful endpoints to access the data
   - API includes endpoints for appointments, feedback, service, and staff data

4. **Data Visualization**:
   - React dashboard fetches data from the API
   - Dashboard displays charts, graphs, and tables
   - Auto-refresh functionality keeps data current

## Database Schema

### Appointments Table
| Column             | Type    | Description                           |
|--------------------|---------|---------------------------------------|
| appointment_id     | INTEGER | Primary key                           |
| patient_id         | INTEGER | Patient identifier                    |
| department         | TEXT    | Department name                       |
| appointment_date   | TEXT    | Date of appointment (YYYY-MM-DD)      |
| scheduled_time     | TEXT    | Scheduled time (HH:MM)                |
| arrival_time       | TEXT    | Actual arrival time (HH:MM)           |
| group_name         | TEXT    | A/B test group assignment             |
| wait_time_minutes  | INTEGER | Wait time in minutes                  |
| was_seen           | INTEGER | Boolean (1=seen, 0=no-show)           |

### Feedback Data Table
| Column             | Type    | Description                           |
|--------------------|---------|---------------------------------------|
| id                 | INTEGER | Primary key                           |
| appointment_id     | INTEGER | Foreign key to appointments           |
| patient_id         | INTEGER | Patient identifier                    |
| satisfaction_score | INTEGER | Score from 1-10                       |
| comments           | TEXT    | Patient comments                      |
| group_name         | TEXT    | A/B test group assignment             |

### Service Data Table
| Column                    | Type    | Description                    |
|---------------------------|---------|--------------------------------|
| id                        | INTEGER | Primary key                    |
| department                | TEXT    | Department name                |
| date                      | TEXT    | Date (YYYY-MM-DD)              |
| patients_seen             | INTEGER | Number of patients seen        |
| avg_service_time_minutes  | REAL    | Average service time           |
| equipment_downtime_hours  | REAL    | Equipment downtime in hours    |

### Staff Logs Table
| Column             | Type    | Description                           |
|--------------------|---------|---------------------------------------|
| id                 | INTEGER | Primary key                           |
| department         | TEXT    | Department name                       |
| date               | TEXT    | Date (YYYY-MM-DD)                     |
| shift_start_time   | TEXT    | Shift start time (HH:MM)              |
| shift_end_time     | TEXT    | Shift end time (HH:MM)                |
| staff_count        | INTEGER | Number of staff on duty               |

## Component Interactions

- **File Watcher → ETL Pipeline**: Triggers ETL process when files change
- **ETL Pipeline → Database**: Updates database with processed data
- **API Server → Database**: Queries database to serve data
- **Dashboard → API Server**: Requests data for visualization
- **A/B Test Analysis → Database**: Analyzes data for A/B test results
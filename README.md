# MedOptix

A healthcare analytics platform with real-time ETL processing, advanced A/B testing capabilities, and interactive dashboard visualization. MedOptix helps healthcare providers analyze patient data, optimize service delivery, and make data-driven decisions to improve patient outcomes and operational efficiency.

## Developer

This project was developed by Jeet Singh Saini.

## Features

- **Real-time ETL Processing**: Monitors raw data files for changes and automatically updates the database
- **RESTful API**: Serves cleaned data to the dashboard with last_updated timestamp
- **Interactive Dashboard**: React-based dashboard with auto-refresh capability
- **Data Analysis**: Provides insights on appointments, feedback, service, and staff data
- **A/B Testing**: Comprehensive analysis of healthcare service approaches to identify optimal patient care strategies

## Project Structure

```
/medoptix_1/
├── api/                      # API server
│   └── server.py             # FastAPI implementation
├── client/                   # Frontend
│   └── medoptix-dashboard/   # React dashboard
├── data/                     # Data directory
│   ├── raw/                  # Raw CSV files (monitored by watcher)
│   ├── cleaned/              # Cleaned data files
│   └── healthcare.db         # SQLite database (generated)
├── docs/                     # Documentation
│   ├── architecture.md       # System architecture documentation
│   ├── ab_testing.md         # A/B testing methodology
│   └── contributing.md       # Contribution guidelines
├── insights/                 # Analysis insights
│   └── ab_test_summary.md    # A/B test results summary
├── notebooks/                # Jupyter notebooks for analysis
├── scripts/                  # ETL scripts
│   ├── extract.py            # Data extraction
│   ├── transform.py          # Data transformation
│   ├── load.py               # Database loading
│   └── realtime_etl_watcher.py # Real-time file watcher
├── server/                   # Original server implementation
├── main.py                   # Original ETL pipeline
├── ab_test_analysis.py       # A/B test analysis script
└── run_realtime_api.py       # Script to run the real-time API
```

## Getting Started

## Tech Stack

### Backend
- **Python 3.8+**: Core programming language
- **FastAPI**: Modern, high-performance web framework for building APIs
- **SQLite**: Lightweight database for storing processed data
- **Pandas**: Data manipulation and analysis
- **NumPy**: Numerical computing
- **SciPy**: Statistical analysis for A/B testing
- **Watchdog**: File system monitoring for real-time ETL

### Frontend
- **Node.js 14+**: JavaScript runtime
- **React**: Frontend library for building user interfaces
- **Axios**: HTTP client for API requests
- **Recharts**: Charting library for data visualization
- **TailwindCSS**: Utility-first CSS framework

### DevOps
- **Git**: Version control
- **Docker** (optional): Containerization for deployment

### Prerequisites

- Python 3.8+
- Node.js 14+
- Git

### Installation

1. Clone the repository
2. Install Python dependencies:
   ```
   pip install fastapi uvicorn pandas watchdog
   ```
3. Install Node.js dependencies:
   ```
   cd client/medoptix-dashboard
   npm install
   ```

### Running the Application

#### Standard Method

1. Start the real-time API server:
   ```
   python run_realtime_api.py
   ```
   This will start the API server on http://localhost:8000 and begin monitoring the data/raw directory for changes.

2. Start the React dashboard:
   ```
   cd client/medoptix-dashboard
   npm run dev
   ```
   The dashboard will be available at http://localhost:3000.

#### Using Docker (Recommended for Production)

The project includes Docker configuration for easy deployment:

1. Build and start all services:
   ```
   docker-compose up -d
   ```

2. Access the application:
   - API: http://localhost:8000
   - Dashboard: http://localhost:3000

3. View logs:
   ```
   docker-compose logs -f
   ```

4. Stop all services:
   ```
   docker-compose down
   ```

## Real-time ETL Process

The real-time ETL process works as follows:

1. The file watcher (scripts/realtime_etl_watcher.py) monitors the data/raw directory for changes to CSV files.
2. When a change is detected, the ETL pipeline is triggered:
   - Extract data from CSV files
   - Transform and clean the data
   - Load the data into the SQLite database
3. The API server provides endpoints to access the cleaned data and check when it was last updated.
4. The dashboard can poll the API to check for updates and refresh data automatically.

## API Endpoints

- `GET /health`: Health check endpoint
- `GET /last_updated`: Get the timestamp of the last ETL update
- `GET /appointments`: Get all appointments
- `GET /feedback`: Get all feedback data
- `GET /service`: Get all service data
- `GET /staff`: Get all staff logs

## Dashboard Features

- **Auto-refresh**: Automatically refreshes data when changes are detected
- **Manual Refresh**: Button to manually trigger data refresh
- **Last Updated**: Displays when the data was last updated
- **Visualizations**: Charts and graphs to visualize the data

## Sample Outputs

### Dashboard Overview
```
+----------------------------------+
|           MedOptix Dashboard    |
+----------------------------------+
| Last Updated: 2025-06-26 18:42  |
+----------------------------------+
|                                  |
| +------------------------------+ |
| |      Appointment Summary     | |
| |                              | |
| | Total: 1,245                 | |
| | Completed: 1,156             | |
| | No-shows: 89                 | |
| +------------------------------+ |
|                                  |
| +------------------------------+ |
| |     Patient Satisfaction     | |
| |                              | |
| | [Chart: Satisfaction Scores] | |
| | Average: 8.5/10              | |
| +------------------------------+ |
|                                  |
+----------------------------------+
```

### A/B Test Results
```
Group A vs Group B Performance:
- Wait times: 17.6 vs 17.7 minutes
- Satisfaction: 8.55 vs 8.53 (out of 10)
- No-show rate: 5.8% vs 6.2%
```

## Troubleshooting

### Common Issues

#### Database Connection Errors
- Ensure SQLite database exists at the expected location
- Check file permissions on the database file
- Verify database is not locked by another process

#### API Server Won't Start
- Check if port 8000 is already in use
- Ensure all required Python packages are installed
- Verify the database file exists

#### Dashboard Not Showing Data
- Confirm API server is running
- Check browser console for network errors
- Verify the API URL in the dashboard configuration

#### ETL Process Errors
- Check if raw data files are in the correct format
- Ensure the data/raw directory exists and is accessible
- Look for error messages in the console output

### Getting Help
If you encounter issues not covered here, please:
1. Check the logs in the console output
2. Review the documentation in the docs/ directory
3. Open an issue on the project repository

## License

MIT

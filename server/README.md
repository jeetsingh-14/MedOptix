# MedOptix API

A FastAPI backend that exposes RESTful endpoints from a local SQLite database (medoptix.db).

## Developer

This project was developed by Jeet Singh Saini.

## Endpoints

The API provides the following endpoints:

- `/appointments`: Returns a list of all appointments
- `/staff`: Returns a list of all staff logs
- `/service`: Returns a list of all service data
- `/feedback`: Returns a list of all feedback data
- `/insights`: Returns precomputed analysis results

All endpoints return JSON responses.

## Database

The API uses a SQLite database (medoptix.db) with the following tables:

- `appointments`: Appointment data
- `feedback_data`: Feedback data
- `service_data`: Service data
- `staff_logs`: Staff logs

## Running the API

To run the API, follow these steps:

1. Make sure you have Python 3.7+ installed
2. Install the required packages:
   ```
   pip install fastapi uvicorn sqlalchemy pydantic
   ```
3. Run the ETL pipeline to create the database (if it doesn't exist):
   ```
   python main.py
   ```
4. Run the API:
   ```
   python run_api.py
   ```

The API will be available at http://localhost:8000.

## API Documentation

FastAPI automatically generates API documentation. You can access it at:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## CORS

CORS is enabled for the React frontend at http://localhost:3000.

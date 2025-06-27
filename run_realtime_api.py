"""
run_realtime_api.py - Script to run the real-time API server

This script runs the FastAPI server for the MedOptix dashboard with real-time ETL updates.
"""

import uvicorn
import os
import sys

if __name__ == "__main__":
    print("Starting MedOptix Real-time API Server...")
    
    # Add the current directory to the path so we can import the api module
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))
    
    # Run the FastAPI server
    uvicorn.run("api.server:app", host="0.0.0.0", port=8000, reload=True)
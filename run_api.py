"""
run_api.py - Script to run the FastAPI backend

This script runs the FastAPI backend for the MedOptix dashboard.
It also starts the stream simulation in a separate thread.
"""

import uvicorn
from simulate_stream import start_stream_in_thread

if __name__ == "__main__":
    # Start the stream simulation in a separate thread
    print("Starting stream simulation in background...")
    stream_thread = start_stream_in_thread()

    # Run the FastAPI server
    print("Starting FastAPI server...")
    uvicorn.run("server.main:app", host="0.0.0.0", port=8000, reload=True)

#!/bin/bash

echo "==================================="
echo "MedOptix Project Setup"
echo "==================================="

echo
echo "Creating Python virtual environment..."
python3 -m venv venv
source venv/bin/activate

echo
echo "Installing Python dependencies..."
pip install -r requirements.txt

echo
echo "Setting up environment variables..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Created .env file from .env.example"
else
    echo ".env file already exists"
fi

echo
echo "Creating data directories if they don't exist..."
mkdir -p data/raw
mkdir -p data/cleaned

echo
echo "Creating SQLite database if it doesn't exist..."
python -c "from scripts.load import create_database; create_database()"

echo
echo "Running initial ETL process..."
python main.py

echo
echo "==================================="
echo "Setup complete!"
echo "==================================="
echo
echo "To start the application:"
echo "1. Run the API server: python run_realtime_api.py"
echo "2. In a new terminal, start the dashboard:"
echo "   cd client/medoptix-dashboard"
echo "   npm run dev"
echo
echo "The API will be available at http://localhost:8000"
echo "The dashboard will be available at http://localhost:3000"
echo "==================================="
"""
test_api.py - Script to test the FastAPI endpoints

This script tests the FastAPI endpoints to ensure they return the expected JSON responses.
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_endpoint(endpoint):
    """
    Test an endpoint and print the response
    
    Args:
        endpoint (str): The endpoint to test
    """
    url = f"{BASE_URL}{endpoint}"
    print(f"\nTesting endpoint: {url}")
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        
        # Print status code and response
        print(f"Status code: {response.status_code}")
        print("Response:")
        
        # Pretty print the JSON response
        data = response.json()
        print(json.dumps(data, indent=2))
        
        return True
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
        return False

def main():
    """
    Test all endpoints
    """
    print("Testing MedOptix API endpoints...")
    
    # Test root endpoint
    test_endpoint("/")
    
    # Test health endpoint
    test_endpoint("/health")
    
    # Test appointments endpoint
    test_endpoint("/appointments")
    
    # Test staff endpoint
    test_endpoint("/staff")
    
    # Test service endpoint
    test_endpoint("/service")
    
    # Test feedback endpoint
    test_endpoint("/feedback")
    
    # Test insights endpoint
    test_endpoint("/insights")
    
    print("\nAPI testing completed.")

if __name__ == "__main__":
    main()
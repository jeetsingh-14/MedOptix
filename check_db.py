import sqlite3
import os

# Path to the database
db_path = './data/healthcare.db'

# Check if the database file exists
if not os.path.exists(db_path):
    print(f"Database file not found at {db_path}")
    exit(1)

# Connect to the database
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Get list of tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()

print("Tables in the database:")
for table in tables:
    print(f"- {table[0]}")
    
    # Get schema for each table
    cursor.execute(f"PRAGMA table_info({table[0]});")
    columns = cursor.fetchall()
    
    print("  Columns:")
    for column in columns:
        print(f"    - {column[1]} ({column[2]})")
    
    # Get a sample row from each table
    cursor.execute(f"SELECT * FROM {table[0]} LIMIT 1;")
    sample = cursor.fetchone()
    
    if sample:
        print("  Sample row:")
        for i, col in enumerate(columns):
            print(f"    - {col[1]}: {sample[i]}")
    
    print()

# Close the connection
conn.close()
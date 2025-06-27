import sqlite3
import os

# Connect to the database
conn = sqlite3.connect('data/healthcare.db')
cursor = conn.cursor()

# Get list of tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()
print("Tables:", [t[0] for t in tables])

# For each table, get schema and sample data
for table in [t[0] for t in tables]:
    print(f"\nTable: {table}")
    
    # Get schema
    cursor.execute(f"PRAGMA table_info({table})")
    columns = cursor.fetchall()
    print("Schema:")
    for col in columns:
        print(f"  {col[1]} ({col[2]})")
    
    # Get sample data
    cursor.execute(f"SELECT * FROM {table} LIMIT 3")
    sample_data = cursor.fetchall()
    print("Sample data:")
    for row in sample_data:
        print(f"  {row}")

conn.close()
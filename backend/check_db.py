import sqlite3
import os

# Database path
db_path = r'C:\Users\taham\OneDrive\Desktop\icommerce\backend\db.sqlite3'

if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check if users_user table exists and its columns
    try:
        cursor.execute("PRAGMA table_info(users_user);")
        columns = cursor.fetchall()
        print("Current users_user table columns:")
        for col in columns:
            print(f"  {col[1]} ({col[2]})")
        
        # Check if name column exists
        column_names = [col[1] for col in columns]
        if 'name' not in column_names:
            print("\n❌ 'name' column is missing!")
        else:
            print("\n✅ 'name' column exists!")
            
        if 'user_type' not in column_names:
            print("❌ 'user_type' column is missing!")
        else:
            print("✅ 'user_type' column exists!")
            
    except sqlite3.Error as e:
        print(f"Error checking users_user table: {e}")
    
    # Check migration status
    try:
        cursor.execute("SELECT app, name FROM django_migrations WHERE app='users';")
        migrations = cursor.fetchall()
        print("\nApplied migrations for users app:")
        for migration in migrations:
            print(f"  {migration[1]}")
    except sqlite3.Error as e:
        print(f"Error checking migrations: {e}")
    
    conn.close()
else:
    print("Database file not found!")

#!/usr/bin/env python
import os
import sys
import django

# Add the project directory to Python path
sys.path.append(r'C:\Users\taham\OneDrive\Desktop\icommerce\backend')

# Set the settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# Setup Django
django.setup()

# Import migration executor
from django.core.management import execute_from_command_line

if __name__ == '__main__':
    # Run migrations
    print("Running migrations...")
    execute_from_command_line(['manage.py', 'migrate'])
    print("Migrations completed!")

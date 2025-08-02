@echo off
echo Starting Django Development Server...
echo.
echo The server will run on http://127.0.0.1:8000
echo.
echo Test endpoints:
echo - http://127.0.0.1:8000/api/products/
echo - http://127.0.0.1:8000/api/products/?page_size=12
echo - http://127.0.0.1:8000/api/products/?page_size=12^&min_price=10
echo.
echo Press Ctrl+C to stop the server
echo.

C:\Users\taham\OneDrive\Desktop\icommerce\backend\env\Scripts\python.exe manage.py runserver 8000

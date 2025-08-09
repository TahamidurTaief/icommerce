@echo off
echo Starting iCommerce Development Environment...
echo.

echo 1. Creating test coupon in backend...
cd backend
call .\env\Scripts\activate.bat
python create_test_coupon.py
echo.

echo 2. Starting Django backend server...
start "Django Backend" cmd /k ".\env\Scripts\activate.bat && python manage.py runserver 127.0.0.1:8000"
echo.

echo 3. Starting Next.js frontend server...
cd ..\frontend
start "Next.js Frontend" cmd /k "npm run dev"
echo.

echo ✅ Both servers are starting...
echo 📋 Backend: http://127.0.0.1:8000
echo 🌐 Frontend: http://localhost:3000
echo.
echo 🎫 Test Coupon Code: TEST10 (10% off)
echo.
pause

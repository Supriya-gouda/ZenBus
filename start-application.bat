@echo off
echo ========================================
echo       ZenBus System Launcher
echo ========================================
echo.

echo Starting Backend Server...
cd backend
start "Backend Server" cmd /k "npm start"

echo.
echo Waiting for backend to initialize...
timeout /t 5 /nobreak > nul

echo Starting Frontend Development Server...
cd ../frontend
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ========================================
echo    Application Started Successfully!
echo ========================================
echo.
echo Backend Server: http://localhost:8080
echo Frontend App:   http://localhost:3001
echo Admin Login:    http://localhost:3001/admin-login
echo.
echo Admin Credentials:
echo Username: admin
echo Password: admin123
echo.
echo Press any key to exit...
pause > nul

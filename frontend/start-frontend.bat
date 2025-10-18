@echo off
echo Starting PDF to Word Frontend...
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if errorlevel 1 (
        echo Failed to install dependencies!
        pause
        exit /b 1
    )
)

REM Check if backend is running
echo Checking backend connection...
curl -s http://localhost:8000/api/health >nul 2>&1
if errorlevel 1 (
    echo WARNING: Backend is not running on port 8000
    echo Please start the backend first by running: python backend/main.py
    echo.
)

REM Start the frontend
echo Starting frontend development server...
npm run dev

pause
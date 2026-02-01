@echo off
set PGPASSWORD=sikuambi

REM Target database for restore
set dbname=vehicle_platform_test

REM Find the most recent .zip backup in Backups folder
for /f "delims=" %%i in ('dir /b /o-d "C:\Users\Test\projects\CarKnow\vehicle-platform-backend\Backups\*.zip"') do (
    set latest=%%i
    goto :found
)

:found
echo Latest backup found: %latest%

REM Extract the zip into a temp folder
powershell Expand-Archive -Path "C:\Users\Test\projects\CarKnow\vehicle-platform-backend\Backups\%latest%" -DestinationPath "C:\Users\Test\projects\CarKnow\vehicle-platform-backend\Backups\temp" -Force

REM Get the .sql file name inside the zip
for %%f in ("C:\Users\Test\projects\CarKnow\vehicle-platform-backend\Backups\temp\*.sql") do set sqlfile=%%f

REM Create the test database if it doesn’t exist
psql -U postgres -p 3001 -c "CREATE DATABASE %dbname%;"

REM Restore the backup into the test database
psql -U postgres -d %dbname% -p 3001 < "%sqlfile%"

echo Restore completed from %latest% into %dbname% on %DATE% at %TIME%

REM Clean up temp folder
rmdir /s /q "C:\Users\Test\projects\CarKnow\vehicle-platform-backend\Backups\temp"

pause

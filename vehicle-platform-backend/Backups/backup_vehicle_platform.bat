@echo off
set PGPASSWORD=sikuambi

:: Get consistent date format
for /f %%i in ('wmic os get localdatetime ^| find "."') do set datetime=%%i
set timestamp=%datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2%
set filename=vehicle_platform_backup_%timestamp%.sql

pg_dump -U postgres -d vehicle_platform -p 3001 > "C:\Users\Test\projects\CarKnow\vehicle-platform-backend\Backups\%filename%"

powershell Compress-Archive -Path "C:\Users\Test\projects\CarKnow\vehicle-platform-backend\Backups\%filename%" -DestinationPath "C:\Users\Test\projects\CarKnow\vehicle-platform-backend\Backups\%filename%.zip"

del "C:\Users\Test\projects\CarKnow\vehicle-platform-backend\Backups\%filename%"

forfiles /p "C:\Users\Test\projects\CarKnow\vehicle-platform-backend\Backups" /s /m *.zip /d -7 /c "cmd /c del @path"



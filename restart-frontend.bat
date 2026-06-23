@echo off
echo Restarting frontend container only...
cd docker
docker-compose -f complete-stack.yml restart frontend
echo.
echo Frontend restarted!
pause

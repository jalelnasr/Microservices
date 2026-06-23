@echo off
echo ========================================
echo   ARRET DE KEYCLOAK
echo ========================================
echo.

cd docker
docker-compose -f keycloak-standalone.yml down

echo.
echo Keycloak arrete avec succes !
echo.
pause
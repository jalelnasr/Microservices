@echo off
echo ========================================
echo   DEMARRAGE DE KEYCLOAK
echo ========================================
echo.

cd docker

echo [1/3] Arret des conteneurs existants...
docker-compose -f keycloak-standalone.yml down

echo.
echo [2/3] Demarrage de Keycloak...
docker-compose -f keycloak-standalone.yml up -d

echo.
echo [3/3] Attente du demarrage de Keycloak...
timeout /t 30 /nobreak

echo.
echo ========================================
echo   KEYCLOAK DEMARRE AVEC SUCCES !
echo ========================================
echo.
echo URL Admin Console : http://localhost:8180
echo Username          : admin
echo Password          : admin
echo.
echo Realm configure   : microservices-realm
echo.
echo Pour voir les logs :
echo   docker logs -f keycloak
echo.
echo Pour arreter :
echo   cd docker
echo   docker-compose -f keycloak-standalone.yml down
echo.
pause
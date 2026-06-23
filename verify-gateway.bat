@echo off
echo ========================================
echo   VERIFICATION API GATEWAY ROUTING
echo ========================================
echo.

echo 1. Test Gateway (port 8080) - doit retourner 401
curl -I http://localhost:8080/api/offres
echo.

echo 2. Test direct Offre Service (port 8081) - doit retourner 401
curl -I http://localhost:8081/api/offres  
echo.

echo 3. Test direct Candidature Service (port 8082) - doit retourner 401
curl -I http://localhost:8082/api/candidatures
echo.

echo 4. Verification Eureka - services enregistres
curl -s http://localhost:8761/eureka/apps | findstr "application"
echo.

echo 5. Routes Gateway configurees
curl -s http://localhost:8080/actuator/gateway/routes
echo.

echo ========================================
echo   VERIFICATION TERMINEE
echo   Tous les appels doivent passer par 8080
echo ========================================
pause
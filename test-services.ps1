# Test connectivity to microservices
Write-Host "Testing microservices connectivity..." -ForegroundColor Green

# Test Eureka
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8761/actuator/health" -TimeoutSec 3 -UseBasicParsing
    Write-Host "✅ Eureka Server: OK (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ Eureka Server: FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

# Test Offre Service  
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8081/actuator/health" -TimeoutSec 3 -UseBasicParsing
    Write-Host "✅ Offre Service: OK (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ Offre Service: FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

# Test API Gateway
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/actuator/health" -TimeoutSec 3 -UseBasicParsing  
    Write-Host "✅ API Gateway: OK (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ API Gateway: FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

# Test Keycloak
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8180/health" -TimeoutSec 3 -UseBasicParsing
    Write-Host "✅ Keycloak: OK (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ Keycloak: FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTesting completed!" -ForegroundColor Yellow
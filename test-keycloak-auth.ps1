# ========================================
# SCRIPT DE TEST AUTHENTIFICATION KEYCLOAK
# ========================================

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   TEST AUTHENTIFICATION KEYCLOAK" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$keycloakUrl = "http://localhost:8180"
$realm = "microservices-realm"
$clientId = "auth-service-client"
$clientSecret = "S3cr3t-Auth-S3rv1c3-K3y-2024"
$tokenUrl = "$keycloakUrl/realms/$realm/protocol/openid-connect/token"

# Fonction pour tester un login
function Test-Login {
    param (
        [string]$Username,
        [string]$Password,
        [string]$ExpectedRole
    )
    
    Write-Host "`n--- Test Login: $Username ---" -ForegroundColor Yellow
    
    try {
        $body = @{
            grant_type = "password"
            client_id = $clientId
            client_secret = $clientSecret
            username = $Username
            password = $Password
        }
        
        $response = Invoke-RestMethod -Uri $tokenUrl -Method Post -Body $body -ContentType "application/x-www-form-urlencoded"
        
        # Décoder le token pour vérifier le rôle
        $parts = $response.access_token.Split('.')
        $payload = $parts[1]
        while ($payload.Length % 4 -ne 0) { $payload += '=' }
        $decodedBytes = [System.Convert]::FromBase64String($payload)
        $decodedJson = [System.Text.Encoding]::UTF8.GetString($decodedBytes)
        $tokenData = $decodedJson | ConvertFrom-Json
        
        $roles = $tokenData.realm_access.roles -join ", "
        
        Write-Host "  [SUCCESS] Login reussi !" -ForegroundColor Green
        Write-Host "  Username     : $($tokenData.preferred_username)" -ForegroundColor White
        Write-Host "  Email        : $($tokenData.email)" -ForegroundColor White
        Write-Host "  Roles        : $roles" -ForegroundColor White
        Write-Host "  Token valide : $($response.expires_in) secondes" -ForegroundColor White
        
        if ($roles -match $ExpectedRole) {
            Write-Host "  [OK] Role attendu trouve: $ExpectedRole" -ForegroundColor Green
        } else {
            Write-Host "  [WARNING] Role attendu: $ExpectedRole, trouve: $roles" -ForegroundColor Yellow
        }
        
        return $response.access_token
        
    } catch {
        Write-Host "  [FAILED] Login echoue !" -ForegroundColor Red
        Write-Host "  Erreur: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Fonction pour tester un login invalide
function Test-InvalidLogin {
    param (
        [string]$Username,
        [string]$Password
    )
    
    Write-Host "`n--- Test Login Invalide: $Username ---" -ForegroundColor Yellow
    
    try {
        $body = @{
            grant_type = "password"
            client_id = $clientId
            client_secret = $clientSecret
            username = $Username
            password = $Password
        }
        
        $response = Invoke-RestMethod -Uri $tokenUrl -Method Post -Body $body -ContentType "application/x-www-form-urlencoded"
        Write-Host "  [UNEXPECTED] Login reussi alors qu'il devrait echouer !" -ForegroundColor Red
        
    } catch {
        Write-Host "  [SUCCESS] Login echoue comme attendu" -ForegroundColor Green
        Write-Host "  Message: Invalid user credentials" -ForegroundColor White
    }
}

# Fonction pour tester le refresh token
function Test-RefreshToken {
    param (
        [string]$RefreshToken
    )
    
    Write-Host "`n--- Test Refresh Token ---" -ForegroundColor Yellow
    
    try {
        $body = @{
            grant_type = "refresh_token"
            client_id = $clientId
            client_secret = $clientSecret
            refresh_token = $RefreshToken
        }
        
        $response = Invoke-RestMethod -Uri $tokenUrl -Method Post -Body $body -ContentType "application/x-www-form-urlencoded"
        
        Write-Host "  [SUCCESS] Token rafraichi avec succes !" -ForegroundColor Green
        Write-Host "  Nouveau token valide : $($response.expires_in) secondes" -ForegroundColor White
        
    } catch {
        Write-Host "  [FAILED] Refresh token echoue !" -ForegroundColor Red
        Write-Host "  Erreur: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# ========================================
# EXECUTION DES TESTS
# ========================================

Write-Host "`n=== TESTS LOGINS VALIDES ===" -ForegroundColor Cyan

# Test 1: USER
$userToken = Test-Login -Username "user1" -Password "User@2024" -ExpectedRole "USER"

# Test 2: ADMIN
$adminToken = Test-Login -Username "admin" -Password "Admin@2024" -ExpectedRole "ADMIN"

# Test 3: RECRUITER
$recruiterToken = Test-Login -Username "recruiter1" -Password "Recruiter@2024" -ExpectedRole "RECRUITER"

Write-Host "`n`n=== TESTS LOGINS INVALIDES ===" -ForegroundColor Cyan

# Test 4: Mauvais mot de passe
Test-InvalidLogin -Username "user1" -Password "MauvaisPassword"

# Test 5: Utilisateur inexistant
Test-InvalidLogin -Username "utilisateur_inexistant" -Password "password"

Write-Host "`n`n=== TEST REFRESH TOKEN ===" -ForegroundColor Cyan

# Test 6: Refresh token
if ($userToken) {
    # Obtenir d'abord un refresh token
    $body = @{
        grant_type = "password"
        client_id = $clientId
        client_secret = $clientSecret
        username = "user1"
        password = "User@2024"
    }
    $fullResponse = Invoke-RestMethod -Uri $tokenUrl -Method Post -Body $body -ContentType "application/x-www-form-urlencoded"
    Test-RefreshToken -RefreshToken $fullResponse.refresh_token
}

Write-Host "`n`n========================================" -ForegroundColor Cyan
Write-Host "   TESTS TERMINES !" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Pour utiliser un token dans vos requetes API:" -ForegroundColor Yellow
Write-Host '  $headers = @{ Authorization = "Bearer $userToken" }' -ForegroundColor White
Write-Host '  Invoke-RestMethod -Uri "http://localhost:8080/api/offres" -Headers $headers' -ForegroundColor White

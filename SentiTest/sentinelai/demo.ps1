# SentinelAI Demo Script for PowerShell
# Windows compatible version

Write-Host "🛡️  ========================================" -ForegroundColor Cyan
Write-Host "   SentinelAI - Attack Demonstration" -ForegroundColor Cyan
Write-Host "   ========================================" -ForegroundColor Cyan
Write-Host ""

$API_URL = "http://localhost:5000"

# Function to print section header
function Print-Section {
    param($title)
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Blue
    Write-Host $title -ForegroundColor Blue
    Write-Host "========================================" -ForegroundColor Blue
    Write-Host ""
}

# Function to test endpoint
function Test-Endpoint {
    param(
        $name,
        $method,
        $endpoint,
        $data,
        $expected
    )
    
    Write-Host "Testing: $name" -ForegroundColor Yellow
    Write-Host "Endpoint: $method $endpoint"
    
    try {
        if ($method -eq "GET") {
            $response = Invoke-WebRequest -Uri "$API_URL$endpoint" -Method GET -UseBasicParsing
        } else {
            $response = Invoke-WebRequest -Uri "$API_URL$endpoint" -Method POST `
                -ContentType "application/json" -Body $data -UseBasicParsing
        }
        $statusCode = $response.StatusCode
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.Value__
    }
    
    if ($statusCode -eq $expected) {
        Write-Host "✅ PASSED - HTTP $statusCode (Expected: $expected)" -ForegroundColor Green
    } else {
        Write-Host "❌ FAILED - HTTP $statusCode (Expected: $expected)" -ForegroundColor Red
    }
    
    Write-Host ""
    Start-Sleep -Seconds 1
}

# Check if backend is running
Write-Host "Checking backend connectivity..."
try {
    $health = Invoke-WebRequest -Uri "$API_URL/health" -UseBasicParsing
    Write-Host "✅ Backend is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend is not running. Please start it with: npm start" -ForegroundColor Red
    exit 1
}

# 1. SAFE REQUESTS
Print-Section "1️⃣  SAFE REQUESTS (Should Pass)"

Test-Endpoint "Health Check" "GET" "/health" "" 200
Test-Endpoint "Normal User Creation" "POST" "/api/users" '{"name":"John Doe","email":"john@example.com"}' 201
Test-Endpoint "Safe Login" "POST" "/api/auth/login" '{"email":"user@test.com","password":"secure123"}' 200

# 2. SQL INJECTION ATTACKS
Print-Section "2️⃣  SQL INJECTION ATTACKS (Should Block)"

Test-Endpoint "SQL Injection - OR Statement" "POST" "/test/sql-injection" '{"username":"admin OR 1=1--","password":"anything"}' 403
Test-Endpoint "SQL Injection - UNION Attack" "POST" "/test/sql-injection" '{"query":"SELECT * FROM users UNION SELECT * FROM passwords"}' 403

# 3. XSS ATTACKS
Print-Section "3️⃣  XSS ATTACKS (Should Block)"

Test-Endpoint "XSS - Script Tag" "POST" "/test/xss-attack" '{"comment":"<script>alert(XSS)</script>"}' 403
Test-Endpoint "XSS - Image Onerror" "POST" "/test/xss-attack" '{"name":"<img src=x onerror=alert(XSS)>"}' 403

# 4. UNAUTHORIZED ACCESS
Print-Section "4️⃣  UNAUTHORIZED ACCESS (Should Block)"

Test-Endpoint "Admin Endpoint Access" "GET" "/api/admin/users" "" 403

# 5. PATH TRAVERSAL
Print-Section "5️⃣  PATH TRAVERSAL ATTACKS (Should Block)"

Test-Endpoint "Path Traversal - Linux" "POST" "/test/path-traversal" '{"file":"../../etc/passwd"}' 403

# 6. COMMAND INJECTION
Print-Section "6️⃣  COMMAND INJECTION (Should Block)"

Test-Endpoint "Command Injection - Pipe" "POST" "/test/command-injection" '{"command":"ls -la | cat /etc/passwd"}' 403

# 7. DASHBOARD METRICS
Print-Section "8️⃣  SECURITY DASHBOARD METRICS"

Write-Host "Fetching current security metrics..."
$metrics = Invoke-RestMethod -Uri "$API_URL/security/dashboard"

Write-Host ""
Write-Host "Key Metrics:" -ForegroundColor Yellow
Write-Host "  Total Requests: $($metrics.totalRequests)"
Write-Host "  Blocked: $($metrics.blockedRequests)"
Write-Host "  Suspicious: $($metrics.suspiciousRequests)"
Write-Host "  Security Score: $($metrics.securityScore)/100"

# SUMMARY
Print-Section "✅ DEMONSTRATION COMPLETE"

Write-Host "All tests completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 View detailed results at:"
Write-Host "   • Dashboard: http://localhost:3000"
Write-Host "   • API Metrics: $API_URL/security/dashboard"
Write-Host "   • Security Logs: $API_URL/security/logs"
Write-Host ""
Write-Host "🛡️  SentinelAI - Protecting your APIs" -ForegroundColor Cyan

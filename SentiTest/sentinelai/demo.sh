#!/bin/bash

# SentinelAI Demo Script
# This script demonstrates all features of the SentinelAI firewall

echo "🛡️  ========================================"
echo "   SentinelAI - Attack Demonstration"
echo "   ========================================"
echo ""

API_URL="http://localhost:5000"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print section header
print_section() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

# Function to test endpoint
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local expected=$5
    
    echo -e "${YELLOW}Testing: $name${NC}"
    echo "Endpoint: $method $endpoint"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$API_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$http_code" = "$expected" ]; then
        echo -e "${GREEN}✅ PASSED - HTTP $http_code (Expected: $expected)${NC}"
    else
        echo -e "${RED}❌ FAILED - HTTP $http_code (Expected: $expected)${NC}"
    fi
    
    echo "Response: $body" | head -c 200
    echo "..."
    echo ""
    sleep 1
}

# Check if backend is running
echo "Checking backend connectivity..."
if curl -s "$API_URL/health" > /dev/null; then
    echo -e "${GREEN}✅ Backend is running${NC}"
else
    echo -e "${RED}❌ Backend is not running. Please start it with: npm start${NC}"
    exit 1
fi

# 1. SAFE REQUESTS
print_section "1️⃣  SAFE REQUESTS (Should Pass)"

test_endpoint \
    "Health Check" \
    "GET" \
    "/health" \
    "" \
    "200"

test_endpoint \
    "Normal User Creation" \
    "POST" \
    "/api/users" \
    '{"name":"John Doe","email":"john@example.com"}' \
    "201"

test_endpoint \
    "Safe Login" \
    "POST" \
    "/api/auth/login" \
    '{"email":"user@test.com","password":"secure123"}' \
    "200"

# 2. SQL INJECTION ATTACKS
print_section "2️⃣  SQL INJECTION ATTACKS (Should Block)"

test_endpoint \
    "SQL Injection - OR Statement" \
    "POST" \
    "/test/sql-injection" \
    '{"username":"admin OR 1=1--","password":"anything"}' \
    "403"

test_endpoint \
    "SQL Injection - UNION Attack" \
    "POST" \
    "/test/sql-injection" \
    '{"query":"SELECT * FROM users UNION SELECT * FROM passwords"}' \
    "403"

test_endpoint \
    "SQL Injection - Comment Attack" \
    "POST" \
    "/api/database/query" \
    '{"query":"DROP TABLE users; --"}' \
    "403"

# 3. XSS ATTACKS
print_section "3️⃣  XSS ATTACKS (Should Block)"

test_endpoint \
    "XSS - Script Tag" \
    "POST" \
    "/test/xss-attack" \
    '{"comment":"<script>alert(\"XSS\")</script>"}' \
    "403"

test_endpoint \
    "XSS - Image Onerror" \
    "POST" \
    "/test/xss-attack" \
    '{"name":"<img src=x onerror=alert(\"XSS\")>"}' \
    "403"

test_endpoint \
    "XSS - JavaScript Protocol" \
    "POST" \
    "/test/xss-attack" \
    '{"link":"javascript:alert(\"XSS\")"}' \
    "403"

# 4. UNAUTHORIZED ACCESS
print_section "4️⃣  UNAUTHORIZED ACCESS (Should Block)"

test_endpoint \
    "Admin Endpoint Access" \
    "GET" \
    "/api/admin/users" \
    "" \
    "403"

test_endpoint \
    "Database Query Endpoint" \
    "POST" \
    "/api/database/query" \
    '{"query":"SELECT * FROM sensitive_data"}' \
    "403"

# 5. PATH TRAVERSAL
print_section "5️⃣  PATH TRAVERSAL ATTACKS (Should Block)"

test_endpoint \
    "Path Traversal - Linux" \
    "POST" \
    "/test/path-traversal" \
    '{"file":"../../etc/passwd"}' \
    "403"

test_endpoint \
    "Path Traversal - Windows" \
    "POST" \
    "/test/path-traversal" \
    '{"path":"..\\..\\..\\windows\\system32\\config"}' \
    "403"

# 6. COMMAND INJECTION
print_section "6️⃣  COMMAND INJECTION (Should Block)"

test_endpoint \
    "Command Injection - Pipe" \
    "POST" \
    "/test/command-injection" \
    '{"command":"ls -la | cat /etc/passwd"}' \
    "403"

test_endpoint \
    "Command Injection - Backticks" \
    "POST" \
    "/test/command-injection" \
    '{"input":"`whoami`"}' \
    "403"

# 7. RATE LIMITING
print_section "7️⃣  RATE LIMITING TEST"

echo "Sending 50 rapid requests..."
for i in {1..50}; do
    curl -s -X POST "$API_URL/test/spam" \
        -H "Content-Type: application/json" \
        -d '{"data":"test"}' > /dev/null &
done
wait

echo -e "${GREEN}✅ 50 requests sent${NC}"
echo "Note: Check dashboard for rate limiting detection"
sleep 2

# 8. DASHBOARD METRICS
print_section "8️⃣  SECURITY DASHBOARD METRICS"

echo "Fetching current security metrics..."
metrics=$(curl -s "$API_URL/security/dashboard")

echo "$metrics" | python3 -m json.tool 2>/dev/null || echo "$metrics"

echo ""
echo -e "${YELLOW}Key Metrics:${NC}"
total=$(echo "$metrics" | grep -o '"totalRequests":[0-9]*' | cut -d':' -f2)
blocked=$(echo "$metrics" | grep -o '"blockedRequests":[0-9]*' | cut -d':' -f2)
suspicious=$(echo "$metrics" | grep -o '"suspiciousRequests":[0-9]*' | cut -d':' -f2)
score=$(echo "$metrics" | grep -o '"securityScore":[0-9]*' | cut -d':' -f2)

echo "  Total Requests: $total"
echo "  Blocked: $blocked"
echo "  Suspicious: $suspicious"
echo "  Security Score: $score/100"

# 9. RECENT THREATS
print_section "9️⃣  RECENT BLOCKED THREATS"

echo "Fetching recent blocked requests..."
blocked_logs=$(curl -s "$API_URL/security/blocked")

echo "$blocked_logs" | python3 -m json.tool 2>/dev/null | head -50

# SUMMARY
print_section "✅ DEMONSTRATION COMPLETE"

echo -e "${GREEN}All tests completed!${NC}"
echo ""
echo "📊 View detailed results at:"
echo "   • Dashboard: http://localhost:3000"
echo "   • API Metrics: $API_URL/security/dashboard"
echo "   • Security Logs: $API_URL/security/logs"
echo ""
echo "🔄 To reset metrics and try again:"
echo "   curl -X POST $API_URL/security/reset"
echo ""
echo -e "${BLUE}🛡️  SentinelAI - Protecting your APIs${NC}"

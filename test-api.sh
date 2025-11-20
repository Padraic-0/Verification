#!/bin/bash

# Shopify Medical Verification System - API Test Script
# Run this after starting the server to test endpoints

BASE_URL="http://localhost:3000"

echo "🧪 Testing Shopify Verification API"
echo "===================================="
echo ""

# Test 1: Health Check
echo "1️⃣ Testing Health Endpoint..."
curl -s "${BASE_URL}/health" | jq .
echo ""

# Test 2: Signup (change email for each test)
echo "2️⃣ Testing Signup Endpoint..."
SIGNUP_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "Doctor",
    "email": "test.doctor@example.com",
    "phone": "555-1234",
    "npi": "1234567890"
  }')
echo "$SIGNUP_RESPONSE" | jq .
echo ""

# Test 3: Invalid NPI
echo "3️⃣ Testing Invalid NPI (should fail)..."
curl -s -X POST "${BASE_URL}/api/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Bad",
    "lastName": "NPI",
    "email": "bad@example.com",
    "npi": "123"
  }' | jq .
echo ""

# Test 4: Missing Fields
echo "4️⃣ Testing Missing Fields (should fail)..."
curl -s -X POST "${BASE_URL}/api/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Missing",
    "lastName": "Email"
  }' | jq .
echo ""

echo "✅ Tests complete!"
echo ""
echo "📝 Next Steps:"
echo "  1. Check your email for verification link"
echo "  2. Visit ${BASE_URL}/api/admin to see admin panel"
echo "  3. After email verification, upload a test license"
echo ""

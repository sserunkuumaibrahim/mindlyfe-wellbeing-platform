#!/bin/bash

# Get fresh tokens from signin
echo "Getting fresh tokens..."
RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/signin \
  -H "Content-Type: application/json" \
  -d @test-signin.json)

# Extract access token
ACCESS_TOKEN=$(echo $RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

echo "Testing signout with token: ${ACCESS_TOKEN:0:50}..."

# Test signout
curl -X POST http://localhost:3001/api/auth/signout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -v
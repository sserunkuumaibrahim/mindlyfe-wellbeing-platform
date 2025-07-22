#!/usr/bin/env node

// Test script to verify frontend-backend API integration
const API_URL = 'http://localhost:3001/api';

const testSignup = async () => {
  console.log('Testing /auth/signup endpoint...');
  
  const response = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'testintegration@example.com',
      password: 'testpassword123',
      first_name: 'Integration',
      last_name: 'Test',
      user_type: 'individual'
    })
  });

  const data = await response.json();
  console.log('Signup response:', data);
  
  if (data.access_token) {
    console.log('✅ Signup successful, token received');
    return data.access_token;
  } else {
    console.log('❌ Signup failed');
    return null;
  }
};

const testSessions = async (token) => {
  console.log('\nTesting /sessions endpoint...');
  
  const response = await fetch(`${API_URL}/sessions`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();
  console.log('Sessions response:', data);
  
  if (Array.isArray(data)) {
    console.log('✅ Sessions endpoint working');
    return true;
  } else {
    console.log('❌ Sessions endpoint failed');
    return false;
  }
};

const testDashboard = async (token, userId) => {
  console.log('\nTesting /users/:userId/dashboard endpoint...');
  
  const response = await fetch(`${API_URL}/users/${userId}/dashboard`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();
  console.log('Dashboard response:', data);
  
  if (data.profile && data.sessions !== undefined) {
    console.log('✅ Dashboard endpoint working');
    return true;
  } else {
    console.log('❌ Dashboard endpoint failed');
    return false;
  }
};

const runTests = async () => {
  try {
    console.log('🚀 Starting API integration tests...\n');
    
    const token = await testSignup();
    if (!token) {
      console.log('Cannot continue without token');
      return;
    }
    
    // Extract user ID from token (simple base64 decode)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userId = payload.userId;
    console.log('User ID from token:', userId);
    
    await testSessions(token);
    await testDashboard(token, userId);
    
    console.log('\n🎉 All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

runTests();

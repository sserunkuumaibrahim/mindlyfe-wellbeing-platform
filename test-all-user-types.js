#!/usr/bin/env node

/**
 * Comprehensive test script for all user types and functionalities
 * Tests the complete MindLyfe application using PostgreSQL backend
 */

import fetch from 'node-fetch';

const BACKEND_URL = 'http://localhost:3001';

// Helper function to make API requests
async function makeRequest(endpoint, options = {}) {
  const url = `${BACKEND_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  
  const data = await response.json();
  return { data, status: response.status, ok: response.ok };
}

// Test user data for different roles
const testUsers = {
  individual: {
    email: `individual-test-${Date.now()}@example.com`,
    password: 'TestPassword123!',
    role: 'individual',
    metadata: {
      first_name: 'John',
      last_name: 'Doe',
      role: 'individual'
    }
  },
  therapist: {
    email: `therapist-test-${Date.now()}@example.com`,
    password: 'TestPassword123!',
    role: 'therapist',
    metadata: {
      first_name: 'Dr. Sarah',
      last_name: 'Smith',
      role: 'therapist'
    }
  },
  orgAdmin: {
    email: `org-admin-test-${Date.now()}@example.com`,
    password: 'TestPassword123!',
    role: 'org_admin',
    metadata: {
      first_name: 'Michael',
      last_name: 'Johnson',
      role: 'org_admin'
    }
  }
};

// Test user registration with PostgreSQL backend
async function testUserRegistration(userType, userData) {
  console.log(`\n🧪 Testing ${userType} registration...`);
  
  try {
    const response = await makeRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email: userData.email,
        password: userData.password,
        first_name: userData.metadata.first_name,
        last_name: userData.metadata.last_name,
        role: userData.metadata.role
      })
    });
    
    if (!response.ok) {
      console.log(`❌ ${userType} registration failed:`, response.data.error || 'Unknown error');
      return { success: false, error: response.data.error || 'Unknown error' };
    }
    
    if (response.data.user) {
      console.log(`✅ ${userType} registration successful`);
      console.log(`📧 Email: ${userData.email}`);
      console.log(`🆔 User ID: ${response.data.user.id}`);
      return { success: true, data: response.data, user: response.data.user };
    }
    
    return { success: false, error: 'No user data returned' };
  } catch (error) {
    console.log(`❌ ${userType} registration failed:`, error.message);
    return { success: false, error: error.message };
  }
}

// Test user login with PostgreSQL backend
async function testUserLogin(userType, email, password) {
  console.log(`\n🔐 Testing ${userType} login...`);
  
  try {
    const response = await makeRequest('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password
      })
    });
    
    if (!response.ok) {
      console.log(`❌ ${userType} login failed:`, response.data.error || 'Unknown error');
      return { success: false, error: response.data.error || 'Unknown error' };
    }
    
    if (response.data.user && response.data.accessToken) {
      console.log(`✅ ${userType} login successful`);
      console.log(`🆔 User ID: ${response.data.user.id}`);
      console.log(`🔑 Session: ${response.data.accessToken ? 'Valid' : 'Invalid'}`);
      return { 
        success: true, 
        data: response.data,
        user: response.data.user,
        accessToken: response.data.accessToken
      };
    }
    
    return { success: false, error: 'No session data returned' };
  } catch (error) {
    console.log(`❌ ${userType} login failed:`, error.message);
    return { success: false, error: error.message };
  }
}

// Test user profile access with PostgreSQL backend
async function testUserProfile(userType, accessToken) {
  console.log(`\n👤 Testing ${userType} profile access...`);
  
  try {
    const response = await makeRequest('/auth/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      console.log(`❌ ${userType} profile access failed:`, response.data.error || 'Unknown error');
      return { success: false, error: response.data.error || 'Unknown error' };
    }
    
    if (response.data) {
      console.log(`✅ ${userType} profile access successful`);
      console.log(`📋 Profile data:`, {
        id: response.data.id,
        email: response.data.email,
        role: response.data.role,
        first_name: response.data.first_name,
        last_name: response.data.last_name
      });
      return { success: true, data: response.data };
    }
    
    return { success: false, error: 'No profile data returned' };
  } catch (error) {
    console.log(`❌ ${userType} profile access failed:`, error.message);
    return { success: false, error: error.message };
  }
}

// Test session refresh with PostgreSQL backend
async function testSessionRefresh(userType, accessToken) {
  console.log(`\n🔄 Testing session refresh for ${userType}...`);
  
  try {
    const response = await makeRequest('/auth/refresh', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      console.log(`❌ Session refresh failed for ${userType}:`, response.data.error || 'Unknown error');
      return false;
    }
    
    if (response.data.accessToken) {
      console.log(`✅ Session refresh successful for ${userType}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.log(`❌ Session refresh error for ${userType}:`, error.message);
    return false;
  }
}

// Test logout with PostgreSQL backend
async function testLogout(userType, accessToken) {
  console.log(`\n🚪 Testing logout for ${userType}...`);
  
  try {
    const response = await makeRequest('/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      console.log(`❌ Logout failed for ${userType}:`, response.data.error || 'Unknown error');
      return false;
    }
    
    console.log(`✅ Logout successful for ${userType}`);
    return true;
  } catch (error) {
    console.log(`❌ Logout error for ${userType}:`, error.message);
    return false;
  }
}

// Test database connectivity with PostgreSQL backend
async function testDatabaseConnectivity() {
  console.log('\n🗄️  Testing database connectivity...');
  
  try {
    const response = await makeRequest('/health', {
      method: 'GET'
    });
    
    if (!response.ok) {
      console.log('❌ Database connectivity failed:', response.data.error || 'Unknown error');
      return false;
    }
    
    console.log('✅ Database connectivity successful');
    return true;
  } catch (error) {
    console.log('❌ Database connectivity error:', error.message);
    return false;
  }
}

// Main test function
async function runComprehensiveTests() {
  console.log('🚀 Starting comprehensive MindLyfe application tests with PostgreSQL backend...');
  console.log('=' .repeat(80));
  
  // Test database connectivity first
  const dbConnected = await testDatabaseConnectivity();
  if (!dbConnected) {
    console.log('❌ Cannot proceed without database connectivity');
    return;
  }
  
  const results = {
    individual: { registration: false, login: false, profile: false, refresh: false, logout: false },
    therapist: { registration: false, login: false, profile: false, refresh: false, logout: false },
    orgAdmin: { registration: false, login: false, profile: false, refresh: false, logout: false }
  };
  
  // Test each user type
  for (const [userType, userData] of Object.entries(testUsers)) {
    console.log(`\n${'='.repeat(20)} TESTING ${userType.toUpperCase()} ${'='.repeat(20)}`);
    
    // 1. Test Registration
    const registrationResult = await testUserRegistration(userType, userData);
    results[userType].registration = registrationResult.success;
    
    if (!registrationResult.success) {
      console.log(`⏭️  Skipping further tests for ${userType} due to registration failure`);
      continue;
    }
    
    // Wait a moment for user to be fully created
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 2. Test Login
    const loginResult = await testUserLogin(userType, userData.email, userData.password);
    results[userType].login = loginResult.success;
    
    if (!loginResult.success) {
      console.log(`⏭️  Skipping further tests for ${userType} due to login failure`);
      continue;
    }
    
    // 3. Test Profile Access
    const profileResult = await testUserProfile(userType, loginResult.accessToken);
    results[userType].profile = profileResult.success;
    
    // 4. Test Session Refresh
    const refreshResult = await testSessionRefresh(userType, loginResult.accessToken);
    results[userType].refresh = refreshResult;
    
    // 5. Test Logout
    const logoutResult = await testLogout(userType, loginResult.accessToken);
    results[userType].logout = logoutResult;
    
    // Wait between user tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Display final results
  console.log('\n' + '='.repeat(80));
  console.log('📊 COMPREHENSIVE TEST RESULTS');
  console.log('='.repeat(80));
  
  for (const [userType, testResults] of Object.entries(results)) {
    console.log(`\n${userType.toUpperCase()} USER TYPE:`);
    console.log(`  Registration: ${testResults.registration ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Login:        ${testResults.login ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Profile:      ${testResults.profile ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Refresh:      ${testResults.refresh ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Logout:       ${testResults.logout ? '✅ PASS' : '❌ FAIL'}`);
    
    const passCount = Object.values(testResults).filter(Boolean).length;
    const totalTests = Object.keys(testResults).length;
    console.log(`  Overall:      ${passCount}/${totalTests} tests passed`);
  }
  
  // Calculate overall success rate
  const allTests = Object.values(results).flatMap(r => Object.values(r));
  const totalPassed = allTests.filter(Boolean).length;
  const totalTests = allTests.length;
  
  console.log(`\n🎯 OVERALL SUCCESS RATE: ${totalPassed}/${totalTests} (${Math.round(totalPassed/totalTests*100)}%)`);
  
  if (totalPassed === totalTests) {
    console.log('🎉 ALL TESTS PASSED! The MindLyfe application is working correctly for all user types.');
  } else {
    console.log('⚠️  Some tests failed. Please review the results above.');
  }
  
  console.log('\n✅ Comprehensive testing completed!');
}

// Run the tests
runComprehensiveTests().catch(error => {
  console.error('💥 Test execution failed:', error);
  process.exit(1);
});
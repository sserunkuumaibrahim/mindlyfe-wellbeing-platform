#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting Mindlyfe Production Server...');

// Check if backend is built
const backendDistPath = path.join(__dirname, 'backend', 'dist');
if (!fs.existsSync(backendDistPath)) {
  console.log('📦 Building backend...');
  const buildBackend = spawn('npm', ['run', 'build'], {
    cwd: path.join(__dirname, 'backend'),
    stdio: 'inherit'
  });
  
  buildBackend.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Backend built successfully');
      startBackend();
    } else {
      console.error('❌ Backend build failed');
      process.exit(1);
    }
  });
} else {
  startBackend();
}

// Check if frontend is built
const frontendDistPath = path.join(__dirname, 'dist');
if (!fs.existsSync(frontendDistPath)) {
  console.log('📦 Building frontend...');
  const buildFrontend = spawn('npm', ['run', 'build'], {
    cwd: __dirname,
    stdio: 'inherit'
  });
  
  buildFrontend.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Frontend built successfully');
      startFrontendServer();
    } else {
      console.error('❌ Frontend build failed');
      process.exit(1);
    }
  });
} else {
  startFrontendServer();
}

function startBackend() {
  console.log('🔧 Starting backend server on port 3001...');
  const backend = spawn('npm', ['start'], {
    cwd: path.join(__dirname, 'backend'),
    stdio: 'inherit',
    env: { ...process.env, PORT: '3001' }
  });
  
  backend.on('error', (err) => {
    console.error('❌ Backend server error:', err);
  });
  
  backend.on('close', (code) => {
    console.log(`Backend server exited with code ${code}`);
  });
}

function startFrontendServer() {
  console.log('🌐 Starting frontend server on port 8080...');
  const frontend = spawn('npx', ['serve', '-s', 'dist', '-l', '8080'], {
    cwd: __dirname,
    stdio: 'inherit'
  });
  
  frontend.on('error', (err) => {
    console.error('❌ Frontend server error:', err);
  });
  
  frontend.on('close', (code) => {
    console.log(`Frontend server exited with code ${code}`);
  });
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down servers...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down servers...');
  process.exit(0);
});

console.log('✅ Production servers starting...');
console.log('📱 Frontend will be available at: http://localhost:8080');
console.log('🔧 Backend API will be available at: http://localhost:3001');
console.log('💡 Press Ctrl+C to stop all servers');
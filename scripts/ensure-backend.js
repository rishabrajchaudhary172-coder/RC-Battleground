const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

function checkBackendHealth() {
  return new Promise((resolve) => {
    const req = http.get('http://127.0.0.1:5000/api/health', (res) => {
      if (res.statusCode === 200) resolve(true);
      else resolve(false);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function ensureBackendRunning() {
  const isRunning = await checkBackendHealth();
  if (isRunning) {
    console.log('✅ RC Battleground Backend REST API Server is online on http://localhost:5000');
    return;
  }

  console.log('⚡ Backend server offline. Auto-starting RC Battleground Express Server on port 5000...');
  const serverPath = path.join(__dirname, '../server/src/index.js');
  
  const serverProcess = spawn('node', [serverPath], {
    detached: true,
    stdio: 'ignore',
    cwd: path.join(__dirname, '../server')
  });

  serverProcess.unref();

  // Wait briefly for server startup
  for (let i = 0; i < 10; i++) {
    await new Promise((r) => setTimeout(r, 300));
    if (await checkBackendHealth()) {
      console.log('🚀 Express Backend REST API Server initialized successfully!');
      return;
    }
  }
}

ensureBackendRunning();

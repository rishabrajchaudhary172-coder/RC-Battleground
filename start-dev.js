const { spawn } = require('child_process');
const path = require('path');

console.log('🏎️ Starting RC Battleground Full-Stack Application (Backend + Frontend)...');

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

// 1. Start Express REST API Backend
const server = spawn(npmCmd, ['--prefix', 'server', 'start'], {
  stdio: 'inherit',
  shell: true,
  cwd: __dirname
});

// 2. Start Vite React Client Frontend
const client = spawn(npmCmd, ['--prefix', 'client', 'run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  cwd: __dirname
});

server.on('error', (err) => {
  console.error('Failed to start server process:', err);
});

client.on('error', (err) => {
  console.error('Failed to start client process:', err);
});

const cleanup = () => {
  console.log('\n🛑 Shutting down RC Battleground processes...');
  if (server && !server.killed) server.kill();
  if (client && !client.killed) client.kill();
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);

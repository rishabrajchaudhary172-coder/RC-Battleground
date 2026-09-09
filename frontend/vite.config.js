import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    preserveSymlinks: true,
  },
  server: {
    port: 3000,
    open: true,
    fs: {
      allow: ['..'],
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, res) => {
            if (err.code === 'ECONNREFUSED') {
              if (res && !res.headersSent) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                  status: 'connecting', 
                  message: 'Establishing connection to RC Battleground service...',
                  products: [],
                  user: null,
                  categories: []
                }));
              }
            }
          });
        },
      },
    },
  },
});



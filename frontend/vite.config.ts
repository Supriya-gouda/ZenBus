import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const BACKEND_PORT_START = 8080;
const BACKEND_PORT_END = 8090;
const PROBE_TIMEOUT_MS = 300;

async function detectBackendPort() {
  for (let port = BACKEND_PORT_START; port <= BACKEND_PORT_END; port += 1) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
      const response = await fetch(`http://localhost:${port}/api/test`, {
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (response.ok) {
        const body = await response.json().catch(() => null);
        if (body?.message === 'API is working!') {
          return port;
        }
      }
    } catch {
      // Try the next port.
    }
  }

  return BACKEND_PORT_START;
}

// https://vitejs.dev/config/
export default defineConfig(async () => {
  const backendPort = await detectBackendPort();

  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: `http://localhost:${backendPort}`,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});

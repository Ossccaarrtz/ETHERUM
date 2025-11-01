import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import os from 'os'
import qrcode from 'qrcode'

// Get local IP address
function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const localIP = getLocalIPAddress();

// Plugin to show QR code on server start
function qrcodePlugin() {
  return {
    name: 'qrcode-plugin',
    configureServer(server) {
      server.httpServer?.once('listening', async () => {
        const address = server.httpServer?.address();
        const port = typeof address === 'object' ? address.port : 3000;
        const networkUrl = `http://${localIP}:${port}`;
        
        try {
          // Generate QR code as ASCII art for terminal
          const qrAscii = await qrcode.toString(networkUrl, {
            type: 'terminal',
            small: true
          });
          
          console.log('\n');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('📱 SCAN QR CODE TO ACCESS FROM YOUR PHONE');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log(qrAscii);
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log(`🌐 Network URL: ${networkUrl}`);
          console.log(`💻 Local URL:   http://localhost:${port}`);
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        } catch (error) {
          console.error('Error generating QR code:', error);
        }
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    qrcodePlugin()
  ],
  server: {
    host: '0.0.0.0', // Listen on all network interfaces
    port: 3000,
    proxy: {
      '/api': {
        target: `http://${localIP}:3001`,
        changeOrigin: true,
      }
    }
  }
})

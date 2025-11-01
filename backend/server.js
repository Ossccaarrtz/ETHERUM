import express from 'express';
import cors from 'cors';
import env, { validateEnv } from './src/config/env.js';
import routes from './src/routes/index.js';
import os from 'os';
import qrcode from 'qrcode-terminal';

// Initialize Express app
const app = express();

// Validate environment variables
validateEnv();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

// Get local IP address
function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal (localhost) and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// Start server
const PORT = env.PORT;
const HOST = '0.0.0.0'; // Listen on all network interfaces
app.listen(PORT, HOST, () => {
  const localIP = getLocalIPAddress();
  const networkUrl = `http://${localIP}:${PORT}`;
  
  console.log('\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 FLEET EVIDENCE BACKEND');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📍 Environment: ${env.NODE_ENV}`);
  console.log('');
  console.log('📡 Network Access:');
  console.log(`   Local:    http://localhost:${PORT}`);
  console.log(`   Network:  ${networkUrl}`);
  console.log('');
  console.log('🔗 Endpoints:');
  console.log(`   Health:   ${networkUrl}/health`);
  console.log(`   Upload:   ${networkUrl}/api/evidence/upload`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📱 SCAN QR CODE (Backend API):');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Generate QR code for backend URL
  qrcode.generate(networkUrl, { small: true }, (qr) => {
    console.log(qr);
  });
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
});

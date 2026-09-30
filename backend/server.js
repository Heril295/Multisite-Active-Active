const express = require('express');
const cors = require('cors');
const os = require('os');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 5000;
const VERSION = process.env.APP_VERSION || 'Blue (v1.0)';

app.use(cors());
app.use(express.json());

// Helper function to get the local IP address
const getServerIp = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '0.0.0.0';
};

// Main info endpoint (Basic Routing Data)
app.get('/api/info', (req, res) => {
  res.json({
    version: VERSION,
    hostname: os.hostname(),
    serverIp: getServerIp(),
    clientIp: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
    timestamp: new Date().toISOString()
  });
});

// Heavy endpoint (Simulates CPU load for Auto-scaling/HPA testing)
app.get('/api/heavy-task', (req, res) => {
  const start = Date.now();
  let sum = 0;
  for (let i = 0; i < 5e8; i++) {
    sum += i;
  }
  const duration = Date.now() - start;
  
  res.json({
    message: "Heavy task completed",
    durationMs: duration,
    hostname: os.hostname()
  });
});

// Network Interfaces endpoint (Deep Netmask/CIDR data)
app.get('/api/network-interfaces', (req, res) => {
  res.json({
    hostname: os.hostname(),
    interfaces: os.networkInterfaces()
  });
});

// Traceroute endpoint (Network Hop Diagnostics)
app.get('/api/trace', (req, res) => {
  let clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  
  // Clean up IPv4-mapped IPv6 addresses
  if (clientIp && clientIp.includes('::ffff:')) {
    clientIp = clientIp.split('::ffff:')[1];
  }
  
  // Default to Google DNS if testing locally to force an external route
  const targetIp = (clientIp === '::1' || clientIp === '127.0.0.1') ? '8.8.8.8' : clientIp;

  // Run traceroute: max 15 hops, 1 second timeout per probe
  exec(`traceroute -m 15 -w 1 ${targetIp}`, (error, stdout, stderr) => {
    res.json({
      target: targetIp,
      traceOutput: stdout || stderr || (error ? error.message : "Trace failed")
    });
  });
});

app.listen(PORT, () => {
  console.log(`Backend ${VERSION} running on port ${PORT}`);
});
const express = require('express');
require('dotenv').config();

const { sequelize, testConnection } = require('./config/database');
const { startEureka } = require('./config/eureka');
const { connectRabbitMQ, closeRabbitMQ } = require('./config/rabbitmq');
const candidatureRoutes = require('./routes/candidatureRoutes');
const Candidature = require('./models/Candidature');

const app = express();
const PORT = process.env.PORT || 8082;
const startedAt = Date.now();
let httpRequestsTotal = 0;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  if (req.path !== '/metrics') {
    httpRequestsTotal += 1;
  }
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'candidature-service-nodejs' });
});

app.get('/info', (req, res) => {
  res.json({
    service: 'candidature-service-nodejs',
    version: '1.0.0',
    description: 'Candidature microservice with Node.js + PostgreSQL'
  });
});

app.get('/metrics', (req, res) => {
  const uptimeSeconds = Math.floor((Date.now() - startedAt) / 1000);
  res.set('Content-Type', 'text/plain; version=0.0.4');
  res.send([
    '# HELP candidature_service_up Candidature Node.js service availability',
    '# TYPE candidature_service_up gauge',
    'candidature_service_up 1',
    '# HELP candidature_service_uptime_seconds Candidature Node.js service uptime in seconds',
    '# TYPE candidature_service_uptime_seconds gauge',
    `candidature_service_uptime_seconds ${uptimeSeconds}`,
    '# HELP candidature_service_http_requests_total Total HTTP requests handled by candidature service',
    '# TYPE candidature_service_http_requests_total counter',
    `candidature_service_http_requests_total ${httpRequestsTotal}`
  ].join('\n') + '\n');
});

// API Routes
app.use('/api/candidatures', candidatureRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await closeRabbitMQ();
  await sequelize.close();
  process.exit(0);
});

// Start server
async function startServer() {
  try {
    // Test database connection
    await testConnection();

    // Sync database models
    await sequelize.sync({ alter: false });
    console.log('✅ Database models synchronized');

    // Connect to RabbitMQ
    await connectRabbitMQ();

    // Register with Eureka
    startEureka();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`\n🚀 Candidature Service (Node.js) running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
      console.log(`📍 API endpoint: http://localhost:${PORT}/api/candidatures`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

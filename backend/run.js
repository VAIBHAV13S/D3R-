/**
 * Server runner with proper path resolution
 */
require('./fix-paths');

// Load environment variables first
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Set default environment if not set
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Set default port if not set
process.env.PORT = process.env.PORT || '4000';

console.log('🚀 Starting D3R Backend Server');
console.log('============================');
console.log(`Environment: ${process.env.NODE_ENV}`);
console.log(`Port: ${process.env.PORT}`);

// Construct database URL from individual PG* environment variables
if (process.env.PGHOST && process.env.PGPORT && process.env.PGDATABASE && process.env.PGUSER) {
  const password = process.env.PGPASSWORD ? ':*****' : ''; // Mask password in logs
  process.env.DATABASE_URL = `postgresql://${process.env.PGUSER}${password}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`;
  console.log('Database: Connected');
} else {
  console.warn('⚠️  Database connection details incomplete. Check your .env file.');
}

// Import the server
console.log('\n🔌 Initializing server...');

// Import the app from server.js
const app = require('./server');
const PORT = process.env.PORT || 4000;

// Start the server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
  console.log('Press Ctrl+C to stop the server');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  server.close(() => process.exit(1));
});

// Handle termination signals
process.on('SIGTERM', () => {
  console.log('\nSIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\nSIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
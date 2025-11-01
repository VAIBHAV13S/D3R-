/**
 * Server runner with proper path resolution
 */
require('./fix-paths');

// Load environment variables first
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Construct database URL from individual PG* environment variables
if (process.env.PGHOST && process.env.PGPORT && process.env.PGDATABASE && process.env.PGUSER && process.env.PGPASSWORD) {
  process.env.DATABASE_URL = `postgresql://${process.env.PGUSER}:${encodeURIComponent(process.env.PGPASSWORD)}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`;
}

// Log environment status
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Database URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');

// Debug: Log all environment variables
console.log('PG Environment:');
console.log('- PGHOST:', process.env.PGHOST);
console.log('- PGPORT:', process.env.PGPORT);
console.log('- PGDATABASE:', process.env.PGDATABASE);
console.log('- PGUSER:', process.env.PGUSER);
console.log('- PGPASSWORD:', process.env.PGPASSWORD ? '*****' : 'Not set');

try {
  // Attempt to run the server
  require('./server.js');
} catch (error) {
  console.error('Failed to start server:', error);
  
  // Check common issues
  if (error.code === 'MODULE_NOT_FOUND') {
    const missingModule = error.message.match(/Cannot find module '([^']+)'/);
    if (missingModule && missingModule[1]) {
      console.error(`\nMissing module: ${missingModule[1]}`);
      console.error('\nPossible fixes:');
      console.error('1. Install missing dependency: npm install ' + missingModule[1]);
      console.error('2. Check if path is correct in requires/imports');
      console.error('3. Verify the module exists in node_modules');
    }
  }
  
  process.exit(1);
}

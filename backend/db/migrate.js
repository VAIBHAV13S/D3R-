/**
 * Migration runner utility
 * Provides programmatic access to migrations
 */

require('dotenv').config();
const { execSync } = require('child_process');

const commands = {
  up: 'Run pending migrations',
  down: 'Rollback last migration',
  create: 'Create a new migration file',
  status: 'Show migration status',
};

function runMigration(command, ...args) {
  try {
    const cmd = `node-pg-migrate ${command} ${args.join(' ')}`;
    console.log(`Running: ${cmd}`);
    const output = execSync(cmd, { 
      stdio: 'inherit',
      env: process.env,
    });
    return output;
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

// CLI usage
if (require.main === module) {
  const [,, command, ...args] = process.argv;

  if (!command || !commands[command]) {
    console.log('Usage: node db/migrate.js <command> [args]');
    console.log('\nAvailable commands:');
    Object.entries(commands).forEach(([cmd, desc]) => {
      console.log(`  ${cmd.padEnd(10)} - ${desc}`);
    });
    process.exit(1);
  }

  runMigration(command, ...args);
}

module.exports = { runMigration };

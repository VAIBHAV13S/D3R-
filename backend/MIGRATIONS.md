# Database Migrations Guide

## Overview

This project uses `node-pg-migrate` for database schema versioning and migrations. Migrations allow you to:
- Track database schema changes over time
- Apply changes consistently across environments
- Rollback changes if needed
- Collaborate safely on schema modifications

## Quick Start

### Run All Pending Migrations
```bash
npm run migrate
```

### Rollback Last Migration
```bash
npm run migrate:down
```

### Check Migration Status
```bash
npm run migrate:status
```

### Create New Migration
```bash
npm run migrate:create my-migration-name
```

## Migration Files

Migrations are stored in `db/migrations/` with timestamp prefixes:
```
db/migrations/
├── 1730408400000_add-imagecid-to-campaigns.js
└── 1730408500000_add-database-indexes.js
```

## Existing Migrations

### 1. Add imageCID to Campaigns
**File**: `1730408400000_add-imagecid-to-campaigns.js`

**Purpose**: Add support for campaign banner images stored on IPFS

**Changes**:
- Adds `imagecid` column (VARCHAR 100)
- Creates index on `imagecid`
- Adds column comment

**Rollback**: Removes column and index

### 2. Add Database Indexes
**File**: `1730408500000_add-database-indexes.js`

**Purpose**: Improve query performance across all tables

**Changes**:
- Campaigns: indexes on `creator`, `status`, `disasterid`, `(status, currentamount)`
- Donations: indexes on `campaignid`, `donorwallet`, `status`, `createdat`
- Milestones: indexes on `campaignid`, `approved`, `released`
- Users: index on `walletaddress`
- DisasterVerifications: indexes on `disasterid`, `status` (if table exists)

**Rollback**: Removes all created indexes

## Creating New Migrations

### Step 1: Generate Migration File
```bash
npm run migrate:create add-new-feature
```

This creates a file: `db/migrations/[timestamp]_add-new-feature.js`

### Step 2: Edit Migration File

```javascript
/**
 * Migration: Add new feature
 * Created: YYYY-MM-DD
 */

exports.up = (pgm) => {
  // Forward migration
  pgm.addColumn('tablename', {
    columnname: {
      type: 'varchar(255)',
      notNull: false,
    },
  });
};

exports.down = (pgm) => {
  // Rollback migration
  pgm.dropColumn('tablename', 'columnname', {
    ifExists: true,
  });
};
```

### Step 3: Test Migration
```bash
# Apply migration
npm run migrate

# Verify it worked
npm run migrate:status

# Test rollback
npm run migrate:down

# Re-apply
npm run migrate
```

## Common Migration Operations

### Add Column
```javascript
pgm.addColumn('tablename', {
  columnname: {
    type: 'varchar(100)',
    notNull: false,
    default: null,
    comment: 'Column description',
  },
});
```

### Drop Column
```javascript
pgm.dropColumn('tablename', 'columnname', {
  ifExists: true,
});
```

### Create Index
```javascript
pgm.createIndex('tablename', 'columnname', {
  name: 'idx_tablename_columnname',
  ifNotExists: true,
  method: 'btree', // or 'hash', 'gist', etc.
});
```

### Drop Index
```javascript
pgm.dropIndex('tablename', 'columnname', {
  name: 'idx_tablename_columnname',
  ifExists: true,
});
```

### Create Table
```javascript
pgm.createTable('tablename', {
  id: {
    type: 'varchar(36)',
    primaryKey: true,
  },
  name: {
    type: 'varchar(255)',
    notNull: true,
  },
  created_at: {
    type: 'timestamp',
    notNull: true,
    default: pgm.func('current_timestamp'),
  },
});
```

### Drop Table
```javascript
pgm.dropTable('tablename', {
  ifExists: true,
  cascade: true,
});
```

### Alter Column
```javascript
pgm.alterColumn('tablename', 'columnname', {
  type: 'text',
  notNull: true,
});
```

### Add Foreign Key
```javascript
pgm.addConstraint('tablename', 'fk_tablename_other', {
  foreignKeys: {
    columns: 'other_id',
    references: 'othertable(id)',
    onDelete: 'CASCADE',
  },
});
```

### Raw SQL
```javascript
pgm.sql(`
  CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_custom
  ON tablename USING gin(column);
`);
```

## Migration Workflow

### Development
1. Create migration: `npm run migrate:create feature-name`
2. Edit migration file
3. Test: `npm run migrate`
4. Verify: Check database schema
5. Test rollback: `npm run migrate:down`
6. Re-apply: `npm run migrate`
7. Commit migration file to git

### Staging/Production
1. Pull latest code (includes migration files)
2. Run migrations: `npm run migrate`
3. Verify: `npm run migrate:status`
4. Monitor application logs

## Configuration

### Database Connection

Migrations use the same `DATABASE_URL` from `.env`:

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

### Migration Config

File: `.migrate.json`

```json
{
  "migrations-dir": "db/migrations",
  "migrations-table": "pgmigrations",
  "schema": "public"
}
```

## Migration Table

Migrations are tracked in the `pgmigrations` table:

```sql
SELECT * FROM pgmigrations ORDER BY run_on DESC;
```

Columns:
- `id`: Migration sequence number
- `name`: Migration filename
- `run_on`: Timestamp when migration was applied

## Best Practices

### 1. Never Edit Applied Migrations
Once a migration is applied in any environment, never modify it. Create a new migration instead.

### 2. Always Test Rollback
Every migration should have a working `down()` function:
```bash
npm run migrate        # Apply
npm run migrate:down   # Rollback
npm run migrate        # Re-apply
```

### 3. Use Transactions
Most operations are automatically wrapped in transactions. For complex migrations:
```javascript
exports.up = (pgm) => {
  pgm.noTransaction(); // Only if needed
  // Your migration code
};
```

### 4. Make Migrations Idempotent
Use `IF NOT EXISTS` / `IF EXISTS` to allow re-running:
```javascript
pgm.createTable('tablename', { /* ... */ }, {
  ifNotExists: true,
});
```

### 5. Add Comments
Document what and why:
```javascript
/**
 * Migration: Add user preferences
 * Created: 2025-11-01
 * 
 * Adds preferences column to store user settings as JSONB.
 * Required for feature #123.
 */
```

### 6. Handle Data Migrations Carefully
When migrating data, consider:
- Large datasets (batch processing)
- Downtime requirements
- Rollback data integrity

```javascript
exports.up = (pgm) => {
  // Add column
  pgm.addColumn('users', { preferences: 'jsonb' });
  
  // Migrate data in batches
  pgm.sql(`
    UPDATE users 
    SET preferences = '{}'::jsonb 
    WHERE preferences IS NULL;
  `);
  
  // Make not null after data migration
  pgm.alterColumn('users', 'preferences', {
    notNull: true,
  });
};
```

### 7. Coordinate with Team
- Communicate schema changes
- Review migrations in PRs
- Run migrations before deploying code
- Keep migrations small and focused

## Troubleshooting

### Migration Failed Mid-Way
```bash
# Check status
npm run migrate:status

# If transaction rolled back, fix and re-run
npm run migrate

# If partially applied, may need manual cleanup
psql $DATABASE_URL
# Inspect and fix manually
```

### Migration Won't Rollback
```bash
# Check what's applied
npm run migrate:status

# Force rollback (careful!)
node-pg-migrate down --count 1

# Or manually delete from tracking table
DELETE FROM pgmigrations WHERE name = 'migration-name';
```

### Wrong Migration Order
Migrations run in filename order (timestamp). If created out of order:
1. Rename file with correct timestamp
2. Update migration tracking table if already applied

### Database Connection Issues
```bash
# Test connection
psql $DATABASE_URL

# Check .env file
cat .env | grep DATABASE_URL

# Verify permissions
# User needs CREATE, ALTER, DROP privileges
```

## Advanced Usage

### Run Specific Migration
```bash
node-pg-migrate up 1730408400000_add-imagecid-to-campaigns
```

### Rollback Multiple Migrations
```bash
node-pg-migrate down --count 3
```

### Dry Run (Preview SQL)
```bash
node-pg-migrate up --dry-run
```

### Run Migrations Programmatically
```javascript
const { runMigration } = require('./db/migrate');

async function deployDatabase() {
  try {
    await runMigration('up');
    console.log('Migrations complete');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}
```

## CI/CD Integration

### GitHub Actions Example
```yaml
- name: Run Migrations
  run: |
    cd backend
    npm run migrate
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

### Pre-deployment Hook
```bash
#!/bin/bash
# deploy.sh

echo "Running database migrations..."
npm run migrate

if [ $? -eq 0 ]; then
  echo "Migrations successful, deploying app..."
  npm start
else
  echo "Migrations failed, aborting deployment"
  exit 1
fi
```

## Resources

- [node-pg-migrate Documentation](https://salsita.github.io/node-pg-migrate/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Migration Best Practices](https://www.brunton-spall.co.uk/post/2014/05/06/database-migrations-done-right/)

## Support

For issues or questions:
1. Check migration status: `npm run migrate:status`
2. Review migration files in `db/migrations/`
3. Check application logs
4. Consult this documentation
5. Contact team lead

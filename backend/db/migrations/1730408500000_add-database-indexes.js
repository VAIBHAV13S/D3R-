/**
 * Migration: Add performance indexes to database tables
 * Created: 2025-11-01
 */

exports.up = (pgm) => {
  // Campaigns indexes
  pgm.createIndex('campaigns', 'creator', {
    name: 'idx_campaigns_creator',
    ifNotExists: true,
  });

  pgm.createIndex('campaigns', 'status', {
    name: 'idx_campaigns_status',
    ifNotExists: true,
  });

  pgm.createIndex('campaigns', 'disasterid', {
    name: 'idx_campaigns_disasterid',
    ifNotExists: true,
  });

  pgm.createIndex('campaigns', ['status', 'currentamount'], {
    name: 'idx_campaigns_status_amount',
    ifNotExists: true,
    method: 'btree',
  });

  // Donations indexes
  pgm.createIndex('donations', 'campaignid', {
    name: 'idx_donations_campaignid',
    ifNotExists: true,
  });

  pgm.createIndex('donations', 'donorwallet', {
    name: 'idx_donations_donorwallet',
    ifNotExists: true,
  });

  pgm.createIndex('donations', 'status', {
    name: 'idx_donations_status',
    ifNotExists: true,
  });

  pgm.createIndex('donations', 'createdat', {
    name: 'idx_donations_createdat',
    ifNotExists: true,
    method: 'btree',
  });

  // Milestones indexes
  pgm.createIndex('milestones', 'campaignid', {
    name: 'idx_milestones_campaignid',
    ifNotExists: true,
  });

  pgm.createIndex('milestones', 'approved', {
    name: 'idx_milestones_approved',
    ifNotExists: true,
  });

  pgm.createIndex('milestones', 'released', {
    name: 'idx_milestones_released',
    ifNotExists: true,
  });

  // Users indexes
  pgm.createIndex('users', 'walletaddress', {
    name: 'idx_users_walletaddress',
    ifNotExists: true,
  });

  // DisasterVerifications indexes (if table exists)
  pgm.sql(`
    DO $$
    BEGIN
      IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'disasterverifications') THEN
        CREATE INDEX IF NOT EXISTS idx_disasters_disasterid ON disasterverifications(disasterid);
        CREATE INDEX IF NOT EXISTS idx_disasters_status ON disasterverifications(status);
      END IF;
    END $$;
  `);

  // Add comments
  pgm.sql(`
    COMMENT ON INDEX idx_campaigns_creator IS 'Speed up queries filtering by campaign creator';
    COMMENT ON INDEX idx_campaigns_status IS 'Speed up queries filtering by campaign status';
    COMMENT ON INDEX idx_donations_campaignid IS 'Speed up donation lookups by campaign';
    COMMENT ON INDEX idx_donations_donorwallet IS 'Speed up donation lookups by donor wallet';
  `);
};

exports.down = (pgm) => {
  // Drop all indexes
  const indexes = [
    'idx_campaigns_creator',
    'idx_campaigns_status',
    'idx_campaigns_disasterid',
    'idx_campaigns_status_amount',
    'idx_donations_campaignid',
    'idx_donations_donorwallet',
    'idx_donations_status',
    'idx_donations_createdat',
    'idx_milestones_campaignid',
    'idx_milestones_approved',
    'idx_milestones_released',
    'idx_users_walletaddress',
  ];

  indexes.forEach(indexName => {
    pgm.dropIndex(null, indexName, { ifExists: true });
  });

  // Drop disaster indexes if they exist
  pgm.sql(`
    DROP INDEX IF EXISTS idx_disasters_disasterid;
    DROP INDEX IF EXISTS idx_disasters_status;
  `);
};

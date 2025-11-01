/**
 * Migration: Add imageCID column to campaigns table
 * Created: 2025-11-01
 */

exports.up = (pgm) => {
  // Add imageCID column to campaigns table
  pgm.addColumn('campaigns', {
    imagecid: {
      type: 'varchar(100)',
      notNull: false,
      comment: 'IPFS CID for campaign image',
    },
  });

  // Add index for faster lookups if needed
  pgm.createIndex('campaigns', 'imagecid', {
    name: 'idx_campaigns_imagecid',
    ifNotExists: true,
  });

  // Add comment to table
  pgm.sql(`
    COMMENT ON COLUMN campaigns.imagecid IS 'IPFS Content Identifier for campaign banner/hero image';
  `);
};

exports.down = (pgm) => {
  // Drop index first
  pgm.dropIndex('campaigns', 'imagecid', {
    name: 'idx_campaigns_imagecid',
    ifExists: true,
  });

  // Remove column
  pgm.dropColumn('campaigns', 'imagecid', {
    ifExists: true,
  });
};

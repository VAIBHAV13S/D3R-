/* eslint-disable camelcase */
'use strict';

/** @type {import('node-pg-migrate').Migration} */
module.exports = {
  up: async (pgm) => {
    // First, drop foreign key constraints that reference the campaigns.id column
    await pgm.sql(`
      -- Drop foreign key constraints
      ALTER TABLE donations DROP CONSTRAINT IF EXISTS donations_campaignid_fkey;
      ALTER TABLE campaign_updates DROP CONSTRAINT IF EXISTS campaign_updates_campaignid_fkey;
      
      -- Modify the id column in campaigns table
      ALTER TABLE campaigns ALTER COLUMN id TYPE VARCHAR(100);
      
      -- Modify related columns in other tables
      ALTER TABLE donations ALTER COLUMN campaignid TYPE VARCHAR(100);
      ALTER TABLE campaign_updates ALTER COLUMN campaignid TYPE VARCHAR(100);
      
      -- Recreate foreign key constraints
      ALTER TABLE donations 
        ADD CONSTRAINT donations_campaignid_fkey 
        FOREIGN KEY (campaignid) 
        REFERENCES campaigns(id) 
        ON DELETE CASCADE;
        
      ALTER TABLE campaign_updates
        ADD CONSTRAINT campaign_updates_campaignid_fkey
        FOREIGN KEY (campaignid)
        REFERENCES campaigns(id)
        ON DELETE CASCADE;
    `);
  },

  down: (pgm) => {
    // Note: This is a one-way migration due to potential data truncation
    // If you need to rollback, you'll need to handle it manually
  },
};

/* eslint-disable camelcase */
'use strict';

/** @type {import('node-pg-migrate').Migration} */
module.exports = {
  up: (pgm) => {
    // Add donorwallet column to donations table
    pgm.addColumn('donations', {
      donorwallet: {
        type: 'varchar(100)',
        notNull: true,
        default: '',
        comment: 'Wallet address of the donor',
      },
    });

    // Copy data from donor column to donorwallet for existing records
    pgm.sql(`
      UPDATE donations 
      SET donorwallet = donor 
      WHERE donorwallet IS NULL OR donorwallet = '';
    `);
  },

  down: (pgm) => {
    // Remove the column if we need to rollback
    pgm.dropColumn('donations', 'donorwallet');
  },
};

require('dotenv').config();
const { Pool } = require('pg');

async function checkCampaignsSchema() {
  const pool = new Pool({
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT) || 5432,
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
  });

  try {
    // Check campaigns table structure
    const campaignsCols = await pool.query(`
      SELECT column_name, data_type, character_maximum_length, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'campaigns';
    `);

    console.log('\n📋 Campaigns Table Columns:');
    console.table(campaignsCols.rows);

  } catch (error) {
    console.error('Error checking campaigns schema:', error);
  } finally {
    await pool.end();
  }
}

checkCampaignsSchema();

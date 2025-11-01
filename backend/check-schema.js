require('dotenv').config();
const { Pool } = require('pg');

async function checkSchema() {
  const pool = new Pool({
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT) || 5432,
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
  });

  try {
    // Check donations table
    const donationsCols = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'donations';
    `);

    console.log('\n📋 Donations Table Columns:');
    console.table(donationsCols.rows);

    // Check if donorwallet column exists
    const hasDonorWallet = donationsCols.rows.some(col => col.column_name === 'donorwallet');
    console.log('\n🔍 Has donorwallet column?', hasDonorWallet);

    if (!hasDonorWallet) {
      console.log('\n⚠️  The donorwallet column is missing from the donations table.');
      console.log('You may need to run database migrations or update your schema.');
    }

  } catch (error) {
    console.error('Error checking schema:', error);
  } finally {
    await pool.end();
  }
}

checkSchema();

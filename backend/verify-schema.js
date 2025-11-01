require('dotenv').config();
const { Pool } = require('pg');

async function verifySchema() {
  const pool = new Pool({
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT) || 5432,
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
  });

  try {
    // Check campaigns table
    const campaignsCols = await pool.query(`
      SELECT column_name, data_type, character_maximum_length, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'campaigns' 
      AND column_name IN ('id');
    `);

    console.log('\n📋 Campaigns Table - ID Column:');
    console.table(campaignsCols.rows);

    // Check foreign key columns in other tables
    // Check foreign key columns in other tables
    const fkCols = await pool.query(`
      SELECT 
        tc.table_name, 
        kcu.column_name, 
        c.data_type,
        c.character_maximum_length
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.columns AS c
          ON kcu.table_name = c.table_name
          AND kcu.column_name = c.column_name
        JOIN information_schema.referential_constraints AS rc
          ON tc.constraint_name = rc.constraint_name
      WHERE 
        tc.constraint_type = 'FOREIGN KEY' 
        AND rc.unique_constraint_schema = tc.table_schema
        AND tc.table_name IN ('donations', 'campaign_updates');
    `);

    console.log('\n🔗 Foreign Key Columns:');
    console.table(fkCols.rows);

  } catch (error) {
    console.error('Error verifying schema:', error);
  } finally {
    await pool.end();
  }
}

verifySchema();

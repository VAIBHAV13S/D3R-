require('dotenv').config();
const { Pool } = require('pg');

async function checkAllColumns() {
  const pool = new Pool({
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT) || 5432,
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
  });

  try {
    // Get all columns with character varying and their max lengths
    const result = await pool.query(`
      SELECT 
        table_name, 
        column_name, 
        data_type,
        character_maximum_length
      FROM 
        information_schema.columns 
      WHERE 
        data_type = 'character varying'
        AND table_schema = 'public'
      ORDER BY 
        table_name, 
        column_name;
    `);

    console.log('\n📋 All Character Varying Columns:');
    console.table(result.rows);

    // Check for columns with a maximum length of 36
    const problematicColumns = result.rows.filter(
      col => col.character_maximum_length === 36
    );

    if (problematicColumns.length > 0) {
      console.log('\n⚠️  Potentially problematic columns (varchar(36)):');
      console.table(problematicColumns);
    } else {
      console.log('\n✅ No columns with varchar(36) found.');
    }

  } catch (error) {
    console.error('Error checking columns:', error);
  } finally {
    await pool.end();
  }
}

checkAllColumns();

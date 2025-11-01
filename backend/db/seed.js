require('dotenv').config();
const { query, pool } = require('./client');
const { v4: uuidv4 } = require('uuid');

async function ensureSeed() {
  const { rows } = await query('SELECT COUNT(*)::int AS count FROM users');
  if (rows[0].count > 0) {
    console.log('Seed skipped: tables already contain data.');
    return false;
  }
  return true;
}

async function seed() {
  const shouldSeed = await ensureSeed();
  if (!shouldSeed) return;

  // Create a user
  const userId = uuidv4();
  const walletAddress = '0x1111111111111111111111111111111111111111';
  const displayName = 'Alice';
  const user = await query(
    'INSERT INTO users (id, walletaddress, displayname, totaldonated) VALUES ($1, $2, $3, 0) RETURNING id',
    [userId, walletAddress, displayName]
  );

  // Create a campaign
  const campaignId = uuidv4();
  const campaign = await query(
    'INSERT INTO campaigns (id, title, description, disasterid, targetamount, currentamount, creator, deadline, status) VALUES ($1, $2, $3, $4, $5, $6, $7, NULL, $8) RETURNING id',
    [
      campaignId,
      'Relief for Coastal Floods',
      'Emergency relief and supplies for coastal flood victims.',
      'DIS-COAST-2025-001',
      '1000',
      '100',
      userId,
      'active',
    ]
  );

  // Create a milestone
  const milestoneId = uuidv4();
  await query(
    'INSERT INTO milestones (id, campaignid, title, description, proofcid, approved, fundamount) VALUES ($1, $2, $3, $4, NULL, FALSE, $5) RETURNING id',
    [milestoneId, campaignId, 'Phase 1: Food Kits', 'Distribution of 100 food kits.', '200']
  );

  // Create a donation
  const donationId = uuidv4();
  const txHash = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd';
  await query(
    'INSERT INTO donations (id, campaignid, donor, amount, txhash, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
    [donationId, campaignId, userId, '100', txHash, 'confirmed']
  );

  console.log('Seed data inserted successfully.');
}

async function main() {
  try {
    await seed();
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main();
}

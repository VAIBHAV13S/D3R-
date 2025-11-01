const { pool, query } = require('../client');
const { v4: uuidv4 } = require('uuid');

const ANON_WALLET = 'ANONYMOUS';

async function ensureUserByWallet(client, wallet) {
  const res = await client.query('SELECT id FROM users WHERE walletaddress = $1', [wallet]);
  if (res.rowCount > 0) return res.rows[0].id;
  const id = uuidv4();
  await client.query('INSERT INTO users (id, walletaddress, totaldonated) VALUES ($1, $2, 0)', [id, wallet]);
  return id;
}

async function createDonation({ campaignId, donorWallet, amount, txHash, anonymous = false }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Ensure campaign exists and is active
    const campRes = await client.query(
      'SELECT id, status FROM campaigns WHERE id = $1 FOR UPDATE',
      [campaignId]
    );
    if (campRes.rowCount === 0) {
      throw Object.assign(new Error('Campaign not found'), { status: 404 });
    }
    if (campRes.rows[0].status !== 'active') {
      throw Object.assign(new Error('Campaign is not open for donations'), { status: 400 });
    }

    // Resolve donor
    const wallet = anonymous ? ANON_WALLET : donorWallet;
    const donorId = await ensureUserByWallet(client, wallet);

    // Create donation
    const donationId = uuidv4();
    let donationRes;
    try {
      donationRes = await client.query(
        `INSERT INTO donations (id, campaignid, donor, amount, txhash, status)
         VALUES ($1, $2, $3, $4, $5, 'confirmed') RETURNING id`,
        [donationId, campaignId, donorId, String(amount), txHash]
      );
    } catch (e) {
      // Unique violation for txHash
      if (e && e.code === '23505') {
        throw Object.assign(new Error('Duplicate donation txHash'), { status: 409 });
      }
      throw e;
    }

    // Update totals
    await client.query(
      'UPDATE campaigns SET currentamount = currentamount + $1 WHERE id = $2',
      [String(amount), campaignId]
    );
    await client.query(
      'UPDATE users SET totaldonated = totaldonated + $1 WHERE id = $2',
      [String(amount), donorId]
    );

    await client.query('COMMIT');
    return { id: donationRes.rows[0].id, donorId };
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch (_) {}
    throw err;
  } finally {
    client.release();
  }
}

async function listDonationsByCampaign({ campaignId, page = 1, limit = 10 }) {
  page = Math.max(1, parseInt(page, 10) || 1);
  limit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const offset = (page - 1) * limit;

  const dataSql = `
    SELECT d.id, d.campaignid AS "campaignId", u.walletaddress AS "donorWallet",
           d.amount, d.txhash AS "txHash", d.status, d.timestamp
    FROM donations d
    JOIN users u ON u.id = d.donor
    WHERE d.campaignid = $1
    ORDER BY d.amount DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  const countSql = 'SELECT COUNT(*)::int AS count FROM donations WHERE campaignid = $1';

  const [dataRes, countRes] = await Promise.all([
    query(dataSql, [campaignId]),
    query(countSql, [campaignId]),
  ]);

  return { items: dataRes.rows, page, limit, total: countRes.rows[0].count };
}

module.exports = { createDonation, listDonationsByCampaign };

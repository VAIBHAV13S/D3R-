const { query } = require('../client');
const { v4: uuidv4 } = require('uuid');

async function listUsers() {
  const { rows } = await query('SELECT id, walletaddress AS "walletAddress", displayname AS "displayName", totaldonated AS "totalDonated", createdat AS "createdAt" FROM users ORDER BY createdat DESC');
  return rows;
}

async function getUserById(id) {
  const { rows } = await query('SELECT id, walletaddress AS "walletAddress", displayname AS "displayName", totaldonated AS "totalDonated", createdat AS "createdAt" FROM users WHERE id = $1', [id]);
  return rows[0] || null;
}

async function createUser({ walletAddress, displayName }) {
  const id = uuidv4();
  const { rows } = await query(
    'INSERT INTO users (id, walletaddress, displayname, totaldonated) VALUES ($1, $2, $3, 0) RETURNING id, walletaddress AS "walletAddress", displayname AS "displayName", totaldonated AS "totalDonated", createdat AS "createdAt"',
    [id, walletAddress, displayName || null]
  );
  return rows[0];
}

module.exports = { listUsers, getUserById, createUser };

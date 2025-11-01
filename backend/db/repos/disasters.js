const { query } = require('../client');
const { v4: uuidv4 } = require('uuid');

async function upsertVerification({ disasterId, latitude, longitude, eventType, status, confidence, txHash }) {
  // Try update by disasterId, else insert
  const updateRes = await query(
    `UPDATE disasterverifications
     SET latitude = $2, longitude = $3, eventtype = $4, status = $5, confidence = $6, txhash = COALESCE($7, txhash)
     WHERE disasterid = $1 RETURNING id`,
    [disasterId, latitude, longitude, eventType, status, confidence, txHash || null]
  );
  if (updateRes.rowCount > 0) return updateRes.rows[0].id;

  const id = uuidv4();
  await query(
    `INSERT INTO disasterverifications (id, disasterid, latitude, longitude, eventtype, status, confidence, txhash)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [id, disasterId, latitude, longitude, eventType, status, confidence, txHash || null]
  );
  return id;
}

async function setVerified({ disasterId, confidence }) {
  const { rowCount } = await query(
    `UPDATE disasterverifications SET status = 'verified', confidence = $2 WHERE disasterid = $1`,
    [disasterId, confidence]
  );
  return rowCount > 0;
}

async function setFailed({ disasterId }) {
  const { rowCount } = await query(
    `UPDATE disasterverifications SET status = 'failed' WHERE disasterid = $1`,
    [disasterId]
  );
  return rowCount > 0;
}

async function getStatus(disasterId) {
  const { rows } = await query(
    `SELECT disasterid AS "disasterId", status, confidence, updatedat AS "timestamp" FROM disasterverifications WHERE disasterid = $1`,
    [disasterId]
  );
  return rows[0] || null;
}

module.exports = { upsertVerification, setVerified, setFailed, getStatus };

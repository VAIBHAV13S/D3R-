const { query, pool } = require('../client');
const { v4: uuidv4 } = require('uuid');

async function createMilestone({ campaignId, title, description, proofCID, fundAmount }) {
  const id = uuidv4();
  const sql = `
    INSERT INTO milestones (id, campaignid, title, description, proofcid, approved, fundamount)
    VALUES ($1, $2, $3, $4, $5, FALSE, $6)
    RETURNING id, campaignid AS "campaignId", title, description, proofcid AS "proofCID", approved, fundamount AS "fundAmount", releasedat AS "releasedAt", createdat AS "createdAt", updatedat AS "updatedAt";
  `;
  const { rows } = await query(sql, [id, campaignId, title, description || null, proofCID || null, String(fundAmount)]);
  return rows[0];
}

async function listByCampaign({ campaignId }) {
  const { rows } = await query(
    `SELECT id, campaignid AS "campaignId", title, description, proofcid AS "proofCID", approved, fundamount AS "fundAmount", releasedat AS "releasedAt", createdat AS "createdAt", updatedat AS "updatedAt"
     FROM milestones WHERE campaignid = $1 ORDER BY createdat ASC`,
    [campaignId]
  );
  return rows;
}

async function approveMilestone({ id }) {
  const { rowCount, rows } = await query(
    `UPDATE milestones SET approved = TRUE WHERE id = $1 AND approved = FALSE RETURNING id, approved`,
    [id]
  );
  if (rowCount === 0) return null;
  return rows[0];
}

async function markReleased({ id }) {
  const { rowCount, rows } = await query(
    `UPDATE milestones SET releasedat = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, releasedat AS "releasedAt"`,
    [id]
  );
  if (rowCount === 0) return null;
  return rows[0];
}

async function getById(id) {
  const { rows } = await query(
    `SELECT id, campaignid AS "campaignId", title, description, proofcid AS "proofCID", approved, fundamount AS "fundAmount", releasedat AS "releasedAt", createdat AS "createdAt", updatedat AS "updatedAt" FROM milestones WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
}

module.exports = { createMilestone, listByCampaign, approveMilestone, markReleased, getById };

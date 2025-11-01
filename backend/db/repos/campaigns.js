const { query } = require('../client');
const { v4: uuidv4 } = require('uuid');

function toOrderBy(sortBy) {
  switch ((sortBy || 'createdAt').toLowerCase()) {
    case 'deadline':
      return 'deadline';
    case 'targetamount':
      return 'targetamount';
    case 'currentamount':
      return 'currentamount';
    case 'createdat':
    default:
      return 'createdat';
  }
}

async function createCampaign({ title, description, disasterId, imageCID, targetAmount, deadline, creator }) {
  try {
    console.log('=== CREATING CAMPAIGN IN REPO ===');
    console.log('With data:', { title, description, disasterId, imageCID, targetAmount, deadline, creator });
    
    const id = uuidv4();
    const status = 'active';
    const sql = `
      INSERT INTO Campaigns (
        id, title, description, disasterId, imageCID, 
        targetAmount, currentAmount, creator, deadline, status, 
        createdAt, updatedAt
      ) VALUES ($1, $2, $3, $4, $5, $6, 0, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING 
        id, title, description, 
        disasterId AS "disasterId", 
        imageCID AS "imageCID", 
        targetAmount AS "targetAmount", 
        currentAmount AS "currentAmount", 
        creator, 
        deadline, 
        status, 
        createdAt AS "createdAt", 
        updatedAt AS "updatedAt"
    `;
    
    const params = [
      id, 
      title, 
      description || null, 
      disasterId || null, 
      imageCID || null, 
      targetAmount, 
      creator, 
      deadline || null, 
      status
    ];
    
    console.log('Executing campaign SQL:', sql);
    console.log('With params:', params);
    
    const { rows } = await query(sql, params);
    console.log('Campaign query result:', JSON.stringify(rows, null, 2));
    
    if (!rows || !rows[0]) {
      throw new Error('Failed to create campaign: No data returned');
    }
    
    return rows[0];
  } catch (error) {
    console.error('=== ERROR IN CREATE CAMPAIGN REPO ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error code:', error.code);
    console.error('Error detail:', error.detail);
    console.error('Error hint:', error.hint);
    console.error('Error position:', error.position);
    console.error('Error internal position:', error.internalPosition);
    console.error('Error internal query:', error.internalQuery);
    console.error('Error where:', error.where);
    console.error('Error schema:', error.schema);
    console.error('Error table:', error.table);
    console.error('Error column:', error.column);
    console.error('Error data type:', error.dataType);
    console.error('Error constraint:', error.constraint);
    
    throw error;
  }
}

async function listCampaigns({ page = 1, limit = 10, status, sortBy = 'createdAt', sortOrder = 'desc', featured = false }) {
  page = Math.max(1, parseInt(page, 10) || 1);
  limit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const offset = (page - 1) * limit;

  const where = [];
  const params = [];
  if (status) {
    params.push(status);
    where.push(`status = $${params.length}`);
  }
  // Featured campaigns: active status + has donations
  if (featured) {
    where.push(`status = 'active'`);
    where.push(`currentamount > 0`);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const orderCol = featured ? 'currentamount' : toOrderBy(sortBy);
  const orderDir = featured ? 'DESC' : ((sortOrder || 'desc').toLowerCase() === 'asc' ? 'ASC' : 'DESC');

  const dataSql = `
    SELECT id, title, description, disasterid AS "disasterId", imagecid AS "imageCID", targetamount AS "targetAmount", currentamount AS "currentAmount", creator, deadline, status, createdat AS "createdAt", updatedat AS "updatedAt"
    FROM campaigns
    ${whereSql}
    ORDER BY ${orderCol} ${orderDir}
    LIMIT ${limit} OFFSET ${offset}
  `;

  const countSql = `SELECT COUNT(*)::int AS count FROM campaigns ${whereSql}`;

  const [dataRes, countRes] = await Promise.all([
    query(dataSql, params),
    query(countSql, params),
  ]);

  return {
    items: dataRes.rows,
    page,
    limit,
    total: countRes.rows[0].count,
  };
}

async function getCampaignByIdWithCounts(id) {
  const sql = `
    SELECT c.id, c.title, c.description, c.disasterid AS "disasterId", c.imagecid AS "imageCID",
           c.targetamount AS "targetAmount", c.currentamount AS "currentAmount",
           c.creator, c.deadline, c.status, c.createdat AS "createdAt", c.updatedat AS "updatedAt",
           (SELECT COUNT(*)::int FROM donations d WHERE d.campaignid = c.id) AS "donationCount",
           (SELECT COUNT(*)::int FROM milestones m WHERE m.campaignid = c.id) AS "milestoneCount"
    FROM campaigns c
    WHERE c.id = $1
  `;
  const { rows } = await query(sql, [id]);
  return rows[0] || null;
}

async function updateCampaign({ id, creator, title, description, deadline }) {
  const fields = [];
  const params = [];
  if (typeof title !== 'undefined') { params.push(title); fields.push(`title = $${params.length}`); }
  if (typeof description !== 'undefined') { params.push(description); fields.push(`description = $${params.length}`); }
  if (typeof deadline !== 'undefined') { params.push(deadline); fields.push(`deadline = $${params.length}`); }
  if (fields.length === 0) return getCampaignByIdWithCounts(id);

  params.push(id); const idIdx = params.length;
  params.push(creator); const creatorIdx = params.length;

  const sql = `
    UPDATE campaigns
    SET ${fields.join(', ')}
    WHERE id = $${idIdx} AND creator = $${creatorIdx}
    RETURNING id
  `;
  const res = await query(sql, params);
  if (res.rowCount === 0) return null;
  return getCampaignByIdWithCounts(id);
}

async function cancelCampaign({ id, creator }) {
  const sql = `
    UPDATE campaigns
    SET status = 'cancelled'
    WHERE id = $1 AND creator = $2
    RETURNING id
  `;
  const res = await query(sql, [id, creator]);
  if (res.rowCount === 0) return null;
  return getCampaignByIdWithCounts(id);
}

module.exports = {
  createCampaign,
  listCampaigns,
  getCampaignByIdWithCounts,
  updateCampaign,
  cancelCampaign,
};

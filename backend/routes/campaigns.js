const express = require('express');
const router = express.Router();
const { query } = require('../db/client');
const campaignsRepo = require('../db/repos/campaigns');
const { verifyAuth } = require('../middleware/auth');
const { handleError } = require('../utils/errorHandler');

// List campaigns
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, sortBy, sortOrder, featured } = req.query;
    const result = await campaignsRepo.listCampaigns({
      page: parseInt(page, 10),
      limit: Math.min(parseInt(limit, 10) || 10, 100),
      status,
      sortBy,
      sortOrder,
      featured: featured === 'true'
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Get campaign by ID
router.get('/:id', async (req, res, next) => {
  try {
    const campaignId = req.params.id;
    
    if (!campaignId || campaignId === 'undefined') {
      return res.status(400).json({ error: 'Campaign ID is required' });
    }

    const campaign = await campaignsRepo.getCampaignByIdWithCounts(campaignId);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    res.json(campaign);
  } catch (err) {
    console.error('Error getting campaign:', err);
    next(err);
  }
});

// Get campaign donations
router.get('/:id/donations', async (req, res, next) => {
  try {
    const campaignId = req.params.id;
    const { limit = 10 } = req.query;
    
    if (!campaignId || campaignId === 'undefined') {
      return res.status(400).json({ error: 'Campaign ID is required' });
    }
    
    const campaign = await campaignsRepo.getCampaignByIdWithCounts(campaignId);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    const donations = await campaignsRepo.getCampaignDonations(campaignId, parseInt(limit));
    res.json({ items: donations || [] });
  } catch (err) {
    console.error('Error getting campaign donations:', err);
    next(err);
  }
});

// Get campaign milestones
router.get('/:id/milestones', async (req, res, next) => {
  try {
    const campaignId = req.params.id;
    
    if (!campaignId || campaignId === 'undefined') {
      return res.status(400).json({ error: 'Campaign ID is required' });
    }
    
    const campaign = await campaignsRepo.getCampaignByIdWithCounts(campaignId);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    const milestones = await campaignsRepo.getCampaignMilestones(campaignId);
    res.json({ items: milestones || [] });
  } catch (err) {
    console.error('Error getting campaign milestones:', err);
    next(err);
  }
});

// Create campaign
router.post('/', verifyAuth, async (req, res, next) => {
  console.log('=== REQUEST BODY ===');
  console.log(JSON.stringify(req.body, null, 2));
  console.log('=== USER ===');
  console.log(JSON.stringify(req.user, null, 2));
  
  const { title, description, targetAmount, deadline, disasterId, imageCID } = req.body;
  
  if (!title || !targetAmount) {
    return res.status(400).json({ error: 'Title and target amount are required' });
  }

  try {
    // First, get or create the user
    console.log('=== CREATING/FINDING USER ===');
    const userQuery = {
      text: `
        INSERT INTO Users (id, walletAddress, displayName, createdAt, updatedAt)
        VALUES (gen_random_uuid(), $1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (walletAddress) 
        DO UPDATE SET 
          displayName = COALESCE(EXCLUDED.displayName, Users.displayName),
          updatedAt = CURRENT_TIMESTAMP
        RETURNING id, walletAddress
      `,
      values: [req.user.walletAddress, req.user.displayName || null]
    };
    
    console.log('Executing user query:', JSON.stringify(userQuery, null, 2));
    const userResult = await query(userQuery.text, userQuery.values);
    console.log('User query result:', JSON.stringify(userResult.rows, null, 2));

    if (!userResult.rows || !userResult.rows[0]) {
      throw new Error('Failed to create or get user');
    }

    const userId = userResult.rows[0].id;
    console.log('=== CREATING CAMPAIGN ===');
    console.log('Using creator ID:', userId);

    const campaignData = {
      title,
      description,
      targetAmount,
      deadline: deadline || null,
      disasterId: disasterId || null,
      imageCID: imageCID || null,
      creator: userId
    };
    
    console.log('Campaign data:', JSON.stringify(campaignData, null, 2));
    
    const campaign = await campaignsRepo.createCampaign(campaignData);
    console.log('Campaign created:', JSON.stringify(campaign, null, 2));

    res.status(201).json(campaign);
  } catch (err) {
    console.error('=== ERROR CREATING CAMPAIGN ===');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    console.error('Error code:', err.code);
    console.error('Error detail:', err.detail);
    console.error('Error hint:', err.hint);
    console.error('Error position:', err.position);
    console.error('Error internal position:', err.internalPosition);
    console.error('Error internal query:', err.internalQuery);
    console.error('Error where:', err.where);
    console.error('Error schema:', err.schema);
    console.error('Error table:', err.table);
    console.error('Error column:', err.column);
    console.error('Error data type:', err.dataType);
    console.error('Error constraint:', err.constraint);
    
    next({
      status: 500,
      message: 'Failed to create campaign',
      error: {
        name: err.name,
        message: err.message,
        code: err.code,
        detail: err.detail,
        table: err.table,
        constraint: err.constraint,
        column: err.column
      }
    });
  }
});

// Update campaign
router.put('/:id', verifyAuth, async (req, res, next) => {
  try {
    const { title, description, deadline } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const updated = await campaignsRepo.updateCampaign({
      id: req.params.id,
      creator: req.user.walletAddress,
      title,
      description,
      deadline: deadline || null
    });

    if (!updated) {
      return res.status(404).json({ error: 'Campaign not found or not authorized' });
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// Cancel campaign
router.post('/:id/cancel', verifyAuth, async (req, res, next) => {
  try {
    const cancelled = await campaignsRepo.cancelCampaign({
      id: req.params.id,
      creator: req.user.walletAddress
    });

    if (!cancelled) {
      return res.status(404).json({ error: 'Campaign not found or not authorized' });
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

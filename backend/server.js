require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const { query, checkConnection } = require('./db/client');
const usersRepo = require('./db/repos/users');
const campaignsRepo = require('./db/repos/campaigns');
const filesRepo = require('./db/repos/files');
const donationsRepo = require('./db/repos/donations');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { uploadFileToPinata, testPinataConnection } = require('./upload');
const { execFile } = require('child_process');
const milestonesRepo = require('./db/repos/milestones');
const disastersRepo = require('./db/repos/disasters');
const { getDisasterOracle } = require('./web3/contracts');
const { sendAndWait } = require('./web3/tx');
const authRoutes = require('./routes/auth');
const campaignsRoutes = require('./routes/campaigns');
const statsRoutes = require('./routes/stats');
const { verifyAuth } = require('./middleware/auth');
const { handleError, NotFoundError, ValidationError, AuthenticationError, AuthorizationError } = require('./utils/errorHandler');
const logger = require('./utils/logger');

// Simple environment variable validation helper
function validateEnv(requiredVars = []) {
  const missing = requiredVars.filter((key) => !process.env[key] || process.env[key].trim() === '');
  if (missing.length) {
    const err = new Error(`Missing required environment variables: ${missing.join(', ')}`);
    err.code = 'ENV_VALIDATION_ERROR';
    throw err;
  }
}

// Load project version for health endpoint (best-effort)
function getAppVersion() {
  try {
    const pkgPath = path.join(__dirname, 'package.json');
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      return pkg.version || '0.0.0';
    }
  } catch (_) {}
  return '0.0.0';
}

// Create app
const app = express();

// Configuration
const PORT = parseInt(process.env.PORT, 10) || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Validate env (customize this list as needed)
try {
  validateEnv([]);
} catch (err) {
  // Log and exit if run as a standalone server
  // If imported by tests or other scripts, let the error bubble up
  if (require.main === module) {
    logger.error('Startup error', { error: err.message, code: err.code });
    process.exit(1);
  } else {
    throw err;
  }
}

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.logRequest(req, res, duration);
  });
  next();
});

// Core middleware (must be before routes to parse JSON bodies)

// Configure trust proxy
app.set('trust proxy', process.env.NODE_ENV === 'production' ? 1 : 0);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // In development, allow all origins
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // In production, check against allowed origins
    const allowedOrigins = process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',')
      : ['http://localhost:3000', 'http://localhost:3001'];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`Blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies and authorization headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'x-admin-key'],
  exposedHeaders: ['RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset'],
  maxAge: 86400, // 24 hours
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting configurations
// Strict limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Moderate limiter for write operations (POST, PUT, DELETE)
const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requests per window
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Lenient limiter for read operations (GET)
const readLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per window
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Very strict limiter for file uploads
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 uploads per hour
  message: 'Too many file uploads, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth routes with strict rate limiting
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/campaigns', campaignsRoutes);
app.use('/api/stats', statsRoutes);

// Disaster verification with write limiter
app.post('/api/verify-disaster', writeLimiter, async (req, res, next) => {
  try {
    const { disasterId, latitude, longitude, eventType } = req.body || {};
    if (!disasterId) return res.status(400).json({ error: 'disasterId is required' });
    if (typeof latitude === 'undefined' || typeof longitude === 'undefined') {
      return res.status(400).json({ error: 'latitude and longitude are required' });
    }
    if (!eventType) return res.status(400).json({ error: 'eventType is required' });

    // Upsert pending record
    await disastersRepo.upsertVerification({ disasterId, latitude, longitude, eventType, status: 'pending', confidence: null, txHash: null });

    // On-chain request (if configured); otherwise simulate success
    let txHash = null;
    try {
      const oracle = getDisasterOracle(false);
      const txResp = await oracle.requestVerification(String(disasterId), Math.trunc(Number(latitude) * 1e6), Math.trunc(Number(longitude) * 1e6), String(eventType));
      const result = await sendAndWait(Promise.resolve(txResp), 1);
      if (result.status === 'success') {
        txHash = result.txHash;
      } else {
        console.error('Oracle request failed:', result.error || result);
      }
    } catch (e) {
      console.warn('Oracle not configured or call failed, continuing with pending status:', e.message || e);
    }

    if (txHash) {
      await disastersRepo.upsertVerification({ disasterId, latitude, longitude, eventType, status: 'pending', confidence: null, txHash });
    }

    res.status(202).json({ status: 'pending', disasterId, txHash });
  } catch (err) {
    next(err);
  }
});

app.get('/api/disasters/:id/status', readLimiter, async (req, res, next) => {
  try {
    const status = await disastersRepo.getStatus(req.params.id);
    if (!status) return res.status(404).json({ error: 'Not found' });
    res.json(status);
  } catch (err) {
    next(err);
  }
});


// Health check - basic
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    env: NODE_ENV,
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
    },
  });
});

// Database health check - detailed
app.get('/api/db/health', async (req, res, next) => {
  try {
    const dbHealth = await checkConnection();
    const statusCode = dbHealth.ok ? 200 : 503;
    res.status(statusCode).json(dbHealth);
  } catch (err) {
    next(err);
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniquePrefix = uuidv4().slice(0, 8);
    cb(null, `${uniquePrefix}-${file.originalname}`);
  },
});
const allowedMime = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!allowedMime.has(file.mimetype)) {
      return cb(new Error('Unsupported file type'));
    }
    cb(null, true);
  },
});

function execScan(filePath) {
  return new Promise((resolve, reject) => {
    const cmd = process.env.VIRUS_SCAN_CMD;
    if (!process.env.ENABLE_VIRUS_SCAN || process.env.ENABLE_VIRUS_SCAN !== 'true' || !cmd) {
      return resolve({ scanned: false, clean: true });
    }
    execFile(cmd, [filePath], { timeout: 30000 }, (error, stdout, stderr) => {
      if (error) {
        return reject(new Error(`Virus scan failed: ${stderr || error.message}`));
      }
      const out = String(stdout || '').toLowerCase();
      if (out.includes('ok') || out.includes('clean') || out.includes('no threats')) {
        return resolve({ scanned: true, clean: true, output: stdout });
      }
      return reject(new Error(`Virus detected or unknown result: ${stdout}`));
    });
  });
}

async function withRetry(fn, attempts = 3, baseDelayMs = 300) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const delay = baseDelayMs * Math.pow(2, i);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastErr;
}

app.post('/api/ipfs/upload', uploadLimiter, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'file is required (field name: file)' });
    const { documentType, ...rest } = req.body || {};
    if (!documentType) return res.status(400).json({ error: 'documentType is required' });

    await execScan(req.file.path);

    const result = await withRetry(
      () => uploadFileToPinata(req.file.path, documentType, rest),
      3,
      300
    );

    const gateway = (process.env.IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/').replace(/\/?$/, '/');

    const uploader = req.header('x-user-id') || null;
    try {
      await filesRepo.saveUploadedFile({
        cid: result.IpfsHash,
        documentType,
        uploader,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        sizeBytes: req.file.size,
      });
    } catch (e) {
      // Non-fatal: uploading to IPFS succeeded; DB persistence failed
      console.error('Failed to persist uploaded file metadata:', e);
    }

    try { fs.unlinkSync(req.file.path); } catch (_) {}

    res.json({ cid: result.IpfsHash, url: `${gateway}${result.IpfsHash}` });
  } catch (err) {
    try { if (req.file && req.file.path) fs.unlinkSync(req.file.path); } catch (_) {}
    next(err);
  }
});

app.get('/api/ipfs/status', async (req, res, next) => {
  try {
    await testPinataConnection();
    res.json({ ok: true, service: 'Pinata' });
  } catch (err) {
    res.status(200).json({ ok: false, service: 'Pinata', error: err.message });
  }
});

// Milestones
app.post('/api/campaigns/:id/milestones', uploadLimiter, upload.single('proofFile'), async (req, res, next) => {
  try {
    const { title, description, fundAmount, documentType } = req.body || {};
    if (!title) return res.status(400).json({ error: 'title is required' });
    const amt = Number(fundAmount);
    if (!Number.isFinite(amt) || amt < 0) return res.status(400).json({ error: 'fundAmount must be >= 0' });
    let proofCID = null;
    if (req.file) {
      await execScan(req.file.path);
      const up = await withRetry(() => uploadFileToPinata(req.file.path, documentType || 'milestone-proof', { campaignId: req.params.id, title }), 3, 300);
      proofCID = up.IpfsHash;
      try { fs.unlinkSync(req.file.path); } catch (_) {}
    }
    const created = await milestonesRepo.createMilestone({ campaignId: req.params.id, title, description, proofCID, fundAmount: String(amt) });
    return res.status(201).json({ milestoneId: created.id, proofCID: created.proofCID || null });
  } catch (err) {
    try { if (req.file && req.file.path) fs.unlinkSync(req.file.path); } catch (_) {}
    next(err);
  }
});

app.get('/api/campaigns/:id/milestones', readLimiter, async (req, res, next) => {
  try {
    const items = await milestonesRepo.listByCampaign({ campaignId: req.params.id });
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

app.put('/api/milestones/:id/approve', writeLimiter, async (req, res, next) => {
  try {
    const adminKey = req.header('x-admin-key');
    if (!adminKey || adminKey !== (process.env.ADMIN_KEY || '')) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const approved = await milestonesRepo.approveMilestone({ id: req.params.id });
    if (!approved) return res.status(400).json({ error: 'Already approved or not found' });
    res.json({ approved: true });
  } catch (err) {
    next(err);
  }
});

app.post('/api/milestones/:id/release-funds', writeLimiter, async (req, res, next) => {
  try {
    const adminKey = req.header('x-admin-key');
    if (!adminKey || adminKey !== (process.env.ADMIN_KEY || '')) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const { walletAddress } = req.body || {};
    if (!walletAddress) return res.status(400).json({ error: 'walletAddress is required' });

    const milestone = await milestonesRepo.getById(req.params.id);
    if (!milestone) return res.status(404).json({ error: 'Milestone not found' });
    if (!milestone.approved) return res.status(400).json({ error: 'Milestone not approved' });

    // TODO: integrate with smart contract; for now mock call
    const tx = { hash: '0xmocktx' };

    const marked = await milestonesRepo.markReleased({ id: req.params.id });
    res.json({ released: true, txHash: tx.hash, releasedAt: marked.releasedAt });
  } catch (err) {
    next(err);
  }
});

app.get('/api/users', async (req, res, next) => {
  try {
    const users = await usersRepo.listUsers();
    res.json({ users });
  } catch (err) {
    next(err);
  }
});

app.post('/api/users', async (req, res, next) => {
  try {
    const { walletAddress, displayName } = req.body || {};
    if (!walletAddress || typeof walletAddress !== 'string') {
      return res.status(400).json({ error: 'walletAddress is required' });
    }
    const user = await usersRepo.createUser({ walletAddress, displayName });
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
});

// Campaigns
app.post('/api/campaigns', writeLimiter, async (req, res, next) => {
  try {
    const { title, description, targetAmount, deadline, disasterId, imageCID } = req.body || {};
    const creator = req.header('x-user-id');
    if (!creator) return res.status(401).json({ error: 'x-user-id header required' });
    if (!title || typeof title !== 'string') return res.status(400).json({ error: 'title is required' });
    const amt = Number(targetAmount);
    if (!Number.isFinite(amt) || amt <= 0) return res.status(400).json({ error: 'targetAmount must be > 0' });
    let deadlineTs = null;
    if (deadline) {
      const d = new Date(deadline);
      if (isNaN(d.getTime())) return res.status(400).json({ error: 'deadline must be a valid date' });
      if (d.getTime() <= Date.now()) return res.status(400).json({ error: 'deadline must be in the future' });
      deadlineTs = d.toISOString();
    }
    const created = await campaignsRepo.createCampaign({
      title,
      description,
      disasterId,
      imageCID,
      targetAmount: String(amt),
      deadline: deadlineTs,
      creator,
    });
    return res.status(201).json({ campaignId: created.id });
  } catch (err) {
    next(err);
  }
});

app.get('/api/campaigns', readLimiter, async (req, res, next) => {
  try {
    const { page, limit, status, sortBy, sortOrder, featured } = req.query || {};
    let filterStatus = status;
    if (filterStatus) {
      const allowed = new Set(['active', 'completed', 'cancelled']);
      if (!allowed.has(String(filterStatus).toLowerCase())) {
        return res.status(400).json({ error: 'invalid status filter' });
      }
      filterStatus = String(filterStatus).toLowerCase();
    }
    const result = await campaignsRepo.listCampaigns({ page, limit, status: filterStatus, sortBy, sortOrder, featured: featured === 'true' });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.get('/api/campaigns/:id', readLimiter, async (req, res, next) => {
  try {
    const campaign = await campaignsRepo.getCampaignByIdWithCounts(req.params.id);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    res.json(campaign);
  } catch (err) {
    next(err);
  }
});

app.put('/api/campaigns/:id', writeLimiter, async (req, res, next) => {
  try {
    const creator = req.header('x-user-id');
    if (!creator) return res.status(401).json({ error: 'x-user-id header required' });
    const { title, description, deadline } = req.body || {};
    let deadlineTs;
    if (typeof deadline !== 'undefined') {
      if (deadline === null || deadline === '') {
        deadlineTs = null;
      } else {
        const d = new Date(deadline);
        if (isNaN(d.getTime())) return res.status(400).json({ error: 'deadline must be a valid date' });
        if (d.getTime() <= Date.now()) return res.status(400).json({ error: 'deadline must be in the future' });
        deadlineTs = d.toISOString();
      }
    }
    const updated = await campaignsRepo.updateCampaign({ id: req.params.id, creator, title, description, deadline: deadlineTs });
    if (!updated) return res.status(403).json({ error: 'Not allowed or campaign not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/campaigns/:id', async (req, res, next) => {
  try {
    const creator = req.header('x-user-id');
    if (!creator) return res.status(401).json({ error: 'x-user-id header required' });
    const cancelled = await campaignsRepo.cancelCampaign({ id: req.params.id, creator });
    if (!cancelled) return res.status(403).json({ error: 'Not allowed or campaign not found' });
    res.json(cancelled);
  } catch (err) {
    next(err);
  }
});

// Donations
app.post('/api/donations', writeLimiter, async (req, res, next) => {
  try {
    const { campaignId, donor, amount, txHash, anonymous } = req.body || {};
    if (!campaignId) return res.status(400).json({ error: 'campaignId is required' });
    if (!anonymous && !donor) return res.status(400).json({ error: 'donor (wallet) is required unless anonymous=true' });
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) return res.status(400).json({ error: 'amount must be > 0' });
    if (!txHash || typeof txHash !== 'string' || txHash.length < 32) {
      return res.status(400).json({ error: 'txHash is invalid' });
    }
    const created = await donationsRepo.createDonation({ campaignId, donorWallet: donor, amount: String(amt), txHash, anonymous: !!anonymous });
    return res.status(201).json({ donationId: created.id });
  } catch (err) {
    next(err);
  }
});

app.get('/api/campaigns/:id/donations', readLimiter, async (req, res, next) => {
  try {
    const { page, limit } = req.query || {};
    const result = await donationsRepo.listDonationsByCampaign({ campaignId: req.params.id, page, limit });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Get donations by wallet address
app.get('/api/users/:wallet/donations', readLimiter, async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query || {};
    const wallet = req.params.wallet;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const dataSql = `
      SELECT d.id, d.campaignid AS "campaignId", d.donor, d.amount, d.txhash AS "txHash", 
             d.status, d.anonymous, d.createdat AS "createdAt",
             c.title AS "campaignTitle"
      FROM donations d
      LEFT JOIN campaigns c ON d.campaignid = c.id
      WHERE LOWER(d.donorwallet) = LOWER($1)
      ORDER BY d.createdat DESC
      LIMIT ${limitNum} OFFSET ${offset}
    `;
    const countSql = `SELECT COUNT(*)::int AS count FROM donations WHERE LOWER(donorwallet) = LOWER($1)`;

    const [dataRes, countRes] = await Promise.all([
      query(dataSql, [wallet]),
      query(countSql, [wallet])
    ]);

    res.json({
      items: dataRes.rows,
      page: pageNum,
      limit: limitNum,
      total: countRes.rows[0].count
    });
  } catch (err) {
    next(err);
  }
});

// Stats endpoint
app.get('/api/stats', readLimiter, async (req, res, next) => {
  try {
    const statsQuery = `
      SELECT 
        COALESCE(SUM(CAST(d.amount AS NUMERIC)), 0) AS "totalDonations",
        (SELECT COUNT(DISTINCT id)::int FROM campaigns WHERE status = 'active') AS "campaignCount",
        (SELECT COUNT(DISTINCT donorwallet)::int FROM donations WHERE donorwallet IS NOT NULL) AS "peopleHelped"
      FROM donations d
    `;
    const { rows } = await query(statsQuery);
    res.json({
      totalDonations: Number(rows[0].totalDonations) || 0,
      campaignCount: rows[0].campaignCount || 0,
      peopleHelped: rows[0].peopleHelped || 0
    });
  } catch (err) {
    next(err);
  }
});

// Example route (placeholder)
app.get('/', (req, res) => {
  res.status(200).send('Express server template is running.');
});

// 404 handler - must be after all routes
app.use((req, res, next) => {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`));
});

// Global error handler - must be last
app.use(handleError);

// Export the Express app
module.exports = app;

const express = require('express');
const { ethers } = require('ethers');
const { generateToken } = require('../utils/jwt');
const usersRepo = require('../db/repos/users');
const { ValidationError, AuthenticationError } = require('../utils/errorHandler');

const router = express.Router();

// In-memory nonce storage (use Redis in production)
const nonces = new Map();

// Generate nonce for wallet sign-in
router.post('/nonce', async (req, res, next) => {
  try {
    const { walletAddress } = req.body;
    if (!walletAddress || typeof walletAddress !== 'string') {
      throw new ValidationError('walletAddress is required');
    }

    // Validate address format
    if (!ethers.utils.isAddress(walletAddress)) {
      throw new ValidationError('Invalid wallet address');
    }

    const nonce = Math.floor(Math.random() * 1000000).toString();
    nonces.set(walletAddress.toLowerCase(), { nonce, timestamp: Date.now() });

    // Clean up old nonces (older than 5 minutes)
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    for (const [addr, data] of nonces.entries()) {
      if (data.timestamp < fiveMinutesAgo) {
        nonces.delete(addr);
      }
    }

    res.json({ nonce });
  } catch (err) {
    next(err);
  }
});

// Verify signature and issue JWT
router.post('/verify', async (req, res, next) => {
  try {
    const { walletAddress, signature, message } = req.body;
    if (!walletAddress || !signature || !message) {
      return res.status(400).json({ error: 'walletAddress, signature, and message are required' });
    }

    const addr = walletAddress.toLowerCase();
    const nonceData = nonces.get(addr);
    if (!nonceData) {
      return res.status(400).json({ error: 'Nonce not found or expired. Request a new nonce.' });
    }

    // Verify the signature
    try {
      const recoveredAddress = ethers.utils.verifyMessage(message, signature);
      if (recoveredAddress.toLowerCase() !== addr) {
        return res.status(401).json({ error: 'Signature verification failed' });
      }
    } catch (err) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Delete used nonce
    nonces.delete(addr);

    // Get or create user
    let user;
    try {
      const users = await usersRepo.listUsers();
      user = users.find(u => u.walletAddress.toLowerCase() === addr);
    } catch (e) {
      user = null;
    }

    if (!user) {
      user = await usersRepo.createUser({ walletAddress, displayName: null });
    }

    // Generate JWT
    const token = generateToken({
      userId: user.id,
      walletAddress: user.walletAddress,
    });

    res.json({
      token,
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        displayName: user.displayName,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const statsRepo = require('../db/repos/stats');
const { handleError } = require('../utils/errorHandler');

// Get platform statistics
router.get('/', async (req, res, next) => {
  try {
    const stats = await statsRepo.getStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

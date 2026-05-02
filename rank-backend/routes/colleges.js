const express = require('express');
const College = require('../models/College');

const router = express.Router();

// ──────────────────────────────────────────────
// Middleware: Admin password check
// ──────────────────────────────────────────────
function requireAdmin(req, res, next) {
  const password = req.headers['x-admin-password'] || req.query.admin_password;
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized — invalid admin password.' });
  }
  next();
}

// ──────────────────────────────────────────────
// PUBLIC ROUTES
// ──────────────────────────────────────────────

// GET /api/colleges — List all colleges
router.get('/', async (req, res) => {
  try {
    const { search, city, sort } = req.query;
    const filter = {};

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { college_name: regex },
        { college_code: regex },
        { city: regex },
        { location: regex },
      ];
    }

    if (city) {
      filter.city = new RegExp(`^${city}$`, 'i');
    }

    let query = College.find(filter);

    // Sorting
    if (sort === 'name') {
      query = query.sort({ college_name: 1 });
    } else if (sort === 'code') {
      query = query.sort({ college_code: 1 });
    } else if (sort === 'year') {
      query = query.sort({ established_year: -1 });
    } else {
      query = query.sort({ college_name: 1 });
    }

    const colleges = await query.lean();
    res.json(colleges);
  } catch (err) {
    console.error('[GET /api/colleges]', err);
    res.status(500).json({ error: 'Failed to fetch colleges.' });
  }
});

// GET /api/colleges/:code — Get a single college by code
router.get('/:code', async (req, res) => {
  try {
    const college = await College.findOne({ college_code: req.params.code }).lean();
    if (!college) {
      return res.status(404).json({ error: 'College not found.' });
    }
    res.json(college);
  } catch (err) {
    console.error('[GET /api/colleges/:code]', err);
    res.status(500).json({ error: 'Failed to fetch college.' });
  }
});

// ──────────────────────────────────────────────
// ADMIN ROUTES (password-protected)
// ──────────────────────────────────────────────

// POST /api/colleges — Create a new college
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { college_code, college_name } = req.body;
    if (!college_code || !college_name) {
      return res.status(400).json({ error: 'college_code and college_name are required.' });
    }

    // Check for duplicate
    const existing = await College.findOne({ college_code });
    if (existing) {
      return res.status(409).json({ error: `College with code "${college_code}" already exists.` });
    }

    const college = await College.create(req.body);
    res.status(201).json(college);
  } catch (err) {
    console.error('[POST /api/colleges]', err);
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Duplicate college code.' });
    }
    res.status(500).json({ error: 'Failed to create college.' });
  }
});

// PUT /api/colleges/:code — Update a college
router.put('/:code', requireAdmin, async (req, res) => {
  try {
    // Don't allow changing the college_code
    delete req.body.college_code;

    const college = await College.findOneAndUpdate(
      { college_code: req.params.code },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!college) {
      return res.status(404).json({ error: 'College not found.' });
    }

    res.json(college);
  } catch (err) {
    console.error('[PUT /api/colleges/:code]', err);
    res.status(500).json({ error: 'Failed to update college.' });
  }
});

// DELETE /api/colleges/:code — Delete a college
router.delete('/:code', requireAdmin, async (req, res) => {
  try {
    const college = await College.findOneAndDelete({ college_code: req.params.code });
    if (!college) {
      return res.status(404).json({ error: 'College not found.' });
    }
    res.json({ message: 'College deleted successfully.', college });
  } catch (err) {
    console.error('[DELETE /api/colleges/:code]', err);
    res.status(500).json({ error: 'Failed to delete college.' });
  }
});

// POST /api/colleges/auth/verify — Verify admin password
router.post('/auth/verify', (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, error: 'Invalid password.' });
  }
});

module.exports = router;

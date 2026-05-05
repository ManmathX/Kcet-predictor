const express = require('express');
const rateLimit = require('express-rate-limit');
const College = require('../models/College');

const router = express.Router();

// ──────────────────────────────────────────────
// Rate Limiting
// ──────────────────────────────────────────────
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs for admin routes
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Strict limit for password attempts
  message: { error: 'Too many password attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ──────────────────────────────────────────────
// Middleware: Admin password check
// ──────────────────────────────────────────────
function requireAdmin(req, res, next) {
  const password = req.headers['x-admin-password'];
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized — invalid admin password.' });
  }
  next();
}

// Validation helper for Mixed type cutoffs
const validateCourses = (courses) => {
  if (!Array.isArray(courses)) return false;
  for (const c of courses) {
    if (!c.name || !c.code) return false;
    if (c.cutoffs !== undefined && (typeof c.cutoffs !== 'object' || c.cutoffs === null || Array.isArray(c.cutoffs))) {
      return false; // cutoffs must be a plain JSON object
    }
  }
  return true;
};

// ──────────────────────────────────────────────
// PUBLIC ROUTES
// ──────────────────────────────────────────────

// GET /api/colleges — List colleges
// Public requests see only published colleges.
// Admin requests (with x-admin-password or ?include_drafts=true + admin header) see all.
router.get('/', async (req, res) => {
  try {
    const { search, city, sort, include_drafts } = req.query;
    const filter = {};

    // Only admins can see unpublished colleges
    const isAdmin = req.headers['x-admin-password'] === process.env.ADMIN_PASSWORD;
    if (!(isAdmin && include_drafts === 'true')) {
      filter.isPublished = true;
    }

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

    // Exclude the heavy courses array from the list view payload
    let query = College.find(filter).select('-courses');

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
// Public requests can only access published colleges.
// Admin requests (with x-admin-password header) bypass the publish filter.
router.get('/:code', async (req, res) => {
  try {
    const college = await College.findOne({ college_code: req.params.code }).lean();
    if (!college) {
      return res.status(404).json({ error: 'College not found.' });
    }

    // Block public access to unpublished colleges
    const isAdmin = req.headers['x-admin-password'] === process.env.ADMIN_PASSWORD;
    if (!college.isPublished && !isAdmin) {
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
router.post('/', adminLimiter, requireAdmin, async (req, res) => {
  try {
    const { college_code, college_name, courses } = req.body;
    if (!college_code || !college_name) {
      return res.status(400).json({ error: 'college_code and college_name are required.' });
    }

    if (courses && !validateCourses(courses)) {
      return res.status(400).json({ error: 'Invalid courses format. cutoffs must be a valid JSON object.' });
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
router.put('/:code', adminLimiter, requireAdmin, async (req, res) => {
  try {
    if (req.body.courses && !validateCourses(req.body.courses)) {
      return res.status(400).json({ error: 'Invalid courses format. cutoffs must be a valid JSON object.' });
    }

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

// PATCH /api/colleges/:code/publish — Toggle publish state
router.patch('/:code/publish', adminLimiter, requireAdmin, async (req, res) => {
  try {
    const { isPublished } = req.body;

    if (typeof isPublished !== 'boolean') {
      return res.status(400).json({ error: 'Invalid value. isPublished must be a boolean.' });
    }

    const college = await College.findOne({ college_code: req.params.code });
    if (!college) {
      return res.status(404).json({ error: 'College not found.' });
    }

    // Update publish state and track audit time
    college.isPublished = isPublished;
    if (isPublished) {
      college.published_at = new Date();
    }

    await college.save();
    res.json({
      message: `College ${college.isPublished ? 'published' : 'unpublished'} successfully.`,
      isPublished: college.isPublished,
      college,
    });
  } catch (err) {
    console.error('[PATCH /api/colleges/:code/publish]', err);
    res.status(500).json({ error: 'Failed to update publish state.' });
  }
});

// DELETE /api/colleges/:code — Delete a college
router.delete('/:code', adminLimiter, requireAdmin, async (req, res) => {
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
router.post('/auth/verify', authLimiter, (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, error: 'Invalid password.' });
  }
});

module.exports = router;

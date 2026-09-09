const express = require('express');
const db = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { sendAdminNotificationAsync, buildReviewEmail } = require('../services/email');

const router = express.Router();

// GET Featured Reviews (Public - for Homepage testimonial showcase)
router.get('/featured', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT r.*, COALESCE(u.full_name, 'Driver') AS reviewer_name, COALESCE(p.name, 'RC Vehicle') AS product_name, p.images AS product_images
       FROM reviews_ratings r
       LEFT JOIN users u ON r.user_id = u.id
       LEFT JOIN products p ON r.product_id = p.id
       WHERE r.rating >= 4
       ORDER BY r.is_featured DESC, r.created_at DESC
       LIMIT 6`
    );

    res.json({ reviews: result.rows });
  } catch (err) {
    console.error('Fetch featured reviews error:', err);
    res.status(500).json({ error: 'Server error fetching featured reviews' });
  }
});

// GET All Reviews (Admin Review Collection & Moderation)
router.get('/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { rating } = req.query;
    let queryText = `
      SELECT r.*, COALESCE(u.full_name, 'Driver') AS reviewer_name, COALESCE(u.email, '') AS reviewer_email,
        COALESCE(p.name, 'RC Vehicle') AS product_name, p.slug AS product_slug, p.images AS product_images
      FROM reviews_ratings r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN products p ON r.product_id = p.id
      WHERE 1=1
    `;
    const queryParams = [];

    if (rating) {
      queryParams.push(parseInt(rating, 10));
      queryText += ` AND r.rating = $${queryParams.length}`;
    }

    queryText += ` ORDER BY r.created_at DESC`;

    const result = await db.query(queryText, queryParams);
    res.json({ reviews: result.rows });
  } catch (err) {
    console.error('Fetch all reviews error:', err);
    res.status(500).json({ error: 'Server error fetching review collection' });
  }
});

// GET Reviews for a specific product
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const result = await db.query(
      `SELECT r.*, COALESCE(u.full_name, 'Driver') AS reviewer_name
       FROM reviews_ratings r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.product_id = $1
       ORDER BY r.created_at DESC`,
      [productId]
    );

    res.json({ reviews: result.rows });
  } catch (err) {
    console.error('Fetch reviews error:', err);
    res.status(500).json({ error: 'Server error fetching product reviews' });
  }
});

// POST Add or Update Review (Buyer Only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { product_id, rating, comment } = req.body;
    if (!product_id || !rating || !comment) {
      return res.status(400).json({ error: 'Product ID, rating (1-5), and comment are required' });
    }

    const numericRating = parseInt(rating, 10);
    if (numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5 stars' });
    }

    const existing = await db.query(
      'SELECT id FROM reviews_ratings WHERE product_id = $1 AND user_id = $2',
      [product_id, req.user.id]
    );

    if (existing.rows.length > 0) {
      const updateRes = await db.query(
        `UPDATE reviews_ratings SET rating = $1, comment = $2, created_at = CURRENT_TIMESTAMP
         WHERE id = $3 RETURNING *`,
        [numericRating, comment.trim(), existing.rows[0].id]
      );
      return res.json({ review: updateRes.rows[0], message: 'Review updated' });
    } else {
      const insertRes = await db.query(
        `INSERT INTO reviews_ratings (product_id, user_id, rating, comment, is_featured)
         VALUES ($1, $2, $3, $4, false) RETURNING *`,
        [product_id, req.user.id, numericRating, comment.trim()]
      );

      // Award 15 bonus reward points for submitting a verified product review!
      await db.query(
        `INSERT INTO reward_points_transactions (user_id, type, points, description)
         VALUES ($1, 'earned', 15, 'Product review feedback reward')`,
        [req.user.id]
      );

      // Async email notification to admin
      const prodRes = await db.query('SELECT name FROM products WHERE id = $1', [product_id]);
      const userRes = await db.query('SELECT full_name, email FROM users WHERE id = $1', [req.user.id]);
      const productObj = prodRes.rows[0] || { name: `Product #${product_id}` };
      const reviewerObj = userRes.rows[0] || { full_name: 'Driver', email: req.user.email || '' };
      
      const emailPayload = buildReviewEmail(insertRes.rows[0], productObj, reviewerObj);
      sendAdminNotificationAsync({
        ...emailPayload,
        metadata: { product_id, review_id: insertRes.rows[0].id }
      });

      return res.status(201).json({ review: insertRes.rows[0], message: 'Review published (+15 Reward Points earned!)' });
    }
  } catch (err) {
    console.error('Add review error:', err);
    res.status(500).json({ error: 'Server error submitting review' });
  }
});

// PUT Toggle Featured Review (Admin Only)
router.put('/:id/feature', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await db.query('SELECT is_featured FROM reviews_ratings WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const newFeatured = !existing.rows[0].is_featured;
    const result = await db.query('UPDATE reviews_ratings SET is_featured = $1 WHERE id = $2 RETURNING *', [newFeatured, id]);

    res.json({ message: `Review featured status updated to ${newFeatured}`, review: result.rows[0] });
  } catch (err) {
    console.error('Toggle feature review error:', err);
    res.status(500).json({ error: 'Server error toggling review status' });
  }
});

// DELETE Review (Admin Only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM reviews_ratings WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json({ message: 'Review deleted successfully', id });
  } catch (err) {
    console.error('Delete review error:', err);
    res.status(500).json({ error: 'Server error deleting review' });
  }
});

module.exports = router;

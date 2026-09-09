const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET User Wishlist
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT w.id AS wishlist_id, w.created_at AS added_at, p.*, c.name AS category_name
       FROM wishlist w
       JOIN products p ON w.product_id = p.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE w.user_id = $1
       ORDER BY w.created_at DESC`,
      [req.user.id]
    );

    const wishlist = result.rows.map(item => ({
      ...item,
      price: parseFloat(item.price)
    }));

    res.json({ wishlist });
  } catch (err) {
    console.error('Fetch wishlist error:', err);
    res.status(500).json({ error: 'Server error fetching wishlist' });
  }
});

// POST Add to Wishlist
router.post('/toggle', authenticateToken, async (req, res) => {
  try {
    const { product_id } = req.body;
    if (!product_id) {
      return res.status(400).json({ error: 'Product ID required' });
    }

    const existing = await db.query(
      'SELECT id FROM wishlist WHERE user_id = $1 AND product_id = $2',
      [req.user.id, product_id]
    );

    if (existing.rows.length > 0) {
      // Remove from wishlist
      await db.query('DELETE FROM wishlist WHERE id = $1', [existing.rows[0].id]);
      return res.json({ added: false, message: 'Removed from wishlist' });
    } else {
      // Add to wishlist
      await db.query(
        'INSERT INTO wishlist (user_id, product_id) VALUES ($1, $2)',
        [req.user.id, product_id]
      );
      return res.json({ added: true, message: 'Added to wishlist' });
    }
  } catch (err) {
    console.error('Toggle wishlist error:', err);
    res.status(500).json({ error: 'Server error modifying wishlist' });
  }
});

// DELETE Remove from Wishlist
router.delete('/:productId', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;
    await db.query('DELETE FROM wishlist WHERE user_id = $1 AND product_id = $2', [req.user.id, productId]);
    res.json({ message: 'Removed from wishlist' });
  } catch (err) {
    console.error('Remove wishlist item error:', err);
    res.status(500).json({ error: 'Server error removing item from wishlist' });
  }
});

module.exports = router;

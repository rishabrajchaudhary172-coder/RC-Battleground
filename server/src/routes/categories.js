const express = require('express');
const db = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

// GET All Categories with Product Count
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT c.*, COUNT(p.id) AS product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id
      ORDER BY c.name ASC
    `);

    const categories = result.rows.map(c => ({
      ...c,
      product_count: parseInt(c.product_count, 10)
    }));

    res.json({ categories });
  } catch (err) {
    console.error('Fetch categories error:', err);
    res.status(500).json({ error: 'Server error fetching categories' });
  }
});

// POST Create Category (Admin Only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, image_url } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const slug = slugify(name);
    const result = await db.query(
      `INSERT INTO categories (name, slug, description, image_url)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name.trim(), slug, description || '', image_url || '']
    );

    res.status(201).json({ category: result.rows[0] });
  } catch (err) {
    console.error('Create category error:', err);
    res.status(500).json({ error: 'Server error creating category' });
  }
});

// PUT Update Category (Admin Only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image_url } = req.body;

    let slug;
    if (name) {
      slug = slugify(name);
    }

    const result = await db.query(
      `UPDATE categories SET
         name = COALESCE($1, name),
         slug = COALESCE($2, slug),
         description = COALESCE($3, description),
         image_url = COALESCE($4, image_url)
       WHERE id = $5
       RETURNING *`,
      [name, slug, description, image_url, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ category: result.rows[0] });
  } catch (err) {
    console.error('Update category error:', err);
    res.status(500).json({ error: 'Server error updating category' });
  }
});

// DELETE Category (Admin Only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM categories WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ message: 'Category deleted', id });
  } catch (err) {
    console.error('Delete category error:', err);
    res.status(500).json({ error: 'Server error deleting category' });
  }
});

module.exports = router;

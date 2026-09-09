const express = require('express');
const db = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Helper to generate slug
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

// GET All Products (Catalog with category, price filter, search, featured, sorting)
router.get('/', async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, inStock, featured, sort } = req.query;

    let queryText = `
      SELECT p.*, c.name AS category_name, c.slug AS category_slug,
        COALESCE(AVG(r.rating), 0) AS avg_rating,
        COUNT(r.id) AS review_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN reviews_ratings r ON p.id = r.product_id
      WHERE 1=1
    `;
    const queryParams = [];

    if (category) {
      queryParams.push(category);
      queryText += ` AND c.slug = $${queryParams.length}`;
    }

    if (search) {
      queryParams.push(`%${search}%`);
      queryText += ` AND (p.name ILIKE $${queryParams.length} OR p.description ILIKE $${queryParams.length} OR p.seller_name ILIKE $${queryParams.length})`;
    }

    if (minPrice) {
      queryParams.push(parseFloat(minPrice));
      queryText += ` AND p.price >= $${queryParams.length}`;
    }

    if (maxPrice) {
      queryParams.push(parseFloat(maxPrice));
      queryText += ` AND p.price <= $${queryParams.length}`;
    }

    if (inStock === 'true') {
      queryText += ` AND p.stock > 0`;
    }

    if (featured === 'true') {
      queryText += ` AND p.is_featured = true`;
    }

    queryText += ` GROUP BY p.id, c.name, c.slug`;

    if (sort === 'price_asc') {
      queryText += ` ORDER BY p.price ASC`;
    } else if (sort === 'price_desc') {
      queryText += ` ORDER BY p.price DESC`;
    } else if (sort === 'rating') {
      queryText += ` ORDER BY avg_rating DESC`;
    } else if (sort === 'oldest') {
      queryText += ` ORDER BY p.created_at ASC`;
    } else {
      queryText += ` ORDER BY p.created_at DESC`;
    }

    const result = await db.query(queryText, queryParams);
    
    // Format numbers
    const products = result.rows.map(p => ({
      ...p,
      price: parseFloat(p.price),
      avg_rating: parseFloat(p.avg_rating).toFixed(1),
      review_count: parseInt(p.review_count, 10)
    }));

    res.json({ products });
  } catch (err) {
    console.error('Fetch products error:', err);
    res.status(500).json({ error: 'Server error fetching products' });
  }
});

// GET Single Product by ID or Slug
router.get('/:idOrSlug', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const isId = /^\d+$/.test(idOrSlug);

    const queryText = `
      SELECT p.*, c.name AS category_name, c.slug AS category_slug,
        COALESCE(AVG(r.rating), 0) AS avg_rating,
        COUNT(r.id) AS review_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN reviews_ratings r ON p.id = r.product_id
      WHERE ${isId ? 'p.id = $1' : 'p.slug = $1'}
      GROUP BY p.id, c.name, c.slug
    `;

    const result = await db.query(queryText, [isId ? parseInt(idOrSlug, 10) : idOrSlug]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = {
      ...result.rows[0],
      price: parseFloat(result.rows[0].price),
      avg_rating: parseFloat(result.rows[0].avg_rating).toFixed(1),
      review_count: parseInt(result.rows[0].review_count, 10)
    };

    res.json({ product });
  } catch (err) {
    console.error('Fetch single product error:', err);
    res.status(500).json({ error: 'Server error fetching product details' });
  }
});

const { getExchangeRate, usdToNpr } = require('../services/currency');

// POST Add Product (Admin Only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { category_id, name, description, price, price_usd, price_npr, stock, images, seller_name, is_featured, specs } = req.body;

    if (!name || !description || price === undefined || stock === undefined) {
      return res.status(400).json({ error: 'Name, description, price, and stock are required' });
    }

    let slug = slugify(name);
    // Ensure unique slug
    const slugCheck = await db.query('SELECT id FROM products WHERE slug = $1', [slug]);
    if (slugCheck.rows.length > 0) {
      slug = `${slug}-${Date.now()}`;
    }

    const rate = await getExchangeRate();
    const usd = parseFloat(price_usd || price);
    const npr = parseFloat(price_npr || usdToNpr(usd, rate));

    const result = await db.query(
      `INSERT INTO products (category_id, name, slug, description, price, price_usd, price_npr, stock, images, seller_name, is_featured, specs)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        category_id || null,
        name.trim(),
        slug,
        description.trim(),
        usd,
        usd,
        npr,
        parseInt(stock, 10),
        images || [],
        seller_name || 'RC Battleground Official',
        !!is_featured,
        specs || {}
      ]
    );

    res.status(201).json({ product: result.rows[0] });
  } catch (err) {
    console.error('Add product error:', err);
    res.status(500).json({ error: 'Server error adding product' });
  }
});

// PUT Update Product (Admin Only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { category_id, name, description, price, price_usd, price_npr, stock, images, seller_name, is_featured, specs } = req.body;

    const existing = await db.query('SELECT * FROM products WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    let slug = existing.rows[0].slug;
    if (name && name !== existing.rows[0].name) {
      slug = slugify(name);
      const slugCheck = await db.query('SELECT id FROM products WHERE slug = $1 AND id != $2', [slug, id]);
      if (slugCheck.rows.length > 0) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    const rate = await getExchangeRate();
    const usdVal = price_usd !== undefined ? parseFloat(price_usd) : (price !== undefined ? parseFloat(price) : null);
    const nprVal = price_npr !== undefined ? parseFloat(price_npr) : (usdVal ? usdToNpr(usdVal, rate) : null);

    const result = await db.query(
      `UPDATE products SET
         category_id = COALESCE($1, category_id),
         name = COALESCE($2, name),
         slug = $3,
         description = COALESCE($4, description),
         price = COALESCE($5, price),
         price_usd = COALESCE($5, price_usd),
         price_npr = COALESCE($6, price_npr),
         stock = COALESCE($7, stock),
         images = COALESCE($8, images),
         seller_name = COALESCE($9, seller_name),
         is_featured = COALESCE($10, is_featured),
         specs = COALESCE($11, specs)
       WHERE id = $12
       RETURNING *`,
      [
        category_id,
        name,
        slug,
        description,
        usdVal,
        nprVal,
        stock !== undefined ? parseInt(stock, 10) : null,
        images,
        seller_name,
        is_featured,
        specs,
        id
      ]
    );

    res.json({ product: result.rows[0] });
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ error: 'Server error updating product' });
  }
});

// DELETE Product (Admin Only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully', id });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ error: 'Server error deleting product' });
  }
});

module.exports = router;

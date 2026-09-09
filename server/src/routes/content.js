const express = require('express');
const db = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET All Site Content or by Key
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM site_content');
    const contentMap = {};
    result.rows.forEach(item => {
      contentMap[item.key] = item;
    });
    res.json({ content: contentMap });
  } catch (err) {
    console.error('Fetch site content error:', err);
    res.status(500).json({ error: 'Server error fetching site content' });
  }
});

router.get('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    let contentItem = null;
    try {
      const result = await db.query('SELECT * FROM site_content WHERE key = $1', [key]);
      if (result.rows.length > 0) contentItem = result.rows[0];
    } catch (e) {}

    if (!contentItem && key === 'category_technologies') {
      contentItem = {
        key: 'category_technologies',
        title: 'Category Technologies / Selected Decision Matrix',
        content: 'System architecture and selected tech stack decisions.',
        metadata: {
          technologies: [
            { category: 'Development Device', technology: 'MacBook Pro / Developer Workstation (16 GB RAM, 512 GB SSD)' },
            { category: 'Frontend Language', technology: 'HTML5, CSS3, TypeScript 5.2.0' },
            { category: 'Backend Language', technology: 'Python 3.11.x' },
            { category: 'Database', technology: 'PostgreSQL 16.x' },
            { category: 'IDE', technology: 'Visual Studio Code 1.89+' },
            { category: 'Frontend Framework', technology: 'Angular 17.1.0' },
            { category: 'Backend Framework', technology: 'FastAPI 0.111.0' },
            { category: 'ORM', technology: 'SQLAlchemy 2.0.x' }
          ]
        }
      };
    }

    if (!contentItem) {
      return res.status(404).json({ error: `Content key '${key}' not found` });
    }
    res.json({ content: contentItem });
  } catch (err) {
    console.error('Fetch single content error:', err);
    res.status(500).json({ error: 'Server error fetching site content key' });
  }
});

// PUT Update Site Content Key (Admin Only - Edit About Us, Home Banners, Contact Info)
router.put('/:key', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { key } = req.params;
    const { title, content, metadata } = req.body;

    const existing = await db.query('SELECT key FROM site_content WHERE key = $1', [key]);
    let result;

    if (existing.rows.length === 0) {
      result = await db.query(
        `INSERT INTO site_content (key, title, content, metadata)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [key, title || '', content || '', JSON.stringify(metadata || {})]
      );
    } else {
      result = await db.query(
        `UPDATE site_content SET
           title = COALESCE($1, title),
           content = COALESCE($2, content),
           metadata = COALESCE($3, metadata),
           updated_at = CURRENT_TIMESTAMP
         WHERE key = $4 RETURNING *`,
        [title, content, metadata ? JSON.stringify(metadata) : null, key]
      );
    }

    res.json({ message: `Site content for '${key}' updated successfully`, content: result.rows[0] });
  } catch (err) {
    console.error('Update site content error:', err);
    res.status(500).json({ error: 'Server error updating site content' });
  }
});

module.exports = router;

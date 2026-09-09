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

// GET All Upcoming Events (Public / Buyer view)
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM events ORDER BY event_date ASC');
    const events = result.rows.map(e => ({
      ...e,
      entry_fee: parseFloat(e.entry_fee)
    }));
    res.json({ events });
  } catch (err) {
    console.error('Fetch events error:', err);
    res.status(500).json({ error: 'Server error fetching upcoming events' });
  }
});

// GET Single Event details
router.get('/:idOrSlug', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const isId = /^\d+$/.test(idOrSlug);

    const result = await db.query(
      `SELECT * FROM events WHERE ${isId ? 'id = $1' : 'slug = $1'}`,
      [isId ? parseInt(idOrSlug, 10) : idOrSlug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const event = {
      ...result.rows[0],
      entry_fee: parseFloat(result.rows[0].entry_fee)
    };

    res.json({ event });
  } catch (err) {
    console.error('Fetch single event error:', err);
    res.status(500).json({ error: 'Server error fetching event details' });
  }
});

// POST Create Event (Admin Only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, event_date, location, track_type, description, image_url, entry_fee, max_participants } = req.body;
    if (!title || !event_date || !location || !track_type || !description) {
      return res.status(400).json({ error: 'Title, event date, location, track type, and description are required' });
    }

    let slug = slugify(title);
    const slugCheck = await db.query('SELECT id FROM events WHERE slug = $1', [slug]);
    if (slugCheck.rows.length > 0) {
      slug = `${slug}-${Date.now()}`;
    }

    const result = await db.query(
      `INSERT INTO events (title, slug, event_date, location, track_type, description, image_url, entry_fee, max_participants)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        title.trim(),
        slug,
        new Date(event_date),
        location.trim(),
        track_type.trim(),
        description.trim(),
        image_url || 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=1000&q=80',
        entry_fee !== undefined ? parseFloat(entry_fee) : 0.00,
        max_participants !== undefined ? parseInt(max_participants, 10) : 30
      ]
    );

    res.status(201).json({ event: result.rows[0], message: 'Upcoming race event added successfully' });
  } catch (err) {
    console.error('Add event error:', err);
    res.status(500).json({ error: 'Server error adding event' });
  }
});

// PUT Edit Event (Admin Only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, event_date, location, track_type, description, image_url, entry_fee, max_participants } = req.body;

    const existing = await db.query('SELECT * FROM events WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    let slug = existing.rows[0].slug;
    if (title && title !== existing.rows[0].title) {
      slug = slugify(title);
      const slugCheck = await db.query('SELECT id FROM events WHERE slug = $1 AND id != $2', [slug, id]);
      if (slugCheck.rows.length > 0) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    const result = await db.query(
      `UPDATE events SET
         title = COALESCE($1, title),
         slug = $2,
         event_date = COALESCE($3, event_date),
         location = COALESCE($4, location),
         track_type = COALESCE($5, track_type),
         description = COALESCE($6, description),
         image_url = COALESCE($7, image_url),
         entry_fee = COALESCE($8, entry_fee),
         max_participants = COALESCE($9, max_participants)
       WHERE id = $10
       RETURNING *`,
      [
        title,
        slug,
        event_date ? new Date(event_date) : null,
        location,
        track_type,
        description,
        image_url,
        entry_fee !== undefined ? parseFloat(entry_fee) : null,
        max_participants !== undefined ? parseInt(max_participants, 10) : null,
        id
      ]
    );

    res.json({ event: result.rows[0], message: 'Event details updated successfully' });
  } catch (err) {
    console.error('Update event error:', err);
    res.status(500).json({ error: 'Server error updating event' });
  }
});

// DELETE Event (Admin Only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM events WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ message: 'Race event deleted', id });
  } catch (err) {
    console.error('Delete event error:', err);
    res.status(500).json({ error: 'Server error deleting event' });
  }
});

// POST Register / Reserve Driver Spot for Event (Buyer)
router.post('/:id/register', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const eventRes = await db.query('SELECT * FROM events WHERE id = $1', [id]);
    
    if (eventRes.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const event = eventRes.rows[0];
    if (event.registered_count >= event.max_participants) {
      return res.status(400).json({ error: 'Event is fully booked! Registration capacity reached.' });
    }

    const updateRes = await db.query(
      `UPDATE events SET registered_count = registered_count + 1 WHERE id = $1 RETURNING *`,
      [id]
    );

    // Award driver 20 reward points for participating in track events!
    await db.query(
      `INSERT INTO reward_points_transactions (user_id, type, points, description)
       VALUES ($1, 'earned', 20, $2)`,
      [req.user.id, `Track event registration bonus (${event.title})`]
    );

    res.json({
      message: `Driver spot reserved for "${event.title}"! +20 Reward Points earned.`,
      event: updateRes.rows[0]
    });
  } catch (err) {
    console.error('Register for event error:', err);
    res.status(500).json({ error: 'Server error registering for event' });
  }
});

module.exports = router;

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

    if (!contentItem && key === 'explore_pages_nav') {
      contentItem = {
        key: 'explore_pages_nav',
        title: 'Explore Pages Navigation',
        content: 'Admin-customized nav links and display labels for the Explore Pages dropdown.',
        metadata: {
          nav_links: [
            { id: 'home', to: '/', label: 'Home Page', icon: 'Home', badge: null },
            { id: 'catalog', to: '/catalog', label: 'Vehicle Catalog', icon: 'Grid3X3', badge: 'HOT' },
            { id: 'categories', to: '/categories', label: 'Categories', icon: 'Layers', badge: null },
            { id: 'events', to: '/events', label: 'Race Events', icon: 'Calendar', badge: 'LIVE' },
            { id: 'membership', to: '/membership', label: 'Membership Plans', icon: 'Crown', badge: 'PRO' },
            { id: 'rewards', to: '/rewards', label: 'Reward Points', icon: 'Award', badge: 'PTS' },
            { id: 'about', to: '/about', label: 'About RC Battleground', icon: 'Info', badge: null },
            { id: 'contact', to: '/contact', label: 'Contact Us', icon: 'Mail', badge: null },
          ]
        }
      };
    }

    if (!contentItem && key === 'about_us') {
      contentItem = {
        key: 'about_us',
        title: 'ENGINEERED FOR THE DISCERNING CONTROLLER',
        content: 'RC Battleground was founded by motorsport veterans and RC engineering enthusiasts who demanded zero compromises in speed, durability, and chassis craftsmanship.\n\nFrom high-voltage 6S brushless bashing trucks to sub-millimeter gyro drift chassis, we curate only elite competition-grade remote control vehicles, telemetry sensors, and authentic replacement parts in Nepal.',
        metadata: {
          stats: [
            { value: '12,500+', label: 'RC VEHICLES DELIVERED' },
            { value: '450+', label: 'TRACK RECORDS BROKEN' },
            { value: '8,200+', label: 'ACTIVE DRIVERS' }
          ],
          hero_image: '/rc_arena_vision_hero.jpg',
          hero_badge: 'OFFICIAL RC ARENA & TELEMETRY PIT HEADQUARTERS — NEPAL',
          hero_title: 'Precision High-Speed Arena & Trackside Diagnostic Bay',
          hero_description: 'Equipped with live lap timers, telemetry telemetry sensors, sub-millimeter gyro calibration, and 100% genuine replacement parts.',
          gallery: [
            {
              id: 1,
              tag: 'OFF-ROAD 4WD',
              title: 'APEX OFF-ROAD BUGGIES',
              description: '65+ MPH 3660 brushless motors with oil-filled aluminum dampers built for dirt jumps and dirt tracks.',
              image_url: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=800&q=80'
            },
            {
              id: 2,
              tag: '1/10 RWD DRIFT',
              title: 'TOKYO SPEC DRIFT CARS',
              description: 'Precision gyro-assisted counter-steer chassis engineered for smooth concrete drifting.',
              image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'
            },
            {
              id: 3,
              tag: '6S BASHING TRUCKS',
              title: 'TITAN CRUSHER BASHING TRUCKS',
              description: 'Heavy-duty steel drive shafts and massive rubber tires built for extreme double backflips.',
              image_url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80'
            }
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

// DISPATCH PIT CREW MESSAGES & SUPPORT INQUIRIES ENDPOINTS
// -------------------------------------------------------------------

// POST Submit Support Inquiry (Dispatch Pit Crew Message)
router.post('/support-inquiries', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Driver Name, Email, and Message are required' });
    }

    const inquiry = {
      id: Date.now(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: (subject || 'General Pit Crew Inquiry').trim(),
      message: message.trim(),
      status: 'unread',
      created_at: new Date()
    };

    if (!db.memoryDb) db.memoryDb = {};
    if (!Array.isArray(db.memoryDb.support_inquiries)) db.memoryDb.support_inquiries = [];
    db.memoryDb.support_inquiries.unshift(inquiry);

    if (db.saveMemoryDbToDisk) {
      db.saveMemoryDbToDisk();
    }

    res.status(201).json({
      success: true,
      message: '✅ Support inquiry transmitted successfully to the Pit Crew!',
      inquiry
    });
  } catch (err) {
    console.error('Submit support inquiry error:', err);
    res.status(500).json({ error: 'Server error transmitting support inquiry' });
  }
});

// GET All Support Inquiries (Admin Only)
router.get('/support-inquiries/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    let inquiries = [];
    if (db.memoryDb && Array.isArray(db.memoryDb.support_inquiries)) {
      inquiries = db.memoryDb.support_inquiries;
    }
    res.json({ inquiries });
  } catch (err) {
    console.error('Fetch support inquiries error:', err);
    res.status(500).json({ error: 'Server error fetching pit crew support inquiries' });
  }
});

// PUT Mark Inquiry Read / Replied (Admin Only)
router.put('/support-inquiries/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (db.memoryDb && Array.isArray(db.memoryDb.support_inquiries)) {
      const item = db.memoryDb.support_inquiries.find(inq => String(inq.id) === String(id));
      if (item) {
        item.status = status || 'read';
        if (db.saveMemoryDbToDisk) db.saveMemoryDbToDisk();
        return res.json({ success: true, inquiry: item });
      }
    }
    res.status(404).json({ error: 'Support inquiry not found' });
  } catch (err) {
    res.status(500).json({ error: 'Server error updating support inquiry status' });
  }
});

// DELETE Support Inquiry (Admin Only)
router.delete('/support-inquiries/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (db.memoryDb && Array.isArray(db.memoryDb.support_inquiries)) {
      db.memoryDb.support_inquiries = db.memoryDb.support_inquiries.filter(inq => String(inq.id) !== String(id));
      if (db.saveMemoryDbToDisk) db.saveMemoryDbToDisk();
      return res.json({ success: true, message: 'Support inquiry deleted successfully' });
    }
    res.status(404).json({ error: 'Support inquiry not found' });
  } catch (err) {
    res.status(500).json({ error: 'Server error deleting support inquiry' });
  }
});

module.exports = router;

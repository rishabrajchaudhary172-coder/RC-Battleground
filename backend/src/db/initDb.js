const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: process.env.PGPORT || 5432,
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  database: process.env.PGDATABASE || 'rc_battleground',
});

async function initDatabase() {
  const client = await pool.connect();
  try {
    console.log('⚡ Initializing RC Battleground Database Schema...');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    await client.query(schemaSql);
    console.log('✅ Schema tables created successfully!');

    console.log('🌱 Seeding initial database data...');

    // 1. Password Hashes
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const buyerPasswordHash = await bcrypt.hash('buyer123', 10);

    // 2. Users
    await client.query(
      `INSERT INTO users (full_name, email, password_hash, role, phone, address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      ['RC Admin', 'admin@rcbattleground.com', adminPasswordHash, 'admin', '+1 (800) 555-0199', '100 Arena Way, Speed City']
    );

    const buyerUserRes = await client.query(
      `INSERT INTO users (full_name, email, password_hash, role, phone, address)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      ['Alex Vance', 'buyer@rcbattleground.com', buyerPasswordHash, 'buyer', '+1 (555) 234-5678', '742 Apex Boulevard, Trackside']
    );

    const buyerId = buyerUserRes.rows[0].id;

    // 3. Categories (RC Battleground default + custom)
    const categoriesData = [
      ['Offer/Deal Vehicles', 'offer-deal-vehicles', 'Limited-time deals on premium RC vehicles at unbeatable prices.', 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=800&q=80'],
      ['RC Cars', 'rc-cars', 'High-performance remote control cars for racing, drifting, and bashing.', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'],
      ['Batteries', 'batteries', 'LiPo, NiMH, and charger systems for maximum runtime and power.', 'https://images.unsplash.com/photo-1609592806598-ef9c9a5642c6?auto=format&fit=crop&w=800&q=80'],
      ['Parts', 'parts', 'Replacement parts, upgrades, and accessories for every RC platform.', 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80'],
      ['Off-Road Buggies', 'off-road-buggies', 'High-speed all-terrain electric buggies built for dirt, jumps, and gravel.', 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80'],
      ['Racing Drones', 'racing-drones', 'FPV racing quadcopters designed for high-speed indoor and outdoor gates.', 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80']
    ];

    const EXCHANGE_RATE = 133.50;

    // Site Settings — exchange rate
    await client.query(
      `INSERT INTO site_settings (key, value) VALUES ('exchange_rate', $1)`,
      [JSON.stringify({ rate: EXCHANGE_RATE, npr_per_usd: EXCHANGE_RATE })]
    );
    const categoryMap = {};
    for (const cat of categoriesData) {
      const res = await client.query(
        `INSERT INTO categories (name, slug, description, image_url) VALUES ($1, $2, $3, $4) RETURNING id, slug`,
        cat
      );
      categoryMap[res.rows[0].slug] = res.rows[0].id;
    }

    // 4. Products
    const productsData = [
      {
        name: 'Apex Predator 4WD Off-Road Buggy',
        slug: 'apex-predator-4wd-off-road-buggy',
        category_slug: 'off-road-buggies',
        description: 'The Apex Predator is a 1/10 scale brushless ready-to-run buggy capable of speeds up to 65+ MPH. Features heavy-duty aluminum chassis, waterproof 120A ESC, and oil-filled coilover shocks.',
        price: 349.99,
        stock: 14,
        seller_name: 'RC Battleground Official',
        is_featured: true,
        images: [
          'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1000&q=80'
        ],
        specs: { scale: '1/10', max_speed: '65+ MPH', motor: '3660 3300KV Brushless', drivetrain: '4WD Shaft Drive', battery: '3S-4S LiPo Compatible' }
      },
      {
        name: 'Tokyo Spec Nissan GT-R Drift Racer',
        slug: 'tokyo-spec-nissan-gtr-drift-racer',
        category_slug: 'drift-cars',
        description: 'Engineered for smooth indoor polished concrete and asphalt drifting. Includes gyro-assisted steering control, realistic LED front/rear lights, and hard slick drift compound tires.',
        price: 279.50,
        stock: 9,
        seller_name: 'DriftCraft Garage',
        is_featured: true,
        images: [
          'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1000&q=80'
        ],
        specs: { scale: '1/10', drivetrain: 'RWD Counter-Steer', ESC: '60A Sensored Brushless', gyro: 'Integrated AVC / Drift Gyro' }
      },
      {
        name: 'Titan Crusher 6S Monster Bashing Truck',
        slug: 'titan-crusher-6s-monster-bashing-truck',
        category_slug: 'monster-trucks',
        description: 'Unstoppable 1/8 scale stunt truck built to absorb massive double-flips and high jumps. Outfitted with steel drivetrain gears and hex wheel hubs.',
        price: 529.00,
        stock: 6,
        seller_name: 'RC Battleground Official',
        is_featured: true,
        images: [
          'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=1000&q=80'
        ],
        specs: { scale: '1/8', max_speed: '70+ MPH on 6S', shock_type: 'Aluminum Big Bore Shocks', weight: '11.2 lbs' }
      },
      {
        name: 'Trail Blazer 4x4 Scale Rock Crawler',
        slug: 'trail-blazer-4x4-scale-rock-crawler',
        category_slug: 'rock-crawlers',
        description: 'High-torque locked axle crawler with portal axles for extreme ground clearance. Operates dual speed transmission switchable directly from the transmitter.',
        price: 389.00,
        stock: 12,
        seller_name: 'Summit Crawlers',
        is_featured: false,
        images: [
          'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1000&q=80'
        ],
        specs: { scale: '1/10', transmission: 'High/Low Dual Speed', lockers: 'Remote Front & Rear Locking Diffs' }
      },
      {
        name: 'Veloce Carbon GT On-Road Supercar',
        slug: 'veloce-carbon-gt-on-road-supercar',
        category_slug: 'speed-on-road',
        description: 'Ultra-low aerodynamic profile designed for track asphalt racing. Reaches 0 to 60 mph in under 2.5 seconds with zero traction slip.',
        price: 499.99,
        stock: 5,
        seller_name: 'Velocity Tech',
        is_featured: true,
        images: [
          'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1000&q=80'
        ],
        specs: { scale: '1/7', top_speed: '85+ MPH', chassis: '4mm CNC Anodized Carbon Fiber' }
      },
      {
        name: 'Falcon FPV Racing Drone Kit',
        slug: 'falcon-fpv-racing-drone-kit',
        category_slug: 'racing-drones',
        description: 'Carbon fiber quadcopter frame featuring 4k 60fps low-latency FPV video transmitter and high RPM 2207 brushless motors.',
        price: 319.00,
        stock: 18,
        seller_name: 'SkyLine Dynamics',
        is_featured: false,
        images: [
          'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=1000&q=80'
        ],
        specs: { frame: '5-inch Full 3K Carbon', flight_controller: 'F722 Dual Gyro', camera: 'Digital HD FPV System' }
      }
    ];

    const productMap = {};
    for (const p of productsData) {
      const catId = categoryMap[p.category_slug];
      const res = await client.query(
        `INSERT INTO products (category_id, name, slug, description, price, price_npr, price_usd, stock, images, seller_name, is_featured, specs)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id, slug`,
        [catId, p.name, p.slug, p.description, p.price, Math.round(p.price * EXCHANGE_RATE * 100) / 100, p.price, p.stock, p.images, p.seller_name, p.is_featured, JSON.stringify(p.specs)]
      );
      productMap[res.rows[0].slug] = res.rows[0].id;
    }

    // 5. Membership Plans
    const plansData = [
      ['Basic', 'Entry-level membership with standard benefits and 1x reward points.', 0.00, 365, 1.0, ['Standard Point Earning (1x)', 'Standard Shipping', 'Community Access']],
      ['Pro', 'Mid-tier membership with 1.5x reward points, express shipping, and parts discount.', 19.99, 30, 1.5, ['1.5x Reward Points Earning', 'Free Express Shipping', '5% Off Parts & Upgrades', 'Early Access to New Models']],
      ['Elite', 'Premium annual pass with 2x reward points, priority support, and 10% storewide discount.', 149.99, 365, 2.0, ['2x Reward Points Earning', 'Free Next-Day Express Shipping', '10% Storewide Discount', 'Priority 24/7 Tech Support', 'Complimentary Track Event Pass']]
    ];

    for (const plan of plansData) {
      const priceUsd = plan[2];
      const priceNpr = Math.round(priceUsd * EXCHANGE_RATE * 100) / 100;
      await client.query(
        `INSERT INTO membership_plans (plan_name, description, price, price_npr, price_usd, duration_days, point_multiplier, perks)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [plan[0], plan[1], priceUsd, priceNpr, priceUsd, plan[3], plan[4], plan[5]]
      );
    }

    // Assign buyer active membership
    const proPlanRes = await client.query(`SELECT id FROM membership_plans WHERE plan_name = 'Pro'`);
    if (proPlanRes.rows.length > 0) {
      const proPlanId = proPlanRes.rows[0].id;
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);
      await client.query(
        `INSERT INTO user_memberships (user_id, plan_id, plan_name, price, start_date, end_date, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [buyerId, proPlanId, 'Pro', 19.99, startDate, endDate, 'active']
      );
    }

    // 6. Reward Settings
    await client.query(
      `INSERT INTO reward_settings (points_per_dollar_spent, dollars_per_point_redeemed)
       VALUES ($1, $2)`,
      [1.00, 0.05]
    );

    await client.query(
      `INSERT INTO reward_points_transactions (user_id, type, points, description)
       VALUES 
       ($1, 'earned', 350, 'Welcome Bonus & Pro Circuit VIP Signup'),
       ($1, 'earned', 280, 'Purchased Tokyo Spec Nissan GT-R Drift Racer')`,
      [buyerId]
    );

    // 7. Initial Reviews & Ratings
    const gtrId = productMap['tokyo-spec-nissan-gtr-drift-racer'];
    const apexId = productMap['apex-predator-4wd-off-road-buggy'];
    const titanId = productMap['titan-crusher-6s-monster-bashing-truck'];

    if (gtrId) {
      await client.query(
        `INSERT INTO reviews_ratings (product_id, user_id, rating, comment, is_featured)
         VALUES ($1, $2, 5, 'Insane drift angles right out of the box! Gyro assistance makes line transitions effortless.', true)`,
        [gtrId, buyerId]
      );
    }
    if (apexId) {
      await client.query(
        `INSERT INTO reviews_ratings (product_id, user_id, rating, comment, is_featured)
         VALUES ($1, $2, 5, 'Absolute beast on dirt tracks. Handles 4S LiPo jumps like a champ without breaking a arm.', true)`,
        [apexId, buyerId]
      );
    }
    if (titanId) {
      await client.query(
        `INSERT INTO reviews_ratings (product_id, user_id, rating, comment, is_featured)
         VALUES ($1, $2, 5, 'The 6S power is unreal. Double backflips off ramps are effortless. High quality steel drivetrain.', true)`,
        [titanId, buyerId]
      );
    }

    // 8. Wishlist item
    if (apexId) {
      await client.query(
        `INSERT INTO wishlist (user_id, product_id) VALUES ($1, $2)`,
        [buyerId, apexId]
      );
    }

    // 9. Initial Order
    if (gtrId) {
      const orderRes = await client.query(
        `INSERT INTO orders (user_id, order_number, total_amount, discount_amount, points_redeemed, points_earned, status, shipping_address, payment_method)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
        [buyerId, 'RC-2026-98102', 279.50, 0.00, 0, 280, 'delivered', '742 Apex Boulevard, Trackside', 'Credit Card (Visa ending 4242)']
      );
      const orderId = orderRes.rows[0].id;

      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
         VALUES ($1, $2, 1, 279.50)`,
        [orderId, gtrId]
      );
    }

    // 10. Seed Upcoming Events
    const eventsData = [
      [
        'RC Battleground 4WD Dirt Grand Prix 2026',
        'rc-battleground-4wd-dirt-grand-prix-2026',
        new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days in future
        'Sector 7 Outdoor Dirt Arena, RC Valley',
        'Off-Road Clay & Dirt Circuit',
        'Premier 1/10 scale 4WD buggy championship tournament. Includes timed heats, main finals, trophy ceremony, and cash prize pool for top 3 drivers.',
        'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=1000&q=80',
        25.00,
        32,
        14
      ],
      [
        'Tokyo Midnight Drift Underground Showdown',
        'tokyo-midnight-drift-underground-showdown',
        new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days in future
        'Polished Concrete Hangar 9, Trackside',
        'Smooth Polished Concrete Gyro Drift Track',
        'High-skill tandem drift battle judged on angle, clipping point accuracy, and proximity. RGB night lighting ambience and live telemetry board.',
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80',
        15.00,
        24,
        18
      ],
      [
        'Apex Monster Bashing Rampage & Stunt Fest',
        'apex-monster-bashing-rampage-and-stunt-fest',
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days in future
        'Heavy-Duty Bashing Pit Arena',
        'Massive Earth Ramps & Obstacle Course',
        'Open bashing event for 4S/6S/8S monster trucks. Max height jump competition, double flip contest, and durability bash showdown.',
        'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1000&q=80',
        20.00,
        40,
        22
      ]
    ];

    for (const ev of eventsData) {
      await client.query(
        `INSERT INTO events (title, slug, event_date, location, track_type, description, image_url, entry_fee, max_participants, registered_count)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        ev
      );
    }

    // 11. Dynamic Site Content
    const siteContentData = [
      [
        'home_slider',
        'RC Battleground Hero Carousel',
        'Admin-managed homepage slider with 5+ promotional slides.',
        {
          slides: [
            { id: 1, title: 'UNLEASH HIGH-SPEED DOMINANCE', description: 'Premium RC cars, parts, and accessories built for champions.', image_url: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=1400&q=80', cta_text: 'SHOP NOW', cta_link: '/catalog', order: 1 },
            { id: 2, title: 'NEW ARRIVALS — DRIFT MASTERS', description: 'Precision-tuned drift machines with gyro-assisted steering.', image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1400&q=80', cta_text: 'VIEW DRIFT CARS', cta_link: '/catalog?category=rc-cars', order: 2 },
            { id: 3, title: 'MONSTER BASHING TRUCKS', description: '6S power. Steel drivetrain. Zero compromises.', image_url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1400&q=80', cta_text: 'EXPLORE TRUCKS', cta_link: '/catalog', order: 3 },
            { id: 4, title: 'MEMBERSHIP REWARDS', description: 'Earn up to 2x points with Pro & Elite tiers.', image_url: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1400&q=80', cta_text: 'JOIN NOW', cta_link: '/membership', order: 4 },
            { id: 5, title: 'RACE EVENTS 2026', description: 'Compete at premier RC racing events across Nepal.', image_url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1400&q=80', cta_text: 'VIEW EVENTS', cta_link: '/events', order: 5 },
          ]
        }
      ],
      [
        'about_us',
        'ENGINEERED FOR THE DISCERNING CONTROLLER',
        'RC Battleground was founded in 2024 by motorsport veterans and RC enthusiasts who demanded zero compromises in speed, durability, and craftsmanship.\n\nFrom high-voltage 6S bashing trucks to sub-millimeter gyro drift chassis, we curate only elite competition-grade remote control vehicles and accessories. Our mission is simple: provide raw performance backed by transparent rewards and VIP trackside service.',
        { stats: [{ label: 'RC Vehicles Delivered', value: '12,500+' }, { label: 'Track Records Broken', value: '450+' }, { label: 'Active Drivers', value: '8,200+' }] }
      ],
      [
        'contact_info',
        'GET IN TOUCH WITH THE PIT CREW',
        'Have technical questions about gear ratios, ESC programming, or order status? Our pit crew is standing by 24/7.',
        { email: 'support@rcbattleground.com', phone: '+1 (800) 555-RCBG', address: '100 Speed Arena Way, Sector 7, RC Valley', hours: 'Mon - Sun: 8:00 AM - 10:00 PM EST' }
      ]
    ];

    for (const sc of siteContentData) {
      await client.query(
        `INSERT INTO site_content (key, title, content, metadata) VALUES ($1, $2, $3, $4)`,
        [sc[0], sc[1], sc[2], JSON.stringify(sc[3])]
      );
    }

    console.log('🎉 DB Initialization & Seeding Completed Successfully!');
  } catch (err) {
    console.error('❌ Error initializing database:', err);
  } finally {
    client.release();
    pool.end();
  }
}

initDatabase();

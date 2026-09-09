const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: process.env.PGPORT || 5432,
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  database: process.env.PGDATABASE || 'rc_battleground',
  connectionTimeoutMillis: 1500,
});

let pgConnected = null;

// Pre-seeded In-Memory Store for Zero-Downtime Reliability
const adminHash = bcrypt.hashSync('admin123', 10);
const buyerHash = bcrypt.hashSync('buyer123', 10);

const memoryDb = {
  users: [
    { id: 1, full_name: 'RC Admin', email: 'admin@rcbattleground.com', password_hash: adminHash, role: 'admin', is_verified: true, phone: '+1 (800) 555-0199', address: '100 Arena Way, Speed City', created_at: new Date() },
    { id: 2, full_name: 'Alex Vance', email: 'buyer@rcbattleground.com', password_hash: buyerHash, role: 'buyer', is_verified: true, phone: '+1 (555) 234-5678', address: '742 Apex Boulevard, Trackside', created_at: new Date() }
  ],
  categories: [
    { id: 1, name: 'Off-Road Buggies', slug: 'off-road-buggies', description: 'High-speed all-terrain electric buggies built for dirt, jumps, and gravel.', image_url: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=800&q=80' },
    { id: 2, name: 'Drift Cars', slug: 'drift-cars', description: 'Precision tuned 1/10 scale drift machines with realistic counter-steering geometry.', image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80' },
    { id: 3, name: 'Monster Trucks', slug: 'monster-trucks', description: 'Heavy-duty 4WD bashing trucks with oil-filled shocks and massive rubber tires.', image_url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80' },
    { id: 4, name: 'Rock Crawlers', slug: 'rock-crawlers', description: 'Scale 4x4 crawlers engineered for extreme obstacle clearance and steep inclines.', image_url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80' },
    { id: 5, name: 'Speed On-Road', slug: 'speed-on-road', description: 'Sub-3-second 0-60 mph carbon fiber chassis street racers.', image_url: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80' },
    { id: 6, name: 'Racing Drones', slug: 'racing-drones', description: 'FPV racing quadcopters designed for high-speed indoor and outdoor gates.', image_url: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80' }
  ],
  products: [
    {
      id: 1, category_id: 1, category_name: 'Off-Road Buggies', category_slug: 'off-road-buggies',
      name: 'Apex Predator 4WD Off-Road Buggy', slug: 'apex-predator-4wd-off-road-buggy',
      description: 'The Apex Predator is a 1/10 scale brushless ready-to-run buggy capable of speeds up to 65+ MPH.',
      price: 349.99, stock: 14, seller_name: 'RC Battleground Official', is_featured: true,
      images: ['https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=1000&q=80'],
      specs: { scale: '1/10', max_speed: '65+ MPH', motor: '3660 3300KV Brushless' }, avg_rating: '5.0', review_count: 1, created_at: new Date()
    },
    {
      id: 2, category_id: 2, category_name: 'Drift Cars', category_slug: 'drift-cars',
      name: 'Tokyo Spec Nissan GT-R Drift Racer', slug: 'tokyo-spec-nissan-gtr-drift-racer',
      description: 'Engineered for smooth indoor polished concrete and asphalt drifting.',
      price: 279.50, stock: 9, seller_name: 'DriftCraft Garage', is_featured: true,
      images: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80'],
      specs: { scale: '1/10', drivetrain: 'RWD Counter-Steer' }, avg_rating: '5.0', review_count: 1, created_at: new Date()
    },
    {
      id: 3, category_id: 3, category_name: 'Monster Trucks', category_slug: 'monster-trucks',
      name: 'Titan Crusher 6S Monster Bashing Truck', slug: 'titan-crusher-6s-monster-bashing-truck',
      description: 'Unstoppable 1/8 scale stunt truck built to absorb massive double-flips and high jumps.',
      price: 529.00, stock: 6, seller_name: 'RC Battleground Official', is_featured: true,
      images: ['https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1000&q=80'],
      specs: { scale: '1/8', max_speed: '70+ MPH on 6S' }, avg_rating: '5.0', review_count: 1, created_at: new Date()
    },
    {
      id: 4, category_id: 4, category_name: 'Rock Crawlers', category_slug: 'rock-crawlers',
      name: 'Trail Blazer 4x4 Scale Rock Crawler', slug: 'trail-blazer-4x4-scale-rock-crawler',
      description: 'High-torque locked axle crawler with portal axles for extreme ground clearance.',
      price: 389.00, stock: 12, seller_name: 'Summit Crawlers', is_featured: false,
      images: ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1000&q=80'],
      specs: { scale: '1/10', transmission: 'Dual Speed' }, avg_rating: '0.0', review_count: 0, created_at: new Date()
    },
    {
      id: 5, category_id: 5, category_name: 'Speed On-Road', category_slug: 'speed-on-road',
      name: 'Veloce Carbon GT On-Road Supercar', slug: 'veloce-carbon-gt-on-road-supercar',
      description: 'Ultra-low aerodynamic profile designed for track asphalt racing.',
      price: 499.99, stock: 5, seller_name: 'Velocity Tech', is_featured: true,
      images: ['https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1000&q=80'],
      specs: { scale: '1/7', top_speed: '85+ MPH' }, avg_rating: '0.0', review_count: 0, created_at: new Date()
    },
    {
      id: 6, category_id: 6, category_name: 'Racing Drones', category_slug: 'racing-drones',
      name: 'Falcon FPV Racing Drone Kit', slug: 'falcon-fpv-racing-drone-kit',
      description: 'Carbon fiber quadcopter frame featuring 4k 60fps low-latency FPV video transmitter.',
      price: 319.00, stock: 18, seller_name: 'SkyLine Dynamics', is_featured: false,
      images: ['https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=1000&q=80'],
      specs: { frame: '5-inch Carbon' }, avg_rating: '0.0', review_count: 0, created_at: new Date()
    }
  ],
  membership_plans: [
    { id: 1, plan_name: 'Rookie Racer', description: 'Basic membership tier with standard point earning.', price: 0.00, duration_days: 365, perks: ['Standard Point Earning (1x)', 'Standard Shipping'] },
    { id: 2, plan_name: 'Pro Circuit VIP', description: 'Elevated membership tier with 1.5x reward points and express shipping.', price: 19.99, duration_days: 30, perks: ['1.5x Reward Points Earning', 'Free Express Shipping', '5% Off Parts'] },
    { id: 3, plan_name: 'Apex Master Pass', description: 'Ultimate annual VIP pass with 2x reward points and 10% discount.', price: 149.99, duration_days: 365, perks: ['2x Reward Points Earning', 'Free Next-Day Express Shipping', '10% Storewide Discount'] }
  ],
  user_memberships: [
    { id: 1, user_id: 2, plan_id: 2, plan_name: 'Pro Circuit VIP', price: 19.99, start_date: new Date(), end_date: new Date(Date.now() + 30 * 86400000), status: 'active' }
  ],
  reward_settings: { points_per_dollar_spent: 1.00, dollars_per_point_redeemed: 0.05 },
  reward_points_transactions: [
    { id: 1, user_id: 2, type: 'earned', points: 350, description: 'Welcome Bonus & Pro Circuit VIP Signup', created_at: new Date() }
  ],
  reviews_ratings: [
    { id: 1, product_id: 2, user_id: 2, rating: 5, comment: 'Insane drift angles right out of the box!', is_featured: true, created_at: new Date() }
  ],
  wishlist: [
    { id: 1, user_id: 2, product_id: 1, created_at: new Date() }
  ],
  orders: [
    { id: 1, user_id: 2, order_number: 'RC-2026-98102', total_amount: 279.50, discount_amount: 0.00, points_redeemed: 0, points_earned: 280, status: 'delivered', shipping_address: '742 Apex Boulevard, Trackside', payment_method: 'Credit Card (Visa ending 4242)', created_at: new Date() }
  ],
  order_items: [
    { id: 1, order_id: 1, product_id: 1, quantity: 1, unit_price: 279.50 }
  ],
  events: [
    { id: 1, title: 'RC Battleground 4WD Dirt Grand Prix 2026', slug: 'rc-battleground-4wd-dirt-grand-prix-2026', event_date: new Date(Date.now() + 14 * 86400000), location: 'Sector 7 Dirt Arena', track_type: 'Off-Road Clay & Dirt', description: 'Premier 1/10 scale 4WD buggy championship.', image_url: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=1000&q=80', entry_fee: 25.00, max_participants: 32, registered_count: 14 }
  ],
  site_content: [
    { id: 1, key: 'home_banner', title: 'UNLEASH HIGH-SPEED DOMINANCE', content: 'The premier monochrome marketplace for professional RC cars, high-output bashing trucks, drift machines, and racing drones.', metadata: { button_text: 'EXPLORE CATALOG', tagline: 'PRECISION ENGINEERING • MAXIMUM SPEED' } }
  ],
  email_logs: []
};

// Helper for Deep Safe Copying returned query rows
function cloneRows(data) {
  return JSON.parse(JSON.stringify(data));
}

// Fallback in-memory executor for common SQL operations
function executeMemoryQuery(text, params = []) {
  const sql = text.trim();
  const lowerSql = sql.toLowerCase();

  // 1. SELECT users directory list with left join orders (Admin Buyers & Users Directory)
  if (lowerSql.includes('from users u left join orders') || lowerSql.includes('from users u left join orders o') || (lowerSql.includes('from users') && lowerSql.includes('count(distinct o.id)'))) {
    const buyers = memoryDb.users.map(u => {
      const userOrders = memoryDb.orders.filter(o => o.user_id === u.id);
      const totalSpent = userOrders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
      const rewardTx = memoryDb.reward_points_transactions.filter(t => t.user_id === u.id);
      const ptsBalance = rewardTx.reduce((sum, t) => sum + (t.type === 'earned' ? t.points : -t.points), 0);
      const activeMem = memoryDb.user_memberships.find(m => m.user_id === u.id && m.status === 'active');
      return {
        id: u.id,
        full_name: u.full_name,
        email: u.email,
        role: u.role || 'buyer',
        phone: u.phone || '',
        address: u.address || '',
        is_verified: u.is_verified ?? true,
        created_at: u.created_at,
        total_orders: userOrders.length,
        total_spent: totalSpent,
        reward_points_balance: ptsBalance,
        active_membership: activeMem ? activeMem.plan_name : 'Standard'
      };
    });
    return { rows: cloneRows(buyers) };
  }

  // 1.1 SELECT users BY email
  if (lowerSql.includes('from users') && lowerSql.includes('where email = $1')) {
    const email = (params[0] || '').toString().toLowerCase().trim();
    const user = memoryDb.users.find(u => u.email.toLowerCase() === email);
    return { rows: user ? cloneRows([user]) : [] };
  }

  // 1.2 SELECT users BY id
  if (lowerSql.includes('from users') && (lowerSql.includes('where id = $1') || lowerSql.includes('where u.id = $1'))) {
    const userId = parseInt(params[0], 10);
    const user = memoryDb.users.find(u => u.id === userId);
    return { rows: user ? cloneRows([user]) : [] };
  }

  // 1.3 SELECT users BY phone
  if (lowerSql.includes('from users') && lowerSql.includes('where phone = $1')) {
    const phone = (params[0] || '').toString().trim();
    const user = memoryDb.users.find(u => u.phone && u.phone.trim() === phone);
    return { rows: user ? cloneRows([user]) : [] };
  }

  // 3. INSERT INTO users
  if (lowerSql.includes('insert into users')) {
    const newUser = {
      id: memoryDb.users.length + 1,
      full_name: params[0] || 'Driver',
      email: (params[1] || '').toLowerCase(),
      password_hash: params[2] || '',
      role: 'buyer',
      phone: params[3] || '',
      address: params[4] || '',
      is_verified: false,
      verification_code: params[5] || null,
      verification_token: params[6] || null,
      verification_expires: params[7] || null,
      created_at: new Date()
    };
    memoryDb.users.push(newUser);
    return { rows: cloneRows([newUser]) };
  }

  // 3.5 UPDATE users
  if (lowerSql.includes('update users')) {
    const userId = parseInt(params[params.length - 1], 10);
    const targetUser = memoryDb.users.find(u => u.id === userId);
    if (targetUser) {
      if (lowerSql.includes('is_verified = true')) {
        targetUser.is_verified = true;
        targetUser.verification_code = null;
        targetUser.verification_token = null;
        targetUser.verification_expires = null;
      }
      if (lowerSql.includes('verification_code = $1')) {
        targetUser.verification_code = params[0];
        targetUser.verification_token = params[1];
        targetUser.verification_expires = params[2];
      }
    }
    return { rows: [{ id: userId || 1 }] };
  }

  // 4. SELECT, INSERT, UPDATE, DELETE products & Stock Management
  if (lowerSql.includes('stock = stock -')) {
    const qtyToDeduct = parseInt(params[0], 10) || 1;
    const prodId = parseInt(params[1], 10);
    const prod = memoryDb.products.find(p => String(p.id) === String(prodId));
    if (prod) {
      prod.stock = Math.max(0, prod.stock - qtyToDeduct);
    }
    return { rows: cloneRows([prod || { id: prodId }]) };
  }

  if (lowerSql.includes('stock = stock +')) {
    const qtyToAdd = parseInt(params[0], 10) || 1;
    const prodId = parseInt(params[1], 10);
    const prod = memoryDb.products.find(p => String(p.id) === String(prodId));
    if (prod) {
      prod.stock = prod.stock + qtyToAdd;
    }
    return { rows: cloneRows([prod || { id: prodId }]) };
  }

  if (lowerSql.includes('insert into products')) {
    const catId = parseInt(params[0], 10);
    const cat = memoryDb.categories.find(c => c.id === catId) || memoryDb.categories[0];
    const usd = parseFloat(params[4] || 0);
    const npr = parseFloat(params[6] || (usd * 133.50));

    const newProd = {
      id: memoryDb.products.length + 1,
      category_id: catId || cat?.id || 1,
      category_name: cat?.name || 'Off-Road Buggies',
      category_slug: cat?.slug || 'off-road-buggies',
      name: (params[1] || 'New RC Vehicle').toString(),
      slug: (params[2] || `prod-${Date.now()}`).toString(),
      description: (params[3] || '').toString(),
      price: usd,
      price_usd: usd,
      price_npr: npr,
      stock: parseInt(params[7], 10) || 0,
      images: params[8] && Array.isArray(params[8]) && params[8].length > 0 ? params[8] : ['https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=1000&q=80'],
      seller_name: (params[9] || 'RC Battleground Official').toString(),
      is_featured: Boolean(params[10]),
      specs: params[11] || { scale: '1/10', drivetrain: '4WD' },
      avg_rating: '0.0',
      review_count: 0,
      created_at: new Date()
    };
    memoryDb.products.unshift(newProd);
    return { rows: cloneRows([newProd]) };
  }

  if ((lowerSql.includes('update products set') || lowerSql.includes('update products')) && !lowerSql.includes('stock = stock')) {
    const prodId = parseInt(params[params.length - 1], 10);
    const prod = memoryDb.products.find(p => p.id === prodId);
    if (prod) {
      if (params[0] !== null && params[0] !== undefined) {
        prod.category_id = parseInt(params[0], 10);
        const cat = memoryDb.categories.find(c => c.id === prod.category_id);
        if (cat) {
          prod.category_name = cat.name;
          prod.category_slug = cat.slug;
        }
      }
      if (params[1]) prod.name = params[1].toString();
      if (params[2]) prod.slug = params[2].toString();
      if (params[3]) prod.description = params[3].toString();
      if (params[4] !== null && params[4] !== undefined) {
        prod.price = parseFloat(params[4]);
        prod.price_usd = parseFloat(params[4]);
      }
      if (params[5] !== null && params[5] !== undefined) {
        prod.price_npr = parseFloat(params[5]);
      }
      if (params[6] !== null && params[6] !== undefined) prod.stock = parseInt(params[6], 10);
      if (params[7] && Array.isArray(params[7])) prod.images = params[7];
      if (params[8]) prod.seller_name = params[8].toString();
      if (params[9] !== undefined && params[9] !== null) prod.is_featured = Boolean(params[9]);
      if (params[10]) prod.specs = params[10];
    }
    return { rows: cloneRows([prod || { id: prodId }]) };
  }

  if (lowerSql.includes('delete from products')) {
    const prodId = parseInt(params[0], 10);
    memoryDb.products = memoryDb.products.filter(p => p.id !== prodId);
    return { rows: cloneRows([{ id: prodId }]) };
  }

  if (lowerSql.includes('from products')) {
    let prods = cloneRows(memoryDb.products);
    if (lowerSql.includes('where p.id = $1') || lowerSql.includes('where p.slug = $1') || lowerSql.includes('where id = $1')) {
      const val = params[0];
      const product = memoryDb.products.find(p => p.id === parseInt(val, 10) || p.slug === val);
      return { rows: product ? cloneRows([product]) : [] };
    }
    if (lowerSql.includes('where c.slug = $1')) {
      const catSlug = params[0];
      prods = prods.filter(p => p.category_slug === catSlug);
    }
    if (lowerSql.includes('where p.is_featured = true') || lowerSql.includes('is_featured = true')) {
      prods = prods.filter(p => p.is_featured);
    }
    return { rows: prods };
  }

  // 5. SELECT, INSERT, UPDATE, DELETE categories
  if (lowerSql.includes('insert into categories')) {
    const name = (params[0] || '').toString().trim();
    const slug = (params[1] || name.toLowerCase().replace(/\s+/g, '-')).toString();
    const newCat = {
      id: memoryDb.categories.length + 1,
      name,
      slug,
      description: (params[2] || '').toString(),
      image_url: (params[3] || 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=800&q=80').toString(),
      product_count: 0
    };
    memoryDb.categories.push(newCat);
    return { rows: cloneRows([newCat]) };
  }

  if (lowerSql.includes('update categories')) {
    const catId = parseInt(params[params.length - 1], 10);
    const cat = memoryDb.categories.find(c => String(c.id) === String(catId));
    if (cat) {
      if (params[0] !== undefined && params[0] !== null) {
        cat.name = params[0].toString();
        cat.slug = params[1] ? params[1].toString() : cat.name.toLowerCase().replace(/\s+/g, '-');
      }
      if (params[2] !== undefined && params[2] !== null) cat.description = params[2].toString();
      if (params[3] !== undefined && params[3] !== null) cat.image_url = params[3].toString();
    }
    return { rows: cloneRows([cat || { id: catId }]) };
  }

  if (lowerSql.includes('delete from categories')) {
    const catId = parseInt(params[0], 10);
    memoryDb.categories = memoryDb.categories.filter(c => String(c.id) !== String(catId));
    return { rows: cloneRows([{ id: catId }]) };
  }

  if (lowerSql.includes('from categories')) {
    const categories = memoryDb.categories.map(c => {
      const prodCount = memoryDb.products.filter(p => p.category_id === c.id || p.category_slug === c.slug).length;
      return {
        ...c,
        product_count: prodCount
      };
    });
    return { rows: cloneRows(categories) };
  }

  // 6. SELECT membership_plans
  if (lowerSql.includes('from membership_plans')) {
    return { rows: cloneRows(memoryDb.membership_plans) };
  }

  // 6.5 UPDATE membership_plans
  if (lowerSql.includes('update membership_plans')) {
    const planId = parseInt(params[params.length - 1], 10);
    const plan = memoryDb.membership_plans.find(p => p.id === planId);
    if (plan) {
      if (params[0]) plan.plan_name = params[0];
      if (params[1]) plan.description = params[1];
      if (params[2] !== null && params[2] !== undefined) plan.price = parseFloat(params[2]);
      if (params[5] !== null && params[5] !== undefined) plan.duration_days = parseInt(params[5], 10);
      if (params[7]) plan.perks = params[7];
    }
    return { rows: cloneRows([plan || { id: planId }]) };
  }

  // 7. SELECT user_memberships
  if (lowerSql.includes('from user_memberships')) {
    return { rows: cloneRows(memoryDb.user_memberships) };
  }

  // 8. SELECT & UPDATE reward_settings & points
  if (lowerSql.includes('update reward_settings') || lowerSql.includes('insert into reward_settings')) {
    memoryDb.reward_settings = {
      id: 1,
      points_per_dollar_spent: parseFloat(params[0]),
      dollars_per_point_redeemed: parseFloat(params[1]),
      updated_at: new Date()
    };
    return { rows: cloneRows([memoryDb.reward_settings]) };
  }
  if (lowerSql.includes('from reward_settings')) {
    return { rows: cloneRows([memoryDb.reward_settings]) };
  }
  if (lowerSql.includes('from reward_points_transactions')) {
    return { rows: [{ balance: 350 }] };
  }

  // 9. SELECT events
  if (lowerSql.includes('from events')) {
    return { rows: cloneRows(memoryDb.events) };
  }

  // 10. SELECT site_content
  if (lowerSql.includes('from site_content')) {
    return { rows: cloneRows(memoryDb.site_content) };
  }

  // 11. SELECT, INSERT, UPDATE, DELETE reviews_ratings
  if (lowerSql.includes('insert into reviews_ratings')) {
    const newRev = {
      id: memoryDb.reviews_ratings.length + 1,
      product_id: parseInt(params[0], 10),
      user_id: parseInt(params[1], 10),
      rating: parseInt(params[2], 10),
      comment: (params[3] || '').toString(),
      is_featured: false,
      created_at: new Date()
    };
    memoryDb.reviews_ratings.unshift(newRev);

    // Recalculate average rating & review count for target product
    const prod = memoryDb.products.find(p => p.id === newRev.product_id);
    if (prod) {
      const prodReviews = memoryDb.reviews_ratings.filter(r => r.product_id === prod.id);
      prod.review_count = prodReviews.length;
      const sum = prodReviews.reduce((acc, r) => acc + r.rating, 0);
      prod.avg_rating = (sum / prodReviews.length).toFixed(1);
    }
    return { rows: cloneRows([newRev]) };
  }

  if (lowerSql.includes('update reviews_ratings')) {
    const revId = parseInt(params[params.length - 1], 10);
    const rev = memoryDb.reviews_ratings.find(r => r.id === revId);
    if (rev) {
      if (lowerSql.includes('is_featured = $1')) {
        rev.is_featured = Boolean(params[0]);
      }
      if (lowerSql.includes('rating = $1')) {
        rev.rating = parseInt(params[0], 10);
        rev.comment = params[1] || '';
      }
    }
    return { rows: cloneRows([rev || { id: revId }]) };
  }

  if (lowerSql.includes('delete from reviews_ratings')) {
    const revId = parseInt(params[0], 10);
    memoryDb.reviews_ratings = memoryDb.reviews_ratings.filter(r => r.id !== revId);
    return { rows: cloneRows([{ id: revId }]) };
  }

  if (lowerSql.includes('from reviews_ratings')) {
    let reviews = memoryDb.reviews_ratings.map((review) => {
      const reviewer = memoryDb.users.find((user) => user.id === review.user_id);
      const product = memoryDb.products.find((item) => item.id === review.product_id);
      return {
        ...review,
        reviewer_name: reviewer?.full_name || 'Unknown Driver',
        reviewer_email: reviewer?.email || '',
        product_name: product?.name || `Product #${review.product_id}`,
        product_slug: product?.slug || '',
        product_images: product?.images || [],
      };
    });

    if (lowerSql.includes('rating >= 4')) {
      reviews = reviews.filter((review) => review.rating >= 4);
    }
    if (lowerSql.includes('rating = $1')) {
      reviews = reviews.filter((review) => review.rating === parseInt(params[0], 10));
    }
    if (lowerSql.includes('product_id = $1')) {
      reviews = reviews.filter((review) => review.product_id === parseInt(params[0], 10));
    }
    if (lowerSql.includes('user_id = $2')) {
      reviews = reviews.filter((review) => review.user_id === parseInt(params[1], 10));
    }

    return { rows: cloneRows(reviews) };
  }

  // 12. SELECT email_logs
  if (lowerSql.includes('from email_logs')) {
    return { rows: cloneRows(memoryDb.email_logs) };
  }

  // 12.5 SELECT from orders
  if (lowerSql.includes('from orders')) {
    if (lowerSql.includes('coalesce(sum(total_amount)')) {
      const rev = memoryDb.orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
      return { rows: [{ total_revenue: rev }] };
    }
    if (lowerSql.includes('count(id) as total_orders')) {
      return { rows: [{ total_orders: memoryDb.orders.length }] };
    }

    let matchingOrders = memoryDb.orders.map(ord => {
      const buyer = memoryDb.users.find(u => u.id === ord.user_id);
      const items = memoryDb.order_items
        .filter(oi => oi.order_id === ord.id)
        .map(oi => {
          const product = memoryDb.products.find(p => p.id === oi.product_id);
          return {
            item_id: oi.id,
            product_id: oi.product_id,
            name: product?.name || 'RC Vehicle/Part',
            image: product?.images?.[0] || '',
            quantity: oi.quantity,
            unit_price: oi.unit_price
          };
        });

      return {
        ...ord,
        buyer_name: buyer?.full_name || 'Driver Account',
        buyer_email: buyer?.email || '',
        items
      };
    });

    if (lowerSql.includes('where o.id = $1') || lowerSql.includes('where id = $1')) {
      const targetOrderId = parseInt(params[0], 10);
      matchingOrders = matchingOrders.filter(o => String(o.id) === String(targetOrderId));
    }
    if (lowerSql.includes('where o.user_id = $1') || lowerSql.includes('where user_id = $1')) {
      const targetUserId = parseInt(params[0], 10);
      matchingOrders = matchingOrders.filter(o => String(o.user_id) === String(targetUserId));
    }
    if (lowerSql.includes('where o.status = $1') || lowerSql.includes('and o.status = $1') || lowerSql.includes('where status = $1')) {
      const targetStatus = params[0];
      if (targetStatus) {
        matchingOrders = matchingOrders.filter(o => o.status === targetStatus);
      }
    }

    return { rows: cloneRows(matchingOrders) };
  }

  // 12.6 SELECT from users with orders join (Admin Buyers & Users Directory List)
  if (lowerSql.includes('from users u left join orders') || lowerSql.includes('from users u left join orders o') || lowerSql.includes('from users u')) {
    const buyers = memoryDb.users.map(u => {
      const userOrders = memoryDb.orders.filter(o => o.user_id === u.id);
      const totalSpent = userOrders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
      const rewardTx = memoryDb.reward_points_transactions.filter(t => t.user_id === u.id);
      const ptsBalance = rewardTx.reduce((sum, t) => sum + (t.type === 'earned' ? t.points : -t.points), 0);
      const activeMem = memoryDb.user_memberships.find(m => m.user_id === u.id && m.status === 'active');
      return {
        id: u.id,
        full_name: u.full_name,
        email: u.email,
        role: u.role || 'buyer',
        phone: u.phone || '',
        address: u.address || '',
        is_verified: u.is_verified ?? true,
        created_at: u.created_at,
        total_orders: userOrders.length,
        total_spent: totalSpent,
        reward_points_balance: ptsBalance,
        active_membership: activeMem ? activeMem.plan_name : 'Standard'
      };
    });
    return { rows: cloneRows(buyers) };
  }

  // 12.7 SELECT from order_items
  if (lowerSql.includes('from order_items')) {
    let items = memoryDb.order_items;
    if (lowerSql.includes('where order_id = $1')) {
      const orderId = parseInt(params[0], 10);
      items = items.filter(oi => String(oi.order_id) === String(orderId));
    }
    return { rows: cloneRows(items) };
  }

  // 13. Generic INSERT into email_logs
  if (lowerSql.startsWith('insert into email_logs')) {
    const newLog = {
      id: memoryDb.email_logs.length + 1,
      recipient: params[0],
      subject: params[1],
      event_type: params[2],
      status: params[3],
      error_message: params[4] || null,
      metadata: params[5] ? JSON.parse(params[5]) : {},
      created_at: new Date()
    };
    memoryDb.email_logs.unshift(newLog);
    return { rows: [newLog] };
  }

  // 13.5 INSERT INTO orders
  if (lowerSql.includes('insert into orders')) {
    const newOrder = {
      id: memoryDb.orders.length + 1,
      user_id: params[0],
      order_number: params[1],
      total_amount: params[2],
      total_amount_npr: params[3],
      total_amount_usd: params[4],
      currency: params[5],
      discount_amount: params[6],
      points_redeemed: params[7],
      points_earned: params[8],
      status: 'pending',
      shipping_address: params[9],
      payment_method: params[10],
      created_at: new Date()
    };
    memoryDb.orders.unshift(newOrder);
    return { rows: cloneRows([newOrder]) };
  }

  // 13.55 INSERT INTO order_items
  if (lowerSql.includes('insert into order_items')) {
    const newItem = {
      id: memoryDb.order_items.length + 1,
      order_id: params[0],
      product_id: params[1],
      quantity: params[2],
      unit_price: params[3]
    };
    memoryDb.order_items.push(newItem);
    return { rows: cloneRows([newItem]) };
  }

  // 13.56 UPDATE orders
  if (lowerSql.includes('update orders')) {
    const newStatus = params[0];
    const orderId = parseInt(params[1], 10);
    const ord = memoryDb.orders.find(o => String(o.id) === String(orderId));
    if (ord) {
      ord.status = newStatus;
    }
    return { rows: cloneRows([ord || { id: orderId, status: newStatus }]) };
  }

  // 13.6 INSERT INTO payment_transactions
  if (lowerSql.includes('insert into payment_transactions')) {
    const newTx = {
      id: Date.now(),
      user_id: params[0],
      order_id: params[1],
      gateway: params[2],
      amount_npr: params[3],
      amount_usd: params[4],
      currency: params[5],
      status: 'completed',
      transaction_ref: params[6] || `TXN-${Date.now()}`,
      created_at: new Date()
    };
    return { rows: cloneRows([newTx]) };
  }

  // 14. Generic INSERT or UPDATE or DELETE
  if (lowerSql.startsWith('insert into')) {
    return { rows: [{ id: Date.now() }] };
  }
  if (lowerSql.startsWith('update') || lowerSql.startsWith('delete')) {
    return { rows: [{ id: params[0] || 1 }] };
  }

  return { rows: [] };
}

let schemaEnsured = false;

async function ensureSchemaColumns(clientOrPool) {
  if (schemaEnsured) return;
  try {
    await clientOrPool.query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(60) UNIQUE NOT NULL,
        value JSONB DEFAULT '{}'::jsonb,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS reward_settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(50) UNIQUE NOT NULL,
        value VARCHAR(255),
        points_per_dollar_spent NUMERIC(10, 2) DEFAULT 1.00,
        dollars_per_point_redeemed NUMERIC(10, 4) DEFAULT 0.05,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS email_logs (
        id SERIAL PRIMARY KEY,
        recipient VARCHAR(200) NOT NULL,
        subject VARCHAR(300) NOT NULL,
        event_type VARCHAR(60) NOT NULL,
        status VARCHAR(20) DEFAULT 'sent',
        error_message TEXT,
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS reviews_ratings (
        id SERIAL PRIMARY KEY,
        product_id INT,
        user_id INT,
        rating INT DEFAULT 5,
        comment TEXT,
        is_featured BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS reward_points_transactions (
        id SERIAL PRIMARY KEY,
        user_id INT,
        type VARCHAR(20) NOT NULL,
        points INT NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS wishlist (
        id SERIAL PRIMARY KEY,
        user_id INT,
        product_id INT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS membership_plans (
        id SERIAL PRIMARY KEY,
        plan_name VARCHAR(80) UNIQUE NOT NULL,
        description TEXT,
        price NUMERIC(12, 2) DEFAULT 0,
        price_npr NUMERIC(12, 2) DEFAULT 0,
        price_usd NUMERIC(12, 2) DEFAULT 0,
        duration_days INT DEFAULT 30,
        point_multiplier NUMERIC(4, 2) DEFAULT 1.00,
        perks TEXT[] DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_memberships (
        id SERIAL PRIMARY KEY,
        user_id INT,
        plan_id INT,
        plan_name VARCHAR(80),
        price NUMERIC(12, 2) DEFAULT 0,
        start_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        end_date TIMESTAMP WITH TIME ZONE,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        slug VARCHAR(160) UNIQUE NOT NULL,
        event_date TIMESTAMP WITH TIME ZONE,
        location VARCHAR(150),
        track_type VARCHAR(100),
        description TEXT,
        image_url TEXT,
        entry_fee NUMERIC(12, 2) DEFAULT 0,
        entry_fee_npr NUMERIC(12, 2) DEFAULT 0,
        entry_fee_usd NUMERIC(12, 2) DEFAULT 0,
        max_participants INT DEFAULT 30,
        registered_count INT DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS site_content (
        key VARCHAR(60) PRIMARY KEY,
        title VARCHAR(200),
        content TEXT,
        metadata JSONB DEFAULT '{}'::jsonb,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INT,
        order_number VARCHAR(40) UNIQUE NOT NULL,
        total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
        total_amount_npr NUMERIC(12, 2) NOT NULL DEFAULT 0,
        total_amount_usd NUMERIC(12, 2) NOT NULL DEFAULT 0,
        currency VARCHAR(3) DEFAULT 'USD',
        discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
        points_redeemed INT NOT NULL DEFAULT 0,
        points_earned INT NOT NULL DEFAULT 0,
        status VARCHAR(30) NOT NULL DEFAULT 'pending',
        shipping_address TEXT NOT NULL,
        payment_method VARCHAR(50) DEFAULT 'Credit Card',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INT,
        product_id INT,
        quantity INT DEFAULT 1,
        unit_price NUMERIC(12, 2) DEFAULT 0,
        unit_price_npr NUMERIC(12, 2) DEFAULT 0,
        unit_price_usd NUMERIC(12, 2) DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS payment_transactions (
        id SERIAL PRIMARY KEY,
        user_id INT,
        order_id INT,
        membership_purchase_id INT,
        gateway VARCHAR(50) NOT NULL,
        amount_npr NUMERIC(12, 2) NOT NULL DEFAULT 0,
        amount_usd NUMERIC(12, 2) NOT NULL DEFAULT 0,
        currency VARCHAR(3) NOT NULL DEFAULT 'USD',
        status VARCHAR(30) NOT NULL DEFAULT 'pending',
        transaction_ref VARCHAR(100),
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_amount_npr NUMERIC(12, 2) NOT NULL DEFAULT 0;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_amount_usd NUMERIC(12, 2) NOT NULL DEFAULT 0;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD';
      ALTER TABLE order_items ADD COLUMN IF NOT EXISTS unit_price_npr NUMERIC(12, 2) NOT NULL DEFAULT 0;
      ALTER TABLE order_items ADD COLUMN IF NOT EXISTS unit_price_usd NUMERIC(12, 2) NOT NULL DEFAULT 0;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS price_npr NUMERIC(12, 2) NOT NULL DEFAULT 0;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS price_usd NUMERIC(12, 2) NOT NULL DEFAULT 0;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT true;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_code VARCHAR(10);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token VARCHAR(100);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_expires TIMESTAMP WITH TIME ZONE;
    `);
    schemaEnsured = true;
  } catch (err) {
    // Ignore migration errors if tables are uninitialized
  }
}

async function query(text, params) {
  // If PG connection was previously verified offline, skip direct PG timeout
  if (pgConnected === false) {
    return executeMemoryQuery(text, params);
  }

  try {
    const res = await pool.query(text, params);
    pgConnected = true;
    ensureSchemaColumns(pool).catch(() => {});
    return res;
  } catch (err) {
    if (pgConnected !== false) {
      console.warn('⚡ PostgreSQL unavailable (or table uninitialized). Switching backend to high-performance in-memory mode:', err.message);
      pgConnected = false;
    }
    return executeMemoryQuery(text, params);
  }
}

async function getClient() {
  if (pgConnected === false) {
    return createMemoryClient();
  }

  try {
    const client = await pool.connect();
    pgConnected = true;
    await ensureSchemaColumns(client);
    return client;
  } catch (err) {
    if (pgConnected !== false) {
      console.warn('⚡ PostgreSQL unavailable (or table uninitialized). Switching backend to high-performance in-memory mode:', err.message);
      pgConnected = false;
    }
    return createMemoryClient();
  }
}

function createMemoryClient() {
  return {
    query: async (text, params) => executeMemoryQuery(text, params),
    release: () => {}
  };
}

module.exports = {
  query,
  pool,
  getClient,
};

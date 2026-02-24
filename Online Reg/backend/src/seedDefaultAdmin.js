/**
 * Seed default admin: EVT / 00533prince2@EVT
 * Run on startup so this is the only valid login unless changed in DB.
 */
const Admin = require('./models/Admin');

const DEFAULT_USERNAME = process.env.DEFAULT_ADMIN_USERNAME || 'EVT';
const DEFAULT_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || '00533prince2@EVT';
const DEFAULT_EMAIL = process.env.DEFAULT_ADMIN_EMAIL || 'evt@pchsbamenda.edu';

async function seedDefaultAdmin() {
  try {
    const existing = await Admin.findByUsername(DEFAULT_USERNAME);
    if (existing) {
      console.log('[Seed] Default admin EVT already exists.');
      return;
    }
    await Admin.create({
      username: DEFAULT_USERNAME,
      email: DEFAULT_EMAIL,
      password: DEFAULT_PASSWORD,
      fullName: 'Default Admin (EVT)',
      roleId: 1,
    });
    console.log('[Seed] Default admin EVT created.');
  } catch (err) {
    console.error('[Seed] Failed to create default admin:', err.message);
  }
}

module.exports = { seedDefaultAdmin };

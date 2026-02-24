/**
 * Admin authentication controller
 */
const Admin = require('../models/Admin');
const { signToken } = require('../middleware/auth');

/** Allowed admin login: only EVT */
const ALLOWED_USERNAME = process.env.DEFAULT_ADMIN_USERNAME || 'EVT';

/**
 * POST /api/auth/register - Disabled; only default admin EVT is valid.
 */
async function register(req, res) {
  return res.status(403).json({
    success: false,
    message: 'Registration is disabled. Use the default admin login only.',
  });
}

/**
 * POST /api/auth/login - Admin login (only EVT / default password accepted)
 */
async function login(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password required.' });
    }

    // Only the default admin EVT is allowed to log in
    if (String(username).trim() !== ALLOWED_USERNAME) {
      return res.status(401).json({ success: false, message: 'Invalid login name or password.' });
    }

    const admin = await Admin.findByUsername(ALLOWED_USERNAME);
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid login name or password.' });
    }

    const valid = await Admin.verifyPassword(password, admin.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid login name or password.' });
    }

    await Admin.updateLastLogin(admin.id);
    const token = signToken({ id: admin.id, username: admin.username });
    res.json({
      success: true,
      token,
      user: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        fullName: admin.full_name,
      },
    });
  } catch (err) {
    console.error('[Auth] Login error:', err);
    res.status(500).json({ success: false, message: 'Login failed.' });
  }
}

/**
 * GET /api/auth/me - Current user (protected)
 */
async function me(req, res) {
  try {
    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({
      success: true,
      user: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        fullName: admin.full_name,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
}

module.exports = { register, login, me };

/**
 * Admin model - authentication & authorization
 */
const db = require('../config/database');
const bcrypt = require('bcryptjs');

const Admin = {
  /**
   * Find admin by username
   */
  async findByUsername(username) {
    const [rows] = await db.execute(
      'SELECT id, username, email, password_hash, full_name, role_id, is_active FROM admins WHERE username = ? AND is_active = 1',
      [username]
    );
    return rows[0] || null;
  },

  /**
   * Find admin by id
   */
  async findById(id) {
    const [rows] = await db.execute(
      'SELECT id, username, email, full_name, role_id FROM admins WHERE id = ? AND is_active = 1',
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Create new admin (hashed password)
   */
  async create({ username, email, password, fullName, roleId = 1 }) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const [result] = await db.execute(
      'INSERT INTO admins (username, email, password_hash, full_name, role_id) VALUES (?, ?, ?, ?, ?)',
      [username, email, passwordHash, fullName || null, roleId]
    );
    return result.insertId;
  },

  /**
   * Update last login timestamp
   */
  async updateLastLogin(id) {
    await db.execute('UPDATE admins SET last_login_at = NOW() WHERE id = ?', [id]);
  },

  /**
   * Verify password
   */
  async verifyPassword(plainPassword, hash) {
    return bcrypt.compare(plainPassword, hash);
  },
};

module.exports = Admin;

/**
 * Student model - CRUD for registrations
 */
const db = require('../config/database');

const Student = {
  /**
   * Create new student registration
   */
  async create(data) {
    const [result] = await db.execute(
      `INSERT INTO students (
        full_name, date_of_birth, gender, class_applying_for,
        parent_guardian_name, phone_number, email, address,
        previous_school, passport_photo_path, registration_fee,
        payment_status, payment_provider, payment_phone, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        data.fullName,
        data.dateOfBirth,
        data.gender,
        data.classApplyingFor,
        data.parentGuardianName,
        data.phoneNumber,
        data.email,
        data.address,
        data.previousSchool || null,
        data.passportPhotoPath || null,
        data.registrationFee || null,
        data.paymentStatus || 'pending',
        data.paymentProvider || null,
        data.paymentPhone || null,
      ]
    );
    return result.insertId;
  },

  /**
   * Get all students with optional filters
   */
  async findAll({ status, search, limit = 100, offset = 0 } = {}) {
    let sql = `
      SELECT id, full_name, date_of_birth, gender, class_applying_for,
             parent_guardian_name, phone_number, email, address, previous_school,
             passport_photo_path, registration_fee, payment_status, payment_provider, payment_phone,
             status, reviewed_at, created_at
      FROM students
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }
    if (search) {
      sql += ' AND (full_name LIKE ? OR email LIKE ? OR phone_number LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await db.execute(sql, params);
    return rows;
  },

  /**
   * Get single student by id
   */
  async findById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM students WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Update status (approve/reject)
   */
  async updateStatus(id, status, adminId, notes = null) {
    await db.execute(
      'UPDATE students SET status = ?, reviewed_by = ?, reviewed_at = NOW(), notes = ? WHERE id = ?',
      [status, adminId, notes, id]
    );
    return this.findById(id);
  },

  /**
   * Delete student record
   */
  async delete(id) {
    const [result] = await db.execute('DELETE FROM students WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  /**
   * Count by status (for dashboard)
   */
  async countByStatus() {
    const [rows] = await db.execute(
      "SELECT status, COUNT(*) as count FROM students GROUP BY status"
    );
    return rows;
  },
};

module.exports = Student;

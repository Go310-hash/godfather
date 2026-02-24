/**
 * Student registration controller
 */
const Student = require('../models/Student');
const { getFeeForClass } = require('../config/fees');
const { validationResult } = require('express-validator');

/**
 * POST /api/students - Public registration
 */
async function create(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const classApplyingFor = req.body.classApplyingFor?.trim();
    const registrationFee = getFeeForClass(classApplyingFor) ?? req.body.registrationFee ?? null;
    const paymentProvider = (req.body.paymentProvider || '').trim() || null;
    const paymentPhone = (req.body.paymentPhone || '').trim() || null;

    const data = {
      fullName: req.body.fullName?.trim(),
      dateOfBirth: req.body.dateOfBirth,
      gender: req.body.gender,
      classApplyingFor,
      parentGuardianName: req.body.parentGuardianName?.trim(),
      phoneNumber: req.body.phoneNumber?.trim(),
      email: req.body.email?.trim().toLowerCase(),
      address: req.body.address?.trim(),
      previousSchool: req.body.previousSchool?.trim() || null,
      passportPhotoPath: req.file ? req.file.filename : null,
      registrationFee,
      paymentStatus: 'pending',
      paymentProvider: paymentProvider || null,
      paymentPhone: paymentPhone || null,
    };

    const id = await Student.create(data);
    res.status(201).json({
      success: true,
      message: 'Registration submitted successfully.',
      id,
    });
  } catch (err) {
    console.error('[Student] Create error:', err);
    res.status(500).json({ success: false, message: 'Registration failed.' });
  }
}

/**
 * GET /api/students - List (protected, with filters)
 */
async function list(req, res) {
  try {
    const { status, search, limit, offset } = req.query;
    const students = await Student.findAll({
      status: status || undefined,
      search: search || undefined,
      limit: Math.min(parseInt(limit, 10) || 100, 500),
      offset: parseInt(offset, 10) || 0,
    });
    res.json({ success: true, data: students });
  } catch (err) {
    console.error('[Student] List error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch students.' });
  }
}

/**
 * GET /api/students/stats - Dashboard counts (protected)
 */
async function stats(req, res) {
  try {
    const counts = await Student.countByStatus();
    res.json({ success: true, data: counts });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch stats.' });
  }
}

/**
 * GET /api/students/:id - Single student (protected)
 */
async function getById(req, res) {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }
    res.json({ success: true, data: student });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
}

/**
 * PATCH /api/students/:id/status - Approve/Reject (protected)
 */
async function updateStatus(req, res) {
  try {
    const { status, notes } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }
    const student = await Student.updateStatus(
      req.params.id,
      status,
      req.user.id,
      notes?.trim() || null
    );
    res.json({ success: true, data: student });
  } catch (err) {
    console.error('[Student] Update status error:', err);
    res.status(500).json({ success: false, message: 'Update failed.' });
  }
}

/**
 * DELETE /api/students/:id - Delete record (protected)
 */
async function remove(req, res) {
  try {
    const deleted = await Student.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }
    res.json({ success: true, message: 'Record deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Delete failed.' });
  }
}

/**
 * GET /api/students/export/csv - Export all as CSV (protected)
 */
async function exportCsv(req, res) {
  try {
    const students = await Student.findAll({ limit: 10000 });
    const header = 'Full Name,DOB,Gender,Class,Parent,Phone,Email,Address,Previous School,Registration Fee (XAF),Payment Status,Payment Provider,Payment Phone,Status,Created\n';
    const rows = students.map((s) =>
      [
        `"${(s.full_name || '').replace(/"/g, '""')}"`,
        s.date_of_birth,
        s.gender,
        `"${(s.class_applying_for || '').replace(/"/g, '""')}"`,
        `"${(s.parent_guardian_name || '').replace(/"/g, '""')}"`,
        s.phone_number,
        s.email,
        `"${(s.address || '').replace(/"/g, '""')}"`,
        `"${(s.previous_school || '').replace(/"/g, '""')}"`,
        s.registration_fee ?? '',
        s.payment_status ?? 'pending',
        s.payment_provider ?? '',
        s.payment_phone ?? '',
        s.status,
        s.created_at,
      ].join(',')
    ).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=pchs_students.csv');
    res.send('\uFEFF' + header + rows);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Export failed.' });
  }
}

module.exports = {
  create,
  list,
  stats,
  getById,
  updateStatus,
  remove,
  exportCsv,
};

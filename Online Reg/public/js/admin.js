/**
 * Admin dashboard: stats, student list, search, approve/reject, delete, export CSV
 */
(function () {
  var apiBase = function () {
    return window.location.origin || '';
  };
  var getToken = function () {
    return localStorage.getItem('pchs_admin_token');
  };

  function authHeaders() {
    var t = getToken();
    return t ? { Authorization: 'Bearer ' + t } : {};
  }

  function fetchApi(path, opts) {
    opts = opts || {};
    opts.headers = Object.assign({}, opts.headers, authHeaders());
    if (opts.body && typeof opts.body === 'object' && !(opts.body instanceof FormData)) {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(opts.body);
    }
    return fetch(apiBase() + path, opts).then(function (res) {
      if (res.status === 401) {
        localStorage.removeItem('pchs_admin_token');
        window.location.href = 'login.html?redirect=admin.html';
        return Promise.reject(new Error('Unauthorized'));
      }
      return res.json ? res.json() : res;
    });
  }

  // Redirect if not logged in
  if (!getToken()) {
    window.location.href = 'login.html?redirect=admin.html';
    return;
  }

  var statsGrid = document.getElementById('stats-grid');
  var studentsTbody = document.getElementById('students-tbody');
  var searchInput = document.getElementById('search-input');
  var filterStatus = document.getElementById('filter-status');
  var exportCsvBtn = document.getElementById('export-csv-btn');
  var studentModal = document.getElementById('student-modal');
  var studentModalBody = document.getElementById('student-modal-body');
  var currentStudentId = null;

  function setStat(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function loadStats() {
    fetchApi('/api/students/stats').then(function (res) {
      if (!res.success) return;
      var counts = { pending: 0, approved: 0, rejected: 0 };
      (res.data || []).forEach(function (r) {
        counts[r.status] = r.count;
      });
      setStat('stat-pending', counts.pending);
      setStat('stat-approved', counts.approved);
      setStat('stat-rejected', counts.rejected);
    });
  }

  function loadStudents() {
    var search = searchInput ? searchInput.value.trim() : '';
    var status = filterStatus ? filterStatus.value : '';
    var q = new URLSearchParams();
    if (search) q.set('search', search);
    if (status) q.set('status', status);
    var path = '/api/students' + (q.toString() ? '?' + q.toString() : '');
    studentsTbody.innerHTML = '<tr><td colspan="8" class="empty-state">Loading...</td></tr>';
    fetchApi(path).then(function (res) {
      if (!res.success) {
        studentsTbody.innerHTML = '<tr><td colspan="8" class="empty-state">Failed to load</td></tr>';
        return;
      }
      var list = res.data || [];
      if (list.length === 0) {
        studentsTbody.innerHTML = '<tr><td colspan="8" class="empty-state">No students found</td></tr>';
        return;
      }
      studentsTbody.innerHTML = list
        .map(function (s) {
          var badge = 'badge badge-' + (s.status || 'pending');
          var fee = s.registration_fee != null ? Number(s.registration_fee).toLocaleString() : '—';
          var pay = (s.payment_provider || '—') + (s.payment_phone ? ' ' + escapeHtml(s.payment_phone) : '');
          return (
            '<tr data-id="' +
            s.id +
            '">' +
            '<td>' + escapeHtml(s.full_name) + '</td>' +
            '<td>' + escapeHtml(s.class_applying_for) + '</td>' +
            '<td>' + fee + '</td>' +
            '<td>' + pay + '</td>' +
            '<td>' + escapeHtml(s.phone_number) + '<br><small>' + escapeHtml(s.email) + '</small></td>' +
            '<td><span class="' + badge + '">' + (s.status || 'pending') + '</span></td>' +
            '<td>' + (s.created_at ? new Date(s.created_at).toLocaleDateString() : '') + '</td>' +
            '<td><div class="table-actions"><button type="button" class="btn btn-outline view-btn">View</button></div></td>' +
            '</tr>'
          );
        })
        .join('');

      studentsTbody.querySelectorAll('.view-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var row = btn.closest('tr');
          var id = row && row.getAttribute('data-id');
          if (id) openModal(id);
        });
      });
    });
  }

  function escapeHtml(s) {
    if (s == null) return '';
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function openModal(id) {
    currentStudentId = id;
    studentModalBody.innerHTML = '<p>Loading...</p>';
    studentModal.hidden = false;
    fetchApi('/api/students/' + id).then(function (res) {
      if (!res.success || !res.data) {
        studentModalBody.innerHTML = '<p>Failed to load student.</p>';
        return;
      }
      var s = res.data;
      var feeStr = s.registration_fee != null ? Number(s.registration_fee).toLocaleString() + ' XAF' : '—';
      var payStr = [s.payment_provider, s.payment_phone].filter(Boolean).join(' — ') || '—';
      studentModalBody.innerHTML =
        '<dl>' +
        '<dt>Full Name</dt><dd>' + escapeHtml(s.full_name) + '</dd>' +
        '<dt>Date of Birth</dt><dd>' + escapeHtml(s.date_of_birth) + '</dd>' +
        '<dt>Gender</dt><dd>' + escapeHtml(s.gender) + '</dd>' +
        '<dt>Class</dt><dd>' + escapeHtml(s.class_applying_for) + '</dd>' +
        '<dt>Registration fee</dt><dd>' + feeStr + '</dd>' +
        '<dt>Payment</dt><dd>' + escapeHtml(payStr) + ' <span class="badge badge-' + (s.payment_status === 'paid' ? 'approved' : 'pending') + '">' + (s.payment_status || 'pending') + '</span></dd>' +
        '<dt>Parent/Guardian</dt><dd>' + escapeHtml(s.parent_guardian_name) + '</dd>' +
        '<dt>Phone</dt><dd>' + escapeHtml(s.phone_number) + '</dd>' +
        '<dt>Email</dt><dd>' + escapeHtml(s.email) + '</dd>' +
        '<dt>Address</dt><dd>' + escapeHtml(s.address) + '</dd>' +
        '<dt>Previous School</dt><dd>' + escapeHtml(s.previous_school || '—') + '</dd>' +
        '<dt>Status</dt><dd>' + (s.status || 'pending') + '</dd>' +
        '</dl>';
    });
  }

  function closeModal() {
    studentModal.hidden = true;
    currentStudentId = null;
  }

  studentModal.querySelectorAll('[data-close="modal"]').forEach(function (el) {
    el.addEventListener('click', closeModal);
  });

  function updateStatus(status) {
    if (!currentStudentId) return;
    fetchApi('/api/students/' + currentStudentId + '/status', {
      method: 'PATCH',
      body: { status: status },
    }).then(function (res) {
      if (res.success) {
        closeModal();
        loadStudents();
        loadStats();
      } else {
        alert(res.message || 'Update failed');
      }
    });
  }

  document.getElementById('approve-btn').addEventListener('click', function () {
    updateStatus('approved');
  });
  document.getElementById('reject-btn').addEventListener('click', function () {
    updateStatus('rejected');
  });

  document.getElementById('delete-btn').addEventListener('click', function () {
    if (!currentStudentId || !confirm('Delete this record permanently?')) return;
    fetchApi('/api/students/' + currentStudentId, { method: 'DELETE' }).then(function (res) {
      if (res.success) {
        closeModal();
        loadStudents();
        loadStats();
      } else {
        alert(res.message || 'Delete failed');
      }
    });
  });

  if (searchInput) searchInput.addEventListener('input', function () {
    clearTimeout(window._searchTimeout);
    window._searchTimeout = setTimeout(loadStudents, 300);
  });
  if (filterStatus) filterStatus.addEventListener('change', loadStudents);

  exportCsvBtn.addEventListener('click', function (e) {
    e.preventDefault();
    var token = getToken();
    if (!token) return;
    fetch(apiBase() + '/api/students/export/csv', { headers: { Authorization: 'Bearer ' + token } })
      .then(function (r) {
        return r.blob();
      })
      .then(function (blob) {
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'pchs_students.csv';
        a.click();
        URL.revokeObjectURL(a.href);
      });
  });

  // Sidebar nav
  document.querySelectorAll('.sidebar-nav a').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var page = this.getAttribute('data-page');
      document.querySelectorAll('.sidebar-nav a').forEach(function (x) {
        x.classList.toggle('active', x === a);
      });
      document.getElementById('dashboard-page').hidden = page !== 'dashboard';
      document.getElementById('students-page').hidden = page !== 'students';
      document.getElementById('page-heading').textContent = page === 'students' ? 'Students' : 'Dashboard';
      if (page === 'dashboard') loadStats();
      if (page === 'students') loadStudents();
    });
  });

  document.getElementById('logout-btn').addEventListener('click', function () {
    PCHSAuth.logout();
    window.location.href = 'login.html';
  });

  var user = PCHSAuth.getUser();
  if (user && user.username) {
    var nameEl = document.getElementById('admin-name');
    if (nameEl) nameEl.textContent = user.fullName || user.username;
  }

  loadStats();
  loadStudents();
})();

/**
 * Registration form submit: API or localStorage fallback
 * Includes registration fee and payment (Orange / MTN)
 */
(function () {
  var form = document.getElementById('registration-form');
  var submitBtn = document.getElementById('submit-btn');
  var classSelect = document.getElementById('classApplyingFor');
  var feeAmountEl = document.getElementById('fee-amount');
  var paymentPhoneWrap = document.getElementById('payment-phone-wrap');
  var paymentRadios = form && form.querySelectorAll('input[name="paymentProvider"]');

  function getApiBase() {
    if (typeof window !== 'undefined' && window.location && window.location.origin) {
      return window.location.origin;
    }
    return '';
  }

  function updateFeeDisplay() {
    if (!classSelect || !feeAmountEl) return;
    var opt = classSelect.options[classSelect.selectedIndex];
    var fee = opt && opt.getAttribute('data-fee');
    feeAmountEl.textContent = fee ? Number(fee).toLocaleString() : '—';
  }

  function togglePaymentPhone() {
    if (!paymentPhoneWrap || !paymentRadios) return;
    var checked = false;
    for (var i = 0; i < paymentRadios.length; i++) {
      if (paymentRadios[i].checked) {
        checked = true;
        break;
      }
    }
    paymentPhoneWrap.style.display = checked ? 'block' : 'none';
  }

  if (classSelect) classSelect.addEventListener('change', updateFeeDisplay);
  if (paymentRadios && paymentRadios.length) {
    for (var i = 0; i < paymentRadios.length; i++) {
      paymentRadios[i].addEventListener('change', togglePaymentPhone);
    }
  }
  updateFeeDisplay();
  togglePaymentPhone();

  /* Sequential field guide: blink first field, then advance to next when current is done */
  (function initFieldGuide() {
    if (!form) return;
    var groups = form.querySelectorAll('.form-grid .form-group');
    var currentIndex = 0;
    var guideClass = 'field-guide';

    function getPrimaryControl(group) {
      if (group.classList.contains('payment-section')) {
        return group.querySelector('input[name="paymentProvider"]');
      }
      return group.querySelector('input:not([type="radio"]):not([type="checkbox"]), select, textarea');
    }

    function isFieldDone(group, index) {
      var control = getPrimaryControl(group);
      if (!control) return true;
      if (control.type === 'radio') {
        return !!group.querySelector('input[name="' + control.name + '"]:checked');
      }
      if (control.type === 'file') return true;
      var val = (control.value || '').trim();
      if (index === 8 || index === 11) return true;
      return val.length > 0;
    }

    function setGuide(index) {
      for (var i = 0; i < groups.length; i++) {
        groups[i].classList.toggle(guideClass, i === index);
      }
      currentIndex = index;
    }

    function advanceGuide() {
      if (currentIndex >= groups.length - 1) {
        groups[currentIndex].classList.remove(guideClass);
        return;
      }
      setGuide(currentIndex + 1);
    }

    setGuide(0);

    for (var i = 0; i < groups.length; i++) {
      (function (idx) {
        var grp = groups[idx];
        var control = getPrimaryControl(grp);
        if (!control) return;
        if (control.type === 'radio') {
          var radios = grp.querySelectorAll('input[name="' + control.name + '"]');
          for (var r = 0; r < radios.length; r++) {
            radios[r].addEventListener('change', function () {
              if (idx === currentIndex && isFieldDone(grp, idx)) advanceGuide();
            });
          }
          return;
        }
        function maybeAdvance() {
          if (idx !== currentIndex) return;
          if (isFieldDone(grp, idx)) advanceGuide();
        }
        control.addEventListener('blur', maybeAdvance);
        control.addEventListener('change', maybeAdvance);
      })(i);
    }
  })();

  function getPayload(form) {
    var fd = new FormData(form);
    var opt = form.querySelector('#classApplyingFor') && form.querySelector('#classApplyingFor').options[form.querySelector('#classApplyingFor').selectedIndex];
    var registrationFee = opt && opt.getAttribute('data-fee');
    var paymentProvider = form.querySelector('input[name="paymentProvider"]:checked');
    var data = {
      fullName: fd.get('fullName') || '',
      dateOfBirth: fd.get('dateOfBirth') || '',
      gender: fd.get('gender') || '',
      classApplyingFor: fd.get('classApplyingFor') || '',
      parentGuardianName: fd.get('parentGuardianName') || '',
      phoneNumber: fd.get('phoneNumber') || '',
      email: fd.get('email') || '',
      address: fd.get('address') || '',
      previousSchool: fd.get('previousSchool') || '',
      registrationFee: registrationFee || '',
      paymentProvider: paymentProvider ? paymentProvider.value : '',
      paymentPhone: fd.get('paymentPhone') || '',
    };
    return data;
  }

  function saveToLocalStorage(data) {
    try {
      var key = 'pchs_registrations';
      var list = JSON.parse(localStorage.getItem(key) || '[]');
      data.id = 'local_' + Date.now();
      data.createdAt = new Date().toISOString();
      data.status = 'pending';
      data.paymentStatus = 'pending';
      list.push(data);
      localStorage.setItem(key, JSON.stringify(list));
      return true;
    } catch (e) {
      return false;
    }
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!RegistrationValidator.validate(form)) return;

    var base = getApiBase();
    var payload = getPayload(form);
    var fileInput = form.querySelector('input[name="passportPhoto"]');
    var file = fileInput && fileInput.files[0];

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    if (base) {
      var formData = new FormData();
      Object.keys(payload).forEach(function (k) {
        if (payload[k] !== undefined && payload[k] !== '') formData.append(k, payload[k]);
      });
      if (file) formData.append('passportPhoto', file);

      fetch(base + '/api/students', {
        method: 'POST',
        body: formData,
      })
        .then(function (res) {
          return res.json().then(function (body) {
            return { ok: res.ok, status: res.status, body: body };
          });
        })
        .then(function (_ref) {
          var ok = _ref.ok,
            body = _ref.body;
          if (ok) {
            alert('Registration submitted successfully. We will contact you.');
            form.reset();
            window.location.href = 'index.html';
          } else {
            var msg = (body && body.message) || (body && body.errors && body.errors[0] && body.errors[0].msg) || 'Submission failed.';
            alert(msg);
          }
        })
        .catch(function () {
          // Fallback to localStorage when backend unavailable
          if (saveToLocalStorage(payload)) {
            alert('Registration saved locally (server unavailable). You can submit again when online.');
            form.reset();
          } else {
            alert('Submission failed. Please try again.');
          }
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit Registration';
        });
    } else {
      if (saveToLocalStorage(payload)) {
        alert('Registration saved. You can complete submission when the server is available.');
        form.reset();
      }
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Registration';
    }
  });
})();

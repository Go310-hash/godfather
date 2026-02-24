/**
 * Client-side form validation for registration
 * Mirrors server rules where possible
 */
var RegistrationValidator = (function () {
  function required(val) {
    return val != null && String(val).trim() !== '';
  }

  function lengthBetween(val, min, max) {
    var s = String(val || '').trim();
    return s.length >= min && s.length <= max;
  }

  function isEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(val || '').trim());
  }

  function isPhone(val) {
    var s = String(val || '').replace(/\s/g, '');
    return /^[\d\-+()]{9,20}$/.test(s);
  }

  function isDate(val) {
    if (!val) return false;
    var d = new Date(val);
    return !isNaN(d.getTime());
  }

  var rules = {
    fullName: function (v) {
      if (!required(v)) return 'Full name is required';
      if (!lengthBetween(v, 2, 150)) return 'Name must be 2–150 characters';
      return null;
    },
    dateOfBirth: function (v) {
      if (!required(v)) return 'Date of birth is required';
      if (!isDate(v)) return 'Invalid date';
      return null;
    },
    gender: function (v) {
      if (!required(v)) return 'Gender is required';
      if (!['Male', 'Female', 'Other'].includes(v)) return 'Invalid gender';
      return null;
    },
    classApplyingFor: function (v) {
      if (!required(v)) return 'Class is required';
      if (!lengthBetween(v, 1, 50)) return 'Invalid class';
      return null;
    },
    parentGuardianName: function (v) {
      if (!required(v)) return 'Parent/Guardian name is required';
      if (!lengthBetween(v, 1, 150)) return 'Invalid length';
      return null;
    },
    phoneNumber: function (v) {
      if (!required(v)) return 'Phone number is required';
      if (!isPhone(v)) return 'Invalid phone number (9–20 digits/symbols)';
      return null;
    },
    email: function (v) {
      if (!required(v)) return 'Email is required';
      if (!isEmail(v)) return 'Invalid email address';
      return null;
    },
    address: function (v) {
      if (!required(v)) return 'Address is required';
      if (!lengthBetween(v, 1, 1000)) return 'Address too long';
      return null;
    },
    passportPhoto: function (file) {
      if (!file) return null;
      var allowed = /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name);
      if (!allowed) return 'Only JPG, PNG, GIF or WebP allowed';
      var maxMb = 5;
      if (file.size > maxMb * 1024 * 1024) return 'File must be under ' + maxMb + 'MB';
      return null;
    },
  };

  function showErrors(fieldErrors) {
    document.querySelectorAll('.error-msg').forEach(function (el) {
      el.textContent = '';
    });
    document.querySelectorAll('.form-group input, .form-group select, .form-group textarea').forEach(function (el) {
      el.classList.remove('error');
    });
    Object.keys(fieldErrors).forEach(function (name) {
      var msg = fieldErrors[name];
      var el = document.querySelector('.error-msg[data-for="' + name + '"]');
      var input = document.querySelector('[name="' + name + '"]');
      if (el) el.textContent = msg;
      if (input) input.classList.add('error');
    });
  }

  function validate(form) {
    var formData = new FormData(form);
    var fieldErrors = {};
    var names = [
      'fullName',
      'dateOfBirth',
      'gender',
      'classApplyingFor',
      'parentGuardianName',
      'phoneNumber',
      'email',
      'address',
    ];
    names.forEach(function (name) {
      var val = formData.get(name);
      if (name === 'passportPhoto') val = form.elements[name]?.files[0];
      var fn = rules[name];
      if (fn) {
        var err = fn(val);
        if (err) fieldErrors[name] = err;
      }
    });
    var photoRule = rules.passportPhoto;
    var photoFile = form.elements.passportPhoto && form.elements.passportPhoto.files[0];
    if (photoFile) {
      var photoErr = photoRule(photoFile);
      if (photoErr) fieldErrors.passportPhoto = photoErr;
    }
    showErrors(fieldErrors);
    return Object.keys(fieldErrors).length === 0;
  }

  return { validate: validate, showErrors: showErrors };
})();

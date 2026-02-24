/**
 * Form validation module - strong typing
 */
import type { StudentFormData } from '../types/student';

export interface ValidationResult {
  valid: boolean;
  errors: Partial<Record<keyof StudentFormData, string>>;
}

function required(val: unknown, minLength = 1): boolean {
  if (val == null) return false;
  const s = String(val).trim();
  return s.length >= minLength;
}

function lengthBetween(val: string, min: number, max: number): boolean {
  const s = String(val || '').trim();
  return s.length >= min && s.length <= max;
}

function isEmail(val: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(val || '').trim());
}

function isPhone(val: string): boolean {
  const s = String(val || '').replace(/\s/g, '');
  return /^[\d\-+()]{9,20}$/.test(s);
}

function isDate(val: string): boolean {
  if (!val) return false;
  const d = new Date(val);
  return !isNaN(d.getTime());
}

export function validateRegistrationForm(data: Partial<StudentFormData>): ValidationResult {
  const errors: Partial<Record<keyof StudentFormData, string>> = {};

  if (!required(data.fullName, 2)) errors.fullName = 'Full name is required (min 2 characters)';
  else if (!lengthBetween(data.fullName!, 2, 150)) errors.fullName = 'Name must be 2–150 characters';

  if (!required(data.dateOfBirth)) errors.dateOfBirth = 'Date of birth is required';
  else if (!isDate(data.dateOfBirth!)) errors.dateOfBirth = 'Invalid date';

  if (!required(data.gender)) errors.gender = 'Gender is required';
  else if (!['Male', 'Female', 'Other'].includes(data.gender!)) errors.gender = 'Invalid gender';

  if (!required(data.classApplyingFor)) errors.classApplyingFor = 'Class is required';
  else if (!lengthBetween(data.classApplyingFor!, 1, 50)) errors.classApplyingFor = 'Invalid class';

  if (!required(data.parentGuardianName)) errors.parentGuardianName = 'Parent/Guardian name is required';
  else if (!lengthBetween(data.parentGuardianName!, 1, 150)) errors.parentGuardianName = 'Invalid length';

  if (!required(data.phoneNumber)) errors.phoneNumber = 'Phone number is required';
  else if (!isPhone(data.phoneNumber!)) errors.phoneNumber = 'Invalid phone (9–20 digits/symbols)';

  if (!required(data.email)) errors.email = 'Email is required';
  else if (!isEmail(data.email!)) errors.email = 'Invalid email address';

  if (!required(data.address)) errors.address = 'Address is required';
  else if (!lengthBetween(data.address!, 1, 1000)) errors.address = 'Address too long';

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validatePassportFile(file: File | null): string | null {
  if (!file) return null;
  const allowed = /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name);
  if (!allowed) return 'Only JPG, PNG, GIF or WebP allowed';
  const maxMb = 5;
  if (file.size > maxMb * 1024 * 1024) return `File must be under ${maxMb}MB`;
  return null;
}

/**
 * Student interface - PCHS Bamenda registration
 */
export interface Student {
  id: number;
  full_name: string;
  date_of_birth: string;
  gender: 'Male' | 'Female' | 'Other';
  class_applying_for: string;
  parent_guardian_name: string;
  phone_number: string;
  email: string;
  address: string;
  previous_school: string | null;
  passport_photo_path: string | null;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_at: string | null;
  created_at: string;
}

export interface StudentFormData {
  fullName: string;
  dateOfBirth: string;
  gender: Student['gender'];
  classApplyingFor: string;
  parentGuardianName: string;
  phoneNumber: string;
  email: string;
  address: string;
  previousSchool?: string;
}

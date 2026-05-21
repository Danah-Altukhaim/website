export type ServiceRequestType =
  | 'twimc'
  | 'twimc_balance'
  | 'transcript'
  | 'expected_graduation_docs'
  | 'absence_excuse'
  | 'puc_letter_with_stipend'
  | 'puc_letter_no_stipend'
  | 'semester_withdrawal'
  | 'college_withdrawal'
  | 'social_allowance'
  | 'bank_details_change'
  | 'grade_appeal'
  | 'student_id_lost'
  | 'student_id_photo'
  | 'sport_discount'
  | 'transfer_credit_equivalency'
  | 'complaint'
  | 'suggestion';

export type ServiceRequestStatus =
  | 'submitted'
  | 'in_progress'
  | 'pending_advisor'
  | 'pending_finance'
  | 'pending_puc'
  | 'pending_payment'
  | 'rejected'
  | 'cancelled'
  | 'completed';

export interface ServiceRequestStep {
  key: string;
  label_ar: string;
  label_en: string;
  state: 'done' | 'current' | 'upcoming';
  comment_ar?: string;
  comment_en?: string;
  timestamp?: string;
}

export interface ServiceRequestAttachment {
  id: string;
  name: string;
  size_kb: number;
  uploaded_at: string;
  kind: 'civil_id' | 'passport' | 'form' | 'medical' | 'proof' | 'other';
}

export interface ServiceRequest {
  id: string;
  type: ServiceRequestType;
  status: ServiceRequestStatus;
  reference_no: string;
  created_at: string;
  updated_at: string;
  title_ar: string;
  title_en: string;
  category: 'registration' | 'finance' | 'student_life' | 'admissions' | 'it';
  funding_path?: 'self' | 'puc' | 'other' | null;
  workflow: ServiceRequestStep[];
  attachments: ServiceRequestAttachment[];
  notes?: string;
}

export interface ContactDirectoryEntry {
  id: string;
  department_ar: string;
  department_en: string;
  email: string;
  phone?: string;
  category: 'registration' | 'finance' | 'admissions' | 'student_life' | 'it' | 'academic';
}

export interface ExcusedAbsencePolicy {
  validity_days: number;
  body_ar: string;
  body_en: string;
  updated_at: string;
}

export type SocialAllowanceCategory =
  | 'kuwaiti'
  | 'kuwaiti_mother_dependant'
  | 'disabled'
  | 'married';

export interface SocialAllowanceDocRequirement {
  key: string;
  label_ar: string;
  label_en: string;
  required: boolean;
}

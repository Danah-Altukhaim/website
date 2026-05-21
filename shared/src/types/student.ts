export type EnrollmentStatus = 'enrolled' | 'dropped' | 'withdrawn' | 'completed' | 'suspended';

export type FundingType = 'self' | 'puc' | 'scholarship' | 'other';

export interface Student {
  id: string;
  university_id: string;
  student_number: string;
  name_ar: string;
  name_en: string;
  email: string;
  phone: string | null;
  major_id: string | null;
  major_name_ar: string | null;
  major_name_en: string | null;
  cohort_year: number;
  enrollment_status: EnrollmentStatus;
  gpa_cumulative: number | null;
  avatar_url: string | null;
  preferred_language: 'ar' | 'en';
  funding_type: FundingType | null;
  created_at: string;
  updated_at: string;
}

export interface StudentSummary {
  student: Student;
  current_term: {
    id: string;
    name_ar: string;
    name_en: string;
  };
  today_classes_count: number;
  upcoming_deadlines_count: number;
  balance_due: number | null;
  currency: string;
  unread_notifications: number;
}

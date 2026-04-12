// Mock data — MVP standalone, no backend required

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

/** Wraps an async API call with user-friendly error handling. */
async function withErrorHandling<T>(label: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    throw new Error(`[${label}] Request failed: ${message}`);
  }
}

const ENGAGEMENT = {
  daily_active_users: 2450,
  monthly_active_users: 4200,
  avg_session_duration_minutes: 23.5,
  feature_usage_heatmap: {
    schedule_view: { usage_count: 3820, label_ar: 'عرض الجدول', label_en: 'Schedule View' },
    grade_check: { usage_count: 2950, label_ar: 'التحقق من الدرجات', label_en: 'Grade Check' },
    payment_portal: { usage_count: 1870, label_ar: 'بوابة الدفع', label_en: 'Payment Portal' },
    ai_advisor: { usage_count: 1540, label_ar: 'المستشار الذكي', label_en: 'AI Advisor' },
    campus_events: { usage_count: 1320, label_ar: 'فعاليات الحرم', label_en: 'Campus Events' },
    social_feed: { usage_count: 2100, label_ar: 'المنشورات', label_en: 'Social Feed' },
    library_search: { usage_count: 980, label_ar: 'بحث المكتبة', label_en: 'Library Search' },
    club_activities: { usage_count: 760, label_ar: 'أنشطة الأندية', label_en: 'Club Activities' },
  },
  engagement_by_cohort: [
    { cohort: '2023', active_users: 1050, avg_session_min: 26.1 },
    { cohort: '2024', active_users: 1380, avg_session_min: 24.3 },
    { cohort: '2025', active_users: 920, avg_session_min: 21.8 },
    { cohort: '2026', active_users: 850, avg_session_min: 19.5 },
  ],
  engagement_by_major: [
    { major_en: 'Computer Science', major_ar: 'علوم الحاسب', active_users: 820, avg_session_min: 28.4 },
    { major_en: 'Engineering', major_ar: 'الهندسة', active_users: 710, avg_session_min: 25.1 },
    { major_en: 'Business', major_ar: 'إدارة الأعمال', active_users: 680, avg_session_min: 22.7 },
    { major_en: 'Science', major_ar: 'العلوم', active_users: 450, avg_session_min: 20.3 },
    { major_en: 'Arts', major_ar: 'الآداب', active_users: 390, avg_session_min: 18.9 },
  ],
  engagement_by_year: [
    { year: '1st Year', year_ar: 'السنة الأولى', active_users: 1100, avg_session_min: 19.2 },
    { year: '2nd Year', year_ar: 'السنة الثانية', active_users: 980, avg_session_min: 22.5 },
    { year: '3rd Year', year_ar: 'السنة الثالثة', active_users: 870, avg_session_min: 25.8 },
    { year: '4th Year', year_ar: 'السنة الرابعة', active_users: 650, avg_session_min: 27.1 },
    { year: '5th Year', year_ar: 'السنة الخامسة', active_users: 350, avg_session_min: 23.4 },
  ],
  peak_hours: [
    { hour: 9, users: 1200, label_ar: '٩ صباحاً', label_en: '9 AM' },
    { hour: 13, users: 1850, label_ar: '١ ظهراً', label_en: '1 PM' },
    { hour: 21, users: 1650, label_ar: '٩ مساءً', label_en: '9 PM' },
  ],
  period: { start: '2026-03-08', end: '2026-04-08' },
};

const RETENTION = {
  overall_retention_rate: 94.2,
  at_risk_students_count: 47,
  total_enrolled: 4200,
  retention_by_college: [
    { college_ar: 'كلية علوم الحاسب', college_en: 'College of Computer Science', retention_rate: 96.1, enrolled: 820 },
    { college_ar: 'كلية الهندسة', college_en: 'College of Engineering', retention_rate: 93.8, enrolled: 950 },
    { college_ar: 'كلية إدارة الأعمال', college_en: 'College of Business', retention_rate: 94.5, enrolled: 1100 },
    { college_ar: 'كلية العلوم', college_en: 'College of Science', retention_rate: 92.3, enrolled: 680 },
    { college_ar: 'كلية الآداب', college_en: 'College of Arts', retention_rate: 95.0, enrolled: 650 },
  ],
  trend: [
    { month: '2026-01', rate: 95.1 },
    { month: '2026-02', rate: 94.8 },
    { month: '2026-03', rate: 94.5 },
    { month: '2026-04', rate: 94.2 },
  ],
};

const AT_RISK_STUDENTS = [
  {
    id: 'student_401',
    name_ar: 'محمد العتيبي',
    name_en: 'Mohammed Al-Otaibi',
    student_id: '441012345',
    risk_score: 0.85,
    risk_level: 'high',
    college_ar: 'كلية علوم الحاسب',
    college_en: 'College of Computer Science',
    gpa: 1.8,
    contributing_factors: [
      { factor_ar: 'انخفاض حاد في المعدل التراكمي', factor_en: 'Sharp GPA decline', weight: 0.4 },
      { factor_ar: 'غياب متكرر في آخر ٣ أسابيع', factor_en: 'Frequent absences in last 3 weeks', weight: 0.3 },
      { factor_ar: 'عدم تسليم ٤ واجبات', factor_en: '4 missing assignments', weight: 0.15 },
    ],
    last_active: '2026-04-02T14:30:00Z',
  },
  {
    id: 'student_402',
    name_ar: 'سارة الدوسري',
    name_en: 'Sarah Al-Dosari',
    student_id: '441023456',
    risk_score: 0.78,
    risk_level: 'high',
    college_ar: 'كلية الهندسة',
    college_en: 'College of Engineering',
    gpa: 2.1,
    contributing_factors: [
      { factor_ar: 'تأخر في سداد الرسوم الدراسية', factor_en: 'Overdue tuition payment', weight: 0.35 },
      { factor_ar: 'انخفاض التفاعل مع المنصة', factor_en: 'Decreased platform engagement', weight: 0.25 },
      { factor_ar: 'رسوب في مادتين', factor_en: 'Failed 2 courses', weight: 0.18 },
    ],
    last_active: '2026-04-05T09:00:00Z',
  },
  {
    id: 'student_403',
    name_ar: 'خالد الشمري',
    name_en: 'Khalid Al-Shammari',
    student_id: '441034567',
    risk_score: 0.72,
    risk_level: 'medium',
    college_ar: 'كلية إدارة الأعمال',
    college_en: 'College of Business',
    gpa: 2.3,
    contributing_factors: [
      { factor_ar: 'انسحاب من مادتين هذا الفصل', factor_en: 'Withdrew from 2 courses this semester', weight: 0.3 },
      { factor_ar: 'انخفاض في درجات الاختبارات', factor_en: 'Declining exam scores', weight: 0.25 },
    ],
    last_active: '2026-04-07T16:45:00Z',
  },
  {
    id: 'student_404',
    name_ar: 'ريم الحربي',
    name_en: 'Reem Al-Harbi',
    student_id: '441045678',
    risk_score: 0.65,
    risk_level: 'medium',
    college_ar: 'كلية العلوم',
    college_en: 'College of Science',
    gpa: 2.5,
    contributing_factors: [
      { factor_ar: 'غياب عن ٣ اختبارات قصيرة', factor_en: 'Missed 3 quizzes', weight: 0.3 },
      { factor_ar: 'عدم حضور ساعات الإرشاد', factor_en: 'No advising session attendance', weight: 0.2 },
    ],
    last_active: '2026-04-06T11:20:00Z',
  },
  {
    id: 'student_405',
    name_ar: 'عمر المالكي',
    name_en: 'Omar Al-Malki',
    student_id: '441056789',
    risk_score: 0.61,
    risk_level: 'medium',
    college_ar: 'كلية الآداب',
    college_en: 'College of Arts',
    gpa: 2.4,
    contributing_factors: [
      { factor_ar: 'تراجع في الأداء الأكاديمي', factor_en: 'Academic performance decline', weight: 0.25 },
      { factor_ar: 'قلة التفاعل في المنتديات الدراسية', factor_en: 'Low participation in course forums', weight: 0.2 },
      { factor_ar: 'تأخر في تسليم المشاريع', factor_en: 'Late project submissions', weight: 0.16 },
    ],
    last_active: '2026-04-07T08:30:00Z',
  },
];

const ADMIN_USERS = [
  {
    id: 'admin_001',
    email: 'dean@cck.edu.kw',
    name_ar: 'د. عبدالله الفيصل',
    name_en: 'Dr. Abdullah Al-Faisal',
    role: 'super_admin',
    status: 'active',
    created_at: '2025-09-01T00:00:00Z',
    last_login: '2026-04-08T08:30:00Z',
  },
  {
    id: 'admin_002',
    email: 'registrar@cck.edu.kw',
    name_ar: 'نورة الشهري',
    name_en: 'Noura Al-Shahri',
    role: 'university_admin',
    status: 'active',
    created_at: '2025-09-15T00:00:00Z',
    last_login: '2026-04-07T14:20:00Z',
  },
  {
    id: 'admin_003',
    email: 'advisor.cs@cck.edu.kw',
    name_ar: 'أحمد الغامدي',
    name_en: 'Ahmed Al-Ghamdi',
    role: 'advisor',
    status: 'active',
    created_at: '2025-10-01T00:00:00Z',
    last_login: '2026-04-08T10:15:00Z',
  },
];

const STUDENT_PROFILES: Record<string, object> = {
  student_401: {
    id: 'student_401', name_en: 'Mohammed Al-Otaibi', name_ar: 'محمد العتيبي', student_id: '441012345',
    email: 'm.otaibi@students.cck.edu.kw', risk_score: 0.85, risk_level: 'high',
    college_en: 'College of Computer Science', college_ar: 'كلية علوم الحاسب',
    major_en: 'Software Engineering', major_ar: 'هندسة البرمجيات',
    year_en: '3rd Year', year_ar: 'السنة الثالثة', gpa: 1.8,
    assigned_advisor: { name_en: 'Ahmed Al-Ghamdi', name_ar: 'أحمد الغامدي', email: 'advisor.cs@cck.edu.kw' },
    contributing_factors: [
      { factor_en: 'Sharp GPA decline', factor_ar: 'انخفاض حاد في المعدل التراكمي', weight: 0.4 },
      { factor_en: 'Frequent absences in last 3 weeks', factor_ar: 'غياب متكرر في آخر ٣ أسابيع', weight: 0.3 },
      { factor_en: '4 missing assignments', factor_ar: 'عدم تسليم ٤ واجبات', weight: 0.15 },
    ],
    academic_history: [
      { semester_en: 'Fall 2024', semester_ar: 'خريف ٢٠٢٤', gpa: 3.2, credits: 15, status: 'Good Standing', status_ar: 'وضع جيد' },
      { semester_en: 'Spring 2025', semester_ar: 'ربيع ٢٠٢٥', gpa: 2.6, credits: 15, status: 'Good Standing', status_ar: 'وضع جيد' },
      { semester_en: 'Fall 2025', semester_ar: 'خريف ٢٠٢٥', gpa: 2.1, credits: 12, status: 'Warning', status_ar: 'إنذار' },
      { semester_en: 'Spring 2026', semester_ar: 'ربيع ٢٠٢٦', gpa: 1.8, credits: 12, status: 'Probation', status_ar: 'تحت المراقبة' },
    ],
    attendance: [
      { course_en: 'CS301 - Software Engineering', course_ar: 'CS301 - هندسة البرمجيات', attended: 8, total: 14, rate: 57 },
      { course_en: 'CS310 - Database Systems', course_ar: 'CS310 - أنظمة قواعد البيانات', attended: 10, total: 14, rate: 71 },
      { course_en: 'CS350 - Networks', course_ar: 'CS350 - الشبكات', attended: 12, total: 14, rate: 86 },
      { course_en: 'MATH301 - Linear Algebra', course_ar: 'MATH301 - الجبر الخطي', attended: 6, total: 14, rate: 43 },
    ],
    payment_status: [
      { item_en: 'Tuition - Spring 2026', item_ar: 'الرسوم الدراسية - ربيع ٢٠٢٦', amount: 22500, status: 'Paid', status_ar: 'مدفوع', due_date: '2026-01-15' },
      { item_en: 'Lab Fees', item_ar: 'رسوم المختبر', amount: 1500, status: 'Paid', status_ar: 'مدفوع', due_date: '2026-01-15' },
      { item_en: 'Late Registration Fee', item_ar: 'رسوم التسجيل المتأخر', amount: 500, status: 'Overdue', status_ar: 'متأخر', due_date: '2026-03-01' },
    ],
    engagement_timeline: [
      { date: 'Apr 2', action_en: 'Last app login', action_ar: 'آخر دخول للتطبيق' },
      { date: 'Apr 1', action_en: 'Viewed grade for CS301', action_ar: 'عرض درجة CS301' },
      { date: 'Mar 28', action_en: 'Opened AI Advisor — asked about withdrawal', action_ar: 'فتح المستشار الذكي — استفسار عن الانسحاب' },
      { date: 'Mar 25', action_en: 'Checked payment balance', action_ar: 'التحقق من الرصيد المالي' },
      { date: 'Mar 20', action_en: 'Viewed schedule', action_ar: 'عرض الجدول' },
      { date: 'Mar 15', action_en: 'Last LMS login (Blackboard)', action_ar: 'آخر دخول لنظام التعلم (بلاك بورد)' },
    ],
    interventions: [
      { date: '2026-03-10', type_en: 'Schedule Meeting', type_ar: 'جدولة اجتماع', advisor_en: 'Ahmed Al-Ghamdi', advisor_ar: 'أحمد الغامدي', outcome: 'Ongoing', outcome_ar: 'مستمر', notes_en: 'Student agreed to attend tutoring sessions', notes_ar: 'وافق الطالب على حضور جلسات الدعم الأكاديمي' },
      { date: '2026-02-15', type_en: 'Send In-App Message', type_ar: 'إرسال رسالة داخل التطبيق', advisor_en: 'Ahmed Al-Ghamdi', advisor_ar: 'أحمد الغامدي', outcome: 'Resolved', outcome_ar: 'مُنجز', notes_en: 'Reminded about missing assignments, submitted 2 of 4', notes_ar: 'تذكير بالواجبات المفقودة، تم تسليم ٢ من ٤' },
    ],
  },
  student_402: {
    id: 'student_402', name_en: 'Sarah Al-Dosari', name_ar: 'سارة الدوسري', student_id: '441023456',
    email: 's.dosari@students.cck.edu.kw', risk_score: 0.78, risk_level: 'high',
    college_en: 'College of Engineering', college_ar: 'كلية الهندسة',
    major_en: 'Civil Engineering', major_ar: 'الهندسة المدنية',
    year_en: '4th Year', year_ar: 'السنة الرابعة', gpa: 2.1,
    assigned_advisor: { name_en: 'Fatima Al-Rashid', name_ar: 'فاطمة الراشد', email: 'advisor.eng@cck.edu.kw' },
    contributing_factors: [
      { factor_en: 'Overdue tuition payment', factor_ar: 'تأخر في سداد الرسوم الدراسية', weight: 0.35 },
      { factor_en: 'Decreased platform engagement', factor_ar: 'انخفاض التفاعل مع المنصة', weight: 0.25 },
      { factor_en: 'Failed 2 courses', factor_ar: 'رسوب في مادتين', weight: 0.18 },
    ],
    academic_history: [
      { semester_en: 'Fall 2024', semester_ar: 'خريف ٢٠٢٤', gpa: 2.8, credits: 16, status: 'Good Standing', status_ar: 'وضع جيد' },
      { semester_en: 'Spring 2025', semester_ar: 'ربيع ٢٠٢٥', gpa: 2.5, credits: 15, status: 'Good Standing', status_ar: 'وضع جيد' },
      { semester_en: 'Fall 2025', semester_ar: 'خريف ٢٠٢٥', gpa: 2.3, credits: 14, status: 'Warning', status_ar: 'إنذار' },
      { semester_en: 'Spring 2026', semester_ar: 'ربيع ٢٠٢٦', gpa: 2.1, credits: 12, status: 'Warning', status_ar: 'إنذار' },
    ],
    attendance: [
      { course_en: 'CE401 - Structural Analysis', course_ar: 'CE401 - التحليل الإنشائي', attended: 11, total: 14, rate: 79 },
      { course_en: 'CE410 - Construction Mgmt', course_ar: 'CE410 - إدارة الإنشاءات', attended: 9, total: 14, rate: 64 },
      { course_en: 'CE450 - Capstone Project', course_ar: 'CE450 - مشروع التخرج', attended: 13, total: 14, rate: 93 },
    ],
    payment_status: [
      { item_en: 'Tuition - Spring 2026', item_ar: 'الرسوم الدراسية - ربيع ٢٠٢٦', amount: 24000, status: 'Overdue', status_ar: 'متأخر', due_date: '2026-01-15' },
      { item_en: 'Lab Fees', item_ar: 'رسوم المختبر', amount: 2000, status: 'Overdue', status_ar: 'متأخر', due_date: '2026-01-15' },
    ],
    engagement_timeline: [
      { date: 'Apr 5', action_en: 'Last app login', action_ar: 'آخر دخول للتطبيق' },
      { date: 'Apr 3', action_en: 'Checked payment — saw overdue notice', action_ar: 'التحقق من السداد — مشاهدة إشعار التأخير' },
      { date: 'Mar 30', action_en: 'Viewed capstone project deadline', action_ar: 'عرض موعد تسليم مشروع التخرج' },
    ],
    interventions: [
      { date: '2026-03-20', type_en: 'Contact Parent/Guardian', type_ar: 'التواصل مع ولي الأمر', advisor_en: 'Fatima Al-Rashid', advisor_ar: 'فاطمة الراشد', outcome: 'Ongoing', outcome_ar: 'مستمر', notes_en: 'Discussed financial situation with family', notes_ar: 'مناقشة الوضع المالي مع الأسرة' },
    ],
  },
};

// Generate generic profile for students without detailed mock
function generateProfile(id: string) {
  const s = AT_RISK_STUDENTS.find((s) => s.id === id);
  if (!s) return null;
  return {
    ...s, email: `${id}@students.cck.edu.kw`,
    major_en: 'General Studies', major_ar: 'دراسات عامة',
    year_en: '2nd Year', year_ar: 'السنة الثانية',
    assigned_advisor: { name_en: 'Ahmed Al-Ghamdi', name_ar: 'أحمد الغامدي', email: 'advisor.cs@cck.edu.kw' },
    academic_history: [
      { semester_en: 'Fall 2025', semester_ar: 'خريف ٢٠٢٥', gpa: 2.8, credits: 15, status: 'Good Standing', status_ar: 'وضع جيد' },
      { semester_en: 'Spring 2026', semester_ar: 'ربيع ٢٠٢٦', gpa: s.gpa, credits: 12, status: s.gpa < 2.0 ? 'Probation' : 'Warning', status_ar: s.gpa < 2.0 ? 'تحت المراقبة' : 'إنذار' },
    ],
    attendance: [
      { course_en: 'GEN201 - Core Course', course_ar: 'GEN201 - مقرر أساسي', attended: 9, total: 14, rate: 64 },
      { course_en: 'GEN202 - Elective', course_ar: 'GEN202 - مقرر اختياري', attended: 11, total: 14, rate: 79 },
    ],
    payment_status: [{ item_en: 'Tuition - Spring 2026', item_ar: 'الرسوم الدراسية - ربيع ٢٠٢٦', amount: 20000, status: 'Paid', status_ar: 'مدفوع', due_date: '2026-01-15' }],
    engagement_timeline: [
      { date: 'Apr 7', action_en: 'Last app login', action_ar: 'آخر دخول للتطبيق' },
      { date: 'Apr 5', action_en: 'Viewed schedule', action_ar: 'عرض الجدول' },
    ],
    interventions: [],
  };
}

const AUDIT_LOG = [
  { id: 'log_001', timestamp: '2026-04-08T14:30:00Z', admin_name_en: 'Dr. Abdullah Al-Faisal', admin_name_ar: 'د. عبدالله الفيصل', action_en: 'Updated branding colors', action_ar: 'تحديث ألوان الهوية', resource_en: 'Branding Config', resource_ar: 'إعدادات الهوية', ip: '10.0.1.15' },
  { id: 'log_002', timestamp: '2026-04-08T12:15:00Z', admin_name_en: 'Noura Al-Shahri', admin_name_ar: 'نورة الشهري', action_en: 'Sent communication to all students', action_ar: 'إرسال إشعار لجميع الطلاب', resource_en: 'Communications', resource_ar: 'المراسلات', ip: '10.0.1.22' },
  { id: 'log_003', timestamp: '2026-04-08T10:45:00Z', admin_name_en: 'Ahmed Al-Ghamdi', admin_name_ar: 'أحمد الغامدي', action_en: 'Scheduled intervention for Mohammed Al-Otaibi', action_ar: 'جدولة تدخل لمحمد العتيبي', resource_en: 'Retention', resource_ar: 'الاحتفاظ بالطلاب', ip: '10.0.1.35' },
  { id: 'log_004', timestamp: '2026-04-07T16:20:00Z', admin_name_en: 'Noura Al-Shahri', admin_name_ar: 'نورة الشهري', action_en: 'Imported 150 student records', action_ar: 'استيراد 150 سجل طالب', resource_en: 'User Management', resource_ar: 'إدارة المستخدمين', ip: '10.0.1.22' },
  { id: 'log_005', timestamp: '2026-04-07T14:00:00Z', admin_name_en: 'Dr. Abdullah Al-Faisal', admin_name_ar: 'د. عبدالله الفيصل', action_en: 'Changed role for admin_003 to advisor', action_ar: 'تغيير دور admin_003 إلى مرشد', resource_en: 'User Management', resource_ar: 'إدارة المستخدمين', ip: '10.0.1.15' },
  { id: 'log_006', timestamp: '2026-04-07T11:30:00Z', admin_name_en: 'Noura Al-Shahri', admin_name_ar: 'نورة الشهري', action_en: 'Triggered manual data sync', action_ar: 'تشغيل مزامنة يدوية للبيانات', resource_en: 'Integrations', resource_ar: 'التكاملات', ip: '10.0.1.22' },
  { id: 'log_007', timestamp: '2026-04-07T09:00:00Z', admin_name_en: 'Ahmed Al-Ghamdi', admin_name_ar: 'أحمد الغامدي', action_en: 'Marked intervention as Resolved for student_402', action_ar: 'تحديد تدخل الطالب student_402 كمُنجز', resource_en: 'Retention', resource_ar: 'الاحتفاظ بالطلاب', ip: '10.0.1.35' },
  { id: 'log_008', timestamp: '2026-04-06T15:45:00Z', admin_name_en: 'Dr. Abdullah Al-Faisal', admin_name_ar: 'د. عبدالله الفيصل', action_en: 'Approved club "Robotics Society"', action_ar: 'اعتماد نادي "جمعية الروبوتات"', resource_en: 'Content Management', resource_ar: 'إدارة المحتوى', ip: '10.0.1.15' },
  { id: 'log_009', timestamp: '2026-04-06T10:30:00Z', admin_name_en: 'Noura Al-Shahri', admin_name_ar: 'نورة الشهري', action_en: 'Exported student data (CSV)', action_ar: 'تصدير بيانات الطلاب (CSV)', resource_en: 'User Management', resource_ar: 'إدارة المستخدمين', ip: '10.0.1.22' },
  { id: 'log_010', timestamp: '2026-04-05T13:15:00Z', admin_name_en: 'Ahmed Al-Ghamdi', admin_name_ar: 'أحمد الغامدي', action_en: 'Sent communication to at-risk students', action_ar: 'إرسال إشعار للطلاب المعرضين للخطر', resource_en: 'Communications', resource_ar: 'المراسلات', ip: '10.0.1.35' },
];

const PAYMENT_ANALYTICS = {
  total_billed: 18900000,
  total_collected: 16632000,
  collection_rate: 88.0,
  outstanding_balance: 2268000,
  by_cohort: [
    { cohort: '2023', billed: 5200000, collected: 4940000, rate: 95.0 },
    { cohort: '2024', billed: 5100000, collected: 4692000, rate: 92.0 },
    { cohort: '2025', billed: 4800000, collected: 4080000, rate: 85.0 },
    { cohort: '2026', billed: 3800000, collected: 2920000, rate: 76.8 },
  ],
  by_method: [
    { method_en: 'KNET', method_ar: 'كي نت', count: 2840, amount: 9650000, percentage: 58.0 },
    { method_en: 'Credit Card', method_ar: 'بطاقة ائتمان', count: 1250, amount: 4320000, percentage: 26.0 },
    { method_en: 'Bank Transfer', method_ar: 'تحويل بنكي', count: 480, amount: 2150000, percentage: 12.9 },
    { method_en: 'Cash', method_ar: 'نقدي', count: 120, amount: 512000, percentage: 3.1 },
  ],
  overdue_by_college: [
    { college_en: 'Engineering', college_ar: 'الهندسة', students: 45, amount: 720000 },
    { college_en: 'Business', college_ar: 'إدارة الأعمال', students: 38, amount: 580000 },
    { college_en: 'Computer Science', college_ar: 'علوم الحاسب', students: 22, amount: 420000 },
    { college_en: 'Science', college_ar: 'العلوم', students: 18, amount: 310000 },
    { college_en: 'Arts', college_ar: 'الآداب', students: 15, amount: 238000 },
  ],
};

const AI_MONITORING = {
  total_conversations: 12450,
  avg_satisfaction: 4.2,
  escalation_rate: 8.3,
  avg_response_time_sec: 2.1,
  conversations_today: 342,
  topic_distribution: [
    { topic_en: 'Registration & Enrollment', topic_ar: 'التسجيل والقبول', count: 3200, percentage: 25.7 },
    { topic_en: 'Grade Inquiries', topic_ar: 'استفسارات الدرجات', count: 2680, percentage: 21.5 },
    { topic_en: 'Course Recommendations', topic_ar: 'توصيات المقررات', count: 1870, percentage: 15.0 },
    { topic_en: 'Schedule Conflicts', topic_ar: 'تعارضات الجدول', count: 1560, percentage: 12.5 },
    { topic_en: 'Financial Aid & Payments', topic_ar: 'المساعدات المالية والمدفوعات', count: 1240, percentage: 10.0 },
    { topic_en: 'Campus Services', topic_ar: 'خدمات الحرم', count: 980, percentage: 7.9 },
    { topic_en: 'Other', topic_ar: 'أخرى', count: 920, percentage: 7.4 },
  ],
  escalation_reasons: [
    { reason_en: 'Low confidence (<70%)', reason_ar: 'ثقة منخفضة (<٧٠٪)', count: 580, percentage: 56.1 },
    { reason_en: 'Student requested human', reason_ar: 'طلب الطالب التحدث مع شخص', count: 245, percentage: 23.7 },
    { reason_en: 'Sensitive topic detected', reason_ar: 'موضوع حساس', count: 132, percentage: 12.8 },
    { reason_en: 'Multi-step process', reason_ar: 'إجراء متعدد الخطوات', count: 77, percentage: 7.4 },
  ],
  satisfaction_breakdown: [
    { rating: 5, count: 4200, percentage: 33.7 },
    { rating: 4, count: 4050, percentage: 32.5 },
    { rating: 3, count: 2490, percentage: 20.0 },
    { rating: 2, count: 1120, percentage: 9.0 },
    { rating: 1, count: 590, percentage: 4.7 },
  ],
  recent_escalations: [
    { id: 'esc_01', student_en: 'Khalid M.', student_ar: 'خالد م.', topic_en: 'Financial hold on registration', topic_ar: 'إيقاف مالي على التسجيل', timestamp: '2026-04-08T14:20:00Z', status: 'pending' },
    { id: 'esc_02', student_en: 'Noura A.', student_ar: 'نورة أ.', topic_en: 'Grade dispute CS301', topic_ar: 'اعتراض على درجة CS301', timestamp: '2026-04-08T11:45:00Z', status: 'assigned' },
    { id: 'esc_03', student_en: 'Omar S.', student_ar: 'عمر س.', topic_en: 'Graduation requirements unclear', topic_ar: 'متطلبات التخرج غير واضحة', timestamp: '2026-04-08T09:30:00Z', status: 'resolved' },
  ],
};

const CONTENT_ITEMS = {
  events: [
    { id: 'evt_1', title_en: 'Career Fair 2026', title_ar: 'معرض التوظيف ٢٠٢٦', date: '2026-04-20', status: 'approved', status_ar: 'معتمد', category_en: 'Career', category_ar: 'مهني' },
    { id: 'evt_2', title_en: 'Hackathon: AI for Education', title_ar: 'هاكاثون: الذكاء الاصطناعي للتعليم', date: '2026-04-25', status: 'pending', status_ar: 'قيد الانتظار', category_en: 'Academic', category_ar: 'أكاديمي' },
    { id: 'evt_3', title_en: 'Spring Sports Tournament', title_ar: 'بطولة الربيع الرياضية', date: '2026-05-01', status: 'approved', status_ar: 'معتمد', category_en: 'Sports', category_ar: 'رياضي' },
  ],
  news: [
    { id: 'news_1', title_en: 'New Library Hours for Exam Period', title_ar: 'ساعات المكتبة الجديدة لفترة الاختبارات', date: '2026-04-08', status: 'published', status_ar: 'منشور' },
    { id: 'news_2', title_en: 'Scholarship Applications Open', title_ar: 'فتح باب التقديم للمنح الدراسية', date: '2026-04-05', status: 'published', status_ar: 'منشور' },
    { id: 'news_3', title_en: 'Campus Wi-Fi Upgrade', title_ar: 'تحديث شبكة الواي فاي', date: '2026-04-03', status: 'draft', status_ar: 'مسودة' },
  ],
  clubs: [
    { id: 'club_1', name_en: 'Robotics Society', name_ar: 'جمعية الروبوتات', members: 45, status: 'approved', status_ar: 'معتمد', advisor_en: 'Dr. Hassan', advisor_ar: 'د. حسن' },
    { id: 'club_2', name_en: 'Debate Club', name_ar: 'نادي المناظرات', members: 32, status: 'pending', status_ar: 'قيد الانتظار', advisor_en: 'Dr. Layla', advisor_ar: 'د. ليلى' },
    { id: 'club_3', name_en: 'Photography Club', name_ar: 'نادي التصوير', members: 28, status: 'approved', status_ar: 'معتمد', advisor_en: 'Prof. Saleh', advisor_ar: 'أ. صالح' },
    { id: 'club_4', name_en: 'Entrepreneurship Hub', name_ar: 'مركز ريادة الأعمال', members: 67, status: 'approved', status_ar: 'معتمد', advisor_en: 'Dr. Nasser', advisor_ar: 'د. ناصر' },
  ],
};

const INTEGRATIONS = [
  {
    adapter_id: 'blackboard',
    name_ar: 'بلاك بورد',
    name_en: 'Blackboard',
    status: 'connected',
    status_ar: 'متصل',
    last_sync: '2026-04-08T06:00:00Z',
    records_synced: 12450,
    health: 'healthy',
    health_ar: 'سليم',
  },
  {
    adapter_id: 'banner',
    name_ar: 'بانر',
    name_en: 'Banner',
    status: 'syncing',
    status_ar: 'جارٍ المزامنة',
    last_sync: '2026-04-08T07:30:00Z',
    records_synced: 8920,
    health: 'healthy',
    health_ar: 'سليم',
    sync_progress: 67,
  },
  {
    adapter_id: 'canvas',
    name_ar: 'كانفاس',
    name_en: 'Canvas',
    status: 'disconnected',
    status_ar: 'غير متصل',
    last_sync: '2026-04-01T12:00:00Z',
    records_synced: 0,
    health: 'error',
    health_ar: 'خطأ',
    error_ar: 'انتهت صلاحية مفتاح الاتصال',
    error_en: 'API key expired',
  },
];

const CAMPUS_DIRECTORY = [
  {
    id: 'dir_1', type: 'building' as const,
    name_en: 'Main Administration Building', name_ar: 'مبنى الإدارة الرئيسي',
    location_en: 'Central Campus', location_ar: 'الحرم المركزي',
    phone: '+966-11-467-0000', email: 'admin@cck.edu.kw',
    hours_en: 'Sun–Thu 8:00–16:00', hours_ar: 'الأحد–الخميس ٨:٠٠–١٦:٠٠',
    status: 'published' as const,
  },
  {
    id: 'dir_2', type: 'office' as const,
    name_en: 'Registrar Office', name_ar: 'مكتب القبول والتسجيل',
    location_en: 'Admin Building, Floor 2', location_ar: 'مبنى الإدارة، الطابق الثاني',
    phone: '+966-11-467-1111', email: 'registrar@cck.edu.kw',
    hours_en: 'Sun–Thu 9:00–15:00', hours_ar: 'الأحد–الخميس ٩:٠٠–١٥:٠٠',
    status: 'published' as const,
  },
  {
    id: 'dir_3', type: 'service' as const,
    name_en: 'Student Health Center', name_ar: 'مركز صحة الطلاب',
    location_en: 'Building 14', location_ar: 'مبنى ١٤',
    phone: '+966-11-467-2222', email: 'health@cck.edu.kw',
    hours_en: 'Sun–Thu 8:00–20:00', hours_ar: 'الأحد–الخميس ٨:٠٠–٢٠:٠٠',
    status: 'published' as const,
  },
  {
    id: 'dir_4', type: 'service' as const,
    name_en: 'IT Help Desk', name_ar: 'مكتب الدعم التقني',
    location_en: 'Library Building, Ground Floor', location_ar: 'مبنى المكتبة، الطابق الأرضي',
    phone: '+966-11-467-3333', email: 'it@cck.edu.kw',
    hours_en: 'Sun–Thu 8:00–22:00', hours_ar: 'الأحد–الخميس ٨:٠٠–٢٢:٠٠',
    status: 'draft' as const,
  },
  {
    id: 'dir_5', type: 'building' as const,
    name_en: 'College of Computer Science', name_ar: 'كلية علوم الحاسب',
    location_en: 'North Campus', location_ar: 'الحرم الشمالي',
    phone: '+966-11-467-4444', email: 'cs@cck.edu.kw',
    hours_en: 'Sun–Thu 7:30–21:00', hours_ar: 'الأحد–الخميس ٧:٣٠–٢١:٠٠',
    status: 'published' as const,
  },
];

const FEATURE_HEATMAP = {
  features: ['Schedule View', 'Grade Check', 'Payment Portal', 'AI Advisor', 'Campus Events', 'Social Feed', 'Library Search', 'Club Activities'],
  features_ar: ['عرض الجدول', 'التحقق من الدرجات', 'بوابة الدفع', 'المستشار الذكي', 'فعاليات الحرم', 'المنشورات', 'بحث المكتبة', 'أنشطة الأندية'],
  hours: ['8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM', '8PM', '9PM', '10PM'],
  hours_ar: ['٨ص', '٩ص', '١٠ص', '١١ص', '١٢م', '١م', '٢م', '٣م', '٤م', '٥م', '٦م', '٧م', '٨م', '٩م', '١٠م'],
  data: [
    // Schedule View — peaks in morning
    [85, 92, 78, 45, 30, 35, 28, 22, 18, 15, 12, 10, 8, 6, 4],
    // Grade Check — peaks around midday
    [20, 35, 55, 72, 80, 88, 75, 60, 50, 42, 38, 30, 45, 55, 35],
    // Payment Portal — spikes around 10–1
    [10, 15, 45, 60, 55, 50, 35, 25, 20, 18, 15, 12, 10, 8, 5],
    // AI Advisor — steady afternoon/evening
    [8, 12, 18, 25, 30, 38, 42, 48, 52, 55, 58, 60, 65, 62, 45],
    // Campus Events — peaks late afternoon
    [5, 8, 12, 15, 18, 22, 28, 35, 45, 55, 60, 52, 40, 30, 18],
    // Social Feed — peaks evening
    [3, 5, 8, 12, 18, 25, 30, 35, 42, 50, 60, 72, 80, 75, 55],
    // Library Search — peaks mid-morning
    [15, 25, 40, 55, 48, 35, 28, 22, 18, 15, 12, 10, 15, 20, 12],
    // Club Activities — peaks late afternoon
    [2, 3, 5, 8, 10, 12, 18, 28, 38, 45, 42, 35, 25, 18, 10],
  ],
};

const FOLLOW_UP_REMINDERS = [
  { id: 'fu_1', student_id: 'student_401', student_name_en: 'Mohammed Al-Otaibi', student_name_ar: 'محمد العتيبي', intervention_date: '2026-03-10', due_date: '2026-04-09', status: 'overdue' as const, action_en: 'Schedule Meeting', action_ar: 'جدولة اجتماع' },
  { id: 'fu_2', student_id: 'student_402', student_name_en: 'Sarah Al-Dosari', student_name_ar: 'سارة الدوسري', intervention_date: '2026-03-20', due_date: '2026-04-19', status: 'upcoming' as const, action_en: 'Contact Parent/Guardian', action_ar: 'التواصل مع ولي الأمر' },
];

const SENT_MESSAGES = [
  { message_id: 'comm_001', subject_en: 'Registration Reminder', subject_ar: 'تذكير بالتسجيل', target_audience: 'all_students', recipients_count: 4200, sent_at: '2026-04-07T10:00:00Z', channels: ['push', 'email'] },
  { message_id: 'comm_002', subject_en: 'Payment Deadline', subject_ar: 'موعد السداد', target_audience: 'at_risk', recipients_count: 47, sent_at: '2026-04-05T14:00:00Z', channels: ['push', 'email', 'sms'] },
];

export const api = {
  getEngagement: async () => withErrorHandling('getEngagement', async () => { await delay(); return ENGAGEMENT; }),
  getRetention: async () => withErrorHandling('getRetention', async () => { await delay(); return RETENTION; }),
  getAtRiskStudents: async () => withErrorHandling('getAtRiskStudents', async () => { await delay(); return AT_RISK_STUDENTS; }),
  intervene: async (id: string, body: Record<string, unknown>) => withErrorHandling('intervene', async () => {
    await delay();
    return { intervention_id: `int_${Date.now()}`, student_id: id, action: body.action, status: 'scheduled' };
  }),
  sendCommunication: async (body: Record<string, unknown>) => withErrorHandling('sendCommunication', async () => {
    await delay(500);
    return { message_id: `comm_${Date.now()}`, recipients_count: 342, status: 'queued', ...body };
  }),
  getBranding: async () => withErrorHandling('getBranding', async () => { await delay(); return { university_name_en: 'Canadian College of Kuwait', university_name_ar: 'الكلية الكندية في الكويت', primary_color: '#006341', secondary_color: '#76B82A' }; }),
  updateBranding: async (body: Record<string, unknown>) => withErrorHandling('updateBranding', async () => { await delay(500); return { ...body, updated_at: new Date().toISOString() }; }),
  getUsers: async () => withErrorHandling('getUsers', async () => { await delay(); return ADMIN_USERS; }),
  createUser: async (body: Record<string, unknown>) => withErrorHandling('createUser', async () => {
    await delay(500);
    return { id: `admin_${Date.now()}`, ...body, status: 'active', created_at: new Date().toISOString(), last_login: null };
  }),
  updateRole: async (id: string, role: string) => withErrorHandling('updateRole', async () => { await delay(); return { id, role, updated_at: new Date().toISOString() }; }),
  importStudents: async (_body: Record<string, unknown>) => withErrorHandling('importStudents', async () => {
    await delay(800);
    return { import_id: `imp_${Date.now()}`, total_records: 150, successful: 148, failed: 2 };
  }),
  exportStudents: async () => withErrorHandling('exportStudents', async () => { await delay(); return { export_id: `exp_${Date.now()}`, total_records: 4200 }; }),
  getIntegrations: async () => withErrorHandling('getIntegrations', async () => { await delay(); return INTEGRATIONS; }),
  triggerSync: async () => withErrorHandling('triggerSync', async () => { await delay(500); return { sync_id: `sync_${Date.now()}`, status: 'started' }; }),
  getStudentProfile: async (id: string) => withErrorHandling('getStudentProfile', async () => { await delay(); return STUDENT_PROFILES[id] || generateProfile(id); }),
  getAuditLog: async () => withErrorHandling('getAuditLog', async () => { await delay(); return AUDIT_LOG; }),
  getPaymentAnalytics: async () => withErrorHandling('getPaymentAnalytics', async () => { await delay(); return PAYMENT_ANALYTICS; }),
  getAIMonitoring: async () => withErrorHandling('getAIMonitoring', async () => { await delay(); return AI_MONITORING; }),
  getContent: async () => withErrorHandling('getContent', async () => { await delay(); return CONTENT_ITEMS; }),
  approveContent: async (type: string, id: string) => withErrorHandling('approveContent', async () => { await delay(); return { type, id, status: 'approved' }; }),

  // Settings — General & Security
  updateGeneralSettings: async (body: Record<string, unknown>) => withErrorHandling('updateGeneralSettings', async () => {
    await delay(500);
    return { ...body, updated_at: new Date().toISOString() };
  }),
  updateSecuritySettings: async (body: Record<string, unknown>) => withErrorHandling('updateSecuritySettings', async () => {
    await delay(500);
    return { ...body, updated_at: new Date().toISOString() };
  }),

  // Retention — interventions & outcomes
  logIntervention: async (studentId: string, intervention: Record<string, unknown>) => withErrorHandling('logIntervention', async () => {
    await delay();
    return { id: 'int_' + Date.now(), student_id: studentId, ...intervention, logged_at: new Date().toISOString() };
  }),
  updateOutcome: async (studentId: string, outcome: string) => withErrorHandling('updateOutcome', async () => {
    await delay();
    return { student_id: studentId, outcome, updated_at: new Date().toISOString() };
  }),

  // Communications — sent history
  getSentCommunications: async () => withErrorHandling('getSentCommunications', async () => {
    await delay();
    return [...SENT_MESSAGES];
  }),

  // Integrations — reconnect
  reconnectIntegration: async (adapterId: string) => withErrorHandling('reconnectIntegration', async () => {
    await delay(500);
    return { adapter_id: adapterId, status: 'connecting' };
  }),

  // SSO configuration
  getSSOConfig: async () => withErrorHandling('getSSOConfig', async () => {
    await delay();
    return {
      enabled: false,
      provider: 'saml',
      entity_id: '',
      sso_url: '',
      certificate: '',
      attribute_mapping: { email: 'email', name: 'displayName', student_id: 'employeeNumber' },
    };
  }),
  updateSSOConfig: async (body: Record<string, unknown>) => withErrorHandling('updateSSOConfig', async () => {
    await delay(500);
    return { ...body, updated_at: new Date().toISOString() };
  }),

  // Feature usage heatmap
  getFeatureHeatmap: async () => withErrorHandling('getFeatureHeatmap', async () => {
    await delay();
    return FEATURE_HEATMAP;
  }),

  // Campus directory
  getCampusDirectory: async () => withErrorHandling('getCampusDirectory', async () => {
    await delay();
    return CAMPUS_DIRECTORY;
  }),
  updateDirectoryItem: async (id: string, body: Record<string, unknown>) => withErrorHandling('updateDirectoryItem', async () => {
    await delay(500);
    return { id, ...body, updated_at: new Date().toISOString() };
  }),

  // Follow-up reminders
  getFollowUpReminders: async () => withErrorHandling('getFollowUpReminders', async () => {
    await delay();
    return FOLLOW_UP_REMINDERS;
  }),
  dismissReminder: async (id: string) => withErrorHandling('dismissReminder', async () => {
    await delay();
    return { id, dismissed: true };
  }),

  // Risk recalculation info
  getRiskRecalcInfo: async () => withErrorHandling('getRiskRecalcInfo', async () => {
    await delay();
    return { last_calculated: '2026-04-07T03:00:00Z', next_scheduled: '2026-04-14T03:00:00Z', model_version: 'v2.1' };
  }),

  // Export students with filters
  exportStudentsFiltered: async (filters: Record<string, unknown>) => withErrorHandling('exportStudentsFiltered', async () => {
    await delay(500);
    return { export_id: `exp_${Date.now()}`, total_records: 4200, filters_applied: filters, format: 'csv' };
  }),

  // Bulk operations
  bulkUpdateRole: async (userIds: string[], role: string) => withErrorHandling('bulkUpdateRole', async () => {
    await delay(500);
    return { updated: userIds.length, role, updated_at: new Date().toISOString() };
  }),
  bulkSuspend: async (userIds: string[]) => withErrorHandling('bulkSuspend', async () => {
    await delay(500);
    return { suspended: userIds.length, updated_at: new Date().toISOString() };
  }),
};

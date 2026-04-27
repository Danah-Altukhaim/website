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
    email: 'dean@ksu.edu.sa',
    name_ar: 'د. عبدالله الفيصل',
    name_en: 'Dr. Abdullah Al-Faisal',
    role: 'super_admin',
    status: 'active',
    created_at: '2025-09-01T00:00:00Z',
    last_login: '2026-04-08T08:30:00Z',
  },
  {
    id: 'admin_002',
    email: 'registrar@ksu.edu.sa',
    name_ar: 'نورة الشهري',
    name_en: 'Noura Al-Shahri',
    role: 'university_admin',
    status: 'active',
    created_at: '2025-09-15T00:00:00Z',
    last_login: '2026-04-07T14:20:00Z',
  },
  {
    id: 'admin_003',
    email: 'advisor.cs@ksu.edu.sa',
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
    email: 'm.otaibi@students.ksu.edu.sa', risk_score: 0.85, risk_level: 'high',
    college_en: 'College of Computer Science', major_en: 'Software Engineering', year: '3rd Year', gpa: 1.8,
    assigned_advisor: { name_en: 'Ahmed Al-Ghamdi', email: 'advisor.cs@ksu.edu.sa' },
    contributing_factors: [
      { factor_en: 'Sharp GPA decline', weight: 0.4 },
      { factor_en: 'Frequent absences in last 3 weeks', weight: 0.3 },
      { factor_en: '4 missing assignments', weight: 0.15 },
    ],
    academic_history: [
      { semester: 'Fall 2024', gpa: 3.2, credits: 15, status: 'Good Standing' },
      { semester: 'Spring 2025', gpa: 2.6, credits: 15, status: 'Good Standing' },
      { semester: 'Fall 2025', gpa: 2.1, credits: 12, status: 'Warning' },
      { semester: 'Spring 2026', gpa: 1.8, credits: 12, status: 'Probation' },
    ],
    attendance: [
      { course: 'CS301 - Software Engineering', attended: 8, total: 14, rate: 57 },
      { course: 'CS310 - Database Systems', attended: 10, total: 14, rate: 71 },
      { course: 'CS350 - Networks', attended: 12, total: 14, rate: 86 },
      { course: 'MATH301 - Linear Algebra', attended: 6, total: 14, rate: 43 },
    ],
    payment_status: [
      { item: 'Tuition - Spring 2026', amount: 22500, status: 'Paid', due_date: '2026-01-15' },
      { item: 'Lab Fees', amount: 1500, status: 'Paid', due_date: '2026-01-15' },
      { item: 'Late Registration Fee', amount: 500, status: 'Overdue', due_date: '2026-03-01' },
    ],
    engagement_timeline: [
      { date: 'Apr 2', action: 'Last app login' },
      { date: 'Apr 1', action: 'Viewed grade for CS301' },
      { date: 'Mar 28', action: 'Opened AI Advisor — asked about withdrawal' },
      { date: 'Mar 25', action: 'Checked payment balance' },
      { date: 'Mar 20', action: 'Viewed schedule' },
      { date: 'Mar 15', action: 'Last LMS login (Blackboard)' },
    ],
    interventions: [
      { date: '2026-03-10', type: 'Schedule Meeting', advisor: 'Ahmed Al-Ghamdi', outcome: 'Ongoing', notes: 'Student agreed to attend tutoring sessions' },
      { date: '2026-02-15', type: 'Send In-App Message', advisor: 'Ahmed Al-Ghamdi', outcome: 'Resolved', notes: 'Reminded about missing assignments, submitted 2 of 4' },
    ],
  },
  student_402: {
    id: 'student_402', name_en: 'Sarah Al-Dosari', name_ar: 'سارة الدوسري', student_id: '441023456',
    email: 's.dosari@students.ksu.edu.sa', risk_score: 0.78, risk_level: 'high',
    college_en: 'College of Engineering', major_en: 'Civil Engineering', year: '4th Year', gpa: 2.1,
    assigned_advisor: { name_en: 'Fatima Al-Rashid', email: 'advisor.eng@ksu.edu.sa' },
    contributing_factors: [
      { factor_en: 'Overdue tuition payment', weight: 0.35 },
      { factor_en: 'Decreased platform engagement', weight: 0.25 },
      { factor_en: 'Failed 2 courses', weight: 0.18 },
    ],
    academic_history: [
      { semester: 'Fall 2024', gpa: 2.8, credits: 16, status: 'Good Standing' },
      { semester: 'Spring 2025', gpa: 2.5, credits: 15, status: 'Good Standing' },
      { semester: 'Fall 2025', gpa: 2.3, credits: 14, status: 'Warning' },
      { semester: 'Spring 2026', gpa: 2.1, credits: 12, status: 'Warning' },
    ],
    attendance: [
      { course: 'CE401 - Structural Analysis', attended: 11, total: 14, rate: 79 },
      { course: 'CE410 - Construction Mgmt', attended: 9, total: 14, rate: 64 },
      { course: 'CE450 - Capstone Project', attended: 13, total: 14, rate: 93 },
    ],
    payment_status: [
      { item: 'Tuition - Spring 2026', amount: 24000, status: 'Overdue', due_date: '2026-01-15' },
      { item: 'Lab Fees', amount: 2000, status: 'Overdue', due_date: '2026-01-15' },
    ],
    engagement_timeline: [
      { date: 'Apr 5', action: 'Last app login' },
      { date: 'Apr 3', action: 'Checked payment — saw overdue notice' },
      { date: 'Mar 30', action: 'Viewed capstone project deadline' },
    ],
    interventions: [
      { date: '2026-03-20', type: 'Contact Parent/Guardian', advisor: 'Fatima Al-Rashid', outcome: 'Ongoing', notes: 'Discussed financial situation with family' },
    ],
  },
};

// Generate generic profile for students without detailed mock
function generateProfile(id: string) {
  const s = AT_RISK_STUDENTS.find((s) => s.id === id);
  if (!s) return null;
  return {
    ...s, email: `${id}@students.ksu.edu.sa`, major_en: 'General Studies', year: '2nd Year',
    assigned_advisor: { name_en: 'Ahmed Al-Ghamdi', email: 'advisor.cs@ksu.edu.sa' },
    academic_history: [
      { semester: 'Fall 2025', gpa: 2.8, credits: 15, status: 'Good Standing' },
      { semester: 'Spring 2026', gpa: s.gpa, credits: 12, status: s.gpa < 2.0 ? 'Probation' : 'Warning' },
    ],
    attendance: [
      { course: 'GEN201 - Core Course', attended: 9, total: 14, rate: 64 },
      { course: 'GEN202 - Elective', attended: 11, total: 14, rate: 79 },
    ],
    payment_status: [{ item: 'Tuition - Spring 2026', amount: 20000, status: 'Paid', due_date: '2026-01-15' }],
    engagement_timeline: [
      { date: 'Apr 7', action: 'Last app login' },
      { date: 'Apr 5', action: 'Viewed schedule' },
    ],
    interventions: [],
  };
}

const AUDIT_LOG = [
  { id: 'log_001', timestamp: '2026-04-08T14:30:00Z', admin_name: 'Dr. Abdullah Al-Faisal', action: 'Updated branding colors', resource: 'Branding Config', ip: '10.0.1.15' },
  { id: 'log_002', timestamp: '2026-04-08T12:15:00Z', admin_name: 'Noura Al-Shahri', action: 'Sent communication to all students', resource: 'Communications', ip: '10.0.1.22' },
  { id: 'log_003', timestamp: '2026-04-08T10:45:00Z', admin_name: 'Ahmed Al-Ghamdi', action: 'Scheduled intervention for Mohammed Al-Otaibi', resource: 'Retention', ip: '10.0.1.35' },
  { id: 'log_004', timestamp: '2026-04-07T16:20:00Z', admin_name: 'Noura Al-Shahri', action: 'Imported 150 student records', resource: 'User Management', ip: '10.0.1.22' },
  { id: 'log_005', timestamp: '2026-04-07T14:00:00Z', admin_name: 'Dr. Abdullah Al-Faisal', action: 'Changed role for admin_003 to advisor', resource: 'User Management', ip: '10.0.1.15' },
  { id: 'log_006', timestamp: '2026-04-07T11:30:00Z', admin_name: 'Noura Al-Shahri', action: 'Triggered manual data sync', resource: 'Integrations', ip: '10.0.1.22' },
  { id: 'log_007', timestamp: '2026-04-07T09:00:00Z', admin_name: 'Ahmed Al-Ghamdi', action: 'Marked intervention as Resolved for student_402', resource: 'Retention', ip: '10.0.1.35' },
  { id: 'log_008', timestamp: '2026-04-06T15:45:00Z', admin_name: 'Dr. Abdullah Al-Faisal', action: 'Approved club "Robotics Society"', resource: 'Content Management', ip: '10.0.1.15' },
  { id: 'log_009', timestamp: '2026-04-06T10:30:00Z', admin_name: 'Noura Al-Shahri', action: 'Exported student data (CSV)', resource: 'User Management', ip: '10.0.1.22' },
  { id: 'log_010', timestamp: '2026-04-05T13:15:00Z', admin_name: 'Ahmed Al-Ghamdi', action: 'Sent communication to at-risk students', resource: 'Communications', ip: '10.0.1.35' },
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
    { method: 'KNET', count: 2840, amount: 9650000, percentage: 58.0 },
    { method: 'Credit Card', count: 1250, amount: 4320000, percentage: 26.0 },
    { method: 'Bank Transfer', count: 480, amount: 2150000, percentage: 12.9 },
    { method: 'Cash', count: 120, amount: 512000, percentage: 3.1 },
  ],
  overdue_by_college: [
    { college: 'Engineering', students: 45, amount: 720000 },
    { college: 'Business', students: 38, amount: 580000 },
    { college: 'Computer Science', students: 22, amount: 420000 },
    { college: 'Science', students: 18, amount: 310000 },
    { college: 'Arts', students: 15, amount: 238000 },
  ],
};

const AI_MONITORING = {
  total_conversations: 12450,
  avg_satisfaction: 4.2,
  escalation_rate: 8.3,
  avg_response_time_sec: 2.1,
  conversations_today: 342,
  topic_distribution: [
    { topic: 'Registration & Enrollment', count: 3200, percentage: 25.7 },
    { topic: 'Grade Inquiries', count: 2680, percentage: 21.5 },
    { topic: 'Course Recommendations', count: 1870, percentage: 15.0 },
    { topic: 'Schedule Conflicts', count: 1560, percentage: 12.5 },
    { topic: 'Financial Aid & Payments', count: 1240, percentage: 10.0 },
    { topic: 'Campus Services', count: 980, percentage: 7.9 },
    { topic: 'Other', count: 920, percentage: 7.4 },
  ],
  escalation_reasons: [
    { reason: 'Low confidence (<70%)', count: 580, percentage: 56.1 },
    { reason: 'Student requested human', count: 245, percentage: 23.7 },
    { reason: 'Sensitive topic detected', count: 132, percentage: 12.8 },
    { reason: 'Multi-step process', count: 77, percentage: 7.4 },
  ],
  satisfaction_breakdown: [
    { rating: 5, count: 4200, percentage: 33.7 },
    { rating: 4, count: 4050, percentage: 32.5 },
    { rating: 3, count: 2490, percentage: 20.0 },
    { rating: 2, count: 1120, percentage: 9.0 },
    { rating: 1, count: 590, percentage: 4.7 },
  ],
  recent_escalations: [
    { id: 'esc_01', student: 'Khalid M.', topic: 'Financial hold on registration', timestamp: '2026-04-08T14:20:00Z', status: 'pending' },
    { id: 'esc_02', student: 'Noura A.', topic: 'Grade dispute CS301', timestamp: '2026-04-08T11:45:00Z', status: 'assigned' },
    { id: 'esc_03', student: 'Omar S.', topic: 'Graduation requirements unclear', timestamp: '2026-04-08T09:30:00Z', status: 'resolved' },
  ],
};

const CONTENT_ITEMS = {
  events: [
    { id: 'evt_1', title_en: 'Career Fair 2026', title_ar: 'معرض التوظيف ٢٠٢٦', date: '2026-04-20', status: 'approved', category: 'Career' },
    { id: 'evt_2', title_en: 'Hackathon: AI for Education', title_ar: 'هاكاثون: الذكاء الاصطناعي للتعليم', date: '2026-04-25', status: 'pending', category: 'Academic' },
    { id: 'evt_3', title_en: 'Spring Sports Tournament', title_ar: 'بطولة الربيع الرياضية', date: '2026-05-01', status: 'approved', category: 'Sports' },
  ],
  news: [
    { id: 'news_1', title_en: 'New Library Hours for Exam Period', title_ar: 'ساعات المكتبة الجديدة لفترة الاختبارات', date: '2026-04-08', status: 'published' },
    { id: 'news_2', title_en: 'Scholarship Applications Open', title_ar: 'فتح باب التقديم للمنح الدراسية', date: '2026-04-05', status: 'published' },
    { id: 'news_3', title_en: 'Campus Wi-Fi Upgrade', title_ar: 'تحديث شبكة الواي فاي', date: '2026-04-03', status: 'draft' },
  ],
  clubs: [
    { id: 'club_1', name_en: 'Robotics Society', name_ar: 'جمعية الروبوتات', members: 45, status: 'approved', advisor: 'Dr. Hassan' },
    { id: 'club_2', name_en: 'Debate Club', name_ar: 'نادي المناظرات', members: 32, status: 'pending', advisor: 'Dr. Layla' },
    { id: 'club_3', name_en: 'Photography Club', name_ar: 'نادي التصوير', members: 28, status: 'approved', advisor: 'Prof. Saleh' },
    { id: 'club_4', name_en: 'Entrepreneurship Hub', name_ar: 'مركز ريادة الأعمال', members: 67, status: 'approved', advisor: 'Dr. Nasser' },
  ],
};

const INTEGRATIONS = [
  {
    adapter_id: 'blackboard',
    name_ar: 'بلاك بورد',
    name_en: 'Blackboard',
    status: 'connected',
    last_sync: '2026-04-08T06:00:00Z',
    records_synced: 12450,
    health: 'healthy',
  },
  {
    adapter_id: 'banner',
    name_ar: 'بانر',
    name_en: 'Banner',
    status: 'syncing',
    last_sync: '2026-04-08T07:30:00Z',
    records_synced: 8920,
    health: 'healthy',
    sync_progress: 67,
  },
  {
    adapter_id: 'canvas',
    name_ar: 'كانفاس',
    name_en: 'Canvas',
    status: 'disconnected',
    last_sync: '2026-04-01T12:00:00Z',
    records_synced: 0,
    health: 'error',
    error_ar: 'انتهت صلاحية مفتاح الاتصال',
    error_en: 'API key expired',
  },
];

const CAMPUS_DIRECTORY = [
  {
    id: 'dir_1', type: 'building' as const,
    name_en: 'Main Administration Building', name_ar: 'مبنى الإدارة الرئيسي',
    location_en: 'Central Campus', location_ar: 'الحرم المركزي',
    phone: '+966-11-467-0000', email: 'admin@ksu.edu.sa',
    hours_en: 'Sun–Thu 8:00–16:00', hours_ar: 'الأحد–الخميس ٨:٠٠–١٦:٠٠',
    status: 'published' as const,
  },
  {
    id: 'dir_2', type: 'office' as const,
    name_en: 'Registrar Office', name_ar: 'مكتب القبول والتسجيل',
    location_en: 'Admin Building, Floor 2', location_ar: 'مبنى الإدارة، الطابق الثاني',
    phone: '+966-11-467-1111', email: 'registrar@ksu.edu.sa',
    hours_en: 'Sun–Thu 9:00–15:00', hours_ar: 'الأحد–الخميس ٩:٠٠–١٥:٠٠',
    status: 'published' as const,
  },
  {
    id: 'dir_3', type: 'service' as const,
    name_en: 'Student Health Center', name_ar: 'مركز صحة الطلاب',
    location_en: 'Building 14', location_ar: 'مبنى ١٤',
    phone: '+966-11-467-2222', email: 'health@ksu.edu.sa',
    hours_en: 'Sun–Thu 8:00–20:00', hours_ar: 'الأحد–الخميس ٨:٠٠–٢٠:٠٠',
    status: 'published' as const,
  },
  {
    id: 'dir_4', type: 'service' as const,
    name_en: 'IT Help Desk', name_ar: 'مكتب الدعم التقني',
    location_en: 'Library Building, Ground Floor', location_ar: 'مبنى المكتبة، الطابق الأرضي',
    phone: '+966-11-467-3333', email: 'it@ksu.edu.sa',
    hours_en: 'Sun–Thu 8:00–22:00', hours_ar: 'الأحد–الخميس ٨:٠٠–٢٢:٠٠',
    status: 'draft' as const,
  },
  {
    id: 'dir_5', type: 'building' as const,
    name_en: 'College of Computer Science', name_ar: 'كلية علوم الحاسب',
    location_en: 'North Campus', location_ar: 'الحرم الشمالي',
    phone: '+966-11-467-4444', email: 'cs@ksu.edu.sa',
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
  { id: 'fu_1', student_id: 'student_401', student_name_en: 'Mohammed Al-Otaibi', student_name_ar: 'محمد العتيبي', intervention_date: '2026-03-10', due_date: '2026-04-09', status: 'overdue' as const, action: 'Schedule Meeting' },
  { id: 'fu_2', student_id: 'student_402', student_name_en: 'Sarah Al-Dosari', student_name_ar: 'سارة الدوسري', intervention_date: '2026-03-20', due_date: '2026-04-19', status: 'upcoming' as const, action: 'Contact Parent/Guardian' },
];

const SENT_MESSAGES = [
  { message_id: 'comm_001', subject_en: 'Registration Reminder', subject_ar: 'تذكير بالتسجيل', target_audience: 'all_students', recipients_count: 4200, sent_at: '2026-04-07T10:00:00Z', channels: ['push', 'email'] },
  { message_id: 'comm_002', subject_en: 'Payment Deadline', subject_ar: 'موعد السداد', target_audience: 'at_risk', recipients_count: 47, sent_at: '2026-04-05T14:00:00Z', channels: ['push', 'email', 'sms'] },
];

/* ────────────────────────────────────────────────────────────
 * CCK-Hub workflow mock data
 *   Backs the Document Management & Workflow System spec.
 *   Types are duplicated here on purpose — admin app is a
 *   standalone front-end with no backend wired up yet.
 * ──────────────────────────────────────────────────────────── */

export type RequestType =
  | 'twimc'
  | 'twimc_balance'
  | 'transcript'
  | 'semester_withdrawal'
  | 'college_withdrawal'
  | 'absence_excuse'
  | 'expected_grad'
  | 'puc_letter'
  | 'puc_no_aid'
  | 'industrial_cert'
  | 'lost_id'
  | 'update_id_photo';

export type RequestStatus = 'submitted' | 'in_progress' | 'completed' | 'cancelled';

export interface RequestComment {
  id: string;
  author_en: string;
  author_ar: string;
  body: string;
  created_at: string;
  internal: boolean;
}

export interface RequestAttachment {
  id: string;
  name: string;
  size_kb: number;
  uploaded_by_en: string;
  uploaded_by_ar: string;
  uploaded_at: string;
}

export interface RequestWorkflowStep {
  key: string;
  label_en: string;
  label_ar: string;
  status: 'completed' | 'current' | 'pending';
  completed_at?: string;
}

export interface StudentRequest {
  id: string;
  type: RequestType;
  student_id: string;
  student_name_en: string;
  student_name_ar: string;
  status: RequestStatus;
  submitted_at: string;
  assigned_to_en: string | null;
  assigned_to_ar: string | null;
  payment_status: 'paid' | 'pending' | 'not_required';
  workflow: RequestWorkflowStep[];
  attachments: RequestAttachment[];
  comments: RequestComment[];
}

const wfTwimc = (step: 0 | 1 | 2 | 3): RequestWorkflowStep[] => [
  { key: 'submitted', label_en: 'Submitted by student', label_ar: 'قدّمها الطالب',
    status: step >= 0 ? 'completed' : 'pending', completed_at: '2026-04-21T08:00:00Z' },
  { key: 'paid', label_en: 'Online payment received', label_ar: 'تم استلام الدفع',
    status: step >= 1 ? 'completed' : step === 0 ? 'current' : 'pending' },
  { key: 'in_progress', label_en: 'Assigned to Registration', label_ar: 'مسند للتسجيل',
    status: step >= 2 ? 'completed' : step === 1 ? 'current' : 'pending' },
  { key: 'completed', label_en: 'Letter ready for pickup', label_ar: 'الخطاب جاهز للاستلام',
    status: step >= 3 ? 'completed' : step === 2 ? 'current' : 'pending' },
];

const wfWithdrawal = (step: 0 | 1 | 2 | 3 | 4): RequestWorkflowStep[] => [
  { key: 'submitted', label_en: 'Form submitted by student', label_ar: 'قدّم الطالب النموذج',
    status: step >= 0 ? 'completed' : 'pending' },
  { key: 'advisor', label_en: 'Advisor feedback', label_ar: 'رأي المرشد',
    status: step >= 1 ? 'completed' : step === 0 ? 'current' : 'pending' },
  { key: 'finance', label_en: 'Finance approval', label_ar: 'موافقة المالية',
    status: step >= 2 ? 'completed' : step === 1 ? 'current' : 'pending' },
  { key: 'puc', label_en: 'PUC documents (if sponsored)', label_ar: 'مستندات PUC (للمبتعثين)',
    status: step >= 3 ? 'completed' : step === 2 ? 'current' : 'pending' },
  { key: 'registration', label_en: 'Registration processing', label_ar: 'إجراء التسجيل',
    status: step >= 4 ? 'completed' : step === 3 ? 'current' : 'pending' },
];

const wfAbsence = (step: 0 | 1 | 2): RequestWorkflowStep[] => [
  { key: 'submitted', label_en: 'Excuse + medical doc submitted', label_ar: 'تقديم العذر والمستند الطبي',
    status: step >= 0 ? 'completed' : 'pending' },
  { key: 'review', label_en: 'Registration review', label_ar: 'مراجعة التسجيل',
    status: step >= 1 ? 'completed' : step === 0 ? 'current' : 'pending' },
  { key: 'applied', label_en: 'Excuse applied to courses in SIS', label_ar: 'تطبيق العذر في النظام الأكاديمي',
    status: step >= 2 ? 'completed' : step === 1 ? 'current' : 'pending' },
];

const STUDENT_REQUESTS: StudentRequest[] = [
  {
    id: 'REQ-2026-0431', type: 'twimc',
    student_id: '20211045', student_name_en: 'Yousef Al-Mutairi', student_name_ar: 'يوسف المطيري',
    status: 'in_progress', submitted_at: '2026-04-23T08:14:00Z',
    assigned_to_en: 'Noura Al-Shahri', assigned_to_ar: 'نورة الشهري',
    payment_status: 'paid',
    workflow: wfTwimc(2),
    attachments: [
      { id: 'att1', name: 'civil_id.pdf', size_kb: 412, uploaded_by_en: 'Yousef Al-Mutairi', uploaded_by_ar: 'يوسف المطيري', uploaded_at: '2026-04-23T08:14:00Z' },
    ],
    comments: [
      { id: 'c1', author_en: 'Noura Al-Shahri', author_ar: 'نورة الشهري',
        body: 'Letter drafted, pending department head signature.', created_at: '2026-04-24T10:21:00Z', internal: true },
    ],
  },
  {
    id: 'REQ-2026-0432', type: 'transcript',
    student_id: '20221180', student_name_en: 'Mariam Al-Ajmi', student_name_ar: 'مريم العجمي',
    status: 'submitted', submitted_at: '2026-04-25T11:02:00Z',
    assigned_to_en: null, assigned_to_ar: null, payment_status: 'paid',
    workflow: wfTwimc(1),
    attachments: [],
    comments: [],
  },
  {
    id: 'REQ-2026-0433', type: 'semester_withdrawal',
    student_id: '20201990', student_name_en: 'Khalid Al-Rashidi', student_name_ar: 'خالد الرشيدي',
    status: 'in_progress', submitted_at: '2026-04-19T13:40:00Z',
    assigned_to_en: 'Noura Al-Shahri', assigned_to_ar: 'نورة الشهري', payment_status: 'not_required',
    workflow: wfWithdrawal(2),
    attachments: [
      { id: 'att2', name: 'withdrawal_form_signed.pdf', size_kb: 880, uploaded_by_en: 'Khalid Al-Rashidi', uploaded_by_ar: 'خالد الرشيدي', uploaded_at: '2026-04-19T13:40:00Z' },
      { id: 'att3', name: 'PUC_freeze_form.pdf', size_kb: 624, uploaded_by_en: 'Khalid Al-Rashidi', uploaded_by_ar: 'خالد الرشيدي', uploaded_at: '2026-04-20T09:11:00Z' },
    ],
    comments: [
      { id: 'c2', author_en: 'Ahmed Al-Ghamdi (Advisor)', author_ar: 'أحمد الغامدي (مرشد)',
        body: 'Student has cleared all incomplete grades. Recommended approval.', created_at: '2026-04-21T08:55:00Z', internal: false },
    ],
  },
  {
    id: 'REQ-2026-0434', type: 'absence_excuse',
    student_id: '20231022', student_name_en: 'Lina Al-Otaibi', student_name_ar: 'لينا العتيبي',
    status: 'submitted', submitted_at: '2026-04-26T07:20:00Z',
    assigned_to_en: null, assigned_to_ar: null, payment_status: 'not_required',
    workflow: wfAbsence(1),
    attachments: [
      { id: 'att4', name: 'medical_report.pdf', size_kb: 521, uploaded_by_en: 'Lina Al-Otaibi', uploaded_by_ar: 'لينا العتيبي', uploaded_at: '2026-04-26T07:20:00Z' },
    ],
    comments: [],
  },
  {
    id: 'REQ-2026-0435', type: 'puc_letter',
    student_id: '20211045', student_name_en: 'Yousef Al-Mutairi', student_name_ar: 'يوسف المطيري',
    status: 'completed', submitted_at: '2026-04-10T09:00:00Z',
    assigned_to_en: 'Noura Al-Shahri', assigned_to_ar: 'نورة الشهري', payment_status: 'not_required',
    workflow: wfTwimc(3),
    attachments: [
      { id: 'att5', name: 'civil_id.pdf', size_kb: 412, uploaded_by_en: 'Yousef Al-Mutairi', uploaded_by_ar: 'يوسف المطيري', uploaded_at: '2026-04-10T09:00:00Z' },
    ],
    comments: [],
  },
  {
    id: 'REQ-2026-0436', type: 'college_withdrawal',
    student_id: '20191130', student_name_en: 'Fatima Al-Sabah', student_name_ar: 'فاطمة الصباح',
    status: 'in_progress', submitted_at: '2026-04-15T14:00:00Z',
    assigned_to_en: 'Noura Al-Shahri', assigned_to_ar: 'نورة الشهري', payment_status: 'not_required',
    workflow: wfWithdrawal(3),
    attachments: [
      { id: 'att6', name: 'college_withdrawal_form.pdf', size_kb: 901, uploaded_by_en: 'Fatima Al-Sabah', uploaded_by_ar: 'فاطمة الصباح', uploaded_at: '2026-04-15T14:00:00Z' },
      { id: 'att7', name: 'PUC_scholarship_cancel.pdf', size_kb: 612, uploaded_by_en: 'Fatima Al-Sabah', uploaded_by_ar: 'فاطمة الصباح', uploaded_at: '2026-04-16T11:20:00Z' },
    ],
    comments: [],
  },
  {
    id: 'REQ-2026-0437', type: 'expected_grad',
    student_id: '20191205', student_name_en: 'Abdullah Al-Failakawi', student_name_ar: 'عبدالله الفيلكاوي',
    status: 'submitted', submitted_at: '2026-04-26T09:30:00Z',
    assigned_to_en: null, assigned_to_ar: null, payment_status: 'paid',
    workflow: wfTwimc(1),
    attachments: [],
    comments: [],
  },
  {
    id: 'REQ-2026-0438', type: 'industrial_cert',
    student_id: '20251002', student_name_en: 'Saad Al-Hajri', student_name_ar: 'سعد الهاجري',
    status: 'in_progress', submitted_at: '2026-04-22T10:15:00Z',
    assigned_to_en: 'Ahmed Al-Ghamdi', assigned_to_ar: 'أحمد الغامدي', payment_status: 'not_required',
    workflow: wfTwimc(2),
    attachments: [
      { id: 'att8', name: 'industrial_certificate.pdf', size_kb: 1180, uploaded_by_en: 'Ahmed Al-Ghamdi', uploaded_by_ar: 'أحمد الغامدي', uploaded_at: '2026-04-22T10:15:00Z' },
    ],
    comments: [
      { id: 'c3', author_en: 'Ahmed Al-Ghamdi', author_ar: 'أحمد الغامدي',
        body: 'Forwarded to Registration to draft PUC acceptance letter.', created_at: '2026-04-23T13:00:00Z', internal: true },
    ],
  },
  {
    id: 'REQ-2026-0439', type: 'lost_id',
    student_id: '20221180', student_name_en: 'Mariam Al-Ajmi', student_name_ar: 'مريم العجمي',
    status: 'in_progress', submitted_at: '2026-04-24T15:30:00Z',
    assigned_to_en: 'IT Helpdesk', assigned_to_ar: 'مكتب الدعم التقني', payment_status: 'paid',
    workflow: [
      { key: 'submitted', label_en: 'Lost ID request submitted', label_ar: 'تقديم طلب فقدان البطاقة', status: 'completed' },
      { key: 'finance', label_en: 'Finance — replacement fee', label_ar: 'المالية — رسوم البدل', status: 'completed' },
      { key: 'it', label_en: 'IT prints new card', label_ar: 'IT يطبع البطاقة الجديدة', status: 'current' },
      { key: 'registration', label_en: 'Pickup at Registration', label_ar: 'الاستلام من التسجيل', status: 'pending' },
    ],
    attachments: [],
    comments: [],
  },
];

export interface AdmissionApplicant {
  id: string;
  applicant_name_en: string;
  applicant_name_ar: string;
  category: 'self_funded' | 'puc_sponsored' | 'other' | 'tc';
  transferred_from?: string;
  major: string;
  semester_admitted: string;
  entry_level: string;
  stage: 'admission' | 'academic' | 'admission_approval' | 'registration' | 'completed';
  documents: { key: string; status: 'uploaded' | 'missing' | 'flagged' }[];
  submitted_at: string;
  acceptance_letter_generated: boolean;
}

const ADMISSION_DOC_KEYS = [
  'civil_id', 'passport', 'equivalency', 'high_school',
  'father_civil_id', 'declaration', 'payment_proof',
  'puc_declaration', 'placement_test',
];

const ADMISSION_APPLICANTS: AdmissionApplicant[] = [
  {
    id: 'ADM-2026-101',
    applicant_name_en: 'Hessa Al-Mansour', applicant_name_ar: 'حصة المنصور',
    category: 'self_funded',
    major: 'Business Administration', semester_admitted: 'Fall 2026', entry_level: 'Level 3',
    stage: 'admission_approval',
    documents: ADMISSION_DOC_KEYS.map((k) => ({
      key: k,
      status: k === 'puc_declaration' ? 'missing' : k === 'placement_test' ? 'flagged' : 'uploaded',
    })),
    submitted_at: '2026-04-15T09:00:00Z',
    acceptance_letter_generated: false,
  },
  {
    id: 'ADM-2026-102',
    applicant_name_en: 'Faisal Al-Sane', applicant_name_ar: 'فيصل السانع',
    category: 'puc_sponsored',
    major: 'Computer Engineering Technology', semester_admitted: 'Fall 2026', entry_level: 'Level 2',
    stage: 'admission',
    documents: ADMISSION_DOC_KEYS.map((k) => ({
      key: k,
      status: k === 'payment_proof' ? 'missing' : 'uploaded',
    })),
    submitted_at: '2026-04-22T11:30:00Z',
    acceptance_letter_generated: false,
  },
  {
    id: 'ADM-2026-103',
    applicant_name_en: 'Dana Al-Khalifa', applicant_name_ar: 'دانة الخليفة',
    category: 'tc', transferred_from: 'Kuwait University — College of Engineering',
    major: 'Mechanical Engineering Technology', semester_admitted: 'Fall 2026', entry_level: 'Level 4',
    stage: 'academic',
    documents: ADMISSION_DOC_KEYS.map((k) => ({ key: k, status: 'uploaded' })),
    submitted_at: '2026-04-08T14:00:00Z',
    acceptance_letter_generated: false,
  },
  {
    id: 'ADM-2026-104',
    applicant_name_en: 'Talal Al-Kandari', applicant_name_ar: 'طلال الكندري',
    category: 'self_funded',
    major: 'Business Administration', semester_admitted: 'Fall 2026', entry_level: 'Level 1',
    stage: 'completed',
    documents: ADMISSION_DOC_KEYS.map((k) => ({ key: k, status: 'uploaded' })),
    submitted_at: '2026-03-28T10:00:00Z',
    acceptance_letter_generated: true,
  },
  {
    id: 'ADM-2026-105',
    applicant_name_en: 'Aisha Al-Anezi', applicant_name_ar: 'عائشة العنزي',
    category: 'puc_sponsored',
    major: 'Aviation Maintenance Engineering Technology', semester_admitted: 'Fall 2026', entry_level: 'Level 3',
    stage: 'registration',
    documents: ADMISSION_DOC_KEYS.map((k) => ({ key: k, status: 'uploaded' })),
    submitted_at: '2026-04-02T08:30:00Z',
    acceptance_letter_generated: true,
  },
];

export type SocialCategory = 'kuwaiti' | 'kuwaiti_mother' | 'disabled' | 'married' | 'bank_change';
export interface SocialApplication {
  id: string;
  application_no: string;
  student_id: string;
  student_name_en: string;
  student_name_ar: string;
  category: SocialCategory;
  status: 'pending' | 'in_progress' | 'rejected' | 'completed';
  submitted_at: string;
  documents: { key: string; quality: 'ok' | 'issue' }[];
  sent_to_puc: boolean;
}

const SOCIAL_DOCS: Record<SocialCategory, string[]> = {
  kuwaiti: ['civil_id', 'security', 'social_affairs', 'salary_transfer'],
  kuwaiti_mother: [
    'civil_id', 'manpower', 'social_affairs', 'mother_nationality',
    'mother_civil_id', 'birth_cert', 'salary_transfer', 'twimc_mother',
  ],
  disabled: ['disability_proof'],
  married: ['marriage_cert', 'marriage_continuity', 'wife_civil_id'],
  bank_change: ['civil_id', 'salary_transfer', 'bank_form'],
};

const SOCIAL_APPLICATIONS: SocialApplication[] = [
  {
    id: 'SOC-2026-001', application_no: 'SA-26-001',
    student_id: '20221180', student_name_en: 'Mariam Al-Ajmi', student_name_ar: 'مريم العجمي',
    category: 'kuwaiti', status: 'in_progress',
    submitted_at: '2026-04-18T10:00:00Z',
    documents: SOCIAL_DOCS.kuwaiti.map((k) => ({ key: k, quality: 'ok' })),
    sent_to_puc: false,
  },
  {
    id: 'SOC-2026-002', application_no: 'SA-26-002',
    student_id: '20231022', student_name_en: 'Lina Al-Otaibi', student_name_ar: 'لينا العتيبي',
    category: 'kuwaiti_mother', status: 'pending',
    submitted_at: '2026-04-22T14:30:00Z',
    documents: SOCIAL_DOCS.kuwaiti_mother.map((k, i) => ({
      key: k, quality: i === 3 ? 'issue' : 'ok',
    })),
    sent_to_puc: false,
  },
  {
    id: 'SOC-2026-003', application_no: 'SA-26-003',
    student_id: '20211045', student_name_en: 'Yousef Al-Mutairi', student_name_ar: 'يوسف المطيري',
    category: 'married', status: 'completed',
    submitted_at: '2026-04-05T09:15:00Z',
    documents: SOCIAL_DOCS.married.map((k) => ({ key: k, quality: 'ok' })),
    sent_to_puc: true,
  },
  {
    id: 'SOC-2026-004', application_no: 'SA-26-004',
    student_id: '20241002', student_name_en: 'Reem Al-Failakawi', student_name_ar: 'ريم الفيلكاوي',
    category: 'disabled', status: 'in_progress',
    submitted_at: '2026-04-20T11:00:00Z',
    documents: SOCIAL_DOCS.disabled.map((k) => ({ key: k, quality: 'ok' })),
    sent_to_puc: false,
  },
  {
    id: 'SOC-2026-005', application_no: 'SA-26-005',
    student_id: '20191130', student_name_en: 'Fatima Al-Sabah', student_name_ar: 'فاطمة الصباح',
    category: 'bank_change', status: 'pending',
    submitted_at: '2026-04-25T08:00:00Z',
    documents: SOCIAL_DOCS.bank_change.map((k) => ({ key: k, quality: 'ok' })),
    sent_to_puc: false,
  },
];

export interface Appeal {
  id: string;
  student_id: string;
  student_name_en: string;
  student_name_ar: string;
  course_code: string;
  course_name: string;
  current_grade: string;
  status: 'submitted' | 'in_progress' | 'completed';
  submitted_at: string;
  faculty_assigned_en: string;
  faculty_assigned_ar: string;
  form_uploaded: boolean;
}

const APPEALS: Appeal[] = [
  {
    id: 'APP-2026-001', student_id: '20211045',
    student_name_en: 'Yousef Al-Mutairi', student_name_ar: 'يوسف المطيري',
    course_code: 'BUS 301', course_name: 'Operations Management',
    current_grade: 'D+', status: 'submitted', submitted_at: '2026-04-25T11:00:00Z',
    faculty_assigned_en: 'Dr. Hassan Al-Sayed', faculty_assigned_ar: 'د. حسن السيد',
    form_uploaded: true,
  },
  {
    id: 'APP-2026-002', student_id: '20221180',
    student_name_en: 'Mariam Al-Ajmi', student_name_ar: 'مريم العجمي',
    course_code: 'ENG 201', course_name: 'Engineering Mechanics',
    current_grade: 'C-', status: 'in_progress', submitted_at: '2026-04-24T13:00:00Z',
    faculty_assigned_en: 'Dr. Layla Al-Rashid', faculty_assigned_ar: 'د. ليلى الرشيد',
    form_uploaded: true,
  },
];

export interface FaRoster {
  course_code: string;
  course_name: string;
  section: string;
  instructor_en: string;
  instructor_ar: string;
  instructor_email: string;
  students: {
    id: string;
    student_id: string;
    name_en: string;
    name_ar: string;
    attendance_pct: number;
    absences: number;
    assessments: { label: string; score: number }[];
    total_grade: number;
    decision: 'pending' | 'fa_admitted' | 'absence_removed';
    warning_email_sent?: boolean;
  }[];
}

const FA_ROSTERS: FaRoster[] = [
  {
    course_code: 'BUS 201', course_name: 'Principles of Marketing',
    section: 'Section A', instructor_en: 'Ahmed Al-Ghamdi', instructor_ar: 'أحمد الغامدي',
    instructor_email: 'admission@cck.edu.kw',
    students: [
      {
        id: 'fa1', student_id: '20231022', name_en: 'Lina Al-Otaibi', name_ar: 'لينا العتيبي',
        attendance_pct: 62, absences: 11,
        assessments: [{ label: 'Quiz 1', score: 7 }, { label: 'Midterm', score: 18 }, { label: 'Project', score: 12 }],
        total_grade: 37, decision: 'pending',
      },
      {
        id: 'fa2', student_id: '20211045', name_en: 'Yousef Al-Mutairi', name_ar: 'يوسف المطيري',
        attendance_pct: 70, absences: 9,
        assessments: [{ label: 'Quiz 1', score: 8 }, { label: 'Midterm', score: 22 }, { label: 'Project', score: 14 }],
        total_grade: 44, decision: 'pending',
      },
    ],
  },
  {
    course_code: 'BUS 305', course_name: 'Operations Management',
    section: 'Section B', instructor_en: 'Ahmed Al-Ghamdi', instructor_ar: 'أحمد الغامدي',
    instructor_email: 'admission@cck.edu.kw',
    students: [
      {
        id: 'fa4', student_id: '20221180', name_en: 'Mariam Al-Ajmi', name_ar: 'مريم العجمي',
        attendance_pct: 64, absences: 10,
        assessments: [{ label: 'Quiz 1', score: 6 }, { label: 'Midterm', score: 20 }],
        total_grade: 26, decision: 'pending',
      },
    ],
  },
  {
    course_code: 'ENG 102', course_name: 'English Composition',
    section: 'Section B', instructor_en: 'Sarah Coombs', instructor_ar: 'سارة كومبس',
    instructor_email: 'sarah.coombs@cck.edu.kw',
    students: [
      {
        id: 'fa3', student_id: '20251002', name_en: 'Saad Al-Hajri', name_ar: 'سعد الهاجري',
        attendance_pct: 58, absences: 12,
        assessments: [{ label: 'Essay 1', score: 14 }, { label: 'Midterm', score: 19 }],
        total_grade: 33, decision: 'pending',
      },
    ],
  },
];

export interface AcademicWarning {
  id: string;
  student_id: string;
  name_en: string;
  name_ar: string;
  gpa: number;
  warning_semester: string;
  notified_at: string;
  signed_at: string | null;
}

const WARNINGS: AcademicWarning[] = [
  { id: 'w1', student_id: '20231022', name_en: 'Lina Al-Otaibi', name_ar: 'لينا العتيبي',
    gpa: 1.7, warning_semester: 'Spring 2026', notified_at: '2026-04-20T08:00:00Z', signed_at: null },
  { id: 'w2', student_id: '20221180', name_en: 'Mariam Al-Ajmi', name_ar: 'مريم العجمي',
    gpa: 1.85, warning_semester: 'Spring 2026', notified_at: '2026-04-18T08:00:00Z', signed_at: '2026-04-22T11:00:00Z' },
  { id: 'w3', student_id: '20251002', name_en: 'Saad Al-Hajri', name_ar: 'سعد الهاجري',
    gpa: 1.6, warning_semester: 'Spring 2026', notified_at: '2026-04-21T08:00:00Z', signed_at: null },
];

export interface FeedbackEntry {
  id: string;
  type: 'complaint' | 'suggestion';
  subject: string;
  body: string;
  student_id: string;
  student_name_en: string;
  student_name_ar: string;
  department: string;
  status: 'open' | 'in_progress' | 'resolved';
  submitted_at: string;
}

const FEEDBACK_ENTRIES: FeedbackEntry[] = [
  { id: 'fb1', type: 'complaint', subject: 'Wifi outage in Building 4',
    body: 'Wifi has been unreliable in Block 4 study area for the past week.',
    student_id: '20211045', student_name_en: 'Yousef Al-Mutairi', student_name_ar: 'يوسف المطيري',
    department: 'IT', status: 'in_progress', submitted_at: '2026-04-22T10:00:00Z' },
  { id: 'fb2', type: 'complaint', subject: 'Cafeteria pricing',
    body: 'Cafeteria meal prices have increased without notice.',
    student_id: '20231022', student_name_en: 'Lina Al-Otaibi', student_name_ar: 'لينا العتيبي',
    department: 'Student Life', status: 'open', submitted_at: '2026-04-25T09:30:00Z' },
  { id: 'fb3', type: 'suggestion', subject: 'Add evening library hours during finals',
    body: 'Could the library stay open until midnight during finals week?',
    student_id: '20221180', student_name_en: 'Mariam Al-Ajmi', student_name_ar: 'مريم العجمي',
    department: 'Library', status: 'open', submitted_at: '2026-04-24T20:00:00Z' },
  { id: 'fb4', type: 'suggestion', subject: 'Mobile app — Arabic course names',
    body: 'Some course names in the app are still only in English.',
    student_id: '20251002', student_name_en: 'Saad Al-Hajri', student_name_ar: 'سعد الهاجري',
    department: 'IT', status: 'resolved', submitted_at: '2026-04-12T14:00:00Z' },
];

export interface SportApplication {
  id: string;
  student_id: string;
  student_name_en: string;
  student_name_ar: string;
  activity: string;
  proof_doc: string;
  discount_pct: number;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
}

const SPORT_APPLICATIONS: SportApplication[] = [
  { id: 'sp1', student_id: '20211045', student_name_en: 'Yousef Al-Mutairi', student_name_ar: 'يوسف المطيري',
    activity: 'Kuwait National Football Team — Youth', proof_doc: 'national_team_id.pdf',
    discount_pct: 25, status: 'pending', submitted_at: '2026-04-22T11:00:00Z' },
  { id: 'sp2', student_id: '20231022', student_name_en: 'Lina Al-Otaibi', student_name_ar: 'لينا العتيبي',
    activity: 'Kazma SC — Women\'s Volleyball', proof_doc: 'kazma_volleyball.pdf',
    discount_pct: 15, status: 'approved', submitted_at: '2026-04-10T08:00:00Z' },
];

export interface DirectoryEntry {
  id: string;
  name_en: string;
  name_ar: string;
  department_en: string;
  department_ar: string;
  email: string;
  phone: string;
}

const DIRECTORY_ENTRIES: DirectoryEntry[] = [
  { id: 'd1', name_en: 'Registration Office', name_ar: 'مكتب التسجيل',
    department_en: 'Registration', department_ar: 'التسجيل',
    email: 'registration@cck.edu.kw', phone: '+965 1842 426' },
  { id: 'd2', name_en: 'Admission Office', name_ar: 'مكتب القبول',
    department_en: 'Admission', department_ar: 'القبول',
    email: 'admission@cck.edu.kw', phone: '+965 1842 426' },
  { id: 'd3', name_en: 'Finance Department', name_ar: 'قسم المالية',
    department_en: 'Finance', department_ar: 'المالية',
    email: 'finance@cck.edu.kw', phone: '+965 1842 426' },
  { id: 'd4', name_en: 'Student Life', name_ar: 'الحياة الطلابية',
    department_en: 'Student Affairs', department_ar: 'شؤون الطلاب',
    email: 'studentlife@cck.edu.kw', phone: '+965 1842 426' },
  { id: 'd5', name_en: 'Faculty of Business', name_ar: 'كلية الأعمال',
    department_en: 'Academics', department_ar: 'الأكاديمي',
    email: 'business.faculty@cck.edu.kw', phone: '+965 1842 426' },
  { id: 'd6', name_en: 'Faculty of Engineering Technology', name_ar: 'كلية هندسة التكنولوجيا',
    department_en: 'Academics', department_ar: 'الأكاديمي',
    email: 'engineering.faculty@cck.edu.kw', phone: '+965 1842 426' },
  { id: 'd7', name_en: 'IT Helpdesk', name_ar: 'الدعم التقني',
    department_en: 'IT', department_ar: 'تقنية المعلومات',
    email: 'helpdesk@cck.edu.kw', phone: '+965 1842 426' },
];

const STAFF_DASHBOARD_ACTIVITY = [
  { id: 'a1', label_en: 'You completed REQ-2026-0420 (TWIMC)', label_ar: 'أنجزت الطلب REQ-2026-0420 (إلى من يهمه الأمر)', timestamp: '2026-04-26T08:00:00Z' },
  { id: 'a2', label_en: 'New applicant ADM-2026-105 advanced to Registration', label_ar: 'تقدم المتقدم ADM-2026-105 لمرحلة التسجيل', timestamp: '2026-04-26T07:30:00Z' },
  { id: 'a3', label_en: 'Lina Al-Otaibi submitted an Excused Absence', label_ar: 'قدّمت لينا العتيبي عذر غياب', timestamp: '2026-04-26T07:20:00Z' },
  { id: 'a4', label_en: 'FA decision pending — BUS 201 Section A (2 students)', label_ar: 'قرار FA معلق — BUS 201 شعبة A (طالبان)', timestamp: '2026-04-25T16:00:00Z' },
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

  /* ─── CCK-Hub workflow APIs ─── */

  getStaffDashboard: async () => withErrorHandling('getStaffDashboard', async () => {
    await delay();
    const open = STUDENT_REQUESTS.filter((r) => r.status !== 'completed' && r.status !== 'cancelled');
    const inProgress = STUDENT_REQUESTS.filter((r) => r.status === 'in_progress').length;
    const submitted = STUDENT_REQUESTS.filter((r) => r.status === 'submitted').length;
    const completed = STUDENT_REQUESTS.filter((r) => r.status === 'completed').length;
    const queues = [
      { key: 'requests', label_en: 'Student Requests', label_ar: 'طلبات الطلاب',
        href: '/requests', open: open.length, in_progress: inProgress, completed },
      { key: 'admissions', label_en: 'Admissions', label_ar: 'القبول',
        href: '/admissions', open: ADMISSION_APPLICANTS.filter((a) => a.stage !== 'completed').length,
        in_progress: ADMISSION_APPLICANTS.filter((a) => a.stage !== 'completed' && a.stage !== 'admission').length,
        completed: ADMISSION_APPLICANTS.filter((a) => a.stage === 'completed').length },
      { key: 'social', label_en: 'Social Allowance', label_ar: 'الإعانة الاجتماعية',
        href: '/social-allowance',
        open: SOCIAL_APPLICATIONS.filter((s) => s.status !== 'completed').length,
        in_progress: SOCIAL_APPLICATIONS.filter((s) => s.status === 'in_progress').length,
        completed: SOCIAL_APPLICATIONS.filter((s) => s.status === 'completed').length },
      { key: 'appeals', label_en: 'Appeals', label_ar: 'التظلمات',
        href: '/appeals',
        open: APPEALS.filter((a) => a.status !== 'completed').length,
        in_progress: APPEALS.filter((a) => a.status === 'in_progress').length,
        completed: APPEALS.filter((a) => a.status === 'completed').length },
      { key: 'fa', label_en: 'FA Decisions', label_ar: 'قرارات FA',
        href: '/fa-screen',
        open: FA_ROSTERS.reduce((acc, r) => acc + r.students.filter((s) => s.decision === 'pending').length, 0),
        in_progress: 0,
        completed: FA_ROSTERS.reduce((acc, r) => acc + r.students.filter((s) => s.decision !== 'pending').length, 0) },
      { key: 'feedback', label_en: 'Complaints & Suggestions', label_ar: 'الشكاوى والمقترحات',
        href: '/feedback',
        open: FEEDBACK_ENTRIES.filter((f) => f.status !== 'resolved').length,
        in_progress: FEEDBACK_ENTRIES.filter((f) => f.status === 'in_progress').length,
        completed: FEEDBACK_ENTRIES.filter((f) => f.status === 'resolved').length },
    ];
    const alerts = open
      .map((r) => {
        const ageDays = Math.floor((Date.now() - new Date(r.submitted_at).getTime()) / 86_400_000);
        return { id: r.id, type: r.type, student_name_en: r.student_name_en, student_name_ar: r.student_name_ar,
          age_days: ageDays, overdue: ageDays > 5 };
      })
      .filter((a) => a.age_days >= 4)
      .sort((a, b) => b.age_days - a.age_days);
    return {
      stats: {
        assigned_to_me: STUDENT_REQUESTS.filter((r) => r.assigned_to_en === 'Noura Al-Shahri' && r.status !== 'completed').length,
        open: open.length,
        due_today: alerts.filter((a) => !a.overdue && a.age_days >= 4).length,
        overdue: alerts.filter((a) => a.overdue).length,
        completed_this_week: completed,
      },
      queues,
      alerts: alerts.slice(0, 6),
      recent_activity: STAFF_DASHBOARD_ACTIVITY,
    };
  }),

  getRequests: async () => withErrorHandling('getRequests', async () => {
    await delay();
    return [...STUDENT_REQUESTS].sort((a, b) =>
      new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());
  }),

  getRequest: async (id: string) => withErrorHandling('getRequest', async () => {
    await delay();
    return STUDENT_REQUESTS.find((r) => r.id === id) ?? null;
  }),

  updateRequestStatus: async (id: string, status: RequestStatus) => withErrorHandling('updateRequestStatus', async () => {
    await delay();
    return { id, status, updated_at: new Date().toISOString() };
  }),

  assignRequest: async (id: string, assignee: { en: string; ar: string } | null) => withErrorHandling('assignRequest', async () => {
    await delay();
    return { id, assignee, updated_at: new Date().toISOString() };
  }),

  addRequestComment: async (id: string, body: string) => withErrorHandling('addRequestComment', async () => {
    await delay();
    return { id: `c_${Date.now()}`, request_id: id, body, created_at: new Date().toISOString() };
  }),

  notifyRequestStudent: async (id: string) => withErrorHandling('notifyRequestStudent', async () => {
    await delay(400);
    return { id, notified: true, sent_at: new Date().toISOString() };
  }),

  getAdmissionApplicants: async () => withErrorHandling('getAdmissionApplicants', async () => {
    await delay();
    return [...ADMISSION_APPLICANTS];
  }),

  decideAdmission: async (id: string, decision: 'approve' | 'reject', comment: string) => withErrorHandling('decideAdmission', async () => {
    await delay(400);
    return { id, decision, comment, decided_at: new Date().toISOString() };
  }),

  generateAcceptanceLetter: async (id: string) => withErrorHandling('generateAcceptanceLetter', async () => {
    await delay(500);
    return { id, letter_id: `letter_${Date.now()}`, generated_at: new Date().toISOString() };
  }),

  getSocialApplications: async () => withErrorHandling('getSocialApplications', async () => {
    await delay();
    return [...SOCIAL_APPLICATIONS];
  }),

  updateSocialStatus: async (id: string, status: SocialApplication['status']) => withErrorHandling('updateSocialStatus', async () => {
    await delay();
    return { id, status, updated_at: new Date().toISOString() };
  }),

  markSocialSentToPuc: async (id: string) => withErrorHandling('markSocialSentToPuc', async () => {
    await delay();
    return { id, sent_to_puc: true, updated_at: new Date().toISOString() };
  }),

  getAppeals: async () => withErrorHandling('getAppeals', async () => {
    await delay();
    return [...APPEALS];
  }),

  getAppealsReleaseStatus: async () => withErrorHandling('getAppealsReleaseStatus', async () => {
    await delay();
    return { released: true };
  }),

  toggleAppealsRelease: async () => withErrorHandling('toggleAppealsRelease', async () => {
    await delay();
    return { released: false };
  }),

  getFaRosters: async () => withErrorHandling('getFaRosters', async () => {
    await delay();
    return [...FA_ROSTERS];
  }),

  decideFa: async (studentRowId: string, decision: 'fa_admitted' | 'absence_removed') => withErrorHandling('decideFa', async () => {
    await delay();
    return { id: studentRowId, decision, updated_at: new Date().toISOString() };
  }),

  getWarnings: async () => withErrorHandling('getWarnings', async () => {
    await delay();
    return [...WARNINGS];
  }),

  markWarningSigned: async (id: string) => withErrorHandling('markWarningSigned', async () => {
    await delay();
    return { id, signed_at: new Date().toISOString() };
  }),

  getFeedback: async () => withErrorHandling('getFeedback', async () => {
    await delay();
    return [...FEEDBACK_ENTRIES];
  }),

  resolveFeedback: async (id: string) => withErrorHandling('resolveFeedback', async () => {
    await delay();
    return { id, status: 'resolved', updated_at: new Date().toISOString() };
  }),

  getSportApplications: async () => withErrorHandling('getSportApplications', async () => {
    await delay();
    return [...SPORT_APPLICATIONS];
  }),

  decideSport: async (id: string, decision: 'approved' | 'rejected') => withErrorHandling('decideSport', async () => {
    await delay();
    return { id, status: decision, updated_at: new Date().toISOString() };
  }),

  getDirectory: async () => withErrorHandling('getDirectory', async () => {
    await delay();
    return [...DIRECTORY_ENTRIES];
  }),
};

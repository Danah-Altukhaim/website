export { API_PATHS } from './api-paths';
export { ERROR_CODES } from './errors';
export {
  FOUNDATION_THRESHOLDS,
  DEGREE_THRESHOLDS_BY_CREDITS,
  ATTENDANCE_POLICY_NOTES,
  EXCUSE_SUBMISSION_WINDOW_DAYS,
  getAttendanceThresholds,
  attendanceLevel,
} from './attendance-policy';
export type {
  AttendanceTrack,
  AttendanceThresholds,
  AttendanceLevel,
} from './attendance-policy';
export {
  CURRENCY,
  CREDIT_PRICE_KWD,
  FOUNDATION_SEMESTER_FEE_KWD,
  STANDARD_GRANT_RATE,
  SPORT_DISCOUNT_RATE,
  STUDENT_SERVICE_FEE_KWD,
  REGISTRATION_FEE_KWD,
  MISC_FEES_KWD,
  NON_REFUNDABLE_FEES,
  WITHDRAWAL_FINE_BY_WEEK,
  withdrawalFineRate,
  calcWithdrawalFine,
  INSTALLMENT_WEEKS,
  INSTALLMENT_SPLIT,
  buildInstallments,
  CCK_PAYMENT_METHODS,
  calcTuition,
  FINANCE_POLICY_NOTES,
} from './fees';
export type {
  ProgramTrack,
  MiscFeeType,
  Installment,
  TuitionBreakdown,
} from './fees';
export {
  MAX_CREDITS_PER_TERM,
  PUC_MIN_CREDITS_REGULAR,
  SELF_FUND_MIN_CREDITS,
  creditLoadRange,
} from './credit-load';
export type { CreditLoadRange } from './credit-load';

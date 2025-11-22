export const API_BASE_URL = "http://localhost:5000/api";

export const API_ROUTES = {
  // Auth
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  LOGOUT: "/auth/logout",
  CHECK_AUTH: "/auth/is-auth",
  VERIFY_EMAIL: "/auth/verify-account",

  // Family
  GET_FAMILY: "/family/all",
  ADD_FAMILY: "/family/add",
  UPDATE_FAMILY: "/family/:id",
  DELETE_FAMILY: "/family/:id",
  UPLOAD_FAMILY_IMAGE: "/family/:id/image",
  DELETE_FAMILY_IMAGE: "/family/:id/image",
  GET_FAMILY_STATS: "/family/:id/stats",

  // Reports
  UPLOAD_REPORT: "/reports/upload",
  GET_ALL_REPORTS: "/reports/all",
  GET_REPORT_BY_ID: "/reports/:id",
  GET_REPORTS_BY_MEMBER: "/reports/member/:memberId",
  UPDATE_REPORT: "/reports/:id",
  DELETE_REPORT: "/reports/:id",
  DOWNLOAD_REPORT: "/reports/:id/download",
  SEARCH_REPORTS: "/reports/search",
  GET_REPORT_STATS: "/reports/stats",

  // Analysis
  ANALYZE_REPORT: "/analysis/analyze/:id",
  GET_ANALYSIS: "/analysis/:id",
  DOWNLOAD_PDF: "/analysis/:id/pdf",
  REGENERATE_ANALYSIS: "/analysis/regenerate/:id",
  HEALTH_SUMMARY: "/analysis/summary/:memberId",
  ASK_QUESTION: "/analysis/:id/question",
};

export const REPORT_TYPES = [
  "Blood Test",
  "X-Ray",
  "MRI Scan",
  "CT Scan",
  "Ultrasound",
  "ECG",
  "EEG",
  "Urine Test",
  "Stool Test",
  "Thyroid Test",
  "Diabetes Test",
  "Liver Function Test",
  "Kidney Function Test",
  "Lipid Profile",
  "Complete Blood Count",
  "Biopsy",
  "Endoscopy",
  "Colonoscopy",
  "Mammography",
  "Bone Density Scan",
  "Pulmonary Function Test",
  "Other",
];

export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export const RELATIONS = [
  "Self",
  "Father",
  "Mother",
  "Spouse",
  "Child",
  "Other",
];

export const GENDERS = ["Male", "Female", "Other"];

export const REPORT_STATUS = {
  UPLOADED: "Uploaded",
  PROCESSING: "Processing",
  ANALYZED: "Analyzed",
  FAILED: "Failed",
};

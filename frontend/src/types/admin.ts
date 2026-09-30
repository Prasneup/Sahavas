export interface VerificationRequest {
  id: string;
  userId: string;
  fullName: string;
  role: string;
  phoneNumber: string;
  email: string;
  collegeName: string;
  collegeRegistrationNumber: string;
  documentType: string;
  registrationNumber: string;
  documentImageUrl: string;
  status: string;
  ocrName?: string;
  ocrSimilarity?: string;
  submittedAt: string;
}

export interface ListingItem {
  id: string;
  title: string;
  description: string;
  rentAmount: number;
  depositAmount: number;
  roomType: string;
  genderPreference: string;
  distanceFromCollegeText: string;
  isVerified: boolean;
  isAvailable: boolean;
  verificationStatus: string;
  rejectionReason?: string;
  images?: any[];
  owner?: {
    id: string;
    phoneNumber: string;
    email: string;
  };
}

export interface TrustReportItem {
  id: string;
  reporterId: string;
  reportedUserId: string;
  reason: string;
  description: string;
  status: string;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  adminId: string;
  adminName: string;
  affectedUserId?: string;
  affectedUserName?: string;
  affectedListingId?: string;
  affectedListingTitle?: string;
  action: string;
  reason?: string;
  previousStatus?: string;
  newStatus?: string;
  createdAt: string;
}

export interface AnalyticsStats {
  totalUsers: number;
  verifiedUsers: number;
  totalListings: number;
  activeReports: number;
  suspiciousListings: number;
}
export interface UserItem {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  majorCourse?: string;
  currentCity?: string;
  hometownDistrict?: string;
  verificationStatus?: string;
}

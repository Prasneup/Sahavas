export interface User {
  id: string;
  phoneNumber: string;
  role: string;
  status: string;
  fullName: string;
}

export interface ProfileData {
  fullName: string;
  gender: string;
  age: number;
  majorCourse: string;
  academicYear: number;
  currentSemester: number;
  avatarUrl: string;
  bio: string;
  hometownDistrict: string;
  currentCity: string;
  preferredRelocationCity: string;
  budgetMin: number;
  budgetMax: number;
  verificationStatus: string;
  completenessPercentage: number;
  interests: string[];
  skills: string[];
  languages: string[];
}

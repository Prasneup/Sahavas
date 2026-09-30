export interface Roommate {
  id: string;
  name: string;
  compatibilityScore: number;
  college: string;
  department: string;
  academicYear: string;
  budgetRange: string;
  smokingStatus: string;
  drinkingHabit: string;
  studyStyle: string;
  sleepSchedule: string;
  cleanlinessLevel: string;
  guestPreference: string;
  hometown: string;
  bio: string;
  avatarUrl: string;
  interests: string[];
  compatibilityBreakdown: {
    lifestyle: number;
    study: number;
    budget: number;
    cleanliness: number;
    location: number;
  };
}

export interface RoommateMatch {
  id: string;
  name: string;
  college: string;
  gender: string;
  matchScore: number;
  badges: string[];
  avatarUrl: string;
}

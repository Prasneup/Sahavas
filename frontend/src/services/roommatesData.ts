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

export const MOCK_ROOMMATES: Roommate[] = [
  {
    id: "rm1",
    name: "Suman Thapa",
    compatibilityScore: 94,
    college: "IOE Pulchowk Campus",
    department: "Mechanical Engineering",
    academicYear: "3rd Year",
    budgetRange: "NPR 6,000 - 8,000 / mo",
    smokingStatus: "Non-Smoker",
    drinkingHabit: "Socially",
    studyStyle: "Quiet library study",
    sleepSchedule: "Early Bird",
    cleanlinessLevel: "High Cleanliness",
    guestPreference: "No overnight guests",
    hometown: "Pokhara, Kaski",
    bio: "Looking for a clean roommate who respects study times. I enjoy playing guitar and football on weekends. Mostly busy with exams during weekdays.",
    avatarUrl: "/src/assets/roommates/media__1785942064373.png",
    interests: ["Football", "Guitar", "Gaming", "Travel"],
    compatibilityBreakdown: {
      lifestyle: 94,
      study: 91,
      budget: 89,
      cleanliness: 96,
      location: 88,
    }
  },
  {
    id: "rm4",
    name: "Aarav Joshi",
    compatibilityScore: 91,
    college: "KUSOM",
    department: "MBA",
    academicYear: "1st Year",
    budgetRange: "NPR 8,000 - 12,000 / mo",
    smokingStatus: "Non-Smoker",
    drinkingHabit: "Never",
    studyStyle: "Group study / Case reviews",
    sleepSchedule: "Late Owl",
    cleanlinessLevel: "Moderate Cleanliness",
    guestPreference: "Occasional guests allowed",
    hometown: "Lalitpur",
    bio: "Busy with MBA case reviews and class assignments. Looking for a neat apartment-mate in the Kupondole / Sanepa area. Quiet and professional.",
    avatarUrl: "/src/assets/roommates/media__1785942033546.png",
    interests: ["Gym", "Travel", "Finance", "Movies"],
    compatibilityBreakdown: {
      lifestyle: 90,
      study: 93,
      budget: 92,
      cleanliness: 88,
      location: 94,
    }
  },
  {
    id: "rm2",
    name: "Prerna Adhikari",
    compatibilityScore: 89,
    college: "Patan Multiple Campus",
    department: "BBS",
    academicYear: "2nd Year",
    budgetRange: "NPR 5,000 - 7,000 / mo",
    smokingStatus: "Non-Smoker",
    drinkingHabit: "Never",
    studyStyle: "Group study",
    sleepSchedule: "Balanced",
    cleanlinessLevel: "High Cleanliness",
    guestPreference: "No guests allowed",
    hometown: "Chitwan",
    bio: "Vegetarian BBS student looking for a friendly roommate to share an apartment near Patan Multiple Campus. I like cooking, music, and reading novels.",
    avatarUrl: "/src/assets/roommates/media__1785942172505.png",
    interests: ["Cooking", "Reading", "Movies", "Music"],
    compatibilityBreakdown: {
      lifestyle: 95,
      study: 84,
      budget: 91,
      cleanliness: 96,
      location: 80,
    }
  },
  {
    id: "rm7",
    name: "Ananya Pandey",
    compatibilityScore: 87,
    college: "Padma Kanya Campus",
    department: "BA Fine Arts",
    academicYear: "3rd Year",
    budgetRange: "NPR 5,500 - 7,500 / mo",
    smokingStatus: "Non-Smoker",
    drinkingHabit: "Never",
    studyStyle: "Creative studio work",
    sleepSchedule: "Late Owl",
    cleanlinessLevel: "Moderate Cleanliness",
    guestPreference: "Occasional guests allowed",
    hometown: "Hetauda",
    bio: "Fine arts student looking for a creative, quiet place to paint. I love acoustic music, indie movies, and photography. Very chill vibes.",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    interests: ["Painting", "Music", "Movies", "Reading"],
    compatibilityBreakdown: {
      lifestyle: 86,
      study: 88,
      budget: 89,
      cleanliness: 82,
      location: 90,
    }
  },
  {
    id: "rm3",
    name: "Kshitiz Shrestha",
    compatibilityScore: 86,
    college: "NCIT Campus",
    department: "IT Engineering",
    academicYear: "4th Year",
    budgetRange: "NPR 7,000 - 9,000 / mo",
    smokingStatus: "Non-Smoker",
    drinkingHabit: "Socially",
    studyStyle: "Late night coding",
    sleepSchedule: "Late Owl",
    cleanlinessLevel: "Moderate Cleanliness",
    guestPreference: "Overnight guests allowed",
    hometown: "Kathmandu",
    bio: "Final year IT student, mostly busy with coding projects and freelancer gigs. Looking for a chilled-out roommate who doesn't mind late night coding sessions.",
    avatarUrl: "/src/assets/roommates/media__1785942101755.png",
    interests: ["Gaming", "Coding", "Music", "Football"],
    compatibilityBreakdown: {
      lifestyle: 82,
      study: 94,
      budget: 85,
      cleanliness: 80,
      location: 89,
    }
  },
  {
    id: "rm5",
    name: "Sneha Regmi",
    compatibilityScore: 84,
    college: "Nepal Medical College",
    department: "MBBS",
    academicYear: "3rd Year",
    budgetRange: "NPR 10,000 - 15,000 / mo",
    smokingStatus: "Non-Smoker",
    drinkingHabit: "Never",
    studyStyle: "Intensive library study",
    sleepSchedule: "Erratic / Night shifts",
    cleanlinessLevel: "High Cleanliness",
    guestPreference: "No guests allowed",
    hometown: "Biratnagar",
    bio: "MBBS student. I need a very quiet environment and a neat flatmate to share an apartment near Jorpati. Mostly studying or doing clinical rotations.",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
    interests: ["Reading", "Travel", "Yoga", "Music"],
    compatibilityBreakdown: {
      lifestyle: 89,
      study: 90,
      budget: 80,
      cleanliness: 95,
      location: 76,
    }
  },
  {
    id: "rm6",
    name: "Bibek Shrestha",
    compatibilityScore: 81,
    college: "GoldenGate College",
    department: "BCA",
    academicYear: "2nd Year",
    budgetRange: "NPR 6,000 - 8,000 / mo",
    smokingStatus: "Social Smoker",
    drinkingHabit: "Socially",
    studyStyle: "Casual group study",
    sleepSchedule: "Late Owl",
    cleanlinessLevel: "Moderate Cleanliness",
    guestPreference: "Overnight guests allowed",
    hometown: "Dharan, Sunsari",
    bio: "Chilled out guy studying BCA. Love watching movies, gaming with friends, and coding side projects. Looking for a flat near Baneshwor / Koteshwor.",
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200",
    interests: ["Movies", "Gaming", "Coding", "Gym"],
    compatibilityBreakdown: {
      lifestyle: 75,
      study: 82,
      budget: 89,
      cleanliness: 78,
      location: 83,
    }
  },
  {
    id: "rm8",
    name: "Niranjan Thapa",
    compatibilityScore: 78,
    college: "The British College",
    department: "BBA",
    academicYear: "1st Year",
    budgetRange: "NPR 8,000 - 11,000 / mo",
    smokingStatus: "Non-Smoker",
    drinkingHabit: "Socially",
    studyStyle: "Balanced library study",
    sleepSchedule: "Balanced",
    cleanlinessLevel: "Moderate Cleanliness",
    guestPreference: "Occasional guests allowed",
    hometown: "Butwal",
    bio: "Friendly and highly social BBA student. Looking for an active roommate to share a neat flat near Thapathali / Kupandole.",
    avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200",
    interests: ["Travel", "Gym", "Football", "Music"],
    compatibilityBreakdown: {
      lifestyle: 80,
      study: 74,
      budget: 78,
      cleanliness: 82,
      location: 78,
    }
  }
];

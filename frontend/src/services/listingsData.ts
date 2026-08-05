export interface Listing {
  id: string;
  title: string;
  description: string;
  rentAmount: number;
  depositAmount: number;
  roomType: string;
  genderPreference: string;
  isVerified: boolean;
  amenities: string[];
  distanceFromCollegeText: string;
  rating: number;
  reviewCount: number;
  locationLat: number;
  locationLng: number;
  images: { id: string; imageUrl: string }[];
  collegeName: string;
  collegeLat: number;
  collegeLng: number;
  walkingTime: string;
  vehicleTime: string;
  distanceKm: number;
  hostName: string;
  hostPhone: string;
  hostAvatarUrl: string;
  isAvailable: boolean;
}

export const MOCK_LISTINGS: Listing[] = [
  {
    id: "1",
    title: "Premium Sunlit Single Room near IOE Pulchowk gate",
    description: "Fully furnished single room available for engineering student. Shared kitchen and clean toilet. 24 hour water supply with high speed WiFi.",
    rentAmount: 7500,
    depositAmount: 7500,
    roomType: "SINGLE_ROOM",
    genderPreference: "ANY",
    isVerified: true,
    amenities: ["WIFI", "WATER_24_7", "FURNISHED", "PARKING"],
    distanceFromCollegeText: "200m from IOE Pulchowk Main Gate",
    rating: 4.8,
    reviewCount: 12,
    locationLat: 27.6798,
    locationLng: 85.3175,
    images: [
      { id: "i1", imageUrl: "/src/assets/rooms/media__1785938361229.jpg" }
    ],
    collegeName: "IOE Pulchowk Campus",
    collegeLat: 27.6812,
    collegeLng: 85.3184,
    walkingTime: "3 min",
    vehicleTime: "1 min",
    distanceKm: 0.2,
    hostName: "Ramesh Bhattarai",
    hostPhone: "9864728355",
    hostAvatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100",
    isAvailable: true
  },
  {
    id: "2",
    title: "Spacious Flatlet for Girls in Tinkune, Koteshwor",
    description: "Two-sharing room available in a safe family home. Near college bus stops. Vegetarian kitchen preferred.",
    rentAmount: 5000,
    depositAmount: 5000,
    roomType: "SHARED_ROOM",
    genderPreference: "GIRLS_ONLY",
    isVerified: true,
    amenities: ["WIFI", "WATER_24_7", "BALCONY"],
    distanceFromCollegeText: "1.1km from Patan Campus",
    rating: 4.5,
    reviewCount: 8,
    locationLat: 27.6842,
    locationLng: 85.3190,
    images: [
      { id: "i2", imageUrl: "/src/assets/rooms/media__1785938364169.jpg" }
    ],
    collegeName: "Patan Multiple Campus",
    collegeLat: 27.6751,
    collegeLng: 85.3210,
    walkingTime: "14 min",
    vehicleTime: "4 min",
    distanceKm: 1.1,
    hostName: "Alok Prasai",
    hostPhone: "9841234567",
    hostAvatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=100",
    isAvailable: true
  },
  {
    id: "3",
    title: "Spacious Room with Full Wardrobes & Mirror",
    description: "Charming green-walled room featuring extensive wooden storage closets, a large integrated dressing mirror, comfortable bed, and ventilation fan. Highly suitable for Patan Campus students.",
    rentAmount: 8200,
    depositAmount: 8200,
    roomType: "SINGLE_ROOM",
    genderPreference: "ANY",
    isVerified: true,
    amenities: ["WIFI", "WATER_24_7", "FURNISHED", "STUDY_DESK"],
    distanceFromCollegeText: "800m from Patan Multiple Campus",
    rating: 4.7,
    reviewCount: 14,
    locationLat: 27.6690,
    locationLng: 85.3260,
    images: [
      { id: "i3", imageUrl: "/src/assets/rooms/media__1785938104831.jpg" }
    ],
    collegeName: "Patan Multiple Campus",
    collegeLat: 27.6751,
    collegeLng: 85.3210,
    walkingTime: "10 min",
    vehicleTime: "3 min",
    distanceKm: 0.8,
    hostName: "Siddharth Shrestha",
    hostPhone: "9841987654",
    hostAvatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100",
    isAvailable: true
  },
  {
    id: "4",
    title: "Twin Sharing Student Room close to NCIT College",
    description: "Comfortable double-occupancy room with two single beds, fresh green walls, and airy windows overlooking residential greenery. Safe and secure student home with parking access.",
    rentAmount: 6500,
    depositAmount: 6500,
    roomType: "SHARED_ROOM",
    genderPreference: "ANY",
    isVerified: true,
    amenities: ["WIFI", "WATER_24_7", "FURNISHED", "PARKING"],
    distanceFromCollegeText: "400m from NCIT Campus",
    rating: 4.6,
    reviewCount: 9,
    locationLat: 27.6815,
    locationLng: 85.3465,
    images: [
      { id: "i4", imageUrl: "/src/assets/rooms/media__1785938108528.jpg" }
    ],
    collegeName: "NCIT Campus",
    collegeLat: 27.6780,
    collegeLng: 85.3490,
    walkingTime: "6 min",
    vehicleTime: "2 min",
    distanceKm: 0.4,
    hostName: "Ganga Kharel",
    hostPhone: "9841765432",
    hostAvatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100",
    isAvailable: true
  },
  {
    id: "5",
    title: "Spacious Multi-Sharing Dormitory near IOE Pulchowk",
    description: "Triple sharing room for students looking to study together. Features bright blue walls, central study carpet, individual beds, and study desk access.",
    rentAmount: 6000,
    depositAmount: 6000,
    roomType: "SHARED_ROOM",
    genderPreference: "ANY",
    isVerified: false,
    amenities: ["WIFI", "WATER_24_7", "FURNISHED", "BALCONY"],
    distanceFromCollegeText: "300m from IOE Pulchowk Campus",
    rating: 4.4,
    reviewCount: 7,
    locationLat: 27.6790,
    locationLng: 85.3215,
    images: [
      { id: "i5", imageUrl: "/src/assets/rooms/media__1785938131263.jpg" }
    ],
    collegeName: "IOE Pulchowk Campus",
    collegeLat: 27.6812,
    collegeLng: 85.3184,
    walkingTime: "4 min",
    vehicleTime: "1 min",
    distanceKm: 0.3,
    hostName: "Basanta Rijal",
    hostPhone: "9851122334",
    hostAvatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100",
    isAvailable: true
  },
  {
    id: "6",
    title: "Quiet Private Study Room near KCMIT College",
    description: "A peaceful single room painted in relaxing blue, complete with a study table positioned right by the window for natural light. Perfect for focused learning.",
    rentAmount: 7000,
    depositAmount: 7000,
    roomType: "SINGLE_ROOM",
    genderPreference: "ANY",
    isVerified: true,
    amenities: ["WIFI", "WATER_24_7", "STUDY_DESK"],
    distanceFromCollegeText: "600m from KCMIT Campus",
    rating: 4.8,
    reviewCount: 11,
    locationLat: 27.6905,
    locationLng: 85.3415,
    images: [
      { id: "i6", imageUrl: "/src/assets/rooms/media__1785938135634.jpg" }
    ],
    collegeName: "KCMIT Campus",
    collegeLat: 27.6854,
    collegeLng: 85.3441,
    walkingTime: "8 min",
    vehicleTime: "2 min",
    distanceKm: 0.6,
    hostName: "Kabita Acharya",
    hostPhone: "9818456789",
    hostAvatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100",
    isAvailable: true
  },
  {
    id: "7",
    title: "Budget Single Room in Kirtipur near TU Gate",
    description: "Minimalist, budget-friendly single room in a student-centric neighborhood. Features fresh blue paint, single bed frame, and wide airy window.",
    rentAmount: 6200,
    depositAmount: 6200,
    roomType: "SINGLE_ROOM",
    genderPreference: "ANY",
    isVerified: false,
    amenities: ["WIFI", "WATER_24_7", "FURNISHED"],
    distanceFromCollegeText: "700m from Tribhuvan University Gate",
    rating: 4.2,
    reviewCount: 5,
    locationLat: 27.6755,
    locationLng: 85.2810,
    images: [
      { id: "i7", imageUrl: "/src/assets/rooms/media__1785938138319.jpg" }
    ],
    collegeName: "TU Kirtipur Campus",
    collegeLat: 27.6795,
    collegeLng: 85.2870,
    walkingTime: "10 min",
    vehicleTime: "3 min",
    distanceKm: 0.7,
    hostName: "Niranjan Giri",
    hostPhone: "9803123456",
    hostAvatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100",
    isAvailable: true
  }
];

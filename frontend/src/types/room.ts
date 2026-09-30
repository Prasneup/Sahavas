export interface ListingImage {
  id?: string;
  imageUrl: string;
}

export interface Listing {
  id?: string;
  title: string;
  description: string;
  rentAmount: number;
  depositAmount: number;
  locationLat: number;
  locationLng: number;
  roomType: string;
  genderPreference: string;
  distanceFromCollegeText: string;
  amenities: string[];
  isAvailable: boolean;
  isVerified: boolean;
  images: ListingImage[];
  rating?: number;
  reviewCount?: number;
  collegeName?: string;
  collegeLat?: number;
  collegeLng?: number;
  walkingTime?: string;
  vehicleTime?: string;
  distanceKm?: number;
  hostName?: string;
  hostPhone?: string;
  hostAvatarUrl?: string;
  owner?: {
    id: string;
    email: string;
    role: string;
    status: string;
    phoneNumber?: string;
  };
}

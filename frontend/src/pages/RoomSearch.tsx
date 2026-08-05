import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Search, CheckCircle, Star, MapPin, Heart, Compass, ArrowLeft } from 'lucide-react';

interface Listing {
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
}

const RoomSearch: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'LIST' | 'SPLIT'>('SPLIT');
  const [wishlist, setWishlist] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadListings();
  }, []);

  const MOCK_LISTINGS: Listing[] = [
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
      locationLat: 27.6812,
      locationLng: 85.3184,
      images: [
        { id: "i1", imageUrl: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=400" }
      ]
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
      distanceFromCollegeText: "1.2km from K&K College Campus",
      rating: 4.5,
      reviewCount: 8,
      locationLat: 27.6854,
      locationLng: 85.3441,
      images: [
        { id: "i2", imageUrl: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=400" }
      ]
    }
  ];

  const loadListings = async () => {
    try {
      const res = await api.get('/listings');
      if (res.data && res.data.length > 0) {
        setListings(res.data);
      } else {
        setListings(MOCK_LISTINGS);
      }
    } catch (err) {
      console.warn("API listing fetch failed, using mock listings data", err);
      setListings(MOCK_LISTINGS);
    }
  };

  const toggleWishlist = (id: string) => {
    if (wishlist.includes(id)) {
      setWishlist(wishlist.filter(wId => wId !== id));
    } else {
      setWishlist([...wishlist, id]);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1E1E1E] flex flex-col font-sans">
      
      {/* Search Header panel aligned with mockup design */}
      <header className="border-b border-[#EAE5D9] bg-[#FAF8F5]/85 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="w-9 h-9 rounded-full bg-white border border-[#EAE5D9] flex items-center justify-center shadow-sm"
          >
            <ArrowLeft size={18} className="text-[#8E8674]" />
          </button>
          
          <div className="flex items-center gap-1.5">
            {/* Sahavas Mandala Logo */}
            <div className="w-7 h-7 rounded-full bg-[#FAF8F5] flex items-center justify-center border border-[#D9A25A]/40">
              <svg className="w-4.5 h-4.5 text-[#D9A25A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
            </div>
            <h1 className="text-xl font-black text-[#1A2540] tracking-tight font-display">सहवास Rooms</h1>
          </div>
        </div>

        {/* Search Input bar */}
        <div className="flex-1 max-w-xl bg-white border border-[#EAE5D9] rounded-full px-5 py-2.5 flex items-center gap-3 shadow-sm">
          <Search className="text-[#D9A25A]" size={16} />
          <input
            type="text"
            placeholder="Search rooms near your college..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-[#1E1E1E] focus:outline-none w-full text-xs font-semibold placeholder-[#A39E93]"
          />
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setViewMode(viewMode === 'LIST' ? 'SPLIT' : 'LIST')}
            className="bg-white hover:bg-[#FAF3E8] border border-[#EAE5D9] text-[#1E1E1E] text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition"
          >
            {viewMode === 'LIST' ? 'Show Split Map' : 'Show List Feed'}
          </button>
        </div>
      </header>

      {/* Split Listings/Map workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Listings column */}
        <div className={`flex-1 overflow-y-auto p-6 ${viewMode === 'SPLIT' ? 'max-w-full md:max-w-[55%]' : 'max-w-3xl mx-auto w-full'}`}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xs font-bold text-[#8E8674] uppercase tracking-wider">Available Rooms</h2>
            <span className="text-xs bg-[#FAF3E8] text-[#D9A25A] font-bold px-3 py-1 rounded-full border border-[#D9A25A]/20">
              {listings.length} places found
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {listings.map((room) => (
              <div key={room.id} className="bg-white border border-[#EAE5D9] rounded-3xl overflow-hidden shadow-md hover:border-[#D9A25A]/45 transition duration-300 group flex flex-col">
                
                {/* Photo section */}
                <div className="h-60 w-full bg-[#EAE5D9] relative overflow-hidden">
                  <img 
                    src={room.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=600'} 
                    alt="Listing Photo"
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                  />
                  
                  {/* Overlays */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {room.isVerified && (
                      <span className="text-[9px] bg-[#E6F4EA] border border-[#137333]/20 text-[#137333] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider backdrop-blur-sm flex items-center gap-1 shadow-sm">
                        <CheckCircle size={10} /> Verified
                      </span>
                    )}
                    <span className="text-[9px] bg-white/90 border border-[#EAE5D9] text-[#1E1E1E] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider backdrop-blur-sm shadow-sm">
                      {room.roomType.replace('_', ' ')}
                    </span>
                  </div>

                  <button 
                    onClick={() => toggleWishlist(room.id)}
                    className="absolute top-4 right-4 bg-white/90 border border-[#EAE5D9] hover:bg-white text-slate-300 p-2.5 rounded-full backdrop-blur-sm transition shadow-sm"
                  >
                    <Heart size={14} className={wishlist.includes(room.id) ? 'fill-rose-500 text-rose-500' : 'text-[#8E8674]'} />
                  </button>
                </div>

                {/* Listing Details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-[#D9A25A] font-bold flex items-center gap-1">
                        <MapPin size={13} className="stroke-[2.5]" />
                        {room.distanceFromCollegeText}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                        <Star size={13} className="fill-amber-500 stroke-none" />
                        {room.rating} <span className="text-[#8E8674] font-semibold">({room.reviewCount})</span>
                      </div>
                    </div>

                    <h3 className="text-lg font-black text-[#1E1E1E] mb-2 leading-tight group-hover:text-[#D9A25A] transition font-display">
                      {room.title}
                    </h3>
                    <p className="text-[#8E8674] text-xs mb-4 line-clamp-2 leading-relaxed">{room.description}</p>

                    {/* Amenities tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {room.amenities.map((amenity) => (
                        <span key={amenity} className="text-[9px] bg-[#FAF8F5] border border-[#EAE5D9] text-[#8E8674] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Rent rates bottom footer */}
                  <div className="flex items-center justify-between border-t border-[#EAE5D9]/70 pt-4 mt-2">
                    <div>
                      <span className="text-[9px] text-[#A39E93] font-bold uppercase tracking-wider block">Rent rate</span>
                      <div className="flex items-center text-[#1E1E1E] font-black text-lg font-display">
                        <span>NPR {room.rentAmount}</span>
                        <span className="text-xs text-[#8E8674] font-medium ml-1">/ month</span>
                      </div>
                    </div>
                    <button className="bg-[#D9A25A] hover:bg-[#C9924A] text-white font-black py-2.5 px-5 rounded-xl transition text-xs shadow-sm">
                      View Details
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* Right Map column */}
        {viewMode === 'SPLIT' && (
          <div className="flex-1 bg-[#FAF8F5] border-l border-[#EAE5D9] relative hidden md:block">
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-[#8E8674]">
              <Compass className="animate-spin text-[#D9A25A] mb-4" size={44} />
              <h4 className="text-base font-black text-[#1E1E1E] mb-1 font-display">OpenStreetMap Coordinates</h4>
              <p className="text-xs max-w-xs leading-relaxed">Interactive coordinates displaying nearest colleges in Kathmandu & Lalitpur.</p>
              
              <div className="w-full max-w-sm bg-white border border-[#EAE5D9] rounded-xl p-4 mt-6 text-left space-y-3 font-mono text-[10px]">
                <div className="flex justify-between border-b border-[#FAF8F5] pb-2 text-[#1E1E1E] font-semibold">
                  <span className="text-[#D9A25A]">Marker 1: Pulchowk Gate</span>
                  <span>[27.6812 N, 85.3184 E]</span>
                </div>
                <div className="flex justify-between text-[#1E1E1E] font-semibold">
                  <span className="text-[#D9A25A]">Marker 2: Tinkune stop</span>
                  <span>[27.6854 N, 85.3441 E]</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default RoomSearch;

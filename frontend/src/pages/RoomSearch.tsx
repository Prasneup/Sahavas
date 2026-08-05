import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Search, CheckCircle, Star, MapPin, Heart, Compass } from 'lucide-react';

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

  const loadListings = async () => {
    try {
      const res = await api.get('/listings');
      setListings(res.data);
    } catch (err) {
      console.warn("API listing fetch failed, using mock listings data", err);
      setListings([
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
            { id: "i1", imageUrl: "https://images.unsplash.com/photo-1522771739844-6a9f5d5f14af?auto=format&fit=crop&q=80&w=400" }
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
      ]);
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top sticky search navigation bar */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-black text-brand-cyan tracking-tight font-display">UniSphere Rooms</h1>
          <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-medium">Airbnb Edition</span>
        </div>

        {/* The Student Pill Search bar */}
        <div className="flex-1 max-w-2xl bg-slate-950 border border-slate-800 rounded-full px-6 py-2.5 flex items-center gap-3 shadow-inner">
          <Search className="text-brand-cyan" size={18} />
          <input
            type="text"
            placeholder="Search rooms near your college (e.g. Pulchowk, Tinkune)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-white focus:outline-none w-full text-xs font-semibold"
          />
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setViewMode(viewMode === 'LIST' ? 'SPLIT' : 'LIST')}
            className="bg-slate-800 hover:bg-slate-700 text-xs font-semibold px-4 py-2 rounded-lg transition"
          >
            {viewMode === 'LIST' ? 'Show Split Map' : 'Show List Feed'}
          </button>
          <button 
            onClick={() => navigate('/dashboard')} 
            className="text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            Close
          </button>
        </div>
      </header>

      {/* Workspace Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left List Feed */}
        <div className={`flex-1 overflow-y-auto p-6 md:p-8 ${viewMode === 'SPLIT' ? 'max-w-[55%]' : 'max-w-4xl mx-auto'}`}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Available Verified Rooms</h2>
            <span className="text-xs bg-brand-cyan/15 text-brand-cyan font-bold px-2.5 py-0.5 rounded-full">
              {listings.length} places found
            </span>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {listings.map((room) => (
              <div key={room.id} className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl hover:border-slate-700/80 transition-all duration-300 group flex flex-col">
                {/* Large Photo Section */}
                <div className="h-64 w-full bg-slate-950 relative overflow-hidden">
                  <img 
                    src={room.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=600'} 
                    alt="Listing Photo"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Photo overlays */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {room.isVerified && (
                      <span className="text-[10px] bg-teal-950/90 border border-teal-800 text-teal-400 px-3 py-1 rounded-full font-bold uppercase tracking-wider backdrop-blur-sm flex items-center gap-1 shadow-md">
                        <CheckCircle size={10} /> Verified Room
                      </span>
                    )}
                    <span className="text-[10px] bg-slate-900/90 text-slate-300 px-3 py-1 rounded-full font-bold uppercase tracking-wider backdrop-blur-sm shadow-md">
                      {room.roomType.replace('_', ' ')}
                    </span>
                  </div>

                  <button 
                    onClick={() => toggleWishlist(room.id)}
                    className="absolute top-4 right-4 bg-slate-900/80 hover:bg-slate-800 text-slate-300 p-2.5 rounded-full backdrop-blur-sm transition shadow-md"
                  >
                    <Heart size={16} className={wishlist.includes(room.id) ? 'fill-rose-500 text-rose-500' : 'text-slate-400'} />
                  </button>
                </div>

                {/* Details Section */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-brand-cyan font-semibold flex items-center gap-1">
                        <MapPin size={14} />
                        {room.distanceFromCollegeText || 'Near target college'}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
                        <Star size={14} className="fill-amber-400" />
                        {room.rating} <span className="text-slate-500 font-normal">({room.reviewCount})</span>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold font-display text-white mb-2 leading-tight group-hover:text-brand-cyan transition">
                      {room.title}
                    </h3>
                    <p className="text-slate-400 text-xs mb-4 line-clamp-2">{room.description}</p>

                    {/* Amenities tags */}
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {room.amenities.map((amenity) => (
                        <span key={amenity} className="text-[10px] bg-slate-950 text-slate-500 border border-slate-800/80 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-800/50 pt-4">
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Rent rate</span>
                      <div className="flex items-center text-white font-extrabold text-xl font-display">
                        <span>NPR {room.rentAmount}</span>
                        <span className="text-xs text-slate-500 font-medium ml-1">/ month</span>
                      </div>
                    </div>
                    <button className="bg-brand-cyan hover:bg-teal-700 text-white font-bold py-2.5 px-6 rounded-xl transition text-xs shadow-md">
                      View Room Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sticky Map view */}
        {viewMode === 'SPLIT' && (
          <div className="flex-1 bg-slate-900 border-l border-slate-800 relative hidden md:block">
            {/* Mock map layout */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-slate-500">
              <Compass className="animate-spin text-brand-cyan mb-4" size={48} />
              <h4 className="text-lg font-bold text-white mb-1">OpenStreetMap Coordinates Matcher</h4>
              <p className="text-xs max-w-sm">Mock coordinates markers display active rooms for Kathmandu and Lalitpur campuses.</p>
              
              {/* Mock markers */}
              <div className="w-full max-w-md bg-slate-950/80 border border-slate-800 rounded-xl p-4 mt-6 text-left space-y-3 font-mono text-[10px]">
                <div className="flex justify-between border-b border-slate-900 pb-2">
                  <span className="text-teal-400">Marker 1: Pulchowk Campuses</span>
                  <span>[27.6812 N, 85.3184 E] - 7.5K/m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-teal-400">Marker 2: Tinkune Guesthouses</span>
                  <span>[27.6854 N, 85.3441 E] - 5K/m</span>
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

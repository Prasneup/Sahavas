import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Search, DollarSign, Filter, CheckCircle, Home } from 'lucide-react';

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
}

const RoomSearch: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/listings');
      setListings(res.data);
    } catch (err) {
      console.warn("API listing fetch failed, using mock listings data", err);
      setListings([
        {
          id: "1",
          title: "Sunlit single room near IOE Pulchowk gate",
          description: "Fully furnished single room available for engineering student. Shared kitchen and clean toilet. 24 hour water supply with high speed WiFi.",
          rentAmount: 7500,
          depositAmount: 7500,
          roomType: "SINGLE_ROOM",
          genderPreference: "ANY",
          isVerified: true,
          amenities: ["WIFI", "WATER_24_7", "FURNISHED"]
        },
        {
          id: "2",
          title: "Shared room for Girls in Tinkune, Koteshwor",
          description: "Two-sharing room available in a safe family home. Near college bus stops. Vegetarian kitchen preferred.",
          rentAmount: 5000,
          depositAmount: 5000,
          roomType: "SHARED_ROOM",
          genderPreference: "GIRLS_ONLY",
          isVerified: true,
          amenities: ["WIFI", "WATER_24_7"]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold font-display text-brand-cyan">Housing Listings</h1>
            <p className="text-slate-400 text-sm mt-1">Discover trusted rooms and flats near top college hubs in Nepal.</p>
          </div>
          <button 
            onClick={() => navigate('/dashboard')} 
            className="text-sm font-semibold text-slate-400 hover:text-white transition"
          >
            ← Back to Feed
          </button>
        </header>

        {/* Search & Filter Bar */}
        <div className="flex gap-4 mb-8">
          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 flex items-center gap-3">
            <Search className="text-slate-500" size={20} />
            <input
              type="text"
              placeholder="Search by college or neighborhood (e.g. Pulchowk, Tinkune)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-white focus:outline-none w-full text-sm"
            />
          </div>
          <button className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 p-3 rounded-xl flex items-center justify-center transition">
            <Filter size={20} />
          </button>
        </div>

        {/* Listings Display */}
        <div className="grid grid-cols-1 gap-6">
          {listings.map((room) => (
            <div key={room.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row gap-6 shadow-lg hover:border-slate-700 transition">
              {/* Image Placeholder */}
              <div className="w-full md:w-48 h-40 bg-slate-950 border border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-600 gap-2 flex-shrink-0">
                <Home size={32} />
                <span className="text-xs">No Photos Posted</span>
              </div>

              {/* Detail Info */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md font-semibold tracking-wide uppercase">
                      {room.roomType.replace('_', ' ')}
                    </span>
                    {room.isVerified && (
                      <span className="text-xs bg-teal-950 border border-teal-800 text-teal-400 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <CheckCircle size={12} /> Verified Room
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold font-display text-white mb-2">{room.title}</h3>
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">{room.description}</p>

                  {/* Amenities */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {room.amenities.map((amenity) => (
                      <span key={amenity} className="text-xs bg-slate-950 text-slate-500 border border-slate-800/80 px-2 py-0.5 rounded">
                        #{amenity}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-800/50 pt-4">
                  <div className="flex items-center text-brand-cyan font-extrabold text-lg">
                    <DollarSign size={18} />
                    <span>NPR {room.rentAmount}</span>
                    <span className="text-xs text-slate-500 font-semibold ml-1">/ month</span>
                  </div>
                  <button className="bg-brand-cyan hover:bg-teal-700 text-white font-bold py-2 px-5 rounded-lg transition text-xs">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoomSearch;

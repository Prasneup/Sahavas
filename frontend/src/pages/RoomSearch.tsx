import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft } from 'lucide-react';
import { NivaroLogo } from '../components/NivaroLogo';
import { Listing } from '../types/room';
import { roomService } from '../services/roomService';
import { RoomCard } from '../components/room/RoomCard';
import Footer from '../components/Footer';

const RoomSearch: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlist, setWishlist] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadListings();
    loadWishlist();
  }, []);

  const loadListings = async () => {
    try {
      const res = await roomService.getListings();
      setListings(res || []);
    } catch (err) {
      console.warn("API listing fetch failed", err);
      setListings([]);
    }
  };

  const loadWishlist = async () => {
    try {
      const res = await roomService.getSavedListings();
      if (res) {
        setWishlist(res.map((item: any) => item.id));
      }
    } catch (err) {
      console.warn("API wishlist load failed", err);
    }
  };

  const toggleWishlist = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering card navigation
    const isSaved = wishlist.includes(id);
    try {
      if (isSaved) {
        await roomService.unsaveListing(id);
        setWishlist(wishlist.filter(wId => wId !== id));
      } else {
        await roomService.saveListing(id);
        setWishlist([...wishlist, id]);
      }
    } catch (err) {
      console.error("Failed to toggle wishlist status", err);
    }
  };

  const filteredListings = listings.filter(room => 
    (room.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (room.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (room.collegeName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (room.distanceFromCollegeText || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-clay text-ink flex flex-col font-sans">
      
      {/* Search Header Panel */}
      <header className="border-b border-ink/5 bg-clay/85 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="w-9 h-9 rounded-full bg-paper border border-ink/10 flex items-center justify-center shadow-sm hover:bg-[#FAF3E8] transition"
          >
            <ArrowLeft size={18} className="text-ink-soft" />
          </button>
          
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-full bg-paper flex items-center justify-center border border-ink/10">
              <NivaroLogo className="w-4.5 h-4.5 text-marigold" />
            </div>
            <h1 className="text-xl font-black text-ink tracking-tight font-display">Nivaro Rooms</h1>
          </div>
        </div>

        {/* Search Input bar */}
        <div className="flex-1 max-w-xl bg-paper border border-ink/10 rounded-full px-5 py-2.5 flex items-center gap-3 shadow-sm w-full">
          <Search className="text-marigold" size={16} />
          <input
            type="text"
            placeholder="Search rooms near your college (e.g. Pulchowk, NCIT)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-ink focus:outline-none w-full text-xs font-semibold placeholder-ink-soft/40"
          />
        </div>

        <div className="w-9 h-9 sm:block hidden"></div> {/* Placeholder spacer for header alignment */}
      </header>

      {/* Main Grid View */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-bold text-ink-soft uppercase tracking-wider">Explore Student Listings</h2>
          <span className="text-xs bg-pine-light text-pine font-bold px-3.5 py-1 rounded-full border border-pine/20 font-mono">
            {filteredListings.length} places available
          </span>
        </div>

        {filteredListings.length === 0 ? (
          <div className="text-center py-16 bg-paper border border-ink/10 rounded-[32px] max-w-md mx-auto p-8 shadow-sm">
            <h3 className="text-lg font-bold mb-2 font-display">No Listings Found</h3>
            <p className="text-ink-soft text-xs mb-6 font-semibold leading-relaxed">
              We couldn't find any rooms matching your search. Try searching for other colleges or districts.<br/>
              <span className="text-[10px] text-marigold block mt-3 font-bold uppercase tracking-wider">Find your room. Find your perfect roommate.</span>
            </p>
            <button 
              onClick={() => setSearchQuery('')}
              className="bg-marigold hover:bg-marigold-dark text-paper font-black py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider transition shadow-sm"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredListings.map((room) => (
              <RoomCard 
                key={room.id}
                room={room}
                isWishlisted={wishlist.includes(room.id || '')}
                onWishlistToggle={(e) => toggleWishlist(room.id || '', e)}
              />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default RoomSearch;

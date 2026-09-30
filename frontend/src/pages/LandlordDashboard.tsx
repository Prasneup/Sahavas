import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Plus, Edit, Trash2, CheckCircle, Clock, Sparkles, MessageSquare, ShieldCheck, User } from 'lucide-react';
import api from '../services/api';
import { NivaroLogo } from '../components/NivaroLogo';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationDropdown } from '../components/dashboard/NotificationDropdown';
import { roomService } from '../services/roomService';
import { trustService } from '../services/trustService';
import { mediaService } from '../services/mediaService';
import { Listing } from '../types/room';
import { Conversation } from '../types/chat';
import { Notification } from '../types/notification';

// Extracted Landlord Components
import { RoomListingModal } from '../components/landlord/RoomListingModal';
import { LandlordInquiries } from '../components/landlord/LandlordInquiries';

const LandlordDashboard: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [inquiries, setInquiries] = useState<Conversation[]>([]);
  const [vettingStatus, setVettingStatus] = useState('UNVERIFIED');
  const [loading, setLoading] = useState(true);

  // Hook handles notification states, unread counter, and mark-as-read
  const { 
    notifications, 
    unreadCount, 
    markRead, 
    markAllRead
  } = useNotifications();

  // Form Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [imageUploading, setImageUploading] = useState(false);

  // Form inputs state
  const [listingForm, setListingForm] = useState<Listing>({
    title: '',
    description: '',
    rentAmount: 8000,
    depositAmount: 16000,
    roomType: 'single_room',
    genderPreference: 'any',
    distanceFromCollegeText: '',
    amenities: [],
    images: [],
    isAvailable: true,
    isVerified: false,
    locationLat: 27.68,
    locationLng: 85.32,
  });

  const availableAmenities = ['Wifi', 'Water 24h', 'Hot Shower', 'Parking', 'Balcony', 'Furnished', 'No Curfew', 'Kitchen Access'];

  useEffect(() => {
    loadLandlordData();
  }, []);

  const loadLandlordData = async () => {
    setLoading(true);
    try {
      const [listingsData, inquiriesData, trustData] = await Promise.all([
        roomService.getMyListings(),
        api.get('/chats/conversations'),
        trustService.getTrustMeDetails()
      ]);
      setListings(listingsData || []);
      setInquiries(inquiriesData.data || []);
      setVettingStatus(trustData?.verificationStatus || 'UNVERIFIED');
    } catch (err) {
      console.warn("Failed to load landlord metrics details, using mocks");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingListing(null);
    setListingForm({
      title: '',
      description: '',
      rentAmount: 7500,
      depositAmount: 15000,
      roomType: 'single_room',
      genderPreference: 'any',
      distanceFromCollegeText: '',
      amenities: ['Wifi', 'Water 24h'],
      images: [],
      isAvailable: true,
      isVerified: false,
      locationLat: 27.682,
      locationLng: 85.318,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (listing: Listing) => {
    setEditingListing(listing);
    setListingForm({
      ...listing,
      amenities: listing.amenities || [],
      images: listing.images || []
    });
    setShowModal(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const parsedValue = (name === 'rentAmount' || name === 'depositAmount') ? Number(value) : value;
    setListingForm(prev => ({
      ...prev,
      [name]: parsedValue
    }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setListingForm(prev => {
      const current = prev.amenities || [];
      const updated = current.includes(amenity)
        ? current.filter(a => a !== amenity)
        : [...current, amenity];
      return { ...prev, amenities: updated };
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setImageUploading(true);
    try {
      const url = await mediaService.upload(file);
      if (url) {
        setListingForm(prev => ({
          ...prev,
          images: [...(prev.images || []), { imageUrl: url }]
        }));
      }
    } catch (err) {
      alert("Failed to upload scan file to Cloudinary. Please verify connection/credentials.");
    } finally {
      setImageUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setListingForm(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, idx) => idx !== index)
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingListing && editingListing.id) {
        await roomService.updateListing(editingListing.id, listingForm);
        alert("Listing updated successfully!");
      } else {
        await roomService.createListing(listingForm);
        alert("Listing published successfully!");
      }
      setShowModal(false);
      loadLandlordData();
    } catch (err) {
      alert("Failed to save room details.");
    }
  };

  const handleDeleteListing = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this listing?")) return;
    try {
      await roomService.deleteListing(id);
      alert("Listing deleted successfully.");
      loadLandlordData();
    } catch (err) {
      alert("Failed to delete listing.");
    }
  };

  const handleNotificationClick = async (notif: Notification) => {
    try {
      await markRead(notif.id);
      if (notif.actionUrl) {
        navigate(notif.actionUrl);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChatClick = (chat: Conversation) => {
    navigate(`/chat/${chat.peerProfile.id}${chat.listing?.id ? `?listingId=${chat.listing.id}` : ''}`);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans select-none overflow-x-hidden animate-fade-in" style={{ backgroundColor: 'var(--clay)', color: 'var(--ink)' }}>
      
      <div className="w-full max-w-7xl mx-auto px-6 pt-6 flex-1 flex flex-col justify-start space-y-6">

        {/* Brand header panel */}
        <header className="w-full bg-paper border border-ink/10 rounded-[32px] px-6 py-4 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-paper border border-ink/10 flex items-center justify-center shadow-sm text-marigold">
              <NivaroLogo className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight font-display text-ink leading-none">Nivaro Portal</h1>
              <span className="text-[9px] uppercase tracking-wider block font-bold text-ink-soft mt-1">Landlord Dashboard</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell Dropdown */}
            <NotificationDropdown 
              notifications={notifications}
              unreadCount={unreadCount}
              onNotificationClick={handleNotificationClick}
              onMarkAllRead={markAllRead}
            />

            <button 
              onClick={logout}
              className="bg-paper hover:bg-[#FAF3E8] border border-ink/10 text-ink text-xs font-bold px-5 py-2.5 rounded-full shadow-sm transition"
            >
              Logout
            </button>
            <button 
              onClick={() => navigate('/profile')}
              className="w-10 h-10 rounded-full bg-paper border border-ink/10 flex items-center justify-center overflow-hidden shadow-sm hover:scale-105 transition"
            >
              <User size={20} className="text-ink-soft" />
            </button>
          </div>
        </header>

        {/* Verification Alert Banner */}
        {vettingStatus !== 'VERIFIED' && (
          <div className="bg-[#FAF8F5] border border-marigold/30 rounded-[24px] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <h4 className="text-sm font-black text-ink flex items-center gap-2">
                <Clock className="text-marigold" size={18} /> Owner Vetting In Progress
              </h4>
              <p className="text-xs text-ink-soft font-semibold max-w-2xl leading-relaxed">
                Your landlord status is currently <strong>{vettingStatus.replace('_', ' ')}</strong>. You can create listings, but students will not see them on the map until administrators verify your credentials.
              </p>
            </div>
            <button 
              onClick={() => navigate('/verify')}
              className="bg-marigold hover:bg-marigold-dark text-paper text-xs font-black uppercase tracking-wider px-5 py-3 rounded-xl transition shadow-sm self-start sm:self-center shrink-0"
            >
              Verify Profile
            </button>
          </div>
        )}

        {/* Redesigned Landlord Hero Section */}
        <section className="bg-paper border border-ink/10 rounded-[32px] overflow-hidden p-6 md:p-10 shadow-sm relative flex flex-col md:flex-row gap-8 items-stretch">
          {/* Left Text & Landlord Features */}
          <div className="flex-1 flex flex-col justify-between space-y-8 z-10">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-ink font-display leading-tight">
                Find the Right<br />
                <span className="text-marigold-dark">Tenant. Fill Your Room.</span>
              </h2>
              <p className="text-sm text-ink-soft font-semibold leading-relaxed max-w-sm">
                List your property, connect with verified students, and rent with confidence.
              </p>
              <button 
                onClick={() => {
                  const target = document.getElementById('listings-header');
                  if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    handleOpenCreate();
                  }
                }}
                className="bg-ink hover:bg-ink-soft text-paper text-xs font-bold px-6 py-3 rounded-full shadow-sm transition flex items-center gap-2 w-fit mt-4"
              >
                Manage Your Listings <span className="text-base">&rarr;</span>
              </button>
            </div>

            {/* Landlord 4 Features list */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-ink/5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-clay/35 text-marigold flex items-center justify-center shrink-0">
                  <Home size={14} className="stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-ink leading-tight">Fast Ads</h4>
                  <span className="text-[8px] text-ink-soft font-mono uppercase block mt-0.5">Post in minutes</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-clay/35 text-marigold flex items-center justify-center shrink-0">
                  <ShieldCheck size={14} className="stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-ink leading-tight">Verified Users</h4>
                  <span className="text-[8px] text-ink-soft font-mono uppercase block mt-0.5">Vetted students</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-clay/35 text-marigold flex items-center justify-center shrink-0">
                  <MessageSquare size={14} className="stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-ink leading-tight">Live Chats</h4>
                  <span className="text-[8px] text-ink-soft font-mono uppercase block mt-0.5">Direct messaging</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-clay/35 text-marigold flex items-center justify-center shrink-0">
                  <Sparkles size={14} className="stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-ink leading-tight">Dashboard</h4>
                  <span className="text-[8px] text-ink-soft font-mono uppercase block mt-0.5">Easy management</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Metrics widgets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full md:w-80 shrink-0">
            <div className="bg-clay/40 border border-ink/5 rounded-2xl p-5 flex flex-col justify-between min-h-[110px] shadow-sm">
              <span className="text-[9px] uppercase tracking-wider block font-black text-ink-soft/75">Active Listings</span>
              <h3 className="text-3xl font-black text-ink mt-2 font-mono">
                {listings.filter(l => l.isAvailable).length}
              </h3>
              <span className="text-[9px] block mt-1 font-bold text-marigold-dark">
                Out of {listings.length} total properties
              </span>
            </div>

            <div className="bg-paper border border-ink/10 rounded-2xl p-5 flex flex-col justify-between min-h-[110px] shadow-sm">
              <span className="text-[9px] uppercase tracking-wider block font-black text-ink-soft/75">Vetting Status</span>
              <div className={`flex items-center gap-1.5 mt-2 font-black text-xs leading-none ${
                vettingStatus === 'VERIFIED' ? 'text-pine' : 'text-marigold-dark'
              }`}>
                {vettingStatus === 'VERIFIED' ? <CheckCircle size={14} /> : <Clock size={14} />}
                {vettingStatus.replace('_', ' ')}
              </div>
              <span className="text-[9px] block mt-1.5 font-bold text-ink-soft/70 leading-normal">
                {vettingStatus === 'VERIFIED' ? "Fully verified landlord" : "Verification pending review"}
              </span>
            </div>
          </div>
        </section>

        {/* Primary landlord workspace Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start">
          
          {/* Left Column (8 / 12) - Manage Properties */}
          <main className="lg:col-span-8 space-y-6">
            <div id="listings-header" className="flex justify-between items-center border-b border-ink/5 pb-3">
              <h2 className="text-lg font-black text-ink font-display flex items-center gap-2">
                🏠 Your Listed Properties
              </h2>
              <button 
                onClick={handleOpenCreate}
                className="bg-marigold hover:bg-marigold-dark text-paper text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-sm transition flex items-center gap-1.5"
              >
                <Plus size={14} className="stroke-[2.5]" /> Add Listing
              </button>
            </div>

            {loading ? (
              <div className="text-center py-20 font-bold text-ink-soft animate-pulse">
                Fetching properties context...
              </div>
            ) : listings.length === 0 ? (
              <div className="dashboard-card p-12 text-center text-xs font-semibold text-ink-soft bg-paper space-y-3">
                <Home className="mx-auto text-marigold/30" size={36} />
                <h4 className="text-sm font-black text-ink font-display">No Listings Created Yet</h4>
                <p className="max-w-md mx-auto">List your single room, flat, or annex. Students near colleges will be able to search and route to your room.</p>
                <button 
                  onClick={handleOpenCreate}
                  className="bg-marigold hover:bg-marigold-dark text-paper text-xs font-black uppercase tracking-wider px-5 py-2.5 rounded-xl transition inline-block shadow-sm"
                >
                  Create First Listing
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {listings.map(room => (
                  <div key={room.id} className="dashboard-card overflow-hidden bg-paper flex flex-col justify-between hover:shadow-md transition">
                    <div className="h-44 bg-clay relative overflow-hidden">
                      <img 
                        src={room.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=600'} 
                        alt={room.title} 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                        {room.isVerified ? (
                          <span className="text-[8px] bg-pine text-paper px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shadow">
                            ✓ Verified
                          </span>
                        ) : (
                          <span className="text-[8px] bg-marigold text-paper px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shadow">
                            🕒 Pending Review
                          </span>
                        )}
                        <span className="text-[8px] bg-paper/95 text-ink px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shadow w-fit">
                          {room.roomType.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-1">
                        <h3 className="text-xs font-bold text-ink truncate leading-snug">{room.title}</h3>
                        <p className="text-[10px] text-ink-soft line-clamp-2 leading-relaxed">{room.description}</p>
                      </div>
                      
                      <div className="flex items-center justify-between pt-3 border-t border-ink/5 text-xs font-semibold text-ink-soft font-mono">
                        <div>
                          <span className="text-[8px] block uppercase font-sans font-bold">Rent Rate</span>
                          <span className="font-bold text-ink text-sm">NPR {room.rentAmount}</span>
                        </div>
                        
                        <div className="flex items-center gap-1.5">
                          <button 
                            onClick={() => handleOpenEdit(room)}
                            className="bg-clay hover:bg-clay/80 p-2 rounded-xl text-ink transition shadow-sm"
                            title="Edit Listing"
                          >
                            <Edit size={14} />
                          </button>
                          <button 
                            onClick={() => room.id && handleDeleteListing(room.id)}
                            className="bg-rose-50 border border-rose-100 hover:bg-rose-100 p-2 rounded-xl text-rose-600 transition shadow-sm"
                            title="Delete Listing"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>

          {/* Right Column (4 / 12) - Inquiries Inbox shortcuts */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="border-b border-ink/5 pb-3">
              <h2 className="text-lg font-black text-ink font-display flex items-center gap-2">
                📬 Tenant Enquiries
              </h2>
            </div>

            <LandlordInquiries inquiries={inquiries} onChatClick={handleChatClick} />
          </aside>

        </div>

      </div>

      {/* Floating Add / Edit Property Form Modal popup */}
      {showModal && (
        <RoomListingModal 
          onClose={() => setShowModal(false)}
          onSubmit={handleFormSubmit}
          listingForm={listingForm}
          editingListing={editingListing}
          handleInputChange={handleInputChange}
          handleAmenityToggle={handleAmenityToggle}
          handleImageUpload={handleImageUpload}
          handleRemoveImage={handleRemoveImage}
          imageUploading={imageUploading}
          availableAmenities={availableAmenities}
        />
      )}

    </div>
  );
};

export default LandlordDashboard;

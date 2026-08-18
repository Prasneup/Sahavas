import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Plus, Edit, Trash2, CheckCircle, Clock, Eye, Sparkles, Loader2, Bell, MessageSquare, ShieldCheck, User, Users, MapPin } from 'lucide-react';
import api from '../services/api';
import { NivaroLogo } from '../components/NivaroLogo';

interface ListingImage {
  id?: string;
  imageUrl: string;
}

interface Listing {
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
}

interface Conversation {
  conversationId: string;
  peerProfile: {
    id: string;
    fullName: string;
    avatarUrl: string;
    collegeName?: string;
  };
  lastMessage: string;
  lastMessageTime: string;
  unreadCount?: number;
  listing?: {
    id: string;
    title: string;
    rentAmount: number;
    distanceFromCollegeText?: string;
  };
}

interface Notification {
  id: string;
  userId: string;
  title: string;
  content: string;
  type: 'NEW_MESSAGE' | 'NEW_ENQUIRY' | 'VERIFICATION_APPROVED' | 'VERIFICATION_REJECTED';
  conversationId?: string;
  roomId?: string;
  isRead: boolean;
  createdAt: string;
}

const LandlordDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [inquiries, setInquiries] = useState<Conversation[]>([]);
  const [vettingStatus, setVettingStatus] = useState('UNVERIFIED');
  const [loading, setLoading] = useState(true);

  // Notifications states
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  // Form Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [imageUploading, setImageUploading] = useState(false);

  // Form inputs state
  const [listingForm, setListingForm] = useState<Listing>({
    title: '',
    description: '',
    rentAmount: 12000,
    depositAmount: 12000,
    locationLat: 27.7172,
    locationLng: 85.3240,
    roomType: 'single_room',
    genderPreference: 'any',
    distanceFromCollegeText: '',
    amenities: [],
    isAvailable: true,
    isVerified: false,
    images: []
  });

  const availableAmenities = [
    'WiFi', 'Parking', 'Hot Water', 'Furnished', 'Kitchen', 'Balcony', 'AC', 'Water Supply'
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch own listings
      const listRes = await api.get('/listings/my');
      setListings(listRes.data || []);

      // 2. Fetch vetting status
      const profileRes = await api.get('/profiles/me');
      setVettingStatus(profileRes.data?.verificationStatus || 'UNVERIFIED');

      // 3. Fetch recent conversations
      const chatRes = await api.get('/chats/conversations');
      setInquiries(chatRes.data?.slice(0, 5) || []);

      // 4. Fetch notifications
      const notifRes = await api.get('/notifications');
      setNotifications(notifRes.data || []);

      // 5. Fetch unread count
      const countRes = await api.get('/notifications/unread/count');
      setUnreadCount(countRes.data?.unreadCount || 0);
    } catch (err) {
      console.error("Failed to load landlord metrics", err);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notif: Notification) => {
    try {
      await api.put(`/notifications/${notif.id}/read`);
      setUnreadCount(prev => Math.max(0, prev - 1));
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }

    setShowNotifications(false);

    if (notif.type === 'NEW_MESSAGE' || notif.type === 'NEW_ENQUIRY') {
      let peerId = '';
      try {
        const chatRes = await api.get('/chats/conversations');
        const match = chatRes.data?.find((c: any) => c.conversationId === notif.conversationId);
        if (match) {
          peerId = match.peerProfile?.id;
        }
      } catch (e) {
        console.error(e);
      }

      if (peerId) {
        navigate(`/chat/${peerId}${notif.roomId ? `?listingId=${notif.roomId}` : ''}`);
      } else {
        navigate('/messages');
      }
    } else if (notif.type === 'VERIFICATION_APPROVED' || notif.type === 'VERIFICATION_REJECTED') {
      navigate('/landlord');
      loadData();
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const unreads = notifications.filter(n => !n.isRead);
      await Promise.all(unreads.map(n => api.put(`/notifications/${n.id}/read`)));
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark all notifications as read", err);
    }
  };

  const handleOpenCreate = () => {
    setEditingListing(null);
    setListingForm({
      title: '',
      description: '',
      rentAmount: 10000,
      depositAmount: 10000,
      locationLat: 27.7172,
      locationLng: 85.3240,
      roomType: 'single_room',
      genderPreference: 'any',
      distanceFromCollegeText: '',
      amenities: [],
      isAvailable: true,
      isVerified: false,
      images: []
    });
    setShowModal(true);
  };

  const handleOpenEdit = (listing: Listing) => {
    setEditingListing(listing);
    setListingForm({
      ...listing,
      // Normalize rent & deposit to numbers
      rentAmount: Number(listing.rentAmount),
      depositAmount: Number(listing.depositAmount)
    });
    setShowModal(true);
  };

  const handleDeleteListing = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this listing permanently?")) return;
    try {
      await api.delete(`/listings/${id}`);
      setListings(listings.filter(l => l.id !== id));
      alert("Listing deleted successfully.");
    } catch (err) {
      alert("Failed to delete listing.");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    setImageUploading(true);
    try {
      const res = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data?.url) {
        setListingForm(prev => ({
          ...prev,
          images: [...prev.images, { imageUrl: res.data.url }]
        }));
      }
    } catch (err) {
      alert("Failed to upload image. Please try again.");
    } finally {
      setImageUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setListingForm(prev => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== index)
    }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setListingForm(prev => {
      const current = prev.amenities;
      if (current.includes(amenity)) {
        return { ...prev, amenities: current.filter(a => a !== amenity) };
      } else {
        return { ...prev, amenities: [...current, amenity] };
      }
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setListingForm(prev => ({
      ...prev,
      [name]: name === 'rentAmount' || name === 'depositAmount' || name === 'locationLat' || name === 'locationLng' 
        ? Number(value) 
        : value
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listingForm.title.trim() || !listingForm.description.trim()) {
      alert("Please enter title and description.");
      return;
    }

    try {
      if (editingListing?.id) {
        // Edit Mode
        const res = await api.put(`/listings/${editingListing.id}`, listingForm);
        setListings(listings.map(l => l.id === editingListing.id ? res.data : l));
        alert("Listing updated successfully!");
      } else {
        // Create Mode
        const res = await api.post('/listings', listingForm);
        setListings([res.data, ...listings]);
        alert("Listing created! Note: It will be visible to students after admin moderation.");
      }
      setShowModal(false);
    } catch (err) {
      alert("Failed to save listing. Please verify inputs.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pb-0 animate-fade-in" style={{ backgroundColor: '#F5ECE1', color: 'var(--ink)', fontFamily: 'var(--font-body)' }}>
      <div className="w-full max-w-6xl px-6 pt-6 flex flex-col items-stretch space-y-8 mb-12">
        
        {/* Header Panel */}
        <header className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-marigold flex items-center justify-center text-ink shadow-sm">
              <NivaroLogo className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-ink font-display uppercase leading-none">
                NIVARO
              </h1>
              <span className="text-[10px] tracking-wider block uppercase font-mono font-bold text-ink-soft/75 mt-0.5">
                NAMASTE, {user?.fullName || 'OWNER'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="bg-paper hover:bg-[#FAF3E8] border border-ink/10 text-ink p-2.5 rounded-full shadow-sm transition relative"
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-paper text-[8px] font-black flex items-center justify-center shadow-md animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-paper border border-ink/10 rounded-[20px] shadow-xl z-50 p-4 space-y-3 animate-scale-up">
                  <div className="flex justify-between items-center border-b border-ink/5 pb-2">
                    <h4 className="text-xs font-black text-ink font-display">Notifications</h4>
                    {unreadCount > 0 && (
                      <button 
                        onClick={handleMarkAllRead}
                        className="text-[10px] text-marigold font-black hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-60 overflow-y-auto divide-y divide-ink/5 space-y-2.5">
                    {notifications.length === 0 ? (
                      <div className="text-center py-6 text-[10px] font-bold text-ink-soft/75">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div 
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif)}
                          className={`pt-2.5 pb-1 flex gap-2.5 cursor-pointer group hover:bg-[#FAF8F5] rounded-lg px-2 transition ${notif.isRead ? '' : 'bg-clay/10'}`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 justify-between">
                              <span className={`text-[10px] font-black truncate ${notif.isRead ? 'text-ink' : 'text-marigold-dark'}`}>
                                {notif.title}
                              </span>
                              {!notif.isRead && (
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                              )}
                            </div>
                            <p className="text-[10px] text-ink-soft/80 line-clamp-2 mt-0.5 font-medium leading-normal">
                              {notif.content}
                            </p>
                            <span className="text-[8px] text-ink-soft/45 font-mono mt-1 block">
                              {new Date(notif.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

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
                  <h4 className="text-[10px] font-bold text-ink leading-tight">List Property</h4>
                  <p className="text-[8px] text-ink-soft font-semibold">Easy & Quick</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-clay/35 text-marigold flex items-center justify-center shrink-0">
                  <Users size={14} className="stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-ink leading-tight">Verified Students</h4>
                  <p className="text-[8px] text-ink-soft font-semibold">Trusted Vetting</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-clay/35 text-marigold flex items-center justify-center shrink-0">
                  <MessageSquare size={14} className="stroke-[2]" />
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-ink leading-tight">Manage Inquiries</h4>
                  <p className="text-[8px] text-ink-soft font-semibold">All in One Place</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-clay/35 text-marigold flex items-center justify-center shrink-0">
                  <ShieldCheck size={14} className="stroke-[2]" />
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-ink leading-tight">Rent Confidently</h4>
                  <p className="text-[8px] text-ink-soft font-semibold">Safe & Secure</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Visual Container with absolute overlays matching landlord reference image */}
          <div className="flex-1 min-h-[360px] md:min-h-[420px] relative rounded-[24px] overflow-hidden bg-clay/10 hidden md:block">
            {/* Main cozy room interior backdrop */}
            <img 
              src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800" 
              alt="Cozy Interior" 
              className="absolute inset-0 w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-paper/30 to-transparent pointer-events-none" />

            {/* Overlay Card 1: Active Listing (Top Right) */}
            <div className="absolute top-4 right-4 bg-paper/95 backdrop-blur-sm border border-ink/10 rounded-2xl p-2.5 shadow-lg w-[210px] space-y-1.5 z-20">
              <div className="h-20 rounded-lg overflow-hidden relative">
                <img 
                  src={listings[0]?.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=400"} 
                  alt="Listing card" 
                  className="w-full h-full object-cover" 
                />
                <span className="absolute top-1.5 right-1.5 bg-pine text-paper text-[8px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-paper animate-ping" /> Active Listing
                </span>
              </div>
              <div>
                <h4 className="text-[10px] font-black text-ink truncate leading-tight">
                  {listings[0]?.title || "Cozy Room Near IOE Pulchowk"}
                </h4>
                 <p className="text-[8px] text-ink-soft font-semibold flex items-center gap-0.5 mt-0.5">
                  <MapPin size={7} /> {(listings[0]?.distanceFromCollegeText?.split('from') || [])[0] || "Pulchowk, Lalitpur"}
                </p>
                <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-ink/5">
                  <span className="text-[9px] text-marigold-dark font-black">
                    NPR {listings[0]?.rentAmount?.toLocaleString() || "7,500"} /mo
                  </span>
                  <span className="text-[7px] text-ink-soft/60 font-semibold font-mono">1 Bed • WiFi</span>
                </div>
              </div>
            </div>

            {/* Overlay Card 2: Verified Student (Middle Right) */}
            <div className="absolute top-[170px] right-4 bg-paper/95 backdrop-blur-sm border border-ink/10 rounded-2xl p-3 shadow-lg w-[200px] flex items-center gap-3 z-20">
              <div className="w-9 h-9 rounded-full bg-clay/35 text-marigold flex items-center justify-center shrink-0 overflow-hidden border border-ink/5">
                {inquiries[0]?.peerProfile?.avatarUrl ? (
                  <img src={inquiries[0]?.peerProfile?.avatarUrl} alt="student" className="w-full h-full object-cover" />
                ) : (
                  <User size={16} />
                )}
              </div>
              <div className="min-w-0">
                <span className="text-[7px] text-pine font-black uppercase tracking-wider block">Verified Student</span>
                <h4 className="text-[9px] font-black text-ink truncate leading-tight">
                  {inquiries[0]?.peerProfile?.fullName || "Suresh Neupane"}
                </h4>
                <p className="text-[7px] text-ink-soft font-semibold truncate">
                  {inquiries[0]?.peerProfile?.collegeName || "IOE Pulchowk Campus"}
                </p>
              </div>
              <div className="w-4 h-4 rounded-full bg-pine/15 text-pine flex items-center justify-center shrink-0">
                <CheckCircle size={10} className="stroke-[2.5]" />
              </div>
            </div>

            {/* Overlay Card 3: New Inquiry message (Bottom Left) */}
            <div className="absolute bottom-4 left-4 bg-paper/95 backdrop-blur-sm border border-ink/10 rounded-2xl p-3 shadow-lg w-[220px] space-y-1.5 z-20">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-marigold shrink-0" />
                <span className="text-[8px] uppercase tracking-wider font-black text-ink-soft/75">New Inquiry</span>
              </div>
              <p className="text-[9px] text-ink-soft font-medium leading-relaxed italic">
                "{inquiries[0]?.lastMessage || "Hello! I am interested in your room. Please let me know more details."}"
              </p>
              <span className="text-[7px] text-ink-soft/40 block font-mono">2m ago</span>
            </div>
          </div>
        </section>

        {/* Top metrics summary cards */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
          <div className="bg-paper border border-ink/10 rounded-2xl p-5 flex flex-col justify-between min-h-[110px] shadow-sm">
            <span className="text-[9px] uppercase tracking-wider block font-black text-ink-soft/75">Total Properties</span>
            <h3 className="text-3xl font-black font-mono text-ink mt-2">{listings.length}</h3>
            <span className="text-[9px] block mt-1.5 font-bold text-ink-soft/70">Active listings in database</span>
          </div>

          <div className="bg-paper border border-ink/10 rounded-2xl p-5 flex flex-col justify-between min-h-[110px] shadow-sm">
            <span className="text-[9px] uppercase tracking-wider block font-black text-ink-soft/75">Verified Rooms</span>
            <h3 className="text-3xl font-Pine font-mono text-pine mt-2">
              {listings.filter(l => l.isVerified).length}
            </h3>
            <span className="text-[9px] block mt-1.5 font-bold text-pine font-black uppercase tracking-wider">Cleared & Live on Map</span>
          </div>

          <div className="bg-paper border border-ink/10 rounded-2xl p-5 flex flex-col justify-between min-h-[110px] shadow-sm">
            <span className="text-[9px] uppercase tracking-wider block font-black text-ink-soft/75">Account Status</span>
            <div className="mt-2.5">
              <Link to="/verify" className="inline-block bg-[#F8EEDC] hover:bg-[#FAF3E8] border border-marigold/40 text-marigold-dark rounded-full px-3 py-1 font-bold text-[9px] tracking-wide uppercase transition">
                Check Status
              </Link>
            </div>
            <span className={`text-[10px] block mt-1.5 font-black uppercase tracking-wider ${
              vettingStatus === 'VERIFIED' ? 'text-pine' : 'text-marigold-dark'
            }`}>
              {vettingStatus.replace('_', ' ')}
            </span>
          </div>
        </section>

        {/* Listings Section & Conversations Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start w-full">
          
          {/* Main listings list (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center" id="listings-header">
              <h3 className="text-base font-black text-ink font-display flex items-center gap-1.5">
                🏠 My Rooms & Apartments
              </h3>
              <button 
                onClick={handleOpenCreate}
                className="bg-marigold hover:bg-marigold-dark text-paper text-xs font-black uppercase tracking-wider px-4 py-2 rounded-xl shadow-sm transition flex items-center gap-1.5"
              >
                <Plus size={14} /> Add Property
              </button>
            </div>

            {loading ? (
              <div className="text-center py-16 text-xs text-ink-soft font-bold animate-pulse">
                Fetching properties data from database...
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-16 bg-paper border border-ink/10 rounded-[32px] p-8 shadow-sm space-y-4">
                <h3 className="text-base font-bold font-display text-ink">No Listings Created</h3>
                <p className="text-ink-soft text-xs max-w-sm mx-auto font-semibold leading-relaxed">
                  Start hosting Pulchowk, NCIT, and BBA students by publishing your first room.
                </p>
                <button 
                  onClick={handleOpenCreate}
                  className="bg-marigold hover:bg-marigold-dark text-paper font-black py-2.5 px-5 rounded-xl text-xs uppercase tracking-wider transition shadow-sm"
                >
                  Create Listing
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {listings.map(room => (
                  <div key={room.id} className="dashboard-card p-5 bg-paper border border-ink/5 flex flex-col sm:flex-row justify-between gap-4 hover:shadow-md transition">
                    <div className="flex items-start gap-4">
                      <img 
                        src={room.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=400"} 
                        alt={room.title} 
                        className="w-16 h-16 rounded-2xl object-cover border border-ink/10 shadow-sm shrink-0" 
                      />
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-black text-ink truncate max-w-[200px]">{room.title}</h4>
                          {room.isVerified ? (
                            <span className="inline-flex items-center gap-0.5 bg-pine-light text-pine px-2 py-0.5 rounded-full text-[9px] font-bold">
                              <CheckCircle size={10} /> Live
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 bg-clay text-ink-soft px-2 py-0.5 rounded-full text-[9px] font-bold">
                              <Clock size={10} /> Pending Verification
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-ink-soft font-mono font-bold">
                          NPR {room.rentAmount} / month • Deposit: NPR {room.depositAmount}
                        </p>
                        <p className="text-[10px] text-ink-soft font-semibold">
                          🏫 {room.distanceFromCollegeText || "Near campus"} • {room.roomType.replace('_', ' ').toUpperCase()}
                        </p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col justify-end items-end gap-2 border-t sm:border-t-0 border-ink/5 pt-3 sm:pt-0 shrink-0">
                      <div className="flex gap-2 w-full">
                        <button 
                          onClick={() => handleOpenEdit(room)}
                          className="flex-1 sm:flex-none p-2 rounded-xl bg-clay hover:bg-clay/80 text-ink-soft/80 flex items-center justify-center transition"
                          title="Edit Room"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          onClick={() => handleDeleteListing(room.id!)}
                          className="flex-1 sm:flex-none p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-500 flex items-center justify-center transition"
                          title="Delete Listing"
                        >
                          <Trash2 size={14} />
                        </button>
                        <button 
                          onClick={() => navigate(`/rooms/${room.id}`)}
                          className="flex-1 sm:flex-none p-2 rounded-xl bg-marigold/10 hover:bg-marigold/20 text-marigold-dark flex items-center justify-center transition"
                          title="Preview Room Page"
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right inquiries sidebar (1/3 width) */}
          <div className="space-y-6">
            <h3 className="text-base font-black text-ink font-display flex items-center gap-1.5">
              💬 Prospective Student Inquiries
            </h3>
            
            <div className="space-y-4">
              {inquiries.length === 0 ? (
                <div className="bg-paper border border-ink/5 rounded-[24px] p-5 text-center py-8 text-xs font-bold text-ink-soft leading-relaxed shadow-sm">
                  No active conversations with students yet. Listings that are verified show up on student maps to receive messages.
                </div>
              ) : (
                inquiries.map((conv) => (
                  <div 
                    key={conv.conversationId} 
                    className="bg-paper border border-ink/10 rounded-[20px] p-4 space-y-3 shadow-sm hover:shadow-md transition flex flex-col"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex gap-2.5 items-center">
                        <div className="w-9 h-9 rounded-full bg-clay/35 text-marigold flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                          {conv.peerProfile?.avatarUrl && conv.peerProfile.avatarUrl.trim().length > 0 ? (
                            <img src={conv.peerProfile.avatarUrl} alt={conv.peerProfile.fullName} className="w-full h-full object-cover" />
                          ) : (
                            conv.peerProfile?.fullName ? conv.peerProfile.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : 'NS'
                          )}
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-ink flex items-center gap-1.5">
                            {conv.peerProfile?.fullName || 'Nivaro Student'}
                            {conv.unreadCount && conv.unreadCount > 0 ? (
                              <span className="bg-[#D9A25A] text-paper text-[8px] font-black px-1.5 py-0.5 rounded-md animate-pulse">NEW</span>
                            ) : null}
                          </h4>
                          <span className="text-[9px] text-ink-soft/70 font-semibold block">{conv.peerProfile?.collegeName || 'Nivaro Student'}</span>
                        </div>
                      </div>
                      <span className="text-[8px] text-ink-soft/50 font-mono font-bold">
                        {conv.lastMessageTime ? new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>

                    <div className="bg-[#FAF8F5] border border-ink/5 rounded-xl p-2.5">
                      <p className="text-[10px] text-ink-soft italic font-medium line-clamp-2">
                        "{conv.lastMessage || 'No messages yet'}"
                      </p>
                    </div>

                    {conv.listing && (
                      <div className="border-t border-ink/5 pt-2.5 space-y-1">
                        <span className="text-[8px] text-ink-soft font-bold uppercase tracking-wider block">Interested in:</span>
                        <span className="text-[10px] font-bold text-ink block truncate">{conv.listing.title}</span>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[9px] font-bold text-marigold-dark">NPR {conv.listing.rentAmount.toLocaleString()}/month</span>
                          {conv.listing.distanceFromCollegeText && (
                            <span className="text-[9px] text-pine font-bold uppercase tracking-wider">{conv.listing.distanceFromCollegeText}</span>
                          )}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => navigate(`/chat/${conv.peerProfile?.id || ''}${conv.listing ? `?listingId=${conv.listing.id}` : ''}`)}
                      className="w-full mt-2 bg-ink hover:bg-ink-soft text-paper text-[10px] font-black py-2.5 rounded-xl transition text-center flex items-center justify-center gap-1"
                    >
                      Open Conversation
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* CREATE/EDIT MODAL DIALOG */}
      {showModal && (
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fade-in overflow-y-auto">
          <div className="bg-paper border border-ink/10 rounded-[32px] p-6 max-w-2xl w-full shadow-2xl space-y-6 my-8 max-h-[85vh] overflow-y-auto animate-scale-up">
            <div className="flex justify-between items-center border-b border-ink/5 pb-3">
              <h3 className="text-base font-black text-ink font-display flex items-center gap-1.5">
                <Sparkles className="text-marigold" size={18} /> {editingListing ? 'Edit Property Listing' : 'Publish New Property'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-ink-soft hover:text-ink font-bold text-xs"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-semibold text-ink-soft">
              
              {/* Row 1: Title */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-ink-soft mb-1.5">Listing Title</label>
                <input 
                  type="text" 
                  name="title" 
                  required
                  value={listingForm.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Spacious Single Room near Pulchowk Gate"
                  className="w-full bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-2.5 focus:outline-none focus:border-marigold"
                />
              </div>

              {/* Row 2: Description */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-ink-soft mb-1.5">Description</label>
                <textarea 
                  name="description" 
                  required
                  rows={3}
                  value={listingForm.description}
                  onChange={handleInputChange}
                  placeholder="Detail the room configuration, nearby landmarks, student conveniences, water/electricity systems, etc."
                  className="w-full bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-2.5 focus:outline-none focus:border-marigold resize-none"
                />
              </div>

              {/* Row 3: Rent & Deposit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-ink-soft mb-1.5">Monthly Rent (NPR)</label>
                  <input 
                    type="number" 
                    name="rentAmount" 
                    required
                    value={listingForm.rentAmount}
                    onChange={handleInputChange}
                    className="w-full bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-2.5 focus:outline-none focus:border-marigold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-ink-soft mb-1.5">Security Deposit (NPR)</label>
                  <input 
                    type="number" 
                    name="depositAmount" 
                    required
                    value={listingForm.depositAmount}
                    onChange={handleInputChange}
                    className="w-full bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-2.5 focus:outline-none focus:border-marigold font-mono"
                  />
                </div>
              </div>

              {/* Row 4: Room Type, Gender Preference, Proximity */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-ink-soft mb-1.5">Room Config Type</label>
                  <select 
                    name="roomType"
                    value={listingForm.roomType}
                    onChange={handleInputChange}
                    className="w-full bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-2.5 focus:outline-none focus:border-marigold font-bold text-ink"
                  >
                    <option value="single_room">Single Room</option>
                    <option value="shared_room">Shared Room</option>
                    <option value="full_flat">Full Flat</option>
                    <option value="annex">Annex</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-ink-soft mb-1.5">Gender Restriction</label>
                  <select 
                    name="genderPreference"
                    value={listingForm.genderPreference}
                    onChange={handleInputChange}
                    className="w-full bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-2.5 focus:outline-none focus:border-marigold font-bold text-ink"
                  >
                    <option value="any">Any / Mixed</option>
                    <option value="male">Boys Only</option>
                    <option value="female">Girls Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-ink-soft mb-1.5">Campus Proximity Text</label>
                  <input 
                    type="text" 
                    name="distanceFromCollegeText" 
                    value={listingForm.distanceFromCollegeText}
                    onChange={handleInputChange}
                    placeholder="e.g. 300m to Pulchowk Campus"
                    className="w-full bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-2.5 focus:outline-none focus:border-marigold"
                  />
                </div>
              </div>


              {/* Amenities Grid checklist */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-ink-soft mb-2">Amenities Provided</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {availableAmenities.map(amenity => {
                    const isChecked = listingForm.amenities.includes(amenity);
                    return (
                      <div 
                        key={amenity}
                        onClick={() => handleAmenityToggle(amenity)}
                        className={`p-2 border rounded-xl flex items-center gap-2 cursor-pointer transition ${
                          isChecked 
                            ? 'bg-amber-50 border-marigold/30 text-marigold-dark' 
                            : 'bg-[#FAF8F5] border-ink/5 text-ink-soft/70 hover:bg-clay/5'
                        }`}
                      >
                        <input 
                          type="checkbox" 
                          checked={isChecked}
                          onChange={() => {}}
                          className="rounded text-marigold focus:ring-marigold accent-marigold w-3.5 h-3.5"
                        />
                        <span className="text-[10px] font-bold">{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cloudinary Image Upload */}
              <div className="border-t border-ink/5 pt-4">
                <label className="block text-[10px] uppercase font-bold text-ink-soft mb-2">Property Images</label>
                
                {/* Previews grid */}
                <div className="flex flex-wrap gap-3 mb-3">
                  {listingForm.images.map((img, index) => (
                    <div key={index} className="relative w-20 h-20 rounded-xl overflow-hidden border border-ink/10 group">
                      <img src={img.imageUrl} alt="preview" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute inset-0 bg-rose-500/80 text-paper font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-[9px] uppercase tracking-wider"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  
                  {/* Upload box trigger */}
                  <label className="w-20 h-20 border border-dashed border-ink/20 hover:border-marigold/40 rounded-xl flex flex-col items-center justify-center cursor-pointer transition bg-[#FAF8F5] relative">
                    {imageUploading ? (
                      <Loader2 size={16} className="text-marigold animate-spin" />
                    ) : (
                      <>
                        <Plus size={16} className="text-ink-soft/60" />
                        <span className="text-[8px] text-ink-soft/50 font-bold uppercase mt-1">Upload</span>
                      </>
                    )}
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={imageUploading}
                      className="hidden"
                    />
                  </label>
                </div>
                <span className="text-[9px] text-ink-soft/50 font-semibold block leading-tight">
                  * Upload clear property photos. Cloudinary automatically processes image aspect ratios.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 border-t border-ink/5 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border border-ink/10 hover:bg-clay/10 text-xs font-bold text-ink-soft rounded-xl transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-marigold hover:bg-marigold-dark text-paper text-xs font-black uppercase tracking-wider rounded-xl transition shadow-sm flex items-center justify-center gap-1.5"
                >
                  {editingListing ? 'Update Listing' : 'Publish Listing'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default LandlordDashboard;

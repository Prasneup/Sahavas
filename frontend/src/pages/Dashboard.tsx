import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Home, MessageSquare, User, Home as HomeIcon, Users } from 'lucide-react';
import api from '../services/api';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profileCompleteness, setProfileCompleteness] = useState(60);

  useEffect(() => {
    // Attempt to load current completeness dynamically from profile endpoint
    api.get('/profiles/me')
      .then(res => {
        if (res.data && res.data.completenessPercentage !== undefined) {
          setProfileCompleteness(res.data.completenessPercentage);
        }
      })
      .catch(() => {
        // Fallback to default 60% as shown in UI design mocks
        setProfileCompleteness(60);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1E1E1E] flex flex-col items-center justify-start pb-24 font-sans">
      <div className="w-full max-w-md px-6 pt-6">
        
        {/* Header Bar */}
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            {/* Sahavas Mandala/Sun Logo Icon */}
            <div className="w-8 h-8 rounded-full bg-[#FAF8F5] flex items-center justify-center border border-[#D9A25A]/40 shadow-sm">
              <svg className="w-5 h-5 text-[#D9A25A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#1A2540] flex items-center gap-1 font-display">
                सहवास
              </h1>
              <span className="text-[10px] text-[#A39E93] font-semibold tracking-wider block -mt-1 uppercase">
                Namaste, {user?.fullName?.split(' ')[0] || 'Prasanna'}
              </span>
            </div>
          </div>
          
          <button 
            onClick={() => navigate('/profile')}
            className="w-9 h-9 rounded-full bg-[#EAE5D9] flex items-center justify-center border border-[#D9A25A]/30 overflow-hidden shadow-sm hover:scale-105 transition"
          >
            <User size={18} className="text-[#8E8674]" />
          </button>
        </header>

        {/* Dashboard Title */}
        <section className="mb-6">
          <h2 className="text-2xl font-black text-[#1E1E1E] font-display">Dashboard</h2>
          <p className="text-xs text-[#6E685A] mt-1.5 leading-relaxed">
            Welcome to Sahavas, Refore; UI/Utinate you wire refer for and Sahavas!
          </p>
        </section>

        {/* Two Large Call to Action Cards (Housing vs Roommates) */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Link 
            to="/rooms" 
            className="bg-[#D9A25A] hover:bg-[#C9924A] text-white rounded-2xl p-5 shadow flex flex-col justify-between h-44 transition duration-300 hover:scale-102"
          >
            <div className="w-10 h-10 rounded-full bg-[#FAF8F5] flex items-center justify-center shadow-sm">
              <HomeIcon size={18} className="text-[#D9A25A]" />
            </div>
            <h3 className="text-base font-black leading-snug font-display">
              Looking for<br />Housing?
            </h3>
          </Link>

          <Link 
            to="/roommates" 
            className="bg-[#D9A25A] hover:bg-[#C9924A] text-white rounded-2xl p-5 shadow flex flex-col justify-between h-44 transition duration-300 hover:scale-102"
          >
            <div className="w-10 h-10 rounded-full bg-[#FAF8F5] flex items-center justify-center shadow-sm">
              <Users size={18} className="text-[#D9A25A]" />
            </div>
            <h3 className="text-base font-black leading-snug font-display">
              Looking for a<br />Roommate?
            </h3>
          </Link>
        </div>

        {/* Student Communities Card */}
        <Link 
          to="/communities" 
          className="bg-white border border-[#EAE5D9] hover:border-[#D9A25A]/40 rounded-2xl p-5 shadow-sm flex items-center justify-between transition duration-300 hover:scale-[1.01] mb-6 cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#FAF3E8] flex items-center justify-center text-[#D9A25A] shadow-sm flex-shrink-0">
              <svg className="w-5 h-5 text-[#D9A25A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-black text-[#1E1E1E] font-display">Student Communities Hub</h4>
              <p className="text-[11px] text-[#8E8674] font-medium mt-0.5">Network with students from your campus and district.</p>
            </div>
          </div>
        </Link>

        {/* Relocation Assistant Card */}
        <Link 
          to="/relocation" 
          className="bg-white border border-[#EAE5D9] hover:border-orange-500/40 rounded-2xl p-5 shadow-sm flex items-center justify-between transition duration-300 hover:scale-[1.01] mb-6 cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 shadow-sm flex-shrink-0">
              <svg className="w-5 h-5 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-black text-[#1E1E1E] font-display">Student Relocation Road</h4>
              <p className="text-[11px] text-[#8E8674] font-medium mt-0.5">Earn XP and track flat hunt checklists (Duolingo style).</p>
            </div>
          </div>
          <span className="text-orange-500 text-xs font-black">Play →</span>
        </Link>

        {/* Profile Status Completeness Card */}
        <div className="bg-white border border-[#EAE5D9] rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold text-[#A39E93] uppercase tracking-wider block mb-1">
            Your Profile Status
          </span>
          <div className="flex justify-between items-baseline mb-3">
            <h3 className="text-3xl font-black text-[#1E1E1E] tracking-tight font-display">
              {profileCompleteness}%
            </h3>
            <span className="text-xs font-semibold text-[#8E8674]">Completed</span>
          </div>

          {/* Completeness slider progress line */}
          <div className="w-full bg-[#FAF8F5] h-3 rounded-full overflow-hidden border border-[#EAE5D9]/60">
            <div 
              className="bg-[#D9A25A] h-full rounded-full transition-all duration-750"
              style={{ width: `${profileCompleteness}%` }}
            />
          </div>
        </div>

      </div>

      {/* Bottom Sticky Mobile Navigation Dock */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#FAF8F5] border-t border-[#EAE5D9] py-3.5 px-6 flex justify-between items-center shadow-lg z-30 w-full max-w-md mx-auto">
        <Link to="/dashboard" className="flex flex-col items-center gap-1 text-[#D9A25A] transition">
          <Home size={20} className="stroke-[2.5]" />
          <span className="text-[9px] font-bold tracking-wide">Home</span>
        </Link>
        <Link to="/rooms" className="flex flex-col items-center gap-1 text-[#A39E93] hover:text-[#1E1E1E] transition">
          <HomeIcon size={20} className="stroke-[2]" />
          <span className="text-[9px] font-semibold">Rooms</span>
        </Link>
        <Link to="/roommates" className="flex flex-col items-center gap-1 text-[#A39E93] hover:text-[#1E1E1E] transition">
          <Users size={20} className="stroke-[2]" />
          <span className="text-[9px] font-semibold">Matches</span>
        </Link>
        <Link to="/messages" className="flex flex-col items-center gap-1 text-[#A39E93] hover:text-[#1E1E1E] transition">
          <MessageSquare size={20} className="stroke-[2]" />
          <span className="text-[9px] font-semibold">Inbox</span>
        </Link>
        <Link to="/profile" className="flex flex-col items-center gap-1 text-[#A39E93] hover:text-[#1E1E1E] transition">
          <User size={20} className="stroke-[2]" />
          <span className="text-[9px] font-semibold">Profile</span>
        </Link>
      </nav>
    </div>
  );
};

export default Dashboard;

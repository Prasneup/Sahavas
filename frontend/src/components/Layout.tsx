import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, Users, MessageSquare, User, Bell } from 'lucide-react';
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/dashboard', icon: Home },
    { name: 'Rooms', path: '/rooms', icon: Search },
    { name: 'Matches', path: '/roommates', icon: Users },
    { name: 'Inbox', path: '/messages', icon: MessageSquare },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const activePath = location.pathname;

  return (
    <div className="min-h-screen flex flex-col bg-clay text-ink font-sans">
      {/* Desktop Top Navigation (sticky top-0 hidden on mobile) */}
      <nav className="hidden md:block sticky top-0 z-40 bg-[#FAF6EC] border-b border-ink/10 shadow-sm backdrop-blur-md bg-opacity-95">
        <div className="max-w-6xl mx-auto px-6">
          
          {/* Header Row */}
          <div className="flex justify-between items-center py-3.5 border-b border-ink/5">
            {/* Sahavas Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
              <div className="w-8 h-8 rounded-full bg-marigold flex items-center justify-center text-ink shadow-sm">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                </svg>
              </div>
              <h1 className="text-xl font-black text-ink font-display tracking-tight">सहवास</h1>
            </div>

            {/* Notification and Profile icons */}
            <div className="flex items-center gap-4">
              <button className="relative p-2 rounded-full hover:bg-clay/20 transition text-ink-soft">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
              </button>
              
              <button 
                onClick={() => navigate('/profile')}
                className="w-9 h-9 rounded-full bg-clay border border-ink/10 flex items-center justify-center overflow-hidden hover:scale-105 transition"
              >
                <User size={18} className="text-ink-soft" />
              </button>
            </div>
          </div>

          {/* Navigation Row */}
          <div className="flex items-center gap-8 py-2.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePath === item.path || (item.path !== '/dashboard' && activePath.startsWith(item.path));
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-2 py-1.5 px-3 rounded-xl text-sm font-bold transition duration-200 hover:bg-clay/10 ${
                    isActive 
                      ? 'text-marigold' 
                      : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'stroke-[2.5]' : 'stroke-[2]'} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

        </div>
      </nav>

      {/* Main Page Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>

      {/* Mobile Bottom Navigation (fixed at bottom, hidden on desktop) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 py-3 px-6 flex justify-between items-center shadow-lg z-30 w-full max-w-md mx-auto bg-paper border-t border-ink/10">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePath === item.path || (item.path !== '/dashboard' && activePath.startsWith(item.path));
          return (
            <Link 
              key={`mob-${item.name}`}
              to={item.path} 
              className={`flex flex-col items-center gap-0.5 transition ${
                isActive ? 'text-marigold' : 'text-ink-soft'
              }`}
            >
              <Icon size={20} className={isActive ? 'stroke-[2.5]' : 'stroke-[2]'} />
              <span className="text-[9px] font-semibold">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Layout;

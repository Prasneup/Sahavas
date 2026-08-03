import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Home, User, Search, Users, LogOut } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Sidebar Nav */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between hidden md:flex">
        <div className="space-y-8">
          <div>
            <h1 className="text-2xl font-black text-brand-cyan tracking-tight font-display">UniSphere</h1>
            <span className="text-xs text-slate-500 font-medium">Student Relocation Hub</span>
          </div>

          <nav className="space-y-2">
            <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-lg bg-slate-800 text-brand-cyan transition">
              <Home size={18} />
              Home Feed
            </Link>
            <Link to="/rooms" className="flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition">
              <Search size={18} />
              Search Rooms
            </Link>
            <Link to="/roommates" className="flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition">
              <Users size={18} />
              Find Roommates
            </Link>
          </nav>
        </div>

        <div className="border-t border-slate-800 pt-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-brand-cyan">
              {user?.fullName?.charAt(0) || 'S'}
            </div>
            <div>
              <p className="text-sm font-bold truncate max-w-[150px]">{user?.fullName}</p>
              <span className="text-xs text-slate-500 capitalize">{user?.role?.replace('ROLE_', '').toLowerCase()}</span>
            </div>
          </div>

          <button 
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold text-rose-400 hover:bg-rose-950/20 rounded-lg transition"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-8 md:hidden">
          <h1 className="text-xl font-bold text-brand-cyan font-display">UniSphere</h1>
          <button onClick={logout} className="p-2 text-slate-400"><LogOut size={20} /></button>
        </header>

        {/* Verification Alert Banner */}
        {user?.status === 'PENDING_VERIFICATION' && (
          <div className="mb-8 p-4 bg-amber-950/30 border border-amber-800 text-amber-300 rounded-xl flex items-center gap-3 text-sm">
            <User className="flex-shrink-0" />
            <div>
              <span className="font-bold">Verification Pending:</span> Please upload your college ID to verify your student status and access roommate quizzes.
            </div>
          </div>
        )}

        {/* Welcome Section */}
        <section className="mb-10">
          <h2 className="text-3xl font-extrabold tracking-tight font-display mb-2">Hello, {user?.fullName}!</h2>
          <p className="text-slate-400">Manage your relocating plans and roommate suggestions in Kathmandu.</p>
        </section>

        {/* Action Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-brand-cyan transition flex flex-col justify-between">
            <div>
              <Search className="text-brand-cyan mb-4" size={32} />
              <h3 className="text-xl font-bold font-display mb-2">Housing listings</h3>
              <p className="text-slate-400 text-sm mb-6">Explore trusted rooms and student flats near your university with PostGIS coordinates maps.</p>
            </div>
            <Link to="/rooms" className="inline-flex items-center justify-center bg-brand-cyan hover:bg-teal-700 text-white font-semibold py-2.5 px-4 rounded-lg transition text-sm">
              Explore Rooms
            </Link>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-brand-crimson transition flex flex-col justify-between">
            <div>
              <Users className="text-brand-crimson mb-4" size={32} />
              <h3 className="text-xl font-bold font-display mb-2">Find Roommates</h3>
              <p className="text-slate-400 text-sm mb-6">Answer our 9-factor questionnaire to evaluate compatibility match indices.</p>
            </div>
            <Link to="/roommates" className="inline-flex items-center justify-center bg-brand-crimson hover:bg-rose-700 text-white font-semibold py-2.5 px-4 rounded-lg transition text-sm">
              Start Matching Quiz
            </Link>
          </div>
        </div>

        {/* Mobile Navigation Footer */}
        <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-4 flex justify-around md:hidden">
          <Link to="/dashboard" className="flex flex-col items-center text-brand-cyan text-xs font-semibold">
            <Home size={20} />
            <span>Home</span>
          </Link>
          <Link to="/rooms" className="flex flex-col items-center text-slate-500 text-xs font-semibold">
            <Search size={20} />
            <span>Rooms</span>
          </Link>
          <Link to="/roommates" className="flex flex-col items-center text-slate-500 text-xs font-semibold">
            <Users size={20} />
            <span>Roommates</span>
          </Link>
        </nav>
      </main>
    </div>
  );
};

export default Dashboard;

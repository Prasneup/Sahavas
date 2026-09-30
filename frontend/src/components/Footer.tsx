import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { NivaroLogo } from './NivaroLogo';
import { SupportModal } from './common/SupportModal';
import { BugReportModal } from './common/BugReportModal';
import { FaqModal } from './common/FaqModal';

type ModalType = 'support' | 'faq' | 'bug' | null;

const Footer: React.FC = () => {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  return (
    <footer className="w-full bg-[#FAF6EC] border-t border-ink/10 relative z-10 pt-12 pb-24 md:pb-12 mt-auto">
      <div className="max-w-6xl mx-auto px-6 space-y-10">
        
        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 md:gap-12">
          
          {/* Column 1: Brand (spans 2 columns on tablet/desktop) */}
          <div className="sm:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-marigold flex items-center justify-center text-ink shadow-sm">
                <NivaroLogo className="w-5 h-5" />
              </div>
              <h1 className="text-lg font-black text-ink font-display tracking-tight">NIVARO</h1>
            </div>
            <p className="text-xs text-marigold font-bold italic">
              "Find your room. Find your perfect roommate."
            </p>
            <p className="text-[11px] text-ink-soft/85 font-medium leading-relaxed max-w-sm">
              Nivaro helps students find trusted rooms, compatible roommates, and student communities — all in one place.
            </p>
          </div>

          {/* Column 2: Explore */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-black text-ink uppercase tracking-wider">Explore</h4>
            <ul className="space-y-2 text-xs font-bold text-ink-soft">
              <li>
                <Link to="/rooms" className="hover:text-marigold transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-marigold rounded px-1 -mx-1 block w-fit">
                  Find Rooms
                </Link>
              </li>
              <li>
                <Link to="/roommates" className="hover:text-marigold transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-marigold rounded px-1 -mx-1 block w-fit">
                  Find Roommates
                </Link>
              </li>
              <li>
                <Link to="/communities" className="hover:text-marigold transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-marigold rounded px-1 -mx-1 block w-fit">
                  Student Communities
                </Link>
              </li>
              <li>
                <Link to="/relocation" className="hover:text-marigold transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-marigold rounded px-1 -mx-1 block w-fit">
                  Move-In Journey
                </Link>
              </li>
              <li>
                <Link to="/rooms#saved" className="hover:text-marigold transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-marigold rounded px-1 -mx-1 block w-fit">
                  Saved Rooms
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Support */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-black text-ink uppercase tracking-wider">Support</h4>
            <ul className="space-y-2 text-xs font-bold text-ink-soft">
              <li>
                <button 
                  onClick={() => setActiveModal('faq')}
                  className="hover:text-marigold transition-all duration-150 text-left focus:outline-none focus:ring-1 focus:ring-marigold rounded px-1 -mx-1 block w-fit"
                >
                  Help Center
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveModal('support')}
                  className="hover:text-marigold transition-all duration-150 text-left focus:outline-none focus:ring-1 focus:ring-marigold rounded px-1 -mx-1 block w-fit"
                >
                  Contact Us
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveModal('bug')}
                  className="hover:text-marigold transition-all duration-150 text-left focus:outline-none focus:ring-1 focus:ring-marigold rounded px-1 -mx-1 block w-fit"
                >
                  Report an Issue
                </button>
              </li>
              <li>
                <Link to="/verify" className="hover:text-marigold transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-marigold rounded px-1 -mx-1 block w-fit">
                  Safety & Verification
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-black text-ink uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2 text-xs font-bold text-ink-soft">
              <li>
                <a href="#privacy" className="hover:text-marigold transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-marigold rounded px-1 -mx-1 block w-fit">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#terms" className="hover:text-marigold transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-marigold rounded px-1 -mx-1 block w-fit">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#community-guidelines" className="hover:text-marigold transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-marigold rounded px-1 -mx-1 block w-fit">
                  Community Guidelines
                </a>
              </li>
              <li>
                <a href="#safety-guidelines" className="hover:text-marigold transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-marigold rounded px-1 -mx-1 block w-fit">
                  Safety Guidelines
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright bar */}
        <div className="border-t border-ink/5 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-bold text-ink-soft/70">
          <div>
            © 2026 Nivaro. All rights reserved.
          </div>
          <div className="flex items-center gap-1.5 justify-center">
            Built for students, by students. <span className="text-[10px] text-ink-soft/45 font-mono">v1.2.0</span>
          </div>
        </div>

      </div>

      {/* SUPPORT MODAL (Contact & Bug Report & FAQs) */}
      {activeModal === 'support' && (
        <SupportModal onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'bug' && (
        <BugReportModal onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'faq' && (
        <FaqModal onClose={() => setActiveModal(null)} />
      )}
    </footer>
  );
};

export default Footer;

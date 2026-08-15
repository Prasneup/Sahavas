import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bug, X, ChevronDown, ChevronUp, CheckCircle, Send } from 'lucide-react';
import { NivaroLogo } from './NivaroLogo';

type ModalType = 'support' | 'faq' | 'bug' | null;

const Footer: React.FC = () => {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Form states
  const [supportForm, setSupportForm] = useState({ email: '', subject: '', message: '' });
  const [bugForm, setBugForm] = useState({ title: '', steps: '', severity: 'Low' });

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setActiveModal(null);
      setSupportForm({ email: '', subject: '', message: '' });
    }, 2000);
  };

  const handleBugSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setActiveModal(null);
      setBugForm({ title: '', steps: '', severity: 'Low' });
    }, 2000);
  };

  const faqs = [
    {
      q: "How does roommate compatibility matching work?",
      a: "Nivaro uses Gower's similarity coefficient algorithm to compare your lifestyle choices (sleep schedule, cleaning habits, guest policies) against other students. We also check for dealbreakers to ensure you only match with compatible roommates."
    },
    {
      q: "Are the room listings verified?",
      a: "Yes. Listings marked with a green verification badge have been physically audited or checked by the Nivaro team to ensure address, pricing, and amenities are accurate."
    },
    {
      q: "Is the Nivaro platform free to use?",
      a: "Absolutely! Nivaro is built for Nepalese students to find roommate matches and affordable housing completely free of broker fees or platform charges."
    },
    {
      q: "How can I contact a host or prospective roommate?",
      a: "You can send them a direct message using our built-in real-time inbox. Simply navigate to their room listing or roommate profile and click 'Message'."
    }
  ];

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
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-fade-in">
          <div 
            className="w-full max-w-lg bg-white border border-ink/10 rounded-3xl shadow-xl overflow-hidden animate-slide-up"
            role="dialog"
            aria-modal="true"
          >
            
            {/* Modal Header */}
            <div className="border-b border-ink/5 px-6 py-4 flex justify-between items-center bg-[#FAF6EC]">
              <h3 className="font-bold text-base text-ink font-display">
                {activeModal === 'support' && '📞 Contact Support & Feedback'}
                {activeModal === 'bug' && '🐞 Report a System Bug'}
                {activeModal === 'faq' && '📚 Frequently Asked Questions'}
              </h3>
              <button 
                onClick={() => { setActiveModal(null); setSubmitted(false); }}
                className="w-8 h-8 rounded-full hover:bg-clay/20 flex items-center justify-center text-ink-soft transition"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {submitted ? (
                <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-pine/10 flex items-center justify-center text-pine">
                    <CheckCircle size={28} className="stroke-[2.5]" />
                  </div>
                  <h4 className="font-bold text-ink text-sm">Submission Successful</h4>
                  <p className="text-xs text-ink-soft/75 leading-relaxed font-semibold">
                    Thank you for helping us improve Nivaro. Our team has received your report.
                  </p>
                </div>
              ) : (
                <>
                  {/* SUPPORT FORM */}
                  {activeModal === 'support' && (
                    <form onSubmit={handleSupportSubmit} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-ink-soft block">Your Email Address</label>
                        <input 
                          type="email" 
                          required 
                          placeholder="student@example.edu"
                          className="w-full bg-[#FAF6EC] border border-ink/10 rounded-xl px-4 py-2.5 text-xs text-ink font-semibold focus:outline-none focus:border-marigold focus:ring-1 focus:ring-marigold transition"
                          value={supportForm.email}
                          onChange={e => setSupportForm({ ...supportForm, email: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-ink-soft block">Subject</label>
                        <input 
                          type="text" 
                          required 
                          placeholder="What do you need help with?"
                          className="w-full bg-[#FAF6EC] border border-ink/10 rounded-xl px-4 py-2.5 text-xs text-ink font-semibold focus:outline-none focus:border-marigold focus:ring-1 focus:ring-marigold transition"
                          value={supportForm.subject}
                          onChange={e => setSupportForm({ ...supportForm, subject: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-ink-soft block">Message</label>
                        <textarea 
                          rows={4} 
                          required 
                          placeholder="Describe your issue or share your feedback..."
                          className="w-full bg-[#FAF6EC] border border-ink/10 rounded-xl px-4 py-2.5 text-xs text-ink font-semibold focus:outline-none focus:border-marigold focus:ring-1 focus:ring-marigold transition resize-none"
                          value={supportForm.message}
                          onChange={e => setSupportForm({ ...supportForm, message: e.target.value })}
                        />
                      </div>
                      <button 
                        type="submit"
                        className="w-full bg-marigold hover:bg-marigold-dark text-white font-black py-3 rounded-xl text-xs uppercase tracking-wider transition shadow-sm flex items-center justify-center gap-2 mt-2"
                      >
                        <Send size={14} /> Send Message
                      </button>
                    </form>
                  )}

                  {/* BUG REPORT FORM */}
                  {activeModal === 'bug' && (
                    <form onSubmit={handleBugSubmit} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-ink-soft block">Bug Summary</label>
                        <input 
                          type="text" 
                          required 
                          placeholder="e.g., Compatibility score displays NaN"
                          className="w-full bg-[#FAF6EC] border border-ink/10 rounded-xl px-4 py-2.5 text-xs text-ink font-semibold focus:outline-none focus:border-marigold focus:ring-1 focus:ring-marigold transition"
                          value={bugForm.title}
                          onChange={e => setBugForm({ ...bugForm, title: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-ink-soft block">Severity Level</label>
                        <select 
                          className="w-full bg-[#FAF6EC] border border-ink/10 rounded-xl px-4 py-2.5 text-xs text-ink font-semibold focus:outline-none focus:border-marigold focus:ring-1 focus:ring-marigold transition"
                          value={bugForm.severity}
                          onChange={e => setBugForm({ ...bugForm, severity: e.target.value })}
                        >
                          <option>Low - minor visual issue</option>
                          <option>Medium - feature works but is buggy</option>
                          <option>High - blocker prevents me from using features</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-ink-soft block">Steps to Reproduce</label>
                        <textarea 
                          rows={4} 
                          required 
                          placeholder="1. Go to Roommate Compatibility Quiz&#10;2. Submit responses&#10;3. See score crash"
                          className="w-full bg-[#FAF6EC] border border-ink/10 rounded-xl px-4 py-2.5 text-xs text-ink font-semibold focus:outline-none focus:border-marigold focus:ring-1 focus:ring-marigold transition resize-none"
                          value={bugForm.steps}
                          onChange={e => setBugForm({ ...bugForm, steps: e.target.value })}
                        />
                      </div>
                      <button 
                        type="submit"
                        className="w-full bg-marigold hover:bg-marigold-dark text-white font-black py-3 rounded-xl text-xs uppercase tracking-wider transition shadow-sm flex items-center justify-center gap-2 mt-2"
                      >
                        <Bug size={14} /> Submit Bug Report
                      </button>
                    </form>
                  )}

                  {/* FAQ ACCORDIONS */}
                  {activeModal === 'faq' && (
                    <div className="space-y-3">
                      {faqs.map((faq, idx) => (
                        <div key={idx} className="border border-ink/5 rounded-xl overflow-hidden bg-[#FAF6EC]">
                          <button 
                            onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                            className="w-full px-4 py-3 flex justify-between items-center text-left hover:bg-[#FAF3E8] transition duration-200"
                          >
                            <span className="font-bold text-xs text-ink">{faq.q}</span>
                            {openFaq === idx ? <ChevronUp size={16} className="text-marigold" /> : <ChevronDown size={16} className="text-ink-soft/75" />}
                          </button>
                          {openFaq === idx && (
                            <div className="px-4 pb-4 pt-1 text-xs text-ink-soft/85 font-medium leading-relaxed border-t border-ink/5 bg-white">
                              {faq.a}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;

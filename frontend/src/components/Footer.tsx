import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, BookOpen, MessageSquare, Bug, X, ChevronDown, ChevronUp, CheckCircle, Send } from 'lucide-react';

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
      <div className="max-w-6xl mx-auto px-6 space-y-12">
        
        {/* Brand Header */}
        <div className="text-center md:text-left border-b border-ink/5 pb-6">
          <h2 className="text-xl font-black text-ink font-display tracking-tight">Nivaro</h2>
          <p className="text-xs text-marigold font-bold mt-1">
            Find your room. Find your perfect roommate.
          </p>
        </div>

        {/* Section 1: Support Cards */}
        <div className="space-y-6">
          <div className="text-center md:text-left">
            <h3 className="text-lg font-bold text-ink font-display">Need Help?</h3>
            <p className="text-xs text-ink-soft/75 font-semibold mt-1">
              Have questions or need assistance? We are here to support your housing journey.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Contact Support */}
            <div 
              onClick={() => setActiveModal('support')}
              className="group p-5 bg-white border border-ink/10 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-marigold/10 flex items-center justify-center text-marigold group-hover:scale-110 transition-transform duration-300">
                  <Phone size={20} className="stroke-[2.5]" />
                </div>
                <h4 className="font-bold text-sm text-ink group-hover:text-marigold transition-colors duration-200">Contact Support</h4>
                <p className="text-xs text-ink-soft/80 leading-relaxed font-medium">
                  Get assistance from our dedicated support team.
                </p>
              </div>
              <div className="text-[10px] text-marigold font-black uppercase tracking-wider mt-4 group-hover:translate-x-1 transition-transform duration-200">
                Get Help &rarr;
              </div>
            </div>

            {/* FAQ */}
            <div 
              onClick={() => setActiveModal('faq')}
              className="group p-5 bg-white border border-ink/10 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-marigold/10 flex items-center justify-center text-marigold group-hover:scale-110 transition-transform duration-300">
                  <BookOpen size={20} className="stroke-[2.5]" />
                </div>
                <h4 className="font-bold text-sm text-ink group-hover:text-marigold transition-colors duration-200">FAQ</h4>
                <p className="text-xs text-ink-soft/80 leading-relaxed font-medium">
                  Find answers to common questions.
                </p>
              </div>
              <div className="text-[10px] text-marigold font-black uppercase tracking-wider mt-4 group-hover:translate-x-1 transition-transform duration-200">
                Browse FAQs &rarr;
              </div>
            </div>

            {/* Community Forum */}
            <Link 
              to="/communities"
              className="group p-5 bg-white border border-ink/10 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between text-left"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-marigold/10 flex items-center justify-center text-marigold group-hover:scale-110 transition-transform duration-300">
                  <MessageSquare size={20} className="stroke-[2.5]" />
                </div>
                <h4 className="font-bold text-sm text-ink group-hover:text-marigold transition-colors duration-200">Community Forum</h4>
                <p className="text-xs text-ink-soft/80 leading-relaxed font-medium">
                  Connect with fellow students and share experiences.
                </p>
              </div>
              <div className="text-[10px] text-marigold font-black uppercase tracking-wider mt-4 group-hover:translate-x-1 transition-transform duration-200">
                Join Forum &rarr;
              </div>
            </Link>

            {/* Report a Bug */}
            <div 
              onClick={() => setActiveModal('bug')}
              className="group p-5 bg-white border border-ink/10 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-marigold/10 flex items-center justify-center text-marigold group-hover:scale-110 transition-transform duration-300">
                  <Bug size={20} className="stroke-[2.5]" />
                </div>
                <h4 className="font-bold text-sm text-ink group-hover:text-marigold transition-colors duration-200">Report a Bug</h4>
                <p className="text-xs text-ink-soft/80 leading-relaxed font-medium">
                  Help us improve Nivaro by reporting issues.
                </p>
              </div>
              <div className="text-[10px] text-marigold font-black uppercase tracking-wider mt-4 group-hover:translate-x-1 transition-transform duration-200">
                File Report &rarr;
              </div>
            </div>

          </div>
        </div>

        {/* Section 2: Horizontal Navigation */}
        <div className="border-t border-ink/5 pt-8 flex justify-center">
          <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-xs font-bold text-ink-soft">
            <a href="#privacy" className="hover:text-marigold transition-colors duration-200 relative group py-1">
              Privacy
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-marigold scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left"></span>
            </a>
            <a href="#terms" className="hover:text-marigold transition-colors duration-200 relative group py-1">
              Terms
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-marigold scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left"></span>
            </a>
            <a 
              href="#help" 
              onClick={(e) => { e.preventDefault(); setActiveModal('faq'); }}
              className="hover:text-marigold transition-colors duration-200 relative group py-1"
            >
              Help
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-marigold scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left"></span>
            </a>
            <a 
              href="#contact" 
              onClick={(e) => { e.preventDefault(); setActiveModal('support'); }}
              className="hover:text-marigold transition-colors duration-200 relative group py-1"
            >
              Contact
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-marigold scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left"></span>
            </a>
            <a 
              href="#feedback" 
              onClick={(e) => { e.preventDefault(); setActiveModal('support'); }}
              className="hover:text-marigold transition-colors duration-200 relative group py-1"
            >
              Feedback
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-marigold scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left"></span>
            </a>
          </nav>
        </div>

        {/* Section 3: Bottom Footer */}
        <div className="border-t border-ink/5 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-semibold text-ink-soft/75">
          <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
            <span>&copy; 2026 Nivaro.</span>
            <span className="hidden sm:inline text-ink-soft/30">|</span>
            <span className="flex items-center gap-1.5 justify-center">
              Built for Students in Nepal <span aria-label="Nepal Flag">🇳🇵</span>
            </span>
          </div>
          <div className="bg-ink/5 px-2.5 py-1 rounded-full font-mono text-[10px] tracking-wider text-ink-soft/80">
            Version 1.2.0
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

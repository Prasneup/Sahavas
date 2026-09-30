import React, { useState } from 'react';
import { X, CheckCircle, Send } from 'lucide-react';

interface SupportModalProps {
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ onClose }) => {
  const [submitted, setSubmitted] = useState(false);
  const [supportForm, setSupportForm] = useState({ email: '', subject: '', message: '' });

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
      setSupportForm({ email: '', subject: '', message: '' });
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-lg bg-white border border-ink/10 rounded-3xl shadow-xl overflow-hidden animate-slide-up"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="border-b border-ink/5 px-6 py-4 flex justify-between items-center bg-[#FAF6EC]">
          <h3 className="font-bold text-base text-ink font-display">
            📞 Contact Support & Feedback
          </h3>
          <button 
            onClick={onClose}
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
        </div>
      </div>
    </div>
  );
};

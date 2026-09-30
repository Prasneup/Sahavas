import React, { useState } from 'react';
import { X, CheckCircle, Bug } from 'lucide-react';

interface BugReportModalProps {
  onClose: () => void;
}

export const BugReportModal: React.FC<BugReportModalProps> = ({ onClose }) => {
  const [submitted, setSubmitted] = useState(false);
  const [bugForm, setBugForm] = useState({ title: '', steps: '', severity: 'Low - minor visual issue' });

  const handleBugSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
      setBugForm({ title: '', steps: '', severity: 'Low - minor visual issue' });
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
            🐞 Report a System Bug
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
        </div>
      </div>
    </div>
  );
};

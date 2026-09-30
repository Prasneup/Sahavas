import React, { useState } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';

interface FaqModalProps {
  onClose: () => void;
}

export const FaqModal: React.FC<FaqModalProps> = ({ onClose }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-lg bg-white border border-ink/10 rounded-3xl shadow-xl overflow-hidden animate-slide-up"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="border-b border-ink/5 px-6 py-4 flex justify-between items-center bg-[#FAF6EC]">
          <h3 className="font-bold text-base text-ink font-display">
            📚 Frequently Asked Questions
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
        </div>
      </div>
    </div>
  );
};

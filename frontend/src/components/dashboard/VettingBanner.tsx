import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, AlertTriangle } from 'lucide-react';

interface VettingBannerProps {
  status: string;
  rejectionReason: string | null;
  onDismiss: () => void;
}

export const VettingBanner: React.FC<VettingBannerProps> = ({ status, rejectionReason, onDismiss }) => {
  const [dismissed, setDismissed] = useState(false);

  const handleDismiss = (key: string) => {
    localStorage.setItem(key, status);
    setDismissed(true);
    onDismiss();
  };

  if (dismissed) return null;

  if (status === 'VERIFIED' && localStorage.getItem('hide_verified_banner') !== 'VERIFIED') {
    return (
      <div className="bg-pine-light/80 border border-pine/20 text-pine rounded-2xl p-5 flex items-start justify-between shadow-sm relative w-full">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-paper flex items-center justify-center text-pine shadow-sm flex-shrink-0">
            <CheckCircle size={20} className="stroke-[2.5]" />
          </div>
          <div>
            <h4 className="text-sm font-black font-display text-pine-dark">Your document has been approved!</h4>
            <p className="text-xs opacity-95 mt-0.5 font-semibold">Your identity verification has been successfully completed.</p>
          </div>
        </div>
        <button 
          onClick={() => handleDismiss('hide_verified_banner')}
          className="text-pine-dark/50 hover:text-pine-dark text-lg font-bold absolute top-3 right-4"
        >
          &times;
        </button>
      </div>
    );
  }

  if (status === 'REJECTED' && localStorage.getItem('hide_rejected_banner') !== 'REJECTED') {
    return (
      <div className="bg-rose-50 border border-brick/20 text-brick rounded-2xl p-5 flex items-start justify-between shadow-sm relative w-full">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-paper flex items-center justify-center text-brick shadow-sm flex-shrink-0">
            <AlertTriangle size={20} className="stroke-[2.5]" />
          </div>
          <div>
            <h4 className="text-sm font-black font-display">Your document verification was not approved.</h4>
            <p className="text-xs opacity-95 mt-0.5 font-semibold">Reason: {rejectionReason || 'No reason provided.'}</p>
            <Link to="/verify" className="text-xs font-black underline mt-2 block hover:opacity-80">
              Correct and Resubmit Document &rarr;
            </Link>
          </div>
        </div>
        <button 
          onClick={() => handleDismiss('hide_rejected_banner')}
          className="text-brick/50 hover:text-brick text-lg font-bold absolute top-3 right-4"
        >
          &times;
        </button>
      </div>
    );
  }

  return null;
};

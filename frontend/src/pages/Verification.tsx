import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, AlertTriangle, Upload, FileText, Lock, Loader2 } from 'lucide-react';

interface TrustData {
  trustScore: number;
  verificationLevel: 'UNVERIFIED' | 'PHONE_VERIFIED' | 'STUDENT_VERIFIED' | 'COLLEGE_VERIFIED' | 'PREMIUM_VERIFIED';
  collegeRegistrationNumber?: string;
  documentImageUrl?: string;
  activeReportsCount: number;
}

const Verification: React.FC = () => {
  const [trust, setTrust] = useState<TrustData>({
    trustScore: 30,
    verificationLevel: 'PHONE_VERIFIED',
    activeReportsCount: 0
  });

  const [documentType, setDocumentType] = useState('STUDENT_ID');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    loadTrustData();
  }, []);

  const loadTrustData = async () => {
    try {
      const res = await api.get('/trust/me');
      setTrust(res.data);
      if (res.data.collegeRegistrationNumber) {
        setRegistrationNumber(res.data.collegeRegistrationNumber);
      }
      if (res.data.documentImageUrl) {
        setUploadedFile(res.data.documentImageUrl);
      }
    } catch (err) {
      console.warn("API trust details failed, using mock profile state");
      // Keep mock initial state
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const res = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data?.url) {
        setUploadedFile(res.data.url);
      }
    } catch (err) {
      alert("Failed to upload scan file to Cloudinary.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registrationNumber.trim() || !uploadedFile) return;

    setSubmitting(true);

    const payload = {
      documentType,
      registrationNumber: registrationNumber.trim(),
      imageUrl: uploadedFile
    };

    try {
      const res = await api.post('/trust/verify', payload);
      setTrust(prev => ({
        ...prev,
        verificationLevel: res.data.newVerificationLevel,
        trustScore: res.data.newTrustScore
      }));
      alert("🎉 Verification submitted! Your document has been sent to administrators for vetting. Status is now PENDING VERIFICATION.");
    } catch (err) {
      alert("Failed to submit verification request. Please verify inputs or permissions.");
    } finally {
      setSubmitting(false);
    }
  };

  const getTierDetails = (level: string) => {
    switch (level) {
      case 'PREMIUM_VERIFIED':
        return { name: 'Premium Verified', color: 'text-pine bg-pine-light border-pine/20', score: 100 };
      case 'COLLEGE_VERIFIED':
        return { name: 'College Verified', color: 'text-marigold bg-[#FAF3E8] border-marigold/20', score: 85 };
      case 'STUDENT_VERIFIED':
        return { name: 'Student Verified', color: 'text-pine bg-pine-light border-pine/20', score: 60 };
      case 'PHONE_VERIFIED':
        return { name: 'Phone Verified', color: 'text-ink-soft bg-paper border-ink/10', score: 30 };
      case 'UNVERIFIED':
      default:
        return { name: 'Unverified Account', color: 'text-brick bg-rose-50 border-brick/20', score: 10 };
    }
  };

  const tier = getTierDetails(trust.verificationLevel);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-clay text-marigold">
        <span className="animate-pulse font-bold text-sm">Opening Security Center...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-clay text-ink flex flex-col items-center pb-24 font-sans select-none overflow-x-hidden">
      
      {/* Header Bar */}
      <header className="w-full bg-paper border-b border-ink/5 px-6 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm w-full max-w-md mx-auto">
        <button 
          onClick={() => navigate('/dashboard')} 
          className="w-9 h-9 rounded-full bg-paper border border-ink/10 flex items-center justify-center shadow-sm"
        >
          <ArrowLeft size={18} className="text-ink-soft" />
        </button>
        <h2 className="text-ink-soft text-xs font-bold uppercase tracking-wider font-display">Trust & Vetting</h2>
        <div className="w-9" />
      </header>

      <div className="w-full max-w-md px-6 pt-6 flex-1 flex flex-col justify-start space-y-6">
        
        {/* Title */}
        <div>
          <h1 className="text-2xl font-black text-ink tracking-tight font-display">Trust Center</h1>
          <p className="text-xs text-ink-soft mt-1 font-semibold leading-relaxed">
            Manage your credentials, upload academic IDs, and monitor trust metrics.
          </p>
        </div>

        {/* Dynamic Verification Tier Medallion Shield */}
        <div className={`border rounded-[16px] p-5 flex items-center gap-4 ${tier.color} shadow-sm`}>
          <div className="w-12 h-12 rounded-full bg-paper flex items-center justify-center shadow-sm flex-shrink-0 text-marigold">
            <Shield size={24} className="stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[9px] font-black uppercase tracking-wider text-ink-soft">Vetting Tier Status</span>
            <h3 className="text-base font-black font-display">{tier.name}</h3>
            <p className="text-[10px] opacity-80 mt-0.5 font-medium font-mono">Unlocked at {tier.score}% base trust score</p>
          </div>
        </div>

        {/* Trust Score circular meter block */}
        <div className="bg-paper border border-ink/5 rounded-[16px] p-6 shadow-sm flex flex-col items-center">
          <span className="text-[10px] font-black text-ink-soft uppercase tracking-wider block mb-4">Your Trust Index</span>

          {/* Radial Score Gauge */}
          <div className="relative w-36 h-36 flex items-center justify-center mb-4">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle 
                cx="50" 
                cy="50" 
                r="40" 
                stroke="var(--ink)" 
                strokeWidth="8" 
                fill="transparent" 
                className="opacity-[0.08]"
              />
              <circle 
                cx="50" 
                cy="50" 
                r="40" 
                stroke="var(--marigold)" 
                strokeWidth="8" 
                fill="transparent" 
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * trust.trustScore) / 100}
                className="transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-ink leading-none font-mono">{trust.trustScore}%</span>
              <span className="text-[9px] font-black text-ink-soft uppercase tracking-widest mt-1">Trust Score</span>
            </div>
          </div>

          {/* Trust Score Breakdown details */}
          <div className="w-full space-y-2 border-t border-ink/5 pt-4 text-xs font-semibold text-ink-soft font-mono">
            <div className="flex justify-between items-center">
              <span className="font-sans">Verification Level Base</span>
              <span className="text-ink font-bold">+{tier.score} pts</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-sans">Verified Identity bonus</span>
              <span className="text-ink font-bold">
                +{trust.verificationLevel !== 'UNVERIFIED' && trust.verificationLevel !== 'PHONE_VERIFIED' ? 10 : 0} pts
              </span>
            </div>
            {trust.activeReportsCount > 0 && (
              <div className="flex justify-between items-center text-brick">
                <span className="font-sans">Active Harassment Reports Penalty</span>
                <span className="font-bold">-{trust.activeReportsCount * 20} pts</span>
              </div>
            )}
          </div>
        </div>

        {/* Verification Upload Vetting Form */}
        <div className="bg-paper border border-ink/5 rounded-[16px] p-6 shadow-sm">
          <h3 className="text-sm font-black text-ink font-display mb-4 flex items-center gap-1.5">
            <Lock size={16} className="text-marigold" /> Submit Credentials ID
          </h3>

          <form onSubmit={handleSubmitVerification} className="space-y-4">
            
            {/* Document Select */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-ink">Document Type</label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-3 focus:outline-none focus:border-marigold text-xs font-bold"
              >
                <option value="STUDENT_ID">College Student ID Card</option>
                <option value="CITIZENSHIP">Citizenship Card (Nagariukta)</option>
                <option value="ADMISSION_RECEIPT">Official Admission Receipt</option>
              </select>
            </div>

            {/* Registration Input */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-ink">Registration / Roll Number</label>
              <input
                type="text"
                required
                placeholder="e.g. PUL077BCT045 or Citizenship No."
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-3 focus:outline-none focus:border-marigold text-xs font-semibold"
              />
            </div>

            {/* Upload Box Dropzone */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-ink">Scan / Photo upload</label>
              
              {uploadedFile ? (
                <div className="border border-ink/10 rounded-xl p-3 flex items-center justify-between bg-[#FAF8F5]">
                  <div className="flex items-center gap-2 text-xs font-bold text-ink-soft">
                    <FileText size={16} className="text-marigold" />
                    <span className="truncate max-w-[180px]">document_scan_preview.jpg</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setUploadedFile(null)}
                    className="text-xs font-black text-rose-500 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              ) : (
                <label 
                  className="border-2 border-dashed border-ink/10 hover:border-marigold/30 rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center bg-[#FAF8F5] text-ink-soft"
                >
                  {uploading ? (
                    <Loader2 size={24} className="text-marigold animate-spin mb-2" />
                  ) : (
                    <Upload size={24} className="text-ink-soft/40 mb-2" />
                  )}
                  <span className="text-xs font-bold">{uploading ? 'Uploading document...' : 'Select scan file to upload'}</span>
                  <span className="text-[10px] text-ink-soft/40 mt-0.5">Supports PNG, JPG (Max 5MB)</span>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Submit Vetting details */}
            <button
              type="submit"
              disabled={submitting || !registrationNumber.trim() || !uploadedFile}
              className="w-full bg-marigold hover:bg-marigold-dark text-paper font-black py-4 rounded-xl shadow-md transition disabled:opacity-50 text-xs tracking-wider uppercase"
            >
              {submitting ? 'Authenticating and calculating score...' : 'Submit Verification'}
            </button>

          </form>
        </div>

        {/* Nepal Specific Anti-Scam Safeguards Info Section */}
        <div className="bg-orange-50 border border-orange-500/10 rounded-[16px] p-5 space-y-3">
          <h4 className="text-xs font-black text-orange-700 flex items-center gap-1.5 font-display">
            <AlertTriangle size={15} /> Anti-Scam Protection active
          </h4>
          <p className="text-[11px] text-ink-soft leading-relaxed font-semibold">
            Nivaro runs automated checks on listings:
          </p>
          <ul className="list-disc pl-4 space-y-1.5 text-[10px] text-ink-soft font-medium leading-relaxed">
            <li><span className="font-bold text-ink">Rent Outliers:</span> Rent listings posted below normal district levels are flagged to prevent advance deposit scams.</li>
            <li><span className="font-bold text-ink">Carrier OTP checks:</span> Verification numbers are verified against domestic Ncell/NTC carrier registers.</li>
          </ul>
        </div>

      </div>

    </div>
  );
};

export default Verification;

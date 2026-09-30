import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, CheckCircle, AlertTriangle, Users, Home, TrendingUp, FileText, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  VerificationRequest, 
  ListingItem, 
  TrustReportItem, 
  AuditLogItem, 
  AnalyticsStats, 
  UserItem 
} from '../types/admin';
import { adminService } from '../services/adminService';

// Extracted sub-components
import { AdminOverview } from '../components/admin/AdminOverview';
import { AdminVerifications } from '../components/admin/AdminVerifications';
import { AdminListings } from '../components/admin/AdminListings';
import { AdminReports } from '../components/admin/AdminReports';
import { AdminAuditLogs } from '../components/admin/AdminAuditLogs';
import { AdminUsers } from '../components/admin/AdminUsers';

const AdminPortal: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'VERIFICATIONS' | 'LISTINGS' | 'REPORTS' | 'AUDIT_LOGS' | 'USERS'>('OVERVIEW');
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [reports, setReports] = useState<TrustReportItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [stats, setStats] = useState<AnalyticsStats>({
    totalUsers: 0,
    verifiedUsers: 0,
    totalListings: 0,
    activeReports: 0,
    suspiciousListings: 0
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verification Review Modal State
  const [selectedVerification, setSelectedVerification] = useState<VerificationRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  
  // Listing Review Modal State
  const [selectedListing, setSelectedListing] = useState<ListingItem | null>(null);
  const [listingReviewReason, setListingReviewReason] = useState('');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'OVERVIEW') {
        const data = await adminService.getAnalytics();
        if (data) setStats(data);
      } else if (activeTab === 'VERIFICATIONS') {
        const data = await adminService.getVerifications();
        setVerifications(data || []);
      } else if (activeTab === 'LISTINGS') {
        const data = await adminService.getListings();
        setListings(data || []);
      } else if (activeTab === 'REPORTS') {
        const data = await adminService.getReports();
        setReports(data || []);
      } else if (activeTab === 'AUDIT_LOGS') {
        const data = await adminService.getAuditLogs();
        setAuditLogs(data || []);
      } else if (activeTab === 'USERS') {
        const data = await adminService.getUsers();
        setUsers(data || []);
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to retrieve administrator modules. Please verify permissions.');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewVerification = async (status: 'APPROVED' | 'REJECTED' | 'CORRECTION_REQUIRED' | 'SUSPENDED') => {
    if (!selectedVerification) return;
    
    if ((status === 'REJECTED' || status === 'CORRECTION_REQUIRED') && !rejectionReason.trim()) {
      alert(`An explanation reason is required to reject or request corrections.`);
      return;
    }

    try {
      await adminService.reviewVerification(selectedVerification.id, status, rejectionReason);
      alert(`User verification status marked as ${status} successfully.`);
      setSelectedVerification(null);
      setRejectionReason('');
      loadData();
    } catch (err) {
      alert('Failed to submit verification review.');
    }
  };

  const handleReviewListing = async (status: 'APPROVED' | 'REJECTED' | 'CORRECTION_REQUIRED' | 'SUSPENDED') => {
    if (!selectedListing) return;
    
    if ((status === 'REJECTED' || status === 'CORRECTION_REQUIRED') && !listingReviewReason.trim()) {
      alert(`An explanation reason is required to reject or request corrections.`);
      return;
    }

    try {
      await adminService.reviewListing(selectedListing.id, status, listingReviewReason);
      alert(`Listing verification status marked as ${status} successfully.`);
      setSelectedListing(null);
      setListingReviewReason('');
      loadData();
    } catch (err) {
      alert('Failed to update listing verification status.');
    }
  };

  const handleResolveReport = async (id: string) => {
    try {
      await adminService.resolveReport(id);
      alert('Report marked as resolved successfully.');
      loadData();
    } catch (err) {
      alert('Failed to resolve report.');
    }
  };

  const handleManualUserStatus = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus.toUpperCase() === 'SUSPENDED' ? 'VERIFIED' : 'SUSPENDED';
    try {
      await adminService.updateUserStatus(userId, nextStatus);
      alert(`User status updated to ${nextStatus.toLowerCase()}.`);
      loadData();
    } catch (err) {
      alert('Failed to update user status.');
    }
  };

  return (
    <div className="min-h-screen bg-clay text-ink flex flex-col font-sans">
      
      {/* Header bar */}
      <header className="border-b border-ink/5 bg-paper sticky top-0 z-30 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="w-9 h-9 rounded-full bg-paper border border-ink/10 flex items-center justify-center shadow-sm hover:bg-[#FAF3E8] transition"
          >
            <ArrowLeft size={18} className="text-ink-soft" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="text-marigold" size={20} />
            <h1 className="text-lg font-black text-ink font-display">Administrator Portal</h1>
          </div>
        </div>

        <button 
          onClick={logout}
          className="bg-paper hover:bg-[#FAF3E8] border border-ink/10 text-ink text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition"
        >
          Logout
        </button>
      </header>

      {/* Admin Modules Navigation */}
      <nav className="flex flex-wrap gap-2 px-6 py-3 border-b border-ink/5 bg-paper/50">
        {[
          { key: 'OVERVIEW', label: 'Overview', icon: TrendingUp },
          { key: 'VERIFICATIONS', label: 'Verifications Queue', icon: CheckCircle },
          { key: 'LISTINGS', label: 'Listings Moderation', icon: Home },
          { key: 'REPORTS', label: 'Fraud Reports', icon: AlertTriangle },
          { key: 'AUDIT_LOGS', label: 'Admin Audit Logs', icon: FileText },
          { key: 'USERS', label: 'User Accounts', icon: Users },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm ${
                isActive 
                  ? 'bg-marigold text-paper' 
                  : 'bg-paper hover:bg-[#FAF3E8] border border-ink/10 text-ink-soft'
              }`}
            >
              <Icon size={14} /> {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Main Content Space */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold p-4 rounded-xl mb-6 shadow-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 font-bold animate-pulse text-ink-soft">
            Retrieving administrator context metrics...
          </div>
        ) : (
          <>
            {activeTab === 'OVERVIEW' && <AdminOverview stats={stats} />}
            {activeTab === 'VERIFICATIONS' && (
              <AdminVerifications verifications={verifications} onReview={setSelectedVerification} />
            )}
            {activeTab === 'LISTINGS' && (
              <AdminListings listings={listings} onModerate={setSelectedListing} />
            )}
            {activeTab === 'REPORTS' && (
              <AdminReports reports={reports} onResolve={handleResolveReport} />
            )}
            {activeTab === 'AUDIT_LOGS' && <AdminAuditLogs auditLogs={auditLogs} />}
            {activeTab === 'USERS' && (
              <AdminUsers users={users} onChangeStatus={handleManualUserStatus} />
            )}
          </>
        )}
      </main>

      {/* ------------------------------------------------------------- */}
      {/* VERIFICATION DETAILED MODAL SCREEN */}
      {/* ------------------------------------------------------------- */}
      {selectedVerification && (
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm flex items-center justify-center p-6 z-50 overflow-y-auto">
          <div className="bg-paper border border-ink/10 rounded-[32px] p-6 max-w-2xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center border-b border-ink/5 pb-3">
              <h3 className="text-base font-black text-ink font-display flex items-center gap-1.5">
                <Shield className="text-marigold" size={18} /> Credentials Vetting Panel
              </h3>
              <button 
                onClick={() => { setSelectedVerification(null); setRejectionReason(''); }}
                className="text-ink-soft hover:text-ink font-bold text-xs"
              >
                ✕ Close
              </button>
            </div>

            {/* Profile Info Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              <div className="space-y-3 bg-[#FAF8F5] p-4 border border-ink/5 rounded-2xl">
                <h4 className="text-[10px] font-black uppercase text-marigold-dark tracking-wider">Submitted Personal Information</h4>
                <div className="space-y-2">
                  <div><span className="text-ink-soft">Registered Name:</span> <strong className="text-ink text-sm block">{selectedVerification.fullName}</strong></div>
                  <div><span className="text-ink-soft">Verification Role:</span> <strong className="text-ink block uppercase text-[10px]">{selectedVerification.role}</strong></div>
                  <div><span className="text-ink-soft">College / Organization:</span> <strong className="text-ink block">{selectedVerification.collegeName}</strong></div>
                  <div><span className="text-ink-soft">Phone Contact:</span> <strong className="text-ink block font-mono">{selectedVerification.phoneNumber}</strong></div>
                  <div><span className="text-ink-soft">Email Contact:</span> <strong className="text-ink block font-mono">{selectedVerification.email}</strong></div>
                </div>
              </div>

              {/* OCR Automated Comparisons */}
              <div className="space-y-3 bg-[#FAF8F5] p-4 border border-ink/5 rounded-2xl flex flex-col justify-between">
                <div>
                  <h4 className="text-[10px] font-black uppercase text-marigold-dark tracking-wider mb-2">Automated OCR Document Comparison</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-ink-soft">OCR Extracted Name:</span> 
                      <strong className="text-ink block">{selectedVerification.ocrName || 'Null / Unreadable'}</strong>
                    </div>
                    
                    {/* Comparison Indicator */}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-ink-soft">Name Match:</span>
                      {selectedVerification.ocrSimilarity === 'MATCH' ? (
                        <span className="inline-flex items-center gap-0.5 bg-pine-light text-pine px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">
                          <Check size={10} /> Match
                        </span>
                      ) : selectedVerification.ocrSimilarity === 'MISMATCH' ? (
                        <span className="inline-flex items-center gap-0.5 bg-rose-50 text-rose-600 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">
                          <X size={10} /> Mismatch
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 bg-marigold/10 text-marigold-dark px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">
                          <AlertTriangle size={10} /> Missing / Needs Review
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-500/10 p-2.5 rounded-xl text-[10px] text-orange-700 leading-relaxed font-semibold">
                  ⚠️ Simulated OCR name checks are automated comparisons. Admin must verify details manually before approval.
                </div>
              </div>
            </div>

            {/* Document Image Preview */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-ink">Uploaded Scanning Document</label>
              <div className="border border-ink/10 rounded-2xl overflow-hidden h-64 bg-clay relative flex items-center justify-center">
                {selectedVerification.documentImageUrl ? (
                  <img 
                    src={selectedVerification.documentImageUrl} 
                    alt="Identity Scan Preview" 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-xs font-bold text-ink-soft">No scanned image uploaded.</span>
                )}
              </div>
            </div>

            {/* Rejection / Correction Text Input */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-ink">Review Comments / Reason (Required for rejection or correction request)</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Write specific feedback, e.g., 'Citizenship document is unclear', 'Submitted name does not match the document', etc."
                className="w-full bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-3 focus:outline-none focus:border-marigold text-xs font-semibold h-20 resize-none"
              />
            </div>

            {/* Action Buttons Panel */}
            <div className="flex flex-wrap gap-2 justify-end border-t border-ink/5 pt-4">
              <button
                onClick={() => handleReviewVerification('APPROVED')}
                className="bg-pine text-paper font-black px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider hover:bg-pine/90 transition shadow-sm"
              >
                Approve Vetting
              </button>
              
              <button
                onClick={() => handleReviewVerification('CORRECTION_REQUIRED')}
                className="bg-marigold text-paper font-black px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider hover:bg-marigold-dark transition shadow-sm"
              >
                Request Correction
              </button>

              <button
                onClick={() => handleReviewVerification('REJECTED')}
                className="bg-rose-500 text-paper font-black px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider hover:bg-rose-600 transition shadow-sm"
              >
                Reject Vetting
              </button>

              <button
                onClick={() => handleReviewVerification('SUSPENDED')}
                className="bg-ink text-paper font-black px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider hover:bg-ink-soft transition shadow-sm"
              >
                Suspend Account
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* LISTING MODERATION MODAL */}
      {/* ------------------------------------------------------------- */}
      {selectedListing && (
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm flex items-center justify-center p-6 z-50 overflow-y-auto">
          <div className="bg-paper border border-ink/10 rounded-[32px] p-6 max-w-2xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center border-b border-ink/5 pb-3">
              <h3 className="text-base font-black text-ink font-display flex items-center gap-1.5">
                <Home className="text-marigold" size={18} /> Room Listing Moderation Panel
              </h3>
              <button 
                onClick={() => { setSelectedListing(null); setListingReviewReason(''); }}
                className="text-ink-soft hover:text-ink font-bold text-xs"
              >
                ✕ Close
              </button>
            </div>

            {/* Listing Details */}
            <div className="bg-[#FAF8F5] p-4 border border-ink/5 rounded-2xl text-xs space-y-3">
              <div><span className="text-ink-soft">Room Title:</span> <strong className="text-ink text-sm block">{selectedListing.title}</strong></div>
              <div><span className="text-ink-soft">Room Rent:</span> <strong className="text-pine font-mono text-sm block">NPR {selectedListing.rentAmount} / mo (Deposit: NPR {selectedListing.depositAmount})</strong></div>
              <div><span className="text-ink-soft">Description:</span> <p className="text-ink leading-relaxed mt-1 font-semibold">{selectedListing.description}</p></div>
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-ink-soft">Room Type:</span> <strong className="text-ink block uppercase text-[10px]">{selectedListing.roomType.replace('_', ' ')}</strong></div>
                <div><span className="text-ink-soft">Distance:</span> <strong className="text-ink block">{selectedListing.distanceFromCollegeText || 'Near Campus'}</strong></div>
              </div>
            </div>

            {/* Image Preview */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-ink">Room Scanned/Uploaded Images</label>
              <div className="grid grid-cols-3 gap-2">
                {selectedListing.images && selectedListing.images.length > 0 ? (
                  Array.from(new Map(selectedListing.images.map((img: any) => [img.imageUrl, img])).values()).map((img: any, idx: number) => (
                    <div key={idx} className="h-28 rounded-xl overflow-hidden bg-clay border border-ink/5">
                      <img src={img.imageUrl} alt="Room scan" className="w-full h-full object-cover" />
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 py-6 bg-[#FAF8F5] text-center text-xs font-bold text-ink-soft">
                    No uploaded images from Landlord.
                  </div>
                )}
              </div>
            </div>

            {/* Rejection / Correction Text Input */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-ink">Listing Moderation Notes (Required for rejection or correction request)</label>
              <textarea
                value={listingReviewReason}
                onChange={(e) => setListingReviewReason(e.target.value)}
                placeholder="e.g. 'Rent is set too high for single rooms', 'Location details are incomplete', 'Please add clear room images.'"
                className="w-full bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-3 focus:outline-none focus:border-marigold text-xs font-semibold h-20 resize-none"
              />
            </div>

            {/* Action Buttons Panel */}
            <div className="flex flex-wrap gap-2 justify-end border-t border-ink/5 pt-4">
              <button
                onClick={() => handleReviewListing('APPROVED')}
                className="bg-pine text-paper font-black px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider hover:bg-pine/90 transition shadow-sm"
              >
                Approve & Go Live
              </button>
              
              <button
                onClick={() => handleReviewListing('CORRECTION_REQUIRED')}
                className="bg-marigold text-paper font-black px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider hover:bg-marigold-dark transition shadow-sm"
              >
                Request Correction
              </button>

              <button
                onClick={() => handleReviewListing('REJECTED')}
                className="bg-rose-500 text-paper font-black px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider hover:bg-rose-600 transition shadow-sm"
              >
                Reject Listing
              </button>

              <button
                onClick={() => handleReviewListing('SUSPENDED')}
                className="bg-ink text-paper font-black px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider hover:bg-ink-soft transition shadow-sm"
              >
                Suspend Listing
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPortal;

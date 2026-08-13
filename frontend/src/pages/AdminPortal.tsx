import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, CheckCircle, AlertTriangle, Users, Home, TrendingUp, FileText, Check, X } from 'lucide-react';
import api from '../services/api';

interface VerificationRequest {
  id: string;
  userId: string;
  fullName: string;
  role: string;
  phoneNumber: string;
  email: string;
  collegeName: string;
  collegeRegistrationNumber: string;
  documentType: string;
  registrationNumber: string;
  documentImageUrl: string;
  status: string;
  ocrName?: string;
  ocrSimilarity?: string;
  submittedAt: string;
}

interface ListingItem {
  id: string;
  title: string;
  description: string;
  rentAmount: number;
  depositAmount: number;
  roomType: string;
  genderPreference: string;
  distanceFromCollegeText: string;
  isVerified: boolean;
  isAvailable: boolean;
  verificationStatus: string;
  rejectionReason?: string;
  images?: any[];
  owner?: {
    id: string;
    phoneNumber: string;
    email: string;
  };
}

interface TrustReportItem {
  id: string;
  reporterId: string;
  reportedUserId: string;
  reason: string;
  description: string;
  status: string;
  createdAt: string;
}

interface AuditLogItem {
  id: string;
  adminId: string;
  adminName: string;
  affectedUserId?: string;
  affectedUserName?: string;
  affectedListingId?: string;
  affectedListingTitle?: string;
  action: string;
  reason?: string;
  previousStatus?: string;
  newStatus?: string;
  createdAt: string;
}

interface AnalyticsStats {
  totalUsers: number;
  verifiedUsers: number;
  totalListings: number;
  activeReports: number;
  suspiciousListings: number;
}

const AdminPortal: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'VERIFICATIONS' | 'LISTINGS' | 'REPORTS' | 'AUDIT_LOGS' | 'USERS'>('OVERVIEW');
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [reports, setReports] = useState<TrustReportItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [users, setUsers] = useState<any[]>([]);
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
        const res = await api.get('/admin/analytics');
        setStats(res.data);
      } else if (activeTab === 'VERIFICATIONS') {
        const res = await api.get('/admin/verifications');
        setVerifications(res.data || []);
      } else if (activeTab === 'LISTINGS') {
        const res = await api.get('/admin/listings');
        setListings(res.data || []);
      } else if (activeTab === 'REPORTS') {
        const res = await api.get('/admin/reports');
        setReports(res.data || []);
      } else if (activeTab === 'AUDIT_LOGS') {
        const res = await api.get('/admin/audit-logs');
        setAuditLogs(res.data || []);
      } else if (activeTab === 'USERS') {
        const res = await api.get('/admin/users');
        setUsers(res.data || []);
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
      await api.post(`/admin/verifications/${selectedVerification.id}/review`, { 
        status, 
        reason: rejectionReason 
      });
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
      await api.post(`/admin/listings/${selectedListing.id}/review`, { 
        status, 
        reason: listingReviewReason 
      });
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
      await api.post(`/admin/reports/${id}/resolve`);
      alert('Report marked as resolved successfully.');
      loadData();
    } catch (err) {
      alert('Failed to resolve report.');
    }
  };

  const handleManualUserStatus = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus.toUpperCase() === 'SUSPENDED' ? 'VERIFIED' : 'SUSPENDED';
    try {
      await api.post(`/admin/users/${userId}/status`, { status: nextStatus });
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
      </header>

      {/* Admin Modules Navigation */}
      <nav className="flex flex-wrap gap-2 px-6 py-3 border-b border-ink/5 bg-paper/50">
        {[
          { key: 'OVERVIEW', label: 'Overview', icon: TrendingUp },
          { key: 'VERIFICATIONS', label: 'Verifications Queue', icon: CheckCircle },
          { key: 'LISTINGS', label: 'Listings Moderation', icon: Home },
          { key: 'REPORTS', label: 'Fraud Reports', icon: AlertTriangle },
          { key: 'AUDIT_LOGS', label: 'Admin Audit Logs', icon: FileText },
          { key: 'USERS', label: 'User Accounts', icon: Users }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === tab.key 
                  ? 'bg-marigold text-paper shadow-sm' 
                  : 'hover:bg-ink/5 text-ink-soft'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Main Admin Workspace Container */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-6 space-y-6">
        
        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 rounded-xl p-4 text-xs font-bold">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 font-bold animate-pulse text-ink-soft">
            Retrieving administrator context metrics...
          </div>
        ) : (
          <>
            {/* OVERVIEW MODULE */}
            {activeTab === 'OVERVIEW' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="dashboard-card p-5 bg-paper flex flex-col justify-between min-h-[110px]">
                    <span className="text-[10px] uppercase tracking-wider block font-bold text-ink-soft">Total Accounts</span>
                    <h3 className="text-3xl font-black font-mono text-ink mt-2">{stats.totalUsers}</h3>
                    <span className="text-[10px] block mt-1 text-ink-soft/75 font-semibold">Registered Students & Landlords</span>
                  </div>

                  <div className="dashboard-card p-5 bg-paper flex flex-col justify-between min-h-[110px]">
                    <span className="text-[10px] uppercase tracking-wider block font-bold text-ink-soft">Verified Users</span>
                    <h3 className="text-3xl font-black font-mono text-pine mt-2">{stats.verifiedUsers}</h3>
                    <span className="text-[10px] block mt-1 text-pine font-bold">Cleared Tiers</span>
                  </div>

                  <div className="dashboard-card p-5 bg-paper flex flex-col justify-between min-h-[110px]">
                    <span className="text-[10px] uppercase tracking-wider block font-bold text-ink-soft">Total Listings</span>
                    <h3 className="text-3xl font-black font-mono text-ink mt-2">{stats.totalListings}</h3>
                    <span className="text-[10px] block mt-1 text-ink-soft/75 font-semibold">Host Housing Places</span>
                  </div>

                  <div className="dashboard-card p-5 bg-paper flex flex-col justify-between min-h-[110px]">
                    <span className="text-[10px] uppercase tracking-wider block font-bold text-ink-soft">Active Fraud Reports</span>
                    <h3 className="text-3xl font-black font-mono text-rose-500 mt-2">{stats.activeReports}</h3>
                    <span className="text-[10px] block mt-1 text-rose-500 font-bold">Pending Review</span>
                  </div>
                </div>

                {/* AI / Automated Moderation Indicators card */}
                <div className="dashboard-card p-6 bg-paper border border-ink/5 space-y-4">
                  <div className="flex items-center gap-2">
                    <Shield className="text-marigold" size={18} />
                    <h3 className="text-base font-black text-ink font-display">AI Moderation Status</h3>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-clay/50 rounded-xl">
                    <div>
                      <span className="text-xs font-bold text-ink">Rent Scams Flagged</span>
                      <p className="text-[10px] text-ink-soft font-medium mt-0.5">Listings with outlier rent rates below market average (NPR 4,000).</p>
                    </div>
                    <span className="text-sm font-black font-mono bg-marigold/10 border border-marigold/20 text-marigold-dark px-3 py-1 rounded-full">
                      {stats.suspiciousListings} flagged
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* VERIFICATIONS QUEUE MODULE */}
            {activeTab === 'VERIFICATIONS' && (
              <div className="bg-paper border border-ink/5 rounded-[24px] overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-ink/5">
                  <h3 className="text-sm font-bold text-ink">Pending Credentials Verification Queue</h3>
                </div>
                {verifications.length === 0 ? (
                  <div className="text-center py-12 text-xs font-bold text-ink-soft">
                    No pending verification requests in the queue.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-clay/35 text-[10px] uppercase font-bold text-ink-soft border-b border-ink/5">
                          <th className="p-4">Full Name</th>
                          <th className="p-4">Role</th>
                          <th className="p-4">College</th>
                          <th className="p-4">Reg Number</th>
                          <th className="p-4">Document Type</th>
                          <th className="p-4 text-right">Review</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs">
                        {verifications.map(req => (
                          <tr key={req.id} className="border-b border-ink/5 hover:bg-clay/10 transition">
                            <td className="p-4 font-black">{req.fullName}</td>
                            <td className="p-4 uppercase font-bold text-[9px] text-marigold-dark">{req.role}</td>
                            <td className="p-4 text-ink-soft">{req.collegeName}</td>
                            <td className="p-4 font-mono font-bold">{req.registrationNumber}</td>
                            <td className="p-4 text-ink-soft font-semibold">{req.documentType}</td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => setSelectedVerification(req)}
                                className="bg-marigold text-paper font-bold px-3.5 py-1.5 rounded-lg text-[10px] hover:bg-marigold-dark transition shadow-sm"
                              >
                                Review Submission
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* LISTINGS MODERATION MODULE */}
            {activeTab === 'LISTINGS' && (
              <div className="bg-paper border border-ink/5 rounded-[24px] overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-ink/5">
                  <h3 className="text-sm font-bold text-ink">Room Listings Moderation</h3>
                </div>
                {listings.length === 0 ? (
                  <div className="text-center py-12 text-xs font-bold text-ink-soft">
                    No room listings posted in the system yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-clay/35 text-[10px] uppercase font-bold text-ink-soft border-b border-ink/5">
                          <th className="p-4">Room Title</th>
                          <th className="p-4">Rent</th>
                          <th className="p-4">Type</th>
                          <th className="p-4">Moderation Status</th>
                          <th className="p-4">Owner Info</th>
                          <th className="p-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs">
                        {listings.map(item => (
                          <tr key={item.id} className="border-b border-ink/5 hover:bg-clay/10 transition">
                            <td className="p-4 font-black">{item.title}</td>
                            <td className="p-4 font-mono font-bold text-pine">NPR {item.rentAmount}</td>
                            <td className="p-4 uppercase text-[10px] font-semibold text-ink-soft">{item.roomType.replace('_', ' ')}</td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                item.verificationStatus === 'APPROVED' ? 'bg-pine-light text-pine' : 
                                item.verificationStatus === 'PENDING' ? 'bg-marigold/10 text-marigold-dark' : 'bg-rose-50 text-rose-600'
                              }`}>
                                {item.verificationStatus}
                              </span>
                            </td>
                            <td className="p-4 font-mono text-[10px] text-ink-soft">{item.owner?.phoneNumber || 'N/A'}</td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => setSelectedListing(item)}
                                className="bg-marigold text-paper font-bold px-3 py-1.5 rounded-lg text-[10px] hover:bg-marigold-dark transition shadow-sm"
                              >
                                Moderate
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* FRAUD REPORTS MODULE */}
            {activeTab === 'REPORTS' && (
              <div className="bg-paper border border-ink/5 rounded-[24px] overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-ink/5">
                  <h3 className="text-sm font-bold text-ink">Platform Trust & Fraud Reports</h3>
                </div>
                {reports.length === 0 ? (
                  <div className="text-center py-12 text-xs font-bold text-ink-soft">
                    No trust reports filed yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-clay/35 text-[10px] uppercase font-bold text-ink-soft border-b border-ink/5">
                          <th className="p-4">Reporter ID</th>
                          <th className="p-4">Reported User ID</th>
                          <th className="p-4">Violation Type</th>
                          <th className="p-4">Description</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Resolve</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs">
                        {reports.map(rep => (
                          <tr key={rep.id} className="border-b border-ink/5 hover:bg-clay/10 transition">
                            <td className="p-4 font-mono text-[10px] text-ink-soft">{rep.reporterId}</td>
                            <td className="p-4 font-mono text-[10px] text-brick">{rep.reportedUserId}</td>
                            <td className="p-4 font-black">{rep.reason}</td>
                            <td className="p-4 text-ink-soft max-w-xs truncate">{rep.description}</td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                rep.status === 'RESOLVED' ? 'bg-pine-light text-pine' : 'bg-rose-50 text-rose-600'
                              }`}>
                                {rep.status}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              {rep.status !== 'RESOLVED' && (
                                <button
                                  onClick={() => handleResolveReport(rep.id)}
                                  className="bg-pine text-paper font-bold px-3 py-1.5 rounded-lg text-[10px] hover:bg-pine/90 transition shadow-sm"
                                >
                                  Mark Resolved
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* AUDIT LOGS MODULE */}
            {activeTab === 'AUDIT_LOGS' && (
              <div className="bg-paper border border-ink/5 rounded-[24px] overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-ink/5">
                  <h3 className="text-sm font-bold text-ink">Administrative Action Logs</h3>
                </div>
                {auditLogs.length === 0 ? (
                  <div className="text-center py-12 text-xs font-bold text-ink-soft">
                    No administrative audit actions recorded yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-clay/35 text-[10px] uppercase font-bold text-ink-soft border-b border-ink/5">
                          <th className="p-4">Timestamp</th>
                          <th className="p-4">Admin Name</th>
                          <th className="p-4">Action Type</th>
                          <th className="p-4">Affected Resource</th>
                          <th className="p-4">Reason / Notes</th>
                          <th className="p-4">Status Transition</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs font-mono">
                        {auditLogs.map(log => (
                          <tr key={log.id} className="border-b border-ink/5 hover:bg-clay/10 transition">
                            <td className="p-4 text-ink-soft text-[10px]">{new Date(log.createdAt).toLocaleString()}</td>
                            <td className="p-4 font-black font-sans">{log.adminName}</td>
                            <td className="p-4 font-bold text-[10px] text-marigold-dark">{log.action}</td>
                            <td className="p-4 font-sans text-xs">
                              {log.affectedUserName && (
                                <span className="block text-[11px]">👤 User: <strong>{log.affectedUserName}</strong></span>
                              )}
                              {log.affectedListingTitle && (
                                <span className="block text-[11px]">🏠 Room: <strong>{log.affectedListingTitle}</strong></span>
                              )}
                            </td>
                            <td className="p-4 font-sans text-xs text-ink-soft max-w-xs">{log.reason || 'N/A'}</td>
                            <td className="p-4 text-[10px] font-bold text-ink-soft/90">
                              {log.previousStatus} → <span className="text-pine font-black">{log.newStatus}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* USER ACCOUNTS MODULE */}
            {activeTab === 'USERS' && (
              <div className="bg-paper border border-ink/5 rounded-[24px] overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-ink/5">
                  <h3 className="text-sm font-bold text-ink">Student & Landlord User Accounts</h3>
                </div>
                {users.length === 0 ? (
                  <div className="text-center py-12 text-xs font-bold text-ink-soft">
                    No user accounts found in database.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-clay/35 text-[10px] uppercase font-bold text-ink-soft border-b border-ink/5">
                          <th className="p-4">Full Name</th>
                          <th className="p-4">Role</th>
                          <th className="p-4">City</th>
                          <th className="p-4">Origin District</th>
                          <th className="p-4">Vetting Status</th>
                          <th className="p-4 text-right">Status Action</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs">
                        {users.map(u => (
                          <tr key={u.id} className="border-b border-ink/5 hover:bg-clay/10 transition">
                            <td className="p-4 font-black">{u.fullName}</td>
                            <td className="p-4 uppercase text-[10px] font-bold text-ink-soft">{u.majorCourse === 'Landlord' ? 'Landlord' : 'Student'}</td>
                            <td className="p-4 text-ink-soft">{u.currentCity}</td>
                            <td className="p-4 text-ink-soft">{u.hometownDistrict}</td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                u.verificationStatus === 'VERIFIED' ? 'bg-pine-light text-pine' : 
                                u.verificationStatus === 'SUSPENDED' ? 'bg-rose-50 text-rose-600' : 'bg-marigold/10 text-marigold-dark'
                              }`}>
                                {u.verificationStatus || 'PENDING'}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => handleManualUserStatus(u.id, u.verificationStatus || '')}
                                className={`font-bold px-3 py-1.5 rounded-lg text-[10px] transition shadow-sm ${
                                  u.verificationStatus === 'SUSPENDED' 
                                    ? 'bg-pine text-paper hover:bg-pine/90' 
                                    : 'bg-rose-500 text-paper hover:bg-rose-600'
                                }`}
                              >
                                {u.verificationStatus === 'SUSPENDED' ? 'Unsuspend' : 'Suspend User'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* ------------------------------------------------------------- */}
      {/* 7. VERIFICATION DETAILED MODAL SCREEN */}
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
      {/* 8. LISTING MODERATION MODAL */}
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
                  selectedListing.images.map((img: any, idx: number) => (
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

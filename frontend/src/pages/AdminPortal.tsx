import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, CheckCircle, AlertTriangle, Users, Home, TrendingUp } from 'lucide-react';
import api from '../services/api';

interface VerificationRequest {
  id: string;
  fullName: string;
  collegeName: string;
  collegeRegistrationNumber: string;
  documentImageUrl: string;
  verificationStatus: string;
}

interface ListingItem {
  id: string;
  title: string;
  rentAmount: number;
  roomType: string;
  isVerified: boolean;
  isAvailable: boolean;
  distanceFromCollegeText: string;
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

interface AnalyticsStats {
  totalUsers: number;
  verifiedUsers: number;
  totalListings: number;
  activeReports: number;
  suspiciousListings: number;
}

const AdminPortal: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'VERIFICATIONS' | 'LISTINGS' | 'REPORTS' | 'SUSPICIOUS' | 'USERS'>('OVERVIEW');
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [reports, setReports] = useState<TrustReportItem[]>([]);
  const [users, setUsers] = useState<VerificationRequest[]>([]);
  const [stats, setStats] = useState<AnalyticsStats>({
    totalUsers: 0,
    verifiedUsers: 0,
    totalListings: 0,
    activeReports: 0,
    suspiciousListings: 0
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        setVerifications(res.data);
      } else if (activeTab === 'LISTINGS') {
        const res = await api.get('/admin/listings');
        setListings(res.data);
      } else if (activeTab === 'REPORTS') {
        const res = await api.get('/admin/reports');
        setReports(res.data);
      } else if (activeTab === 'USERS') {
        const res = await api.get('/admin/users');
        setUsers(res.data);
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to retrieve administrator modules. Please verify permissions.');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewVerification = async (id: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      await api.post(`/admin/verifications/${id}/review`, { status });
      setVerifications(verifications.filter(v => v.id !== id));
      alert(`Student verification marked as ${status.toLowerCase()} successfully.`);
    } catch (err) {
      alert('Failed to submit verification review.');
    }
  };

  const handleToggleListingVerify = async (id: string, currentlyVerified: boolean) => {
    try {
      await api.post(`/admin/listings/${id}/review`, { verified: !currentlyVerified });
      setListings(listings.map(l => l.id === id ? { ...l, isVerified: !currentlyVerified } : l));
    } catch (err) {
      alert('Failed to update listing verification status.');
    }
  };

  const handleResolveReport = async (id: string) => {
    try {
      await api.post(`/admin/reports/${id}/resolve`);
      setReports(reports.map(r => r.id === id ? { ...r, status: 'RESOLVED' } : r));
      alert('Report marked as resolved successfully.');
    } catch (err) {
      alert('Failed to resolve report.');
    }
  };

  const handleSuspendUser = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'SUSPENDED' ? 'VERIFIED' : 'SUSPENDED';
    try {
      await api.post(`/admin/users/${id}/status`, { status: nextStatus });
      setUsers(users.map(u => u.id === id ? { ...u, verificationStatus: nextStatus } : u));
    } catch (err) {
      alert('Failed to update user status.');
    }
  };

  return (
    <div className="min-h-screen bg-clay text-ink flex flex-col font-sans">
      {/* Header bar */}
      <header className="border-b border-ink/5 bg-clay/85 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex justify-between items-center">
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
          { key: 'OVERVIEW', label: 'Dashboard Overview', icon: TrendingUp },
          { key: 'VERIFICATIONS', label: 'Verifications Queue', icon: CheckCircle },
          { key: 'LISTINGS', label: 'Listings Moderation', icon: Home },
          { key: 'REPORTS', label: 'Fraud Reports', icon: AlertTriangle },
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
                  <h3 className="text-sm font-bold text-ink">Pending Student & Landlord Credentials</h3>
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
                          <th className="p-4">College</th>
                          <th className="p-4">Reg Number</th>
                          <th className="p-4">Document Scan</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs">
                        {verifications.map(req => (
                          <tr key={req.id} className="border-b border-ink/5 hover:bg-clay/10 transition">
                            <td className="p-4 font-black">{req.fullName}</td>
                            <td className="p-4 text-ink-soft">{req.collegeName}</td>
                            <td className="p-4 font-mono font-bold">{req.collegeRegistrationNumber}</td>
                            <td className="p-4">
                              {req.documentImageUrl ? (
                                <a 
                                  href={req.documentImageUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-marigold hover:underline font-bold"
                                >
                                  View Scan URL →
                                </a>
                              ) : (
                                <span className="text-ink-soft">No Document</span>
                              )}
                            </td>
                            <td className="p-4 text-right space-x-2">
                              <button
                                onClick={() => handleReviewVerification(req.id, 'VERIFIED')}
                                className="bg-pine text-paper font-bold px-3 py-1.5 rounded-lg text-[10px] hover:bg-pine/90 transition shadow-sm"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReviewVerification(req.id, 'REJECTED')}
                                className="bg-rose-500 text-paper font-bold px-3 py-1.5 rounded-lg text-[10px] hover:bg-rose-600 transition shadow-sm"
                              >
                                Reject
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
                  <h3 className="text-sm font-bold text-ink">Active Housing Listings</h3>
                </div>
                {listings.length === 0 ? (
                  <div className="text-center py-12 text-xs font-bold text-ink-soft">
                    No active listings available.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-clay/35 text-[10px] uppercase font-bold text-ink-soft border-b border-ink/5">
                          <th className="p-4">Title</th>
                          <th className="p-4">Rent</th>
                          <th className="p-4">Room Type</th>
                          <th className="p-4">Near Campus</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs">
                        {listings.map(item => (
                          <tr key={item.id} className="border-b border-ink/5 hover:bg-clay/10 transition">
                            <td className="p-4 font-black">{item.title}</td>
                            <td className="p-4 font-mono font-bold">NPR {item.rentAmount}</td>
                            <td className="p-4 uppercase text-ink-soft">{item.roomType.replace('_', ' ')}</td>
                            <td className="p-4 text-marigold font-bold">{item.distanceFromCollegeText}</td>
                            <td className="p-4">
                              {item.isVerified ? (
                                <span className="inline-flex items-center gap-1 bg-pine-light text-pine px-2 py-0.5 rounded-full text-[10px] font-bold">
                                  Verified
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 bg-clay text-ink-soft px-2 py-0.5 rounded-full text-[10px] font-bold">
                                  Unmoderated
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => handleToggleListingVerify(item.id, item.isVerified)}
                                className={`font-bold px-3 py-1.5 rounded-lg text-[10px] transition shadow-sm ${
                                  item.isVerified 
                                    ? 'bg-rose-500 text-paper hover:bg-rose-600' 
                                    : 'bg-marigold text-paper hover:bg-marigold-dark'
                                }`}
                              >
                                {item.isVerified ? 'Unverify' : 'Verify listing'}
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
                  <h3 className="text-sm font-bold text-ink">Unresolved Trust Reports</h3>
                </div>
                {reports.length === 0 ? (
                  <div className="text-center py-12 text-xs font-bold text-ink-soft">
                    No reports filed in the system.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-clay/35 text-[10px] uppercase font-bold text-ink-soft border-b border-ink/5">
                          <th className="p-4">Reporter ID</th>
                          <th className="p-4">Reported User ID</th>
                          <th className="p-4">Reason</th>
                          <th className="p-4">Description</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs">
                        {reports.map(rep => (
                          <tr key={rep.id} className="border-b border-ink/5 hover:bg-clay/10 transition">
                            <td className="p-4 font-mono text-[10px] text-ink-soft">{rep.reporterId}</td>
                            <td className="p-4 font-mono text-[10px] font-bold">{rep.reportedUserId}</td>
                            <td className="p-4">
                              <span className="bg-rose-50 border border-rose-100 text-rose-600 px-2 py-0.5 rounded font-black">
                                {rep.reason}
                              </span>
                            </td>
                            <td className="p-4 text-ink-soft">{rep.description}</td>
                            <td className="p-4 font-bold">{rep.status}</td>
                            <td className="p-4 text-right">
                              {rep.status === 'PENDING' && (
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

            {/* USER ACCOUNTS MODULE */}
            {activeTab === 'USERS' && (
              <div className="bg-paper border border-ink/5 rounded-[24px] overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-ink/5">
                  <h3 className="text-sm font-bold text-ink">User Directory</h3>
                </div>
                {users.length === 0 ? (
                  <div className="text-center py-12 text-xs font-bold text-ink-soft">
                    No user accounts found.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-clay/35 text-[10px] uppercase font-bold text-ink-soft border-b border-ink/5">
                          <th className="p-4">Full Name</th>
                          <th className="p-4">College</th>
                          <th className="p-4">Verification Status</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs">
                        {users.map(u => (
                          <tr key={u.id} className="border-b border-ink/5 hover:bg-clay/10 transition">
                            <td className="p-4 font-black">{u.fullName}</td>
                            <td className="p-4 text-ink-soft">{u.collegeName}</td>
                            <td className="p-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                u.verificationStatus === 'SUSPENDED' 
                                  ? 'bg-rose-500 text-paper' 
                                  : u.verificationStatus === 'VERIFIED'
                                  ? 'bg-pine-light text-pine'
                                  : 'bg-marigold/10 text-marigold-dark'
                              }`}>
                                {u.verificationStatus}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => handleSuspendUser(u.id, u.verificationStatus)}
                                className={`font-bold px-3 py-1.5 rounded-lg text-[10px] transition shadow-sm ${
                                  u.verificationStatus === 'SUSPENDED' 
                                    ? 'bg-pine text-paper hover:bg-pine/90' 
                                    : 'bg-rose-500 text-paper hover:bg-rose-600'
                                }`}
                              >
                                {u.verificationStatus === 'SUSPENDED' ? 'Activate' : 'Suspend user'}
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
    </div>
  );
};

export default AdminPortal;

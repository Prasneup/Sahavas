import React from 'react';
import { Shield } from 'lucide-react';
import { AnalyticsStats } from '../../types/admin';

interface AdminOverviewProps {
  stats: AnalyticsStats;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({ stats }) => {
  return (
    <div className="space-y-6 animate-fade-in">
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
  );
};

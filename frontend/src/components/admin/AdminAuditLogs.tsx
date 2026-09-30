import React from 'react';
import { AuditLogItem } from '../../types/admin';

interface AdminAuditLogsProps {
  auditLogs: AuditLogItem[];
}

export const AdminAuditLogs: React.FC<AdminAuditLogsProps> = ({ auditLogs }) => {
  return (
    <div className="bg-paper border border-ink/5 rounded-[24px] overflow-hidden shadow-sm animate-fade-in">
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
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { Notification } from '../../types/notification';

interface NotificationDropdownProps {
  notifications: Notification[];
  unreadCount: number;
  onNotificationClick: (notif: Notification) => void;
  onMarkAllRead: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
  unreadCount,
  onNotificationClick,
  onMarkAllRead
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setShowNotifications(!showNotifications)}
        className="bg-paper hover:bg-[#FAF3E8] border border-ink/10 text-ink p-2.5 rounded-full shadow-sm transition relative flex items-center justify-center"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-paper text-[8px] font-black flex items-center justify-center shadow-md animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-paper border border-ink/10 rounded-[20px] shadow-xl z-50 p-4 space-y-3">
          <div className="flex justify-between items-center border-b border-ink/5 pb-2">
            <h4 className="text-xs font-black text-ink font-display">Notifications</h4>
            {unreadCount > 0 && (
              <button 
                onClick={() => {
                  onMarkAllRead();
                }}
                className="text-[10px] text-marigold font-black hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-60 overflow-y-auto divide-y divide-ink/5 space-y-2.5">
            {notifications.length === 0 ? (
              <div className="text-center py-6 text-[10px] font-bold text-ink-soft/75">
                No notifications yet.
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id}
                  onClick={() => {
                    onNotificationClick(notif);
                    setShowNotifications(false);
                  }}
                  className={`pt-2.5 pb-1 flex gap-2.5 cursor-pointer group hover:bg-[#FAF8F5] rounded-lg px-2 transition ${notif.isRead ? '' : 'bg-clay/10'}`}
                >
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-1.5 justify-between">
                      <span className={`text-[10px] font-black truncate ${notif.isRead ? 'text-ink' : 'text-marigold-dark'}`}>
                        {notif.title}
                      </span>
                      {!notif.isRead && (
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-[10px] text-ink-soft/80 line-clamp-2 mt-0.5 font-medium leading-normal">
                      {notif.content}
                    </p>
                    <span className="text-[8px] text-ink-soft/45 font-mono mt-1 block">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

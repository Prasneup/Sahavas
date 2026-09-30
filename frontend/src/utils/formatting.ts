export const getAvatarUrl = (profile?: any): string => {
  if (profile?.avatarUrl && profile.avatarUrl.trim().length > 0) {
    return profile.avatarUrl;
  }
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.fullName || 'User')}&background=FAF3E8&color=D9A25A&bold=true&size=128`;
};

export const formatLastMessageTime = (timeStr?: string): string => {
  if (!timeStr) return "No messages yet";
  const date = new Date(timeStr);
  if (isNaN(date.getTime())) return "No messages yet";
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

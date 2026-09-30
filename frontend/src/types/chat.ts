export interface PeerProfile {
  id: string;
  fullName: string;
  avatarUrl: string;
  collegeName?: string;
  majorCourse?: string;
  completenessPercentage?: number;
  role?: string;
}

export interface Conversation {
  conversationId: string;
  peerProfile: PeerProfile;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  listing?: {
    id: string;
    title: string;
    rentAmount: number;
    distanceFromCollegeText?: string;
  };
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: 'TEXT' | 'IMAGE' | 'ROOM_SHARE' | 'PROFILE_SHARE';
  sharedResourceId?: string;
  isRead: boolean;
  createdAt: string;
}

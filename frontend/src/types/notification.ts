export interface Notification {
  id: string;
  userId: string;
  title: string;
  content: string;
  type: 'NEW_MESSAGE' | 'NEW_ENQUIRY' | 'VERIFICATION_APPROVED' | 'VERIFICATION_REJECTED';
  conversationId?: string;
  roomId?: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  type: 'COLLEGE' | 'COURSE' | 'LOCATION' | 'HOUSING' | 'INTEREST' | 'DISTRICT';
  creator?: {
    id: string;
  };
}

export interface PollOption {
  id: string;
  optionText: string;
  votesCount: number;
}

export interface EventDetail {
  eventDate: string;
  location: string;
  rsvpsCount: number;
}

export interface Post {
  id: string;
  communityId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorVerification: string;
  title: string;
  content: string;
  postType: 'TEXT' | 'POLL' | 'EVENT';
  likesCount: number;
  commentsCount: number;
  likedByMe: boolean;
  createdAt: string;
  pollOptions?: PollOption[];
  eventDetails?: EventDetail;
}

export interface Comment {
  id: string;
  postId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

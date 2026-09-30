import api from './api';

export const communityService = {
  getMyCommunities: async () => {
    const res = await api.get('/communities/my');
    return res.data;
  },

  getDiscoverCommunities: async () => {
    const res = await api.get('/communities/discover');
    return res.data;
  },

  createCommunity: async (payload: { name: string; description: string; type: string }) => {
    const res = await api.post('/communities', payload);
    return res.data;
  },

  getPosts: async (communityId: string) => {
    const res = await api.get(`/communities/${communityId}/posts`);
    return res.data;
  },

  createPost: async (communityId: string, payload: any) => {
    const res = await api.post(`/communities/${communityId}/posts`, payload);
    return res.data;
  },

  joinCommunity: async (communityId: string) => {
    const res = await api.post(`/communities/${communityId}/join`);
    return res.data;
  },

  leaveCommunity: async (communityId: string) => {
    const res = await api.post(`/communities/${communityId}/leave`);
    return res.data;
  },

  likePost: async (postId: string) => {
    const res = await api.post(`/communities/posts/${postId}/like`);
    return res.data;
  },

  getComments: async (postId: string) => {
    const res = await api.get(`/communities/posts/${postId}/comments`);
    return res.data;
  },

  addComment: async (postId: string, content: string) => {
    const res = await api.post(`/communities/posts/${postId}/comments`, { content });
    return res.data;
  },

  voteOption: async (optionId: string) => {
    const res = await api.post(`/communities/posts/polls/options/${optionId}/vote`);
    return res.data;
  },

  getRecentPosts: async () => {
    const res = await api.get('/communities/posts/recent');
    return res.data;
  }
};

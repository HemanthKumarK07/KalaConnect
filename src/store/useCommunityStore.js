import { create } from 'zustand';

const API_BASE = 'http://localhost:5000/api';

const useCommunityStore = create((set, get) => ({
  posts: [],
  loading: false,

  fetchPosts: async () => {
    set({ loading: true });
    try {
      const res = await fetch(`${API_BASE}/community`);
      const json = await res.json();
      if (json.success) {
        set({ posts: json.data });
      }
    } catch (error) {
      console.error('Failed to fetch posts', error);
    } finally {
      set({ loading: false });
    }
  },

  addPost: async (postData) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/community`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(postData),
      });
      const json = await res.json();
      if (json.success) {
        set((state) => ({ posts: [json.data, ...state.posts] }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to add post', error);
      return false;
    }
  },

  toggleLike: async (postId) => {
    try {
      // Optimistic update
      set((state) => ({
        posts: state.posts.map((post) => {
          if (post._id === postId) {
            // Need user ID to know if we are liking or unliking, but for now we just toggle based on what's visually there (the backend handles true logic)
            // But we can just refetch or rely on backend response.
            // Let's rely on backend response for accuracy.
            return post;
          }
          return post;
        }),
      }));

      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/community/${postId}/like`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      
      if (json.success) {
        set((state) => ({
          posts: state.posts.map((post) =>
            post._id === postId ? json.data : post
          ),
        }));
      }
    } catch (error) {
      console.error('Failed to toggle like', error);
    }
  },
}));

export default useCommunityStore;

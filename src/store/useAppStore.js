import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAppStore = create(
  persist(
    (set) => ({
      wishlist: [],
      
      toggleWishlist: (productId) => set((state) => {
        if (state.wishlist.includes(productId)) {
          return { wishlist: state.wishlist.filter(id => id !== productId) };
        }
        return { wishlist: [...state.wishlist, productId] };
      }),
      
      isInWishlist: (productId) => {
        // We will just use the state directly where needed
        return false;
      },
      
      clearWishlist: () => set({ wishlist: [] })
    }),
    {
      name: 'kalaconnect-app',
    }
  )
);

export default useAppStore;

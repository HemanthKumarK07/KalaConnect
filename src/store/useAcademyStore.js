import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAcademyStore = create(
  persist(
    (set, get) => ({
      progress: {}, // { courseId: { lessonId: boolean } }
      notes: {}, // { courseId: string }
      
      markLessonComplete: (courseId, lessonId) => set((state) => {
        const courseProgress = state.progress[courseId] || {};
        return {
          progress: {
            ...state.progress,
            [courseId]: { ...courseProgress, [lessonId]: true }
          }
        };
      }),
      
      saveNotes: (courseId, noteText) => set((state) => ({
        notes: { ...state.notes, [courseId]: noteText }
      })),
      
      getCourseProgress: (courseId) => {
        const courseProgress = get().progress[courseId];
        if (!courseProgress) return 0;
        const completedCount = Object.values(courseProgress).filter(Boolean).length;
        return completedCount;
      }
    }),
    {
      name: 'kalaconnect-academy',
    }
  )
);

export default useAcademyStore;

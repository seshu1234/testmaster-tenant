import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface TestState {
  testId: string | null;
  attemptId: string | null;
  currentQuestionId: string | null;
  answers: Record<string, {
    selectedOptions: string[];
    status: string;
    timeSpent: number;
    synced: boolean;
  }>;
  timeLeft: number;
  isFullScreen: boolean;
  
  // Actions
  setTestContext: (testId: string, attemptId: string) => void;
  setCurrentQuestion: (id: string) => void;
  saveAnswer: (questionId: string, data: { selectedOptions: string[], status: string, timeSpent: number }) => void;
  markAsSynced: (questionId: string) => void;
  setTimeLeft: (time: number) => void;
  setFullScreen: (status: boolean) => void;
  reset: () => void;
}

export const useTestTakingStore = create<TestState>()(
  persist(
    (set, get) => ({
      testId: null,
      attemptId: null,
      currentQuestionId: null,
      answers: {},
      timeLeft: 0,
      isFullScreen: true,

      setTestContext: (testId: string, attemptId: string) => set({ testId, attemptId }),
      
      setCurrentQuestion: (id: string) => set({ currentQuestionId: id }),

      saveAnswer: (questionId: string, data: { selectedOptions: string[], status: string, timeSpent: number }) => {
        const { testId, attemptId } = get();
        
        // 1. Update State (Zustand)
        set((state: TestState) => ({
          answers: {
            ...state.answers,
            [questionId]: {
              ...data,
              synced: false,
            }
          }
        }));

        // 2. Persist to Dexie (IndexedDB)
        if (testId && attemptId) {
          import('@/lib/db').then(({ db }) => {
            db.answers.put({
              testId,
              attemptId,
              questionId,
              selectedOptions: data.selectedOptions,
              status: data.status,
              timeSpent: data.timeSpent,
              synced: 0,
              updatedAt: Date.now()
            }).catch((err: Error) => console.error("Dexie save failed:", err));
          });
        }
      },

      markAsSynced: (questionId: string) => {
        const { testId, attemptId } = get();
        
        set((state: TestState) => ({
          answers: {
            ...state.answers,
            [questionId]: state.answers[questionId] ? {
              ...state.answers[questionId],
              synced: true,
            } : {
              selectedOptions: [],
              status: 'not_answered',
              timeSpent: 0,
              synced: true,
            }
          }
        }));

        // Update Dexie sync status
        if (testId && attemptId) {
          import('@/lib/db').then(({ db }) => {
            db.answers.where({ testId, attemptId, questionId }).modify({ synced: 1 });
          });
        }
      },

      setTimeLeft: (time: number) => set({ timeLeft: time }),

      setFullScreen: (status: boolean) => set({ isFullScreen: status }),

      reset: () => set({
        testId: null,
        attemptId: null,
        currentQuestionId: null,
        answers: {},
        timeLeft: 0,
        isFullScreen: false
      })
    }),
    {
      name: "test-taking-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state: TestState) => ({ 
        testId: state.testId, 
        attemptId: state.attemptId, 
        answers: state.answers,
        timeLeft: state.timeLeft 
      }),
    }
  )
);

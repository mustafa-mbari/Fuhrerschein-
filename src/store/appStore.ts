"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  VocabularyItem,
  TrafficSign,
  TheoryQuestion,
  PersonalNote,
  AppStats,
} from "@/types";
import { v4 as uuidv4 } from "uuid";

interface AppState {
  // Data
  vocabulary: VocabularyItem[];
  trafficSigns: TrafficSign[];
  theoryQuestions: TheoryQuestion[];
  personalNotes: PersonalNote[];

  // Stats
  stats: AppStats;

  // Favorites
  favoriteVocab: Set<string>;
  favoriteSigns: Set<string>;
  favoriteQuestions: Set<string>;

  // Progress
  learnedVocab: Set<string>;
  learnedSigns: Set<string>;

  // Actions - Data loading
  setVocabulary: (items: VocabularyItem[]) => void;
  setTrafficSigns: (signs: TrafficSign[]) => void;
  setTheoryQuestions: (questions: TheoryQuestion[]) => void;
  setPersonalNotes: (notes: PersonalNote[]) => void;

  // Actions - Favorites
  toggleVocabFavorite: (id: string) => void;
  toggleSignFavorite: (id: string) => void;
  toggleQuestionFavorite: (id: string) => void;

  // Actions - Progress
  markVocabLearned: (id: string) => void;
  markSignLearned: (id: string) => void;

  // Actions - Personal Notes
  addNote: (note: Omit<PersonalNote, "id" | "createdAt" | "updatedAt">) => void;
  updateNote: (id: string, updates: Partial<PersonalNote>) => void;
  deleteNote: (id: string) => void;
  toggleNoteSolved: (id: string) => void;

  // Actions - Stats
  updateStats: (updates: Partial<AppStats>) => void;
  incrementQuizCompleted: (score: number) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      vocabulary: [],
      trafficSigns: [],
      theoryQuestions: [],
      personalNotes: [],
      favoriteVocab: new Set(),
      favoriteSigns: new Set(),
      favoriteQuestions: new Set(),
      learnedVocab: new Set(),
      learnedSigns: new Set(),
      stats: {
        vocabularyLearned: 0,
        signsLearned: 0,
        quizzesCompleted: 0,
        totalScore: 0,
        streak: 0,
        lastStudyDate: null,
      },

      setVocabulary: (items) => set({ vocabulary: items }),
      setTrafficSigns: (signs) => set({ trafficSigns: signs }),
      setTheoryQuestions: (questions) => set({ theoryQuestions: questions }),
      setPersonalNotes: (notes) => set({ personalNotes: notes }),

      toggleVocabFavorite: (id) =>
        set((state) => {
          const next = new Set(state.favoriteVocab);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return { favoriteVocab: next };
        }),

      toggleSignFavorite: (id) =>
        set((state) => {
          const next = new Set(state.favoriteSigns);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return { favoriteSigns: next };
        }),

      toggleQuestionFavorite: (id) =>
        set((state) => {
          const next = new Set(state.favoriteQuestions);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return { favoriteQuestions: next };
        }),

      markVocabLearned: (id) =>
        set((state) => {
          const next = new Set(state.learnedVocab);
          next.add(id);
          return {
            learnedVocab: next,
            stats: {
              ...state.stats,
              vocabularyLearned: next.size,
            },
          };
        }),

      markSignLearned: (id) =>
        set((state) => {
          const next = new Set(state.learnedSigns);
          next.add(id);
          return {
            learnedSigns: next,
            stats: {
              ...state.stats,
              signsLearned: next.size,
            },
          };
        }),

      addNote: (note) =>
        set((state) => ({
          personalNotes: [
            ...state.personalNotes,
            {
              ...note,
              id: uuidv4(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),

      updateNote: (id, updates) =>
        set((state) => ({
          personalNotes: state.personalNotes.map((n) =>
            n.id === id
              ? { ...n, ...updates, updatedAt: new Date().toISOString() }
              : n
          ),
        })),

      deleteNote: (id) =>
        set((state) => ({
          personalNotes: state.personalNotes.filter((n) => n.id !== id),
        })),

      toggleNoteSolved: (id) =>
        set((state) => ({
          personalNotes: state.personalNotes.map((n) =>
            n.id === id
              ? {
                  ...n,
                  isSolved: !n.isSolved,
                  updatedAt: new Date().toISOString(),
                }
              : n
          ),
        })),

      updateStats: (updates) =>
        set((state) => ({ stats: { ...state.stats, ...updates } })),

      incrementQuizCompleted: (score) =>
        set((state) => ({
          stats: {
            ...state.stats,
            quizzesCompleted: state.stats.quizzesCompleted + 1,
            totalScore: state.stats.totalScore + score,
            lastStudyDate: new Date().toISOString(),
          },
        })),
    }),
    {
      name: "fuhrerschein-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        favoriteVocab: Array.from(state.favoriteVocab),
        favoriteSigns: Array.from(state.favoriteSigns),
        favoriteQuestions: Array.from(state.favoriteQuestions),
        learnedVocab: Array.from(state.learnedVocab),
        learnedSigns: Array.from(state.learnedSigns),
        personalNotes: state.personalNotes,
        stats: state.stats,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.favoriteVocab = new Set(state.favoriteVocab as unknown as string[]);
          state.favoriteSigns = new Set(state.favoriteSigns as unknown as string[]);
          state.favoriteQuestions = new Set(state.favoriteQuestions as unknown as string[]);
          state.learnedVocab = new Set(state.learnedVocab as unknown as string[]);
          state.learnedSigns = new Set(state.learnedSigns as unknown as string[]);
        }
      },
    }
  )
);

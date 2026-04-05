import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Chore, AreaTag, Priority } from "../types/chore";
import { v4 as uuidv4 } from "uuid";

interface ChoreState {
  chores: Chore[];
}

interface ChoreActions {
  addChore: (chore: Omit<Chore, "id" | "createdAt" | "isCompleted">) => string;
  updateChore: (id: string, updates: Partial<Chore>) => void;
  deleteChore: (id: string) => void;
  completeChore: (id: string) => void;
  uncompleteChore: (id: string) => void;
  addNote: (id: string, note: string) => void;
  getChoreById: (id: string) => Chore | undefined;
  getChoresByArea: (area: AreaTag) => Chore[];
  getPendingChores: () => Chore[];
  getCompletedChores: () => Chore[];
  getOverdueChores: () => Chore[];
  getUpcomingChores: () => Chore[];
}

type ChoreStore = ChoreState & ChoreActions;

export const useChoreStore = create<ChoreStore>()(
  persist(
    (set, get) => ({
      chores: [],

      addChore: (chore) => {
        const id = uuidv4();
        const newChore: Chore = {
          ...chore,
          id,
          createdAt: Date.now(),
          isCompleted: false,
        };

        set((state) => ({
          chores: [newChore, ...state.chores],
        }));

        return id;
      },

      updateChore: (id, updates) => {
        set((state) => ({
          chores: state.chores.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        }));
      },

      deleteChore: (id) => {
        set((state) => ({
          chores: state.chores.filter((c) => c.id !== id),
        }));
      },

      completeChore: (id) => {
        set((state) => ({
          chores: state.chores.map((c) =>
            c.id === id
              ? { ...c, isCompleted: true, completedAt: Date.now() }
              : c
          ),
        }));
      },

      uncompleteChore: (id) => {
        set((state) => ({
          chores: state.chores.map((c) =>
            c.id === id
              ? { ...c, isCompleted: false, completedAt: undefined }
              : c
          ),
        }));
      },

      addNote: (id, note) => {
        set((state) => ({
          chores: state.chores.map((c) =>
            c.id === id ? { ...c, notes: note } : c
          ),
        }));
      },

      getChoreById: (id) => {
        return get().chores.find((c) => c.id === id);
      },

      getChoresByArea: (area) => {
        return get().chores.filter((c) => c.areaTag === area && !c.isCompleted);
      },

      getPendingChores: () => {
        return get().chores.filter((c) => !c.isCompleted);
      },

      getCompletedChores: () => {
        return get().chores.filter((c) => c.isCompleted);
      },

      getOverdueChores: () => {
        const now = Date.now();
        return get().chores.filter(
          (c) => !c.isCompleted && c.dueDate && c.dueDate < now
        );
      },

      getUpcomingChores: () => {
        const now = Date.now();
        return get()
          .chores.filter((c) => !c.isCompleted && c.dueDate && c.dueDate >= now)
          .sort((a, b) => (a.dueDate || 0) - (b.dueDate || 0));
      },
    }),
    {
      name: "chore-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        chores: state.chores,
      }),
    }
  )
);

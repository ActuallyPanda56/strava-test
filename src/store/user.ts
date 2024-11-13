import { create } from "zustand";

export const userStore = create((set) => ({
  token: null,
  setToken: (token: string) => set({ token }),
}));

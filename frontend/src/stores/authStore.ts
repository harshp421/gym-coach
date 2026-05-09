import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { User } from "../lib/endpoints/auth"
import { configureApi } from "../lib/api"

type AuthState = {
    user: User | null
    setUser: (user: User) => void
    clearUser: () => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            setUser: (user) => set({ user }),
            clearUser: () => set({ user: null }),
        }),
        {
            name: "gc-auth",
            storage: createJSONStorage(() => localStorage),
            partialize: (s) => ({ user: s.user }),
        },
    ),
)

configureApi({
    onUnauthorized: () => useAuthStore.getState().clearUser(),
})

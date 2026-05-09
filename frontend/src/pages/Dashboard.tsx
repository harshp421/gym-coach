import { useNavigate } from "react-router-dom"
import { useAuthStore } from "../stores/authStore"
import { useProfileStore } from "../stores/profileStore"
import { useQuery } from "../hooks/useQuery"
import { authApi } from "../lib/endpoints/auth"

function Dashboard() {
    const navigate = useNavigate()
    const user = useAuthStore((s) => s.user)
    const clearUser = useAuthStore((s) => s.clearUser)
    const profile = useProfileStore((s) => s.profile)
    const clearProfile = useProfileStore((s) => s.clearProfile)
    const { state, call: logout } = useQuery(authApi.logout)

    const handleLogout = async () => {
        try {
            await logout()
        } finally {
            clearUser()
            clearProfile()
            navigate("/", { replace: true })
        }
    }

    return (
        <main className="min-h-screen bg-stone-50 text-neutral-900">
            <header className="max-w-5xl mx-auto px-6 sm:px-10 py-6 flex items-center justify-between">
                <span className="text-xl font-black tracking-tight">GC</span>
                <button
                    type="button"
                    onClick={handleLogout}
                    disabled={state.loading}
                    className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors disabled:opacity-50"
                >
                    {state.loading ? "Signing out…" : "Sign out"}
                </button>
            </header>

            <section className="max-w-5xl mx-auto px-6 sm:px-10 py-10">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-500">
                    Dashboard
                </span>
                <h1 className="mt-3 text-5xl sm:text-6xl font-black tracking-tight leading-[1.02]">
                    Welcome,{" "}
                    <span className="text-neutral-300">
                        {user?.name ?? user?.email ?? "athlete"}.
                    </span>
                </h1>

                <div className="mt-12 rounded-2xl border border-neutral-200 bg-white p-6">
                    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-500">
                        Your plan
                    </div>
                    <p className="mt-2 text-neutral-600">
                        Plans and tracking are not built yet. You're in the right place
                        — the coach is on the way.
                    </p>
                    {profile && (
                        <dl className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                            <Stat label="Goal" value={profile.goal ?? "—"} />
                            <Stat
                                label="Days/week"
                                value={
                                    profile.trainingDaysPerWeek?.toString() ?? "—"
                                }
                            />
                            <Stat label="Diet" value={profile.dietType ?? "—"} />
                            <Stat
                                label="Equipment"
                                value={profile.equipmentAccess ?? "—"}
                            />
                        </dl>
                    )}
                </div>
            </section>
        </main>
    )
}

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <dt className="text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-500">
                {label}
            </dt>
            <dd className="mt-1 text-base font-semibold capitalize">
                {value.replace(/_/g, " ")}
            </dd>
        </div>
    )
}

export default Dashboard

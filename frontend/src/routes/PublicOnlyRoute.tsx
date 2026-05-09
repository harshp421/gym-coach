import { Navigate, Outlet } from "react-router-dom"
import { useAuthStore } from "../stores/authStore"

const PublicOnlyRoute = () => {
    const user = useAuthStore((s) => s.user)
    if (user) return <Navigate to="/dashboard" replace />
    return <Outlet />
}

export default PublicOnlyRoute

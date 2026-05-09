import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuthStore } from "../stores/authStore"

const ProtectedRoute = () => {
    const user = useAuthStore((s) => s.user)
    const location = useLocation()

    if (!user) {
        return <Navigate to="/login" replace state={{ from: location }} />
    }
    return <Outlet />
}

export default ProtectedRoute

import { Route } from "react-router-dom"
import ProtectedRoute from "./ProtectedRoute"
import OnboardingGate from "./OnboardingGate"
import Onboarding from "../pages/onboarding/Onboarding"
import Dashboard from "../pages/Dashboard"

const privateRoutes = [
    <Route key="protected" element={<ProtectedRoute />}>
        <Route element={<OnboardingGate />}>
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/dashboard" element={<Dashboard />} />
        </Route>
    </Route>,
]

export default privateRoutes

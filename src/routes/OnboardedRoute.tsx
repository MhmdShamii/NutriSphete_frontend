import { Navigate } from "react-router-dom"
import { useSelector } from "react-redux"
import type { RootState } from "../app/store"
import { getPostLoginRoute } from "../features/auth/types"

export default function OnboardedRoute({ children }: { children: React.ReactNode }) {
    const user = useSelector((state: RootState) => state.auth.user)

    if (!user) return <Navigate to="/auth" />

    if (user.onboarding_step !== "complete") {
        return <Navigate to={getPostLoginRoute(user.onboarding_step)} replace />
    }

    return children
}

import { Navigate } from "react-router-dom"
import { useSelector } from "react-redux"
import type { RootState } from "../app/store"

type ProtectedRouteProps = {
    children: React.ReactNode
}

function ProtectedRoute({ children }: ProtectedRouteProps) {

    const user = useSelector((state: RootState) => state.auth.user)

    if (!user) {
        return <Navigate to="/auth" replace />
    }

    return children
}

export default ProtectedRoute
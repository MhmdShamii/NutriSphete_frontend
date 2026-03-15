import { Navigate } from "react-router-dom"
import { useSelector } from "react-redux"
import type { RootState } from "../app/store"

type ProtectedRouteProps = {
    children: React.ReactNode
}

function ProtectedRoute({ children }: ProtectedRouteProps) {

    const { user, initialized } = useSelector((state: RootState) => state.auth)

    if (!initialized) {
        return <div>Loading...</div>
    }

    if (!user) {
        return <Navigate to="/auth" />
    }

    return children
}

export default ProtectedRoute
import { Navigate } from "react-router-dom"
import { useSelector } from "react-redux"
import type { RootState } from "../app/store"

type ProtectedRouteProps = {
    children: React.ReactNode
}

function ProtectedRoute({ children }: ProtectedRouteProps) {

    const { user, initialized } = useSelector((state: RootState) => state.auth)

    if (!initialized) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-background">
                <span className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/auth" />
    }

    return children
}

export default ProtectedRoute

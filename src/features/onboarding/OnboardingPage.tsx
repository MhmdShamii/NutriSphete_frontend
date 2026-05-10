import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { useSelector } from "react-redux"
import type { RootState } from "../../app/store"
import { getPostLoginRoute } from "../auth/types"

export default function OnboardingPage() {
    const user = useSelector((state: RootState) => state.auth.user)
    const location = useLocation()
    const navigate = useNavigate()

    useEffect(() => {
        if (!user) return

        // Completed users have no business here
        if (user.onboarding_step === "complete") {
            navigate("/", { replace: true })
            return
        }

        // Can't jump ahead — always redirect to the correct step
        const expected = getPostLoginRoute(user.onboarding_step)
        if (location.pathname !== expected) {
            navigate(expected, { replace: true })
        }
    }, [user?.onboarding_step, location.pathname])

    return (
        <div className="bg-background text-text h-full overflow-y-auto safe-area-top safe-area-bottom">

            {/* Fixed background blobs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute bottom-[-150px] sm:bottom-[-200px] left-1/2 -translate-x-1/2 w-[500px] h-[250px] sm:w-[900px] sm:h-[500px] bg-primary/25 blur-[140px] sm:blur-[200px] rounded-full animate-energy" />
                <div className="absolute bottom-[-150px] sm:bottom-[-250px] left-[30%] w-[400px] h-[200px] sm:w-[700px] sm:h-[400px] bg-primary/15 blur-[120px] sm:blur-[180px] rounded-full animate-energy" />
                <div className="absolute bottom-[-150px] sm:bottom-[-250px] right-[30%] w-[400px] h-[200px] sm:w-[700px] sm:h-[400px] bg-primary/15 blur-[120px] sm:blur-[180px] rounded-full animate-energy" />
            </div>

            {/* min-h-full + items-start so this grows with content; my-auto on card centers when short */}
            <div className="min-h-full flex items-start justify-center px-3 sm:px-5 py-6">
                <div
                    className="backdrop-blur-xl p-6 rounded-4xl shadow-xl w-full max-w-lg relative z-10 my-auto"
                    style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}
                >
                    <Outlet />
                </div>
            </div>

        </div>
    )
}

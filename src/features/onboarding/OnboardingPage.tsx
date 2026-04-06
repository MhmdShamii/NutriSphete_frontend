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
        <div className="bg-background text-text h-screen flex items-center justify-center relative overflow-hidden px-5">

            <div className="absolute bottom-[-200px] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-primary/25 blur-[200px] rounded-full animate-energy" />
            <div className="absolute bottom-[-250px] left-[30%] w-[700px] h-[400px] bg-primary/15 blur-[180px] rounded-full animate-energy" />
            <div className="absolute bottom-[-250px] right-[30%] w-[700px] h-[400px] bg-primary/15 blur-[180px] rounded-full animate-energy" />

            <div
                className="backdrop-blur-xl p-6 rounded-4xl shadow-xl w-full max-w-lg relative z-10"
                style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}
            >
                <Outlet />
            </div>

        </div>
    )
}

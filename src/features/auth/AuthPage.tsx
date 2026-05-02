import AuthCover from "./AuthCover"
import LoginForm from "../../components/auth/LoginForm"
import SignupForm from "../../components/auth/SignupForm"
import { useState } from "react"
import { Navigate } from "react-router-dom"
import { useSelector } from "react-redux"
import type { RootState } from "../../app/store"
import { getPostLoginRoute } from "../auth/types"

export default function AuthPage() {

    const [mode, setMode] = useState<"login" | "signup">("login")
    const user = useSelector((state: RootState) => state.auth.user)

    if (user) return <Navigate to={getPostLoginRoute(user.onboarding_step)} replace />

    return (
        <div className="bg-background text-text min-h-[100dvh] flex items-center justify-center relative overflow-hidden px-3 sm:px-5 py-4 safe-area-top safe-area-bottom">

            <div className="absolute bottom-[-150px] sm:bottom-[-200px] left-1/2 -translate-x-1/2 w-[500px] h-[250px] sm:w-[900px] sm:h-[500px] bg-primary/25 blur-[140px] sm:blur-[200px] rounded-full animate-energy pointer-events-none"></div>
            <div className="absolute bottom-[-150px] sm:bottom-[-250px] left-[30%] w-[400px] h-[200px] sm:w-[700px] sm:h-[400px] bg-primary/15 blur-[120px] sm:blur-[180px] rounded-full animate-energy pointer-events-none"></div>
            <div className="absolute bottom-[-150px] sm:bottom-[-250px] right-[30%] w-[400px] h-[200px] sm:w-[700px] sm:h-[400px] bg-primary/15 blur-[120px] sm:blur-[180px] rounded-full animate-energy pointer-events-none"></div>

            <div className="backdrop-blur-xl p-1 lg:p-4 rounded-3xl sm:rounded-4xl shadow-xl w-full max-w-[1000px] h-auto sm:h-[700px] flex gap-1 lg:gap-4 overflow-hidden relative z-10" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-primary/15"></div>

                <AuthCover className="hidden lg:w-1/2 lg:flex" />

                {mode === "login" &&
                    <LoginForm className="w-full lg:w-1/2" onSwitchToSignup={() => setMode("signup")} />
                }
                {mode === "signup" && (
                    <SignupForm className="w-full lg:w-1/2" onSwitchToLogin={() => setMode("login")} />
                )}


            </div>
        </div>
    )
}

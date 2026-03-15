import AuthCover from "./AuthCover"
import LoginForm from "../../components/auth/LoginForm"
import SignupForm from "../../components/auth/SignupForm"
import { useState } from "react"
export default function AuthPage() {

    const [mode, setMode] = useState<"login" | "signup">("login")

    return (
        <div className="bg-background text-text h-screen flex items-center justify-center relative overflow-hidden px-5 ">

            <div className="absolute bottom-[-200px] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-primary/25 blur-[200px] rounded-full animate-energy"></div>
            <div className="absolute bottom-[-250px] left-[30%] w-[700px] h-[400px] bg-primary/15 blur-[180px] rounded-full animate-energy"></div>
            <div className="absolute bottom-[-250px] right-[30%] w-[700px] h-[400px] bg-primary/15 blur-[180px] rounded-full animate-energy"></div>

            <div className="backdrop-blur-xl p-1 lg:p-4 rounded-4xl shadow-xl w-full max-w-[1000px] h-[600px] flex gap-1 lg:gap-4 overflow-hidden relative z-10 " style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
                <div className="absolute bottom-0 left-0 w-full h-[1px]bg-primary/15"></div>

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

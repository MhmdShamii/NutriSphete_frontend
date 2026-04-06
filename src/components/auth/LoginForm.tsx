import Input from "../ui/Input"
import Button from "../ui/Button"
import PasswordInput from "../ui/PasswordInput"

import { useState } from "react"

import { useDispatch, useSelector } from "react-redux"
import { login } from "../../features/auth/authSlice"

import { useNavigate } from "react-router-dom"

import type { LoginPayload } from "../../features/auth/types"
import { getPostLoginRoute } from "../../features/auth/types"
import type { RootState, AppDispatch } from "../../app/store"
import GoogleButton from "../ui/GoogleButton"

type LoginFormProps = {
    onSwitchToSignup: () => void
    className: string
}

function LoginForm({ onSwitchToSignup, className }: LoginFormProps) {

    const [loginForm, setLoginForm] = useState<LoginPayload>({
        email: "",
        password: ""
    })

    const dispatch = useDispatch<AppDispatch>()
    const navigate = useNavigate()

    const loading = useSelector((state: RootState) => state.auth.loading)
    const error = useSelector((state: RootState) => state.auth.error)

    function handleChange<K extends keyof LoginPayload>(field: K, value: LoginPayload[K]) {
        setLoginForm(prev => ({ ...prev, [field]: value }))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        try {
            const { user } = await dispatch(login(loginForm)).unwrap()
            navigate(getPostLoginRoute(user.onboarding_step))
        } catch {
            // error is stored in Redux state, displayed below
        }
    }

    return (
        <form onSubmit={handleSubmit} className={`flex flex-col p-8 gap-7 ${className}`}>

            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold text-primary">Welcome Back</h1>
                <p className="text-sm text-text-muted">Your meals, progress and insights are waiting</p>
            </div>

            <div className="flex flex-col gap-5 flex-1 justify-center">

                <Input
                    id="email"
                    label="Email"
                    type="email"
                    placeholder="Enter your email"
                    value={loginForm.email}
                    onChange={(v) => handleChange("email", v)}
                    error={!!error}
                />

                <div className="flex flex-col gap-1">
                    <PasswordInput
                        id="password"
                        label="Password"
                        placeholder="Enter your password"
                        value={loginForm.password}
                        onChange={(v) => handleChange("password", v)}
                        error={!!error}
                    />
                    <span className="text-xs w-full text-right text-text-muted hover:text-primary cursor-pointer transition-colors">
                        Forgot password?
                    </span>
                </div>

                {error && (
                    <p className="text-xs text-red-400 text-center -mt-2">{error}</p>
                )}

            </div>

            <div className="flex flex-col gap-3">

                <Button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <span className="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full" />
                    ) : (
                        "Login"
                    )}
                </Button>

                <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-border/30" />
                    <span className="text-xs text-text-muted">OR</span>
                    <div className="flex-1 h-px bg-border/30" />
                </div>

                <GoogleButton label="Continue with Google" />

                <p className="text-sm text-text-muted w-full text-center">
                    Don't have an account?{" "}
                    <button
                        type="button"
                        onClick={onSwitchToSignup}
                        className="text-primary font-medium hover:underline transition-colors"
                    >
                        Sign up
                    </button>
                </p>

            </div>

        </form>
    )
}

export default LoginForm

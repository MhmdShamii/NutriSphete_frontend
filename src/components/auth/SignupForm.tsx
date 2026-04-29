import { useEffect, useRef, useState } from "react"
import { checkEmail } from "../../services/auth/authApi"
import SignUpStepOne from "./SignUpStepOne"
import SignUpStepTwo from "./SignUpStepTwo"
import StepIndicator from "./StepIndicator"
import { useDispatch, useSelector } from "react-redux"
import { register } from "../../features/auth/authSlice"
import type { AppDispatch, RootState } from "../../app/store"
import type { RegisterPayload } from "../../features/auth/types"
import GoogleButton from "../ui/GoogleButton"
import Button from "../ui/Button"

type SignupFormProps = {
    onSwitchToLogin: () => void
    className: string
}

export default function SignupForm({ onSwitchToLogin, className }: SignupFormProps) {

    const [step, setStep] = useState(1)

    const [formData, setFormData] = useState<RegisterPayload>({
        email: "",
        password: "",
        password_confirmation: ""
    })

    const [debouncedEmail, setDebouncedEmail] = useState("")
    const [emailStatus, setEmailStatus] = useState<"idle" | "checking" | "exists" | "available">("idle")

    const controllerRef = useRef<AbortController | null>(null)
    const dispatch = useDispatch<AppDispatch>()
    const loading = useSelector((state: RootState) => state.auth.loading)
    const reduxError = useSelector((state: RootState) => state.auth.error)

    /* -------------------- VALIDATION -------------------- */

    const passwordValid =
        formData.password.length >= 8 &&
        formData.password === formData.password_confirmation

    const formValid = emailStatus === "available" && passwordValid
    const isCheckingEmail = emailStatus === "checking"

    /* -------------------- FORM HANDLING -------------------- */

    function handleChange(field: keyof RegisterPayload, value: string) {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    /* -------------------- EMAIL DEBOUNCE -------------------- */

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedEmail(formData.email), 500)
        return () => clearTimeout(timer)
    }, [formData.email])

    /* -------------------- EMAIL CHECK -------------------- */

    useEffect(() => {
        const isValid = /^\S+@\S+\.\S+$/.test(debouncedEmail)
        if (!debouncedEmail || !isValid) {
            setEmailStatus("idle")
            return
        }

        if (controllerRef.current) controllerRef.current.abort()
        const controller = new AbortController()
        controllerRef.current = controller

        const check = async () => {
            try {
                setEmailStatus("checking")
                const result = await checkEmail(debouncedEmail, controller.signal)
                if (!result) return
                setEmailStatus(result.existing_user ? "exists" : "available")
            } catch {
                setEmailStatus("idle")
            }
        }

        check()
    }, [debouncedEmail])

    /* -------------------- SUBMIT -------------------- */

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!formValid) return

        try {
            await dispatch(register(formData)).unwrap()
            setStep(2)
        } catch {
            // error stored in Redux, displayed below
        }
    }

    /* -------------------- UI -------------------- */

    return (
        <form onSubmit={handleSubmit} className={`flex flex-col p-8 gap-3 ${className}`}>

            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold text-primary">Create Account</h1>
                <p className="text-sm text-text-muted">Join us and start your nutrition journey today</p>
            </div>

            <StepIndicator step={step} />

            {step === 1 && (
                <SignUpStepOne
                    formData={formData}
                    handleChange={handleChange}
                    emailStatus={emailStatus}
                />
            )}

            {step === 2 && (
                <SignUpStepTwo email={formData.email} />
            )}

            <div className="flex flex-col flex-1 justify-end gap-3">

                {step === 1 && (
                    <>
                        {reduxError && (
                            <p className="text-xs text-red-400 text-center">{reduxError}</p>
                        )}

                        <Button
                            type="submit"
                            className="flex items-center justify-center gap-2 w-full"
                            disabled={!formValid || isCheckingEmail || loading}
                        >
                            {loading || isCheckingEmail ? (
                                <span className="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full" />
                            ) : (
                                "Create Account"
                            )}
                        </Button>

                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-px bg-border/30" />
                            <span className="text-xs text-text-muted">OR</span>
                            <div className="flex-1 h-px bg-border/30" />
                        </div>

                        <GoogleButton label="Continue with Google" />
                    </>
                )}

                <p className="text-sm text-text-muted w-full text-center">
                    Have an account?{" "}
                    <button
                        type="button"
                        onClick={onSwitchToLogin}
                        className="text-primary font-medium hover:underline"
                    >
                        Log In
                    </button>
                </p>

            </div>

        </form>
    )
}

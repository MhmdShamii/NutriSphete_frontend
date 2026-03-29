import { useEffect, useRef, useState } from "react"
import { checkEmail } from "../../services/auth/authApi"
import SignUpStepOne from "./SignUpStepOne"
import SignUpStepTwo from "./SignUpStepTwo"
import StepIndicator from "./StepIndicator"
import { useDispatch } from "react-redux"
import { register } from "../../features/auth/authSlice"
import type { AppDispatch } from "../../app/store"
import HSpacer from "../ui/HSpacer"
import GoogleButton from "../ui/GoogleButton"
import Button from "../ui/Button"

type SignupFormProps = {
    onSwitchToLogin: () => void
    className: string
}

type FormData = {
    email: string
    password: string
    password_confirmation: string
}

export default function SignupForm({ onSwitchToLogin, className }: SignupFormProps) {

    const [step, setStep] = useState(1)

    const [formData, setFormData] = useState<FormData>({
        email: "",
        password: "",
        password_confirmation: ""
    })

    const [debouncedEmail, setDebouncedEmail] = useState("")
    const [emailStatus, setEmailStatus] = useState<"idle" | "checking" | "exists" | "available">("idle")

    const controllerRef = useRef<AbortController | null>(null)
    const dispatch = useDispatch<AppDispatch>()

    /* -------------------- VALIDATION -------------------- */

    const emailValid = /^\S+@\S+\.\S+$/.test(formData.email)

    const passwordValid =
        formData.password.length >= 8 &&
        formData.password === formData.password_confirmation

    const formValid = emailValid && emailStatus === "available" && passwordValid
    const isCheckingEmail = emailStatus === "checking"

    /* -------------------- FORM HANDLING -------------------- */

    function handleChange(field: keyof FormData, value: string) {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    /* -------------------- EMAIL DEBOUNCE -------------------- */

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedEmail(formData.email), 500)
        return () => clearTimeout(timer)
    }, [formData.email])

    /* -------------------- EMAIL CHECK -------------------- */

    useEffect(() => {

        if (!debouncedEmail || !emailValid) {
            setEmailStatus("idle")
            return
        }

        const check = async () => {

            if (controllerRef.current) controllerRef.current.abort()

            const controller = new AbortController()
            controllerRef.current = controller

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
            await dispatch(register({
                email: formData.email,
                password: formData.password,
                password_confirmation: formData.password_confirmation
            })).unwrap()
            setStep(2)
        } catch (error) {
            console.error(error)
        }
    }

    /* -------------------- UI -------------------- */

    return (
        <form onSubmit={handleSubmit} className={`flex flex-col p-8 gap-3 ${className}`}>

            {/* HEADER */}
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold text-primary">
                    Create Account
                </h1>
                <p className="text-sm text-text-muted">
                    Join us and start your nutrition journey today
                </p>
            </div>

            {/* STEP INDICATOR */}
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

            {/* ---------------- FOOTER ---------------- */}

            <div className="flex flex-col flex-1 justify-end gap-3">

                {step === 1 && (
                    <Button
                        type="submit"
                        className="flex items-center justify-center gap-2 w-full"
                        disabled={!formValid || isCheckingEmail}
                    >
                        {isCheckingEmail ? (
                            <span className="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full" />
                        ) : (
                            "Create Account"
                        )}
                    </Button>
                )}

                {step === 1 && (
                    <>
                        <HSpacer height={4} />
                        <GoogleButton label="Continue With Google" />
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

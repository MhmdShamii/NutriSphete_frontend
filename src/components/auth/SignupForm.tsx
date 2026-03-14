import { useEffect, useRef, useState } from "react"
import { checkEmail } from "../../services/auth/authApi"
import SignUpStepOne from "./SignUpStepOne"
import SignUpStepTwo from "./SignUpStepTwo"
import SignUpStepThree from "./SignUpStepThree"
import StepIndicator from "./StepIndicator"
import Navigation from "./Navigation"

type Country = {
    name: string
    "alpha-3": string
    phone_code: string
}

type SignupFormProps = {
    onSwitchToLogin: () => void
}

type FormData = {
    first_name: string
    last_name: string
    email: string
    phone: string
    country_code: string
    password: string
    password_confirmation: string
    profile_image: File | null
    accept_terms: boolean
    accept_privacy: boolean
}

export default function SignupForm({ onSwitchToLogin }: SignupFormProps) {

    const [step, setStep] = useState(1)

    const [country, setCountry] = useState<Country | null>(null)
    const [phoneCountry, setPhoneCountry] = useState<Country | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    const [formData, setFormData] = useState<FormData>({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        country_code: "",
        password: "",
        password_confirmation: "",
        profile_image: null,
        accept_terms: false,
        accept_privacy: false
    })

    const [debouncedEmail, setDebouncedEmail] = useState("")
    const [emailStatus, setEmailStatus] = useState<
        "idle" | "checking" | "exists" | "available"
    >("idle")

    const controllerRef = useRef<AbortController | null>(null)

    /* -------------------- VALIDATION -------------------- */

    const emailValid = /^\S+@\S+\.\S+$/.test(formData.email)

    const passwordValid =
        formData.password.length >= 8 &&
        formData.password === formData.password_confirmation

    const step1Valid =
        emailValid &&
        emailStatus === "available" &&
        passwordValid

    const step2Valid =
        formData.first_name.trim() !== "" &&
        formData.last_name.trim() !== ""

    const step3Valid =
        Boolean(country) &&
        Boolean(formData.phone) &&
        formData.accept_terms &&
        formData.accept_privacy

    const isCheckingEmail = emailStatus === "checking"

    /* -------------------- FORM HANDLING -------------------- */

    function handleChange(field: keyof FormData, value: any) {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    /* -------------------- EMAIL DEBOUNCE -------------------- */

    useEffect(() => {

        const timer = setTimeout(() => {
            setDebouncedEmail(formData.email)
        }, 500)

        return () => clearTimeout(timer)

    }, [formData.email])

    /* -------------------- EMAIL CHECK -------------------- */

    useEffect(() => {

        if (!debouncedEmail || !emailValid) {
            setEmailStatus("idle")
            return
        }

        const check = async () => {

            if (controllerRef.current) {
                controllerRef.current.abort()
            }

            const controller = new AbortController()
            controllerRef.current = controller

            try {

                setEmailStatus("checking")

                const result = await checkEmail(debouncedEmail, controller.signal)

                if (!result) return

                if (result.existing_user) {
                    setEmailStatus("exists")
                } else {
                    setEmailStatus("available")
                }

            } catch {
                setEmailStatus("idle")
            }
        }

        check()

    }, [debouncedEmail])

    /* -------------------- IMAGE -------------------- */

    function handleImageUpload(file: File | null) {

        if (!file) return

        handleChange("profile_image", file)
        setImagePreview(URL.createObjectURL(file))
    }

    /* -------------------- NAVIGATION -------------------- */

    function nextStep() {

        if (step === 1 && !step1Valid) return
        if (step === 2 && !step2Valid) return

        if (step < 3) setStep(prev => prev + 1)
    }

    function prevStep() {
        if (step > 1) setStep(prev => prev - 1)
    }

    function handleSubmit(e: React.FormEvent) {

        e.preventDefault()

        if (!step3Valid) return

        const payload = {
            ...formData,
            phone_country: phoneCountry?.["alpha-3"]
        }

        console.log(payload)
    }

    /* -------------------- UI -------------------- */

    return (
        <form onSubmit={handleSubmit} className="w-1/2 flex flex-col p-8 gap-5">

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
                <SignUpStepOne formData={formData} handleChange={handleChange} emailStatus={emailStatus} />
            )}
            {step === 2 && (
                <SignUpStepTwo formData={formData} handleChange={handleChange} imagePreview={imagePreview} handleImageUpload={handleImageUpload} />
            )}
            {step === 3 && (
                <SignUpStepThree
                    formData={formData} handleChange={handleChange} country={country} setCountry={setCountry} phoneCountry={phoneCountry}
                    setPhoneCountry={setPhoneCountry}
                />
            )}

            {/* ---------------- NAVIGATION ---------------- */}

            <div className="flex flex-col flex-1 justify-end items-end gap-3">

                <Navigation
                    step={step}
                    nextStep={nextStep}
                    prevStep={prevStep}
                    step1Valid={step1Valid}
                    step2Valid={step2Valid}
                    step3Valid={step3Valid}
                    isCheckingEmail={isCheckingEmail}
                />

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
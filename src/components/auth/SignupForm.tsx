import { useEffect, useRef, useState } from "react"
import Button from "../ui/Button"
import Input from "../ui/Input"
import PasswordInput from "../ui/PasswordInput"
import ImageUpload from "../ui/ImageUpload"
import CountryDropdown from "../ui/CountryDropdown"
import PhoneInput from "../ui/PhoneInput"
import ArrowRightIcon from "@mui/icons-material/ArrowRight"
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft"
import { checkEmail } from "../../services/auth/authApi"
import SignUpStepOne from "./SignUpStepOne"
import SignUpStepTwo from "./SignUpStepTwo"

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
        country &&
        formData.phone &&
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
            <div className="flex gap-2 mb-2">
                {[1, 2, 3].map(s => (
                    <div
                        key={s}
                        className={`h-1 flex-1 rounded ${step >= s ? "bg-primary" : "bg-border/30"
                            }`}
                    />
                ))}
            </div>

            {/* ---------------- STEP 1 ---------------- */}
            {step === 1 && (
                <SignUpStepOne formData={formData} handleChange={handleChange} emailStatus={emailStatus} />
            )}

            {/* ---------------- STEP 2 ---------------- */}
            {step === 2 && (
                <SignUpStepTwo
                    formData={formData}
                    handleChange={handleChange}
                    imagePreview={imagePreview}
                    handleImageUpload={handleImageUpload}
                />
            )}

            {/* ---------------- STEP 3 ---------------- */}
            {step === 3 && (
                <>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm text-text-muted">
                            Country
                        </label>

                        <CountryDropdown
                            show="name"
                            selected={country}
                            onSelect={(c) => {
                                setCountry(c)
                                handleChange("country_code", c["alpha-3"])

                                if (!phoneCountry) {
                                    setPhoneCountry(c)
                                }
                            }}
                        />
                    </div>

                    <PhoneInput
                        phone={formData.phone}
                        country={phoneCountry}
                        onPhoneChange={(v) => handleChange("phone", v)}
                        onCountryChange={(c) => setPhoneCountry(c)}
                    />

                    {/* TERMS */}

                    <label className="flex items-center gap-3 text-sm text-text-muted cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.accept_terms}
                            onChange={(e) => handleChange("accept_terms", e.target.checked)}
                            className="w-4 h-4 accent-primary"
                        />
                        I agree to the
                        <span className="text-white font-bold"> Terms of Service </span>
                    </label>

                    <label className="flex items-center gap-3 text-sm text-text-muted cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.accept_privacy}
                            onChange={(e) => handleChange("accept_privacy", e.target.checked)}
                            className="w-4 h-4 accent-primary"
                        />
                        I agree to the
                        <span className="text-white font-bold"> Privacy Policy </span>
                    </label>
                </>
            )}

            {/* ---------------- NAVIGATION ---------------- */}

            <div className="flex flex-col flex-1 justify-end items-end gap-3">

                <div className="flex w-full gap-4">

                    {step > 1 && (
                        <button
                            type="button"
                            onClick={prevStep}
                            className="flex items-center justify-center gap-2 flex-1 border border-border/30 text-text-muted rounded-lg p-3 hover:border-white/50"
                        >
                            <ArrowLeftIcon sx={{ fontSize: 20 }} />
                            Back
                        </button>
                    )}

                    {step < 3 ? (
                        <Button
                            type="button"
                            className="flex items-center justify-center gap-2 flex-1"
                            onClick={nextStep}
                            disabled={
                                step === 1
                                    ? !step1Valid || isCheckingEmail
                                    : step === 2
                                        ? !step2Valid
                                        : false
                            }
                        >
                            {isCheckingEmail ? (
                                <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                            ) : (
                                <>
                                    Proceed
                                    <ArrowRightIcon sx={{ fontSize: 20 }} />
                                </>
                            )}
                        </Button>
                    ) : (
                        <Button
                            type="submit"
                            className="flex items-center justify-center gap-2 flex-1"
                            disabled={!step3Valid}
                        >
                            Sign Up
                        </Button>
                    )}

                </div>

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
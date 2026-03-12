import { useState } from "react"
import Button from "../ui/Button"
import Input from "../ui/Input"
import PasswordInput from "../ui/PasswordInput"
import ArrowRightIcon from "@mui/icons-material/ArrowRight"
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft"
import UploadIcon from "@mui/icons-material/Upload"
import ImageUpload from "../ui/ImageUpload"

type SignupFormProps = {
    onSwitchToLogin: () => void
}

type FormData = {
    first_name: string
    last_name: string
    email: string
    phone: string
    country_code: number
    password: string
    password_confirmation: string
    profile_image: File | null
    accept_terms: boolean
    accept_privacy: boolean
}

function SignupForm({ onSwitchToLogin }: SignupFormProps) {

    const [step, setStep] = useState(1)
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    const [formData, setFormData] = useState<FormData>({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        country_code: 0,
        password: "",
        password_confirmation: "",
        profile_image: null,
        accept_terms: false,
        accept_privacy: false
    })

    function handleChange(field: keyof FormData, value: string | number) {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    function handleImageUpload(file: File | null) {
        if (!file) return

        setFormData(prev => ({
            ...prev,
            profile_image: file
        }))

        setImagePreview(URL.createObjectURL(file))
    }

    function nextStep() {
        if (step < 3) setStep(prev => prev + 1)
    }

    function prevStep() {
        if (step > 1) setStep(prev => prev - 1)
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        console.log(formData)
    }

    return (
        <form onSubmit={handleSubmit} className="w-1/2 flex flex-col p-8 gap-6">

            {/* Header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold text-primary">Create Account</h1>
                <p className="text-sm text-text-muted">
                    Join us and start your nutrition journey today
                </p>
            </div>

            {/* Step Indicator */}
            <div className="flex gap-2 mb-2">
                {[1, 2, 3].map((s) => (
                    <div key={s} className={`h-1 flex-1 rounded ${step >= s ? "bg-primary" : "bg-border/30"}`} />
                ))}
            </div>

            {/* STEP 1 */}
            {step === 1 && (
                <>
                    <Input
                        id="email"
                        label="Email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={(value) => handleChange("email", value)}
                    />

                    <PasswordInput
                        id="password"
                        label="Password"
                        placeholder="********"
                        value={formData.password}
                        onChange={(value) => handleChange("password", value)}
                    />

                    <PasswordInput
                        id="password_confirmation"
                        label="Confirm Password"
                        placeholder="********"
                        value={formData.password_confirmation}
                        onChange={(value) => handleChange("password_confirmation", value)}
                    />
                </>
            )}

            {/* STEP 2 */}
            {step === 2 && (
                <>
                    <ImageUpload
                        label="Profile Picture"
                        value={imagePreview}
                        boxClassName="h-16"
                        previewClassName="h-10 w-10 rounded-full"
                        onChange={handleImageUpload}
                    />

                    <Input
                        id="firstName"
                        label="First Name"
                        placeholder="Enter your first name"
                        value={formData.first_name}
                        onChange={(value) => handleChange("first_name", value)}
                    />

                    <Input
                        id="lastName"
                        label="Last Name"
                        placeholder="Enter your last name"
                        value={formData.last_name}
                        onChange={(value) => handleChange("last_name", value)}
                    />
                </>
            )}

            {/* STEP 3 */}
            {step === 3 && (
                <div className="flex flex-col gap-4">

                    <Input
                        id="phone"
                        label="Phone Number"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={formData.phone}
                        onChange={(value) => handleChange("phone", value)}
                    />

                    <Input
                        id="countryCode"
                        label="Country Code"
                        type="number"
                        placeholder="+1"
                        value={String(formData.country_code)}
                        onChange={(value) => handleChange("country_code", Number(value))}
                    />

                    {/* Custom Checkbox */}
                    <label className="flex items-center gap-3 text-sm text-text-muted cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.accept_terms}
                            onChange={(e) =>
                                setFormData(prev => ({
                                    ...prev,
                                    accept_terms: e.target.checked
                                }))
                            }
                            className="w-4 h-4 accent-primary cursor-pointer"
                        />
                        I agree to the <span className="text-primary">Terms of Service</span>
                    </label>

                    <label className="flex items-center gap-3 text-sm text-text-muted cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.accept_privacy}
                            onChange={(e) =>
                                setFormData(prev => ({
                                    ...prev,
                                    accept_privacy: e.target.checked
                                }))
                            }
                            className="w-4 h-4 accent-primary cursor-pointer"
                        />
                        I agree to the <span className="text-primary">Privacy Policy</span>
                    </label>

                </div>
            )}

            <div className="flex flex-col flex-1 justify-end gap-3">

                {/* Navigation Buttons */}
                <div className="flex w-full gap-4">

                    {step > 1 && (
                        <button
                            type="button"
                            onClick={prevStep}
                            className="flex items-center justify-center gap-2 flex-1 border border-border/30 text-text-muted rounded-lg p-3 transition-all hover:border-primary hover:text-primary"
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
                        >
                            Proceed
                            <ArrowRightIcon sx={{ fontSize: 20 }} />
                        </Button>
                    ) : (
                        <Button
                            type="submit"
                            className="flex items-center justify-center gap-2 flex-1"
                            disabled={!formData.accept_terms || !formData.accept_privacy}
                        >
                            Sign Up
                        </Button>
                    )}

                </div>

                {/* Switch to login */}
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

export default SignupForm
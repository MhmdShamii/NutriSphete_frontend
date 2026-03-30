import Input from "../ui/Input";
import PasswordInput from "../ui/PasswordInput";

type formDataType = {
    email: string
    password: string
    password_confirmation: string
}

type SignUpStepOneProps = {
    formData: formDataType
    handleChange: (field: keyof formDataType, value: string) => void
    emailStatus: "idle" | "checking" | "exists" | "available"
}

export default function SignUpStepOne({ formData, handleChange, emailStatus }: SignUpStepOneProps) {

    const message =
        emailStatus === "checking" ? "Checking availability..." :
        emailStatus === "exists"   ? "An account with this email already exists" :
        emailStatus === "available" ? "Email is available" :
        ""

    return <>
        <Input
            id="email"
            label="Email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(v) => handleChange("email", v)}
            error={emailStatus === "exists"}
            success={emailStatus === "available"}
            message={message}
        />

        <PasswordInput
            id="password"
            label="Password"
            placeholder="Min. 8 characters"
            value={formData.password}
            onChange={(v) => handleChange("password", v)}
        />

        <PasswordInput
            id="password_confirmation"
            label="Confirm Password"
            placeholder="Repeat your password"
            value={formData.password_confirmation}
            onChange={(v) => handleChange("password_confirmation", v)}
        />
    </>
}

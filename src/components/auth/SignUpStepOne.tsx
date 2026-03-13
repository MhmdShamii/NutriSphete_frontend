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

    return <>
        <Input
            id="email"
            label="Email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(v) => handleChange("email", v)}
            error={emailStatus === "exists"}
            message={
                emailStatus === "checking"
                    ? "Checking email..."
                    : emailStatus === "exists"
                        ? "Email already exists"
                        : emailStatus === "available"
                            ? "Email available"
                            : ""
            }
        />

        <PasswordInput
            id="password"
            label="Password"
            placeholder="********"
            value={formData.password}
            onChange={(v) => handleChange("password", v)}
        />

        <PasswordInput
            id="password_confirmation"
            label="Confirm Password"
            placeholder="********"
            value={formData.password_confirmation}
            onChange={(v) => handleChange("password_confirmation", v)}
        />
    </>
}
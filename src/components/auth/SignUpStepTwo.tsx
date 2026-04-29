import { useState } from "react"
import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined"
import { resendVerificationEmail } from "../../services/auth/authApi"

type SignUpStepTwoProps = {
    email: string
}

export default function SignUpStepTwo({ email }: SignUpStepTwoProps) {

    const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle")

    async function handleResend() {
        setStatus("sending")
        try {
            await resendVerificationEmail(email)
            setStatus("sent")
        } catch {
            setStatus("error")
        }
    }

    return (
        <div className="flex flex-col items-center gap-4 py-6 text-center">

            <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center">
                <MarkEmailReadOutlinedIcon sx={{ fontSize: 32 }} className="text-primary" />
            </div>

            <div className="flex flex-col gap-1">
                <h2 className="text-xl font-semibold text-text">Check your email</h2>
                <p className="text-sm text-text-muted">
                    We sent a verification link to
                </p>
                <p className="text-sm font-medium text-primary">{email}</p>
            </div>

            <p className="text-xs text-text-muted">
                Click the link in the email to activate your account. Check your spam folder if you don't see it.
            </p>

            <button
                type="button"
                onClick={handleResend}
                disabled={status === "sending" || status === "sent"}
                className={`text-sm font-medium transition-colors ${status === "sent"
                    ? "text-primary cursor-default"
                    : status === "error"
                        ? "text-red-400 hover:underline"
                        : "text-primary hover:underline"
                    } ${status === "sending" ? "opacity-50 cursor-not-allowed" : ""}`}
            >
                {status === "sending" && (
                    <span className="inline-flex items-center gap-2">
                        <span className="animate-spin w-3 h-3 border-2 border-primary border-t-transparent rounded-full" />
                        Sending...
                    </span>
                )}
                {status === "sent" && "Email sent!"}
                {status === "error" && "Failed to send — try again"}
                {status === "idle" && "Resend verification email"}
            </button>

        </div>
    )
}

import GoogleIcon from "@mui/icons-material/Google"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { googleLogin } from "../../features/auth/authSlice"
import type { AppDispatch } from "../../app/store"
import { getPostLoginRoute } from "../../features/auth/types"
import { useRef, useState } from "react"

type GoogleButtonProps = {
    label: string
}

export default function GoogleButton({ label }: GoogleButtonProps) {

    const dispatch = useDispatch<AppDispatch>()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const initializedRef = useRef(false)

    function handleClick() {
        const google = (window as any).google
        if (!google?.accounts?.id) {
            setError("Google sign-in is not available")
            return
        }

        setError(null)

        if (!initializedRef.current) {
            google.accounts.id.initialize({
                client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                callback: async ({ credential }: { credential: string }) => {
                    setLoading(true)
                    try {
                        const { user } = await dispatch(googleLogin(credential)).unwrap()
                        navigate(getPostLoginRoute(user.onboarding_step))
                    } catch (err: unknown) {
                        const msg = (err as { message?: string })?.message
                        setError(msg || "Google sign-in failed")
                    } finally {
                        setLoading(false)
                    }
                },
                cancel_on_tap_outside: true,
            })
            initializedRef.current = true
        }

        google.accounts.id.prompt((notification: any) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                // One Tap suppressed — fall back to the account picker popup
                google.accounts.id.renderButton(
                    document.getElementById("google-btn-trigger"),
                    { theme: "outline", size: "large" }
                )
                document.getElementById("google-btn-trigger")
                    ?.querySelector("div[role='button']")
                    ?.dispatchEvent(new MouseEvent("click", { bubbles: true }))
            }
        })
    }

    return (
        <div className="flex flex-col gap-1">
            {/* Hidden anchor used as fallback render target */}
            <div id="google-btn-trigger" className="hidden" />

            <button
                type="button"
                disabled={loading}
                className={`flex items-center justify-center gap-2 border border-border/40 text-text rounded-lg py-3 px-4 hover:bg-surface hover:border-primary/60 cursor-pointer transition-colors ${loading ? "opacity-50 pointer-events-none" : ""}`}
                onClick={handleClick}
            >
                {loading ? (
                    <span className="animate-spin w-4 h-4 border-2 border-text border-t-transparent rounded-full" />
                ) : (
                    <GoogleIcon fontSize="small" />
                )}
                {label}
            </button>

            {error && (
                <p className="text-xs text-red-400 text-center">{error}</p>
            )}
        </div>
    )
}

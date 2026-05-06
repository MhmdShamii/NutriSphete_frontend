import GoogleIcon from "@mui/icons-material/Google"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { googleLogin } from "../../features/auth/authSlice"
import type { AppDispatch } from "../../app/store"
import { getPostLoginRoute } from "../../features/auth/types"
import { useEffect, useRef, useState } from "react"
import { useToast } from "../../context/ToastContext"

type GoogleButtonProps = {
    label: string
}

export default function GoogleButton({ label }: GoogleButtonProps) {

    const dispatch = useDispatch<AppDispatch>()
    const navigate = useNavigate()
    const { showError } = useToast()
    const [loading, setLoading] = useState(false)
    const [hovered, setHovered] = useState(false)
    const overlayRef = useRef<HTMLDivElement>(null)
    const renderedRef = useRef(false)

    useEffect(() => {
        let attempts = 0
        const interval = setInterval(() => {
            const gis = (window as any).google?.accounts?.id
            if (gis && overlayRef.current && !renderedRef.current) {
                clearInterval(interval)

                gis.initialize({
                    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                    callback: async ({ credential }: { credential: string }) => {
                        setLoading(true)
                        try {
                            const { user } = await dispatch(googleLogin(credential)).unwrap()
                            navigate(getPostLoginRoute(user.onboarding_step))
                        } catch (err: unknown) {
                            const msg = (err as { message?: string })?.message
                            showError(msg || "Google sign-in failed")
                        } finally {
                            setLoading(false)
                        }
                    },
                })

                gis.renderButton(overlayRef.current, {
                    theme: "outline",
                    size: "large",
                    width: overlayRef.current.offsetWidth || 400,
                })
                renderedRef.current = true
            }
            if (++attempts >= 30) clearInterval(interval)
        }, 100)

        return () => clearInterval(interval)
    }, [dispatch, navigate])

    return (
        <div className="relative w-full">
                {/* Custom styled button — visual only, not interactive */}
                <button
                    type="button"
                    disabled={loading}
                    className={`pointer-events-none flex items-center justify-center gap-2 w-full border border-border/40 text-text rounded-lg py-3 px-4 transition-colors
                        ${hovered && !loading ? "bg-surface border-primary/60" : ""}
                        ${loading ? "opacity-50" : ""}`}
                >
                    {loading ? (
                        <span className="animate-spin w-4 h-4 border-2 border-text border-t-transparent rounded-full" />
                    ) : (
                        <GoogleIcon fontSize="small" />
                    )}
                    {label}
                </button>

                {/* Transparent Google button overlay — handles actual auth, invisible to user */}
                <div
                    ref={overlayRef}
                    className="absolute inset-0 overflow-hidden rounded-lg cursor-pointer"
                    style={{ opacity: 0.01 }}
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                />
        </div>
    )
}

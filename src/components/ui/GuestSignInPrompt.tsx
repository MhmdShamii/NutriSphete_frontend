import { useNavigate } from "react-router-dom"
import Button from "./Button"

export default function GuestSignInPrompt({ onClose }: { onClose: () => void }) {
    const navigate = useNavigate()
    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
            onClick={onClose}
        >
            <div
                className="w-full max-w-sm rounded-3xl p-6 flex flex-col gap-5"
                style={{ background: "var(--surface)", border: "1px solid var(--glass-border)" }}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex flex-col gap-1.5 text-center">
                    <h2 className="text-lg font-bold text-text">Sign in to NutriSphere</h2>
                    <p className="text-sm text-text-muted">Like, comment, log meals and follow other users.</p>
                </div>
                <div className="flex flex-col gap-2">
                    <Button onClick={() => navigate("/auth")} className="w-full">Sign in</Button>
                    <button
                        onClick={onClose}
                        className="text-sm text-text-muted hover:text-text transition-colors py-2"
                    >
                        Continue browsing
                    </button>
                </div>
            </div>
        </div>
    )
}

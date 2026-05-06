import { useEffect, useRef, useState } from "react"
import CloseRoundedIcon from "@mui/icons-material/CloseRounded"
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded"
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded"
import WarningRoundedIcon from "@mui/icons-material/WarningRounded"
import InfoRoundedIcon from "@mui/icons-material/InfoRounded"
import type { ToastItem } from "../../context/ToastContext"

const CONFIG = {
    error: {
        icon: <ErrorRoundedIcon sx={{ fontSize: 20 }} />,
        bar: "#f87171",
        iconColor: "#f87171",
        bg: "rgba(248,113,113,0.08)",
        border: "rgba(248,113,113,0.25)",
    },
    success: {
        icon: <CheckCircleRoundedIcon sx={{ fontSize: 20 }} />,
        bar: "#7FFA88",
        iconColor: "#7FFA88",
        bg: "rgba(127,250,136,0.08)",
        border: "rgba(127,250,136,0.25)",
    },
    warning: {
        icon: <WarningRoundedIcon sx={{ fontSize: 20 }} />,
        bar: "#fbbf24",
        iconColor: "#fbbf24",
        bg: "rgba(251,191,36,0.08)",
        border: "rgba(251,191,36,0.25)",
    },
    info: {
        icon: <InfoRoundedIcon sx={{ fontSize: 20 }} />,
        bar: "#60a5fa",
        iconColor: "#60a5fa",
        bg: "rgba(96,165,250,0.08)",
        border: "rgba(96,165,250,0.25)",
    },
}

interface Props {
    toast: ToastItem
    onDismiss: (id: string) => void
}

export default function Toast({ toast, onDismiss }: Props) {
    const { id, type, message, duration } = toast
    const cfg = CONFIG[type]
    const [progress, setProgress] = useState(100)
    const [exiting, setExiting] = useState(false)
    const startRef = useRef<number>(Date.now())
    const rafRef = useRef<number>(0)

    function dismiss() {
        setExiting(true)
        setTimeout(() => onDismiss(id), 320)
    }

    useEffect(() => {
        startRef.current = Date.now()

        function tick() {
            const elapsed = Date.now() - startRef.current
            const pct = Math.max(0, 100 - (elapsed / duration) * 100)
            setProgress(pct)
            if (pct > 0) {
                rafRef.current = requestAnimationFrame(tick)
            } else {
                dismiss()
            }
        }

        rafRef.current = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(rafRef.current)
    }, [duration])

    return (
        <div
            role="alert"
            style={{
                background: "var(--glass-bg)",
                border: `1px solid ${cfg.border}`,
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                animation: exiting
                    ? "toast-exit 0.32s cubic-bezier(0.4,0,1,1) forwards"
                    : "toast-enter 0.38s cubic-bezier(0.16,1,0.3,1) forwards",
            }}
            className="relative w-full max-w-sm overflow-hidden rounded-2xl shadow-2xl"
        >
            {/* Body */}
            <div className="flex items-start gap-3 px-4 py-3.5">
                <span className="flex-shrink-0 mt-0.5" style={{ color: cfg.iconColor }}>
                    {cfg.icon}
                </span>
                <p className="flex-1 text-sm font-medium text-text leading-snug break-words">{message}</p>
                <button
                    onClick={dismiss}
                    className="flex-shrink-0 text-text-muted hover:text-text transition-colors -mr-1 -mt-0.5 p-1 rounded-lg hover:bg-white/10"
                    aria-label="Dismiss"
                >
                    <CloseRoundedIcon sx={{ fontSize: 16 }} />
                </button>
            </div>

            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: cfg.border }}>
                <div
                    className="h-full transition-none"
                    style={{ width: `${progress}%`, background: cfg.bar, boxShadow: `0 0 6px ${cfg.bar}` }}
                />
            </div>
        </div>
    )
}

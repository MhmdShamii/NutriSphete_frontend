import { createContext, useCallback, useContext, useRef, useState } from "react"
import ToastContainer from "../components/ui/ToastContainer"

export type ToastType = "error" | "success" | "warning" | "info"

export interface ToastItem {
    id: string
    type: ToastType
    message: string
    duration: number
}

interface ToastContextValue {
    showToast: (type: ToastType, message: string, duration?: number) => void
    showError: (message: string) => void
    showSuccess: (message: string) => void
    showWarning: (message: string) => void
    dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([])
    const counterRef = useRef(0)

    const dismiss = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    const showToast = useCallback((type: ToastType, message: string, duration = 4000) => {
        const id = `toast-${++counterRef.current}`
        setToasts(prev => {
            // Keep at most 4 toasts at once
            const trimmed = prev.length >= 4 ? prev.slice(1) : prev
            return [...trimmed, { id, type, message, duration }]
        })
    }, [])

    const showError   = useCallback((msg: string) => showToast("error",   msg), [showToast])
    const showSuccess = useCallback((msg: string) => showToast("success", msg), [showToast])
    const showWarning = useCallback((msg: string) => showToast("warning", msg), [showToast])

    return (
        <ToastContext.Provider value={{ showToast, showError, showSuccess, showWarning, dismiss }}>
            {children}
            <ToastContainer toasts={toasts} onDismiss={dismiss} />
        </ToastContext.Provider>
    )
}

export function useToast(): ToastContextValue {
    const ctx = useContext(ToastContext)
    if (!ctx) throw new Error("useToast must be used within ToastProvider")
    return ctx
}

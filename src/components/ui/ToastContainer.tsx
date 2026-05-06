import { createPortal } from "react-dom"
import Toast from "./Toast"
import type { ToastItem } from "../../context/ToastContext"

interface Props {
    toasts: ToastItem[]
    onDismiss: (id: string) => void
}

export default function ToastContainer({ toasts, onDismiss }: Props) {
    if (toasts.length === 0) return null

    return createPortal(
        <div
            className="fixed z-[9999] flex flex-col gap-2 pointer-events-none
                bottom-4 left-4 right-4
                sm:bottom-auto sm:top-4 sm:left-auto sm:right-4 sm:w-80"
            aria-live="polite"
        >
            {toasts.map(toast => (
                <div key={toast.id} className="pointer-events-auto">
                    <Toast toast={toast} onDismiss={onDismiss} />
                </div>
            ))}
        </div>,
        document.body
    )
}

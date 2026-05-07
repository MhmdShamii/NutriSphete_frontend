export default function ConfirmDialog({
    title,
    message,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    onConfirm,
    onCancel,
    dangerous = false,
}: {
    title: string
    message?: string
    confirmLabel?: string
    cancelLabel?: string
    onConfirm: () => void
    onCancel: () => void
    dangerous?: boolean
}) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
            onClick={onCancel}
        >
            <div
                className="w-full max-w-xs rounded-3xl p-6 flex flex-col gap-5"
                style={{ background: "var(--surface)", border: "1px solid var(--glass-border)" }}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex flex-col gap-1.5 text-center">
                    <h2 className="text-base font-bold text-text">{title}</h2>
                    {message && <p className="text-sm text-text-muted">{message}</p>}
                </div>
                <div className="flex flex-col gap-2">
                    <button
                        onClick={onConfirm}
                        className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95
                            ${dangerous
                                ? "bg-red-500/90 text-white hover:bg-red-500"
                                : "hover:opacity-90"}`}
                        style={dangerous ? undefined : { background: "var(--btn-bg)", color: "var(--btn-text)" }}
                    >
                        {confirmLabel}
                    </button>
                    <button
                        onClick={onCancel}
                        className="text-sm text-text-muted hover:text-text transition-colors py-2"
                    >
                        {cancelLabel}
                    </button>
                </div>
            </div>
        </div>
    )
}

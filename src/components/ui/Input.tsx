type InputProps = {
    label?: string
    type?: string
    placeholder?: string
    id: string
    value?: string | number
    onChange?: (value: string) => void
    className?: string
    error?: boolean
    success?: boolean
    message?: string
}

function Input({
    label,
    type = "text",
    placeholder,
    id,
    value,
    onChange,
    className = "",
    error = false,
    success = false,
    message
}: InputProps) {
    return (
        <div className="flex flex-col gap-2">
            {label && (
                <label htmlFor={id} className="text-sm text-text-muted">
                    {label}
                </label>
            )}

            <div className="flex flex-col gap-1">
                <input
                    id={id}
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange && onChange(e.target.value)}
                    className={`
                        bg-surface border rounded-lg p-3 outline-none w-full transition-all duration-300
                        ${error
                            ? "border-red-400 focus:border-red-400 focus:shadow-[0_0_10px_rgba(239,68,68,0.35)]"
                            : success
                                ? "border-primary/60 focus:border-primary focus:shadow-[0_0_12px_rgba(127,250,136,0.35)]"
                                : "border-border/30 focus:border-primary/60 focus:shadow-[0_0_12px_rgba(127,250,136,0.35)]"
                        }
                        ${className}
                    `}
                />

                {message && (
                    <p className={`text-xs ${error ? "text-red-400" : success ? "text-primary" : "text-text-muted"}`}>
                        {message}
                    </p>
                )}
            </div>
        </div>
    )
}

export default Input

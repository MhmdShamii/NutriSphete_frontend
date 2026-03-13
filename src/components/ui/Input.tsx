type InputProps = {
    label?: string
    type?: string
    placeholder?: string
    id: string
    value?: string | number
    onChange?: (value: string) => void
    className?: string

    error?: boolean
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
    message
}: InputProps) {
    return (
        <div className="flex flex-col gap-2">
            {label && (
                <label htmlFor={id} className="text-sm text-text-muted">
                    {label}
                </label>
            )}

            <input
                id={id}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange && onChange(e.target.value)}
                className={`
        bg-surface border rounded-lg p-3 outline-none w-full transition-all duration-300
        
        ${error
                        ? "border-red-400 focus:border-red-400 focus:shadow-[0_0_10px_rgba(239,68,68,0.35) text-sm]"
                        : "border-border/30 focus:border-primary/60 focus:shadow-[0_0_12px_rgba(127,250,136,0.35)]"
                    }
        
        ${className}
        `}
            />

            {error && (
                <p
                    className={`text-sm ${error ? "text-red-400" : "text-text-muted"
                        }`}
                >
                    {message}
                </p>
            )}
        </div>
    )
}

export default Input
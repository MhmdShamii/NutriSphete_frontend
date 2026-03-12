type InputProps = {
    label: string
    type?: string
    placeholder?: string
    id: string
    onChange?: (value: string) => void
    value?: string | number
}

function Input({ label, type = "text", placeholder, id, onChange, value }: InputProps) {
    return (
        <div className="flex flex-col gap-2">
            <label htmlFor={id} className="text-sm text-text-muted">
                {label}
            </label>

            <input
                id={id}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange && onChange(e.target.value)}
                className="bg-surface border border-border/30 rounded-lg p-3 outline-none w-full transition-all duration-300 
        focus:border-primary/60 
        focus:shadow-[0_0_12px_rgba(127,250,136,0.35)]"
            />
        </div>
    )
}

export default Input
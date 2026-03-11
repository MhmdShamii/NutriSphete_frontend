type InputProps = {
    label: string
    type?: string
    placeholder?: string
    id: string
}

function Input({ label, type = "text", placeholder, id }: InputProps) {
    return (
        <div className="flex flex-col gap-2">
            <label htmlFor={id} className="text-sm text-text-muted">
                {label}
            </label>

            <input
                id={id}
                type={type}
                placeholder={placeholder}
                className="bg-surface border border-border/30 rounded-lg p-3 outline-none w-full transition-all duration-300 
        focus:border-primary/60 
        focus:shadow-[0_0_12px_rgba(127,250,136,0.35)]"
            />
        </div>
    )
}

export default Input
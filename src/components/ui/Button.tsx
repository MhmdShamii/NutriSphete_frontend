type ButtonProps = {
    children: React.ReactNode
    type?: "button" | "submit"
    className?: string
    onClick?: () => void
    disabled?: boolean
}

function Button({ children, type = "button", className, onClick, disabled }: ButtonProps) {
    return (
        <button
            type={type}
            className={`bg-primary text-black font-semibold p-3 rounded-lg cursor-pointer transition-all duration-300
      hover:bg-primary-hover
      hover:shadow-[0_0_18px_rgba(127,250,136,0.45)]
      active:scale-[0.98] ${className || ''} ${disabled ? "pointer-events-none bg-primary/50 " : ""}`}
            onClick={onClick}
        >
            {children}
        </button>
    )
}

export default Button
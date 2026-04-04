type Props = {
    step: number
    total: number
    title: string
    subtitle: string
}

export default function StepHeader({ step, total, title, subtitle }: Props) {
    return (
        <div className="flex flex-col gap-4">
            {/* Progress dots */}
            <div className="flex items-center gap-2">
                {Array.from({ length: total }).map((_, i) => (
                    <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            i < step ? "bg-primary" : "bg-border/30"
                        }`}
                    />
                ))}
            </div>

            <div className="flex flex-col gap-1">
                <p className="text-xs text-text-muted">Step {step} of {total}</p>
                <h1 className="text-2xl font-bold text-primary">{title}</h1>
                <p className="text-sm text-text-muted">{subtitle}</p>
            </div>
        </div>
    )
}

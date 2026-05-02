type ComingSoonProps = {
    title: string
    description?: string
}

export default function ComingSoon({ title, description }: ComingSoonProps) {
    return (
        <div className="h-full flex items-center justify-center p-6">
            <div
                className="relative w-full max-w-sm rounded-3xl p-8 flex flex-col items-center gap-5 overflow-hidden text-center"
                style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", backdropFilter: "blur(20px)" }}
            >
                {/* Glow blob */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-32 bg-primary/20 blur-3xl rounded-full pointer-events-none" />

                {/* Pulse ring */}
                <div className="relative flex items-center justify-center">
                    <div
                        className="absolute w-20 h-20 rounded-full animate-ping opacity-20"
                        style={{ background: "var(--primary)" }}
                    />
                    <div
                        className="relative w-16 h-16 rounded-full flex items-center justify-center text-3xl"
                        style={{ background: "rgba(127,250,136,0.12)", border: "1px solid rgba(127,250,136,0.3)" }}
                    >
                        🚧
                    </div>
                </div>

                <div className="flex flex-col gap-2 relative z-10">
                    <h2 className="text-xl font-bold text-text">{title}</h2>
                    <p className="text-sm text-text-muted leading-relaxed">
                        {description ?? "We're working hard to bring this to you. Check back soon!"}
                    </p>
                </div>

                {/* Coming soon badge */}
                <div
                    className="relative z-10 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide"
                    style={{
                        color: "var(--primary)",
                        background: "rgba(127,250,136,0.1)",
                        border: "1px solid rgba(127,250,136,0.3)",
                    }}
                >
                    Coming Soon
                </div>
            </div>
        </div>
    )
}

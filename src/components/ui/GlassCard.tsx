
export default function GlassCard({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div
            className={`backdrop-blur-3xl shadow-xl flex ${className || ""}`}
            style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}
        >
            {children}
        </div>
    )
}

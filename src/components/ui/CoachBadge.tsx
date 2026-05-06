export default function CoachBadge({ size = 14 }: { size?: number }) {
    return (
        <span
            title="Verified Coach"
            className="inline-flex items-center justify-center rounded-full flex-shrink-0"
            style={{ width: size, height: size, background: "var(--primary)" }}
        >
            <svg width={size * 0.64} height={size * 0.64} viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </span>
    )
}

import LazyImage from "./LazyImage"

const PALETTE = ["#7FFA88", "#4F9CF9", "#FFC107", "#FF6B9D", "#a78bfa"]

function initials(name: string) {
    return name.trim().split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?"
}

function color(name: string) {
    return PALETTE[(name.charCodeAt(0) || 0) % PALETTE.length]
}

interface AvatarProps {
    src?: string | null
    name: string
    size?: number
    onClick?: (e: React.MouseEvent) => void
    className?: string
    ring?: string
}

export default function Avatar({ src, name, size = 36, onClick, className = "", ring }: AvatarProps) {
    const c = color(name)
    const init = initials(name)

    const wrapperStyle: React.CSSProperties = {
        width: size,
        height: size,
        borderRadius: "50%",
        flexShrink: 0,
        position: "relative",
        overflow: "hidden",
        cursor: onClick ? "pointer" : undefined,
        ...(ring ? { boxShadow: `0 0 0 2px ${ring}` } : {}),
    }

    const fallback = (
        <div style={{
            position: "absolute", inset: 0, display: "flex",
            alignItems: "center", justifyContent: "center",
            background: `${c}20`, border: `1.5px solid ${c}50`,
            borderRadius: "50%",
        }}>
            <span style={{ fontSize: size * 0.36, fontWeight: 700, color: c }}>{init}</span>
        </div>
    )

    return (
        <div style={wrapperStyle} className={className} onClick={onClick}>
            {src ? (
                <LazyImage
                    src={src}
                    alt={name}
                    fallback={fallback}
                    className="w-full h-full object-cover"
                />
            ) : fallback}
        </div>
    )
}

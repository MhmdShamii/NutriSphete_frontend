
export default function HSpacer({ height = 16 }: { height?: number }) {
    return (
        <div className="flex items-center gap-2" style={{ marginTop: `${height}px`, marginBottom: `${height}px` }}>
            <div className="flex-1 h-px bg-border"></div>
            <span className="text-gray-600 text-sm font-medium">OR</span>
            <div className="flex-1 h-px bg-border"></div>
        </div>
    )
}
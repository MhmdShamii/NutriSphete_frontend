import { useState } from "react"

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    fallback?: React.ReactNode
    shimmerClassName?: string
}

export default function LazyImage({
    fallback,
    shimmerClassName,
    className,
    onLoad,
    onError,
    ...props
}: LazyImageProps) {
    const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading")

    return (
        <span className="contents">
            {status !== "loaded" && (
                <span
                    className={`absolute inset-0 ${status === "error" ? "" : "overflow-hidden"} ${shimmerClassName ?? ""}`}
                    aria-hidden
                >
                    {status === "loading" && (
                        <>
                            <span className="absolute inset-0 bg-white/5" />
                            <span
                                className="absolute inset-0 -translate-x-full animate-shimmer"
                                style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.07),transparent)" }}
                            />
                        </>
                    )}
                    {status === "error" && fallback}
                </span>
            )}
            <img
                {...props}
                className={`${className ?? ""} transition-opacity duration-300 ${status === "loaded" ? "opacity-100" : "opacity-0"}`}
                onLoad={e => { setStatus("loaded"); onLoad?.(e) }}
                onError={e => { setStatus("error"); onError?.(e) }}
            />
        </span>
    )
}

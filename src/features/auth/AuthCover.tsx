import { useEffect, useState } from "react"
const logo = "/logo-64.png"
import coverImage from "../../assets/coverImage.png"
import nutriSphereSvg from "../../assets/NUTRISPHERE.svg"
import LazyImage from "../../components/ui/LazyImage"


const messages = [
    "Log meals instantly and track calories with precision.",
    "AI-powered nutrition insights tailored to your goals.",
    "Monitor your progress and stay consistent every day.",
    "Share meals, discover recipes, and learn from the community.",
]

type props = {
    className?: string
}

export default function AuthCover({ className = "" }: props) {
    const [index, setIndex] = useState(0)
    const [nextIndex, setNextIndex] = useState(1)
    const [phase, setPhase] = useState("idle") // "idle" | "fading"
    const [coverLoaded, setCoverLoaded] = useState(false)

    useEffect(() => {
        const img = new Image()
        img.src = coverImage
        img.onload = () => setCoverLoaded(true)
        img.onerror = () => setCoverLoaded(true) // show something even on error
    }, [])

    useEffect(() => {
        const interval = setInterval(() => {
            setPhase("fading")
            setTimeout(() => {
                setIndex(prev => (prev + 1) % messages.length)
                setNextIndex(prev => (prev + 1) % messages.length)
                setPhase("idle")
            }, 600)
        }, 4000)

        return () => clearInterval(interval)
    }, [])

    return (
        <div
            className={`w-1/2 h-full rounded-2xl p-2 flex items-end relative overflow-hidden ${className}`}
            style={{ border: "1px solid var(--glass-border)" }}
        >
            {/* Shimmer while cover loads */}
            {!coverLoaded && (
                <div className="absolute inset-0 overflow-hidden bg-white/5">
                    <div className="absolute inset-0 -translate-x-full animate-shimmer"
                        style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.07),transparent)" }} />
                </div>
            )}

            {/* Cover image fades in once loaded */}
            <div
                className="absolute inset-0 bg-center bg-cover transition-opacity duration-700"
                style={{ backgroundImage: `url(${coverImage})`, opacity: coverLoaded ? 1 : 0 }}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent rounded-2xl" />
            <div
                className="relative w-full h-[90px] bg-black/10 backdrop-blur-sm rounded-xl p-3 flex flex-col gap-2"
                style={{ border: "1px solid var(--glass-border)" }}
            >
                <div className="flex gap-2 items-center">
                    <div className="relative w-[30px] h-[30px] rounded-md overflow-hidden flex-shrink-0">
                        <LazyImage src={logo} alt="NutriSphere logo" className="h-full w-full object-cover rounded-md" />
                    </div>
                    <img src={nutriSphereSvg} alt="NutriSphere" className="hidden sm:block h-3 w-auto" />
                    {/* <p className="text-white font-semibold">NutriSphere</p> */}
                </div>

                <div className="relative text-text-muted text-xs leading-relaxed h-[32px] overflow-hidden">
                    {/* Current message — fades out */}
                    <p
                        className="absolute transition-opacity duration-500"
                        style={{ opacity: phase === "fading" ? 0 : 1 }}
                    >
                        {messages[index]}
                    </p>

                    {/* Next message — fades in */}
                    <p
                        className="absolute transition-opacity duration-500"
                        style={{ opacity: phase === "fading" ? 1 : 0 }}
                    >
                        {messages[nextIndex]}
                    </p>
                </div>
            </div>
        </div>
    )
}
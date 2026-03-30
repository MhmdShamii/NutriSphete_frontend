import { useEffect, useState } from "react"
import logo from "../../assets/logo.png"
import coverImage from "../../assets/coverImage.png"

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

    useEffect(() => {
        const interval = setInterval(() => {
            // Step 1: fade out current, fade in next
            setPhase("fading")

            // Step 2: after fade completes, swap and reset
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
            className={`w-1/2 h-full bg-center bg-cover rounded-2xl p-2 flex items-end relative ${className}`}
            style={{ backgroundImage: `url(${coverImage})`, border: "1px solid var(--glass-border)" }}
        >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent rounded-2xl" />
            <div
                className="relative w-full h-[90px] bg-black/10 backdrop-blur-sm rounded-xl p-3 flex flex-col gap-2"
                style={{ border: "1px solid var(--glass-border)" }}
            >
                <div className="flex gap-2 items-center">
                    <img src={logo} alt="NutriSphere logo" className="h-[30px] w-[30px] rounded-md" />
                    <p className="text-white font-semibold">NutriSphere</p>
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
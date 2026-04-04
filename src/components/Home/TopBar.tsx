import GlassCard from "../ui/GlassCard"
import Logo from "../ui/Logo"


export default function TopBar() {
    return (
        <GlassCard className="w-full h-16 p-4 rounded-2xl text-text-muted flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Logo />
                <h1><span className="text-primary font-bold">Nutri</span>Sphere</h1>
            </div>
        </GlassCard>
    )
}
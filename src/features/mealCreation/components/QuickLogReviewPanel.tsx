import CheckRoundedIcon from "@mui/icons-material/CheckRounded"
import EditRoundedIcon from "@mui/icons-material/EditRounded"
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded"
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded"
import FitnessCenterRoundedIcon from "@mui/icons-material/FitnessCenterRounded"
import GrainRoundedIcon from "@mui/icons-material/GrainRounded"
import WaterDropRoundedIcon from "@mui/icons-material/WaterDropRounded"
import SpaRoundedIcon from "@mui/icons-material/SpaRounded"
import type { QuickLogEntry } from "../types/meal.types"

const MACROS = [
    { key: "protein" as const, label: "Protein", unit: "g", icon: <FitnessCenterRoundedIcon sx={{ fontSize: 16 }} />, color: "#4F9CF9" },
    { key: "carbs"   as const, label: "Carbs",   unit: "g", icon: <GrainRoundedIcon sx={{ fontSize: 16 }} />,         color: "#FFC107" },
    { key: "fats"    as const, label: "Fat",      unit: "g", icon: <WaterDropRoundedIcon sx={{ fontSize: 16 }} />,    color: "#FF6B9D" },
    { key: "fiber"   as const, label: "Fiber",    unit: "g", icon: <SpaRoundedIcon sx={{ fontSize: 16 }} />,          color: "#7FFA88" },
]

const BEAM_KEYFRAMES = `
@keyframes beamspin{from{transform:translate3d(-50%,-50%,0) rotate(0deg)}to{transform:translate3d(-50%,-50%,0) rotate(360deg)}}
@keyframes beamrev{from{transform:translate3d(-50%,-50%,0) rotate(0deg)}to{transform:translate3d(-50%,-50%,0) rotate(-360deg)}}
@keyframes throb{0%,100%{opacity:.55}50%{opacity:1}}
`

function GlowCard({ children, speed = 2.8, delay = 0, rounded = "rounded-2xl", innerRounded = "rounded-[15px]" }: {
    children?: React.ReactNode
    speed?: number
    delay?: number
    rounded?: string
    innerRounded?: string
}) {
    return (
        <div
            className={`relative overflow-hidden ${rounded}`}
            style={{ padding: "2px", animation: `throb ${(speed * 0.7).toFixed(1)}s ease-in-out infinite`, animationDelay: `${delay}s` }}
        >
            <div style={{
                position: "absolute", top: "50%", left: "50%",
                width: "200%", aspectRatio: "1 / 1",
                background: "conic-gradient(from 0deg, rgba(127,250,136,0.5) 0%, rgba(127,250,136,0.8) 18%, #ffffff 27%, #7FFA88 33%, rgba(127,250,136,0.5) 48%, rgba(127,250,136,0.2) 72%, rgba(127,250,136,0.5) 100%)",
                animation: `beamspin ${speed}s linear infinite`,
                animationDelay: `${delay}s`,
                willChange: "transform", backfaceVisibility: "hidden", pointerEvents: "none",
            }} />
            <div style={{
                position: "absolute", top: "50%", left: "50%",
                width: "200%", aspectRatio: "1 / 1",
                background: "conic-gradient(from 90deg, transparent 0%, rgba(127,250,136,0.25) 22%, rgba(180,255,190,0.55) 42%, rgba(127,250,136,0.25) 62%, transparent 100%)",
                animation: `beamrev ${(speed * 1.55).toFixed(1)}s linear infinite`,
                willChange: "transform", backfaceVisibility: "hidden", pointerEvents: "none",
            }} />
            <div className={`relative h-full ${innerRounded}`} style={{ background: "var(--surface)" }}>
                {children}
            </div>
        </div>
    )
}

interface Props {
    entry: QuickLogEntry | null
    onCalculate: () => void
    onRecalculate: () => void
    onConfirm: () => void
    onDiscard: () => void
    onBack?: () => void
    isMobile?: boolean
    loading?: boolean
    error?: string | null
    submitReady: boolean
}

export default function QuickLogReviewPanel({ entry, onCalculate, onRecalculate, onConfirm, onDiscard, onBack, isMobile, loading, error, submitReady }: Props) {

    /* ── Skeleton while AI calculates ─────────────────────────── */
    if (loading && !entry) {
        return (
            <div className="flex flex-col gap-4">
                <style>{BEAM_KEYFRAMES}</style>
                <GlowCard speed={3.2}>
                    <div className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#FF6B35]/10 flex-shrink-0" />
                        <div className="flex flex-col gap-2 flex-1">
                            <div className="h-2 w-14 rounded-full bg-text-muted/10" />
                            <div className="h-6 w-24 rounded-full bg-text-muted/8" />
                        </div>
                    </div>
                </GlowCard>
                <div className="grid grid-cols-2 gap-2.5">
                    {[{ speed: 2.6, delay: 0 }, { speed: 2.2, delay: 0.35 }, { speed: 2.9, delay: 0.15 }, { speed: 2.4, delay: 0.5 }].map((cfg, i) => (
                        <GlowCard key={i} rounded="rounded-xl" innerRounded="rounded-[11px]" speed={cfg.speed} delay={cfg.delay}>
                            <div className="p-3 flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-text-muted/10 flex-shrink-0" />
                                <div className="flex flex-col gap-1.5 flex-1">
                                    <div className="h-1.5 w-10 rounded-full bg-text-muted/10" />
                                    <div className="h-4 w-12 rounded-full bg-text-muted/8" />
                                </div>
                            </div>
                        </GlowCard>
                    ))}
                </div>
            </div>
        )
    }

    /* ── Results ───────────────────────────────────────────────── */
    if (entry) {
        return (
            <div className="flex flex-col gap-4 h-full">
                <div className="relative overflow-hidden rounded-2xl border border-[#FF6B35]/20 bg-gradient-to-br from-[#FF6B35]/8 via-surface to-surface p-4 flex items-center gap-3">
                    <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-[#FF6B35]/10 blur-2xl pointer-events-none" />
                    <div className="w-10 h-10 rounded-full bg-[#FF6B35]/15 flex items-center justify-center flex-shrink-0">
                        <LocalFireDepartmentRoundedIcon sx={{ fontSize: 20 }} style={{ color: "#FF6B35" }} />
                    </div>
                    <div>
                        <p className="text-[11px] text-text-muted/70 uppercase tracking-widest font-medium">Calories</p>
                        <p className="text-2xl font-bold text-text leading-tight">
                            {Math.round(Number(entry.calories)).toLocaleString()}
                            <span className="text-sm font-normal text-text-muted ml-1">kcal</span>
                        </p>
                    </div>
                    <p className="ml-auto text-xs font-medium text-primary/70 truncate max-w-[30%]">{entry.log_name}</p>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                    {MACROS.map(({ key, label, unit, icon, color }) => (
                        <div key={key} className="rounded-xl border border-border/20 bg-surface p-3 flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}18` }}>
                                <span style={{ color }}>{icon}</span>
                            </div>
                            <div>
                                <p className="text-[10px] text-text-muted/70 uppercase tracking-wide font-medium">{label}</p>
                                <p className="text-base font-bold text-text leading-tight">
                                    {Math.round(Number(entry[key]))}
                                    <span className="text-xs font-normal text-text-muted ml-0.5">{unit}</span>
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={onRecalculate}
                    disabled={loading}
                    className="flex items-center justify-center gap-1.5 w-full p-2.5 rounded-xl border border-border/20
                        text-sm text-text-muted hover:text-primary hover:border-primary/30
                        transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none"
                >
                    <EditRoundedIcon sx={{ fontSize: 15 }} />
                    Recalculate
                </button>

                {error && <p className="text-xs text-red-400 text-center">{error}</p>}

                <div className={`flex flex-col gap-2 ${isMobile ? "mt-auto pt-1" : "mt-auto"}`}>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className={`w-full flex items-center justify-center gap-1.5 p-3 rounded-xl text-sm font-semibold transition-all duration-300
                            ${!loading
                                ? "bg-primary text-black hover:bg-primary-hover hover:shadow-[0_0_18px_rgba(127,250,136,0.45)] active:scale-[0.98]"
                                : "bg-primary/30 text-black/50 pointer-events-none"
                            }`}
                    >
                        {loading
                            ? <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                            : <><CheckRoundedIcon sx={{ fontSize: 16 }} /> Confirm &amp; Add to Log</>
                        }
                    </button>
                    <button
                        type="button"
                        onClick={onDiscard}
                        disabled={loading}
                        className="flex items-center justify-center gap-1 w-full py-1.5 text-xs text-red-400/60
                            hover:text-red-400 transition-colors duration-200 disabled:opacity-30 disabled:pointer-events-none"
                    >
                        <DeleteOutlineRoundedIcon sx={{ fontSize: 13 }} />
                        Discard
                    </button>
                </div>
            </div>
        )
    }

    /* ── Empty state ───────────────────────────────────────────── */
    return (
        <div className="flex flex-col flex-1 h-full gap-4">
            <div className="flex-1 flex flex-col items-center justify-center gap-3 opacity-40">
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-border/40 flex items-center justify-center">
                    <LocalFireDepartmentRoundedIcon sx={{ fontSize: 22 }} style={{ color: "var(--text-muted)" }} />
                </div>
                <div className="text-center">
                    <p className="text-sm text-text-muted font-medium">AI macros appear here</p>
                    <p className="text-xs text-text-muted/60 mt-1">Fill in the details &amp; ingredients first</p>
                </div>
            </div>
            {error && <p className="text-xs text-red-400 text-center">{error}</p>}
            {!isMobile && (
                <button
                    type="button"
                    onClick={onCalculate}
                    disabled={!submitReady || loading}
                    className={`w-full flex items-center justify-center gap-2 p-3 rounded-xl text-sm font-semibold transition-all duration-300
                        ${submitReady && !loading
                            ? "bg-primary text-black hover:bg-primary-hover hover:shadow-[0_0_18px_rgba(127,250,136,0.45)] active:scale-[0.98]"
                            : "bg-primary/30 text-black/50 pointer-events-none"
                        }`}
                >
                    {loading
                        ? <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        : "Calculate Macros"
                    }
                </button>
            )}
        </div>
    )
}

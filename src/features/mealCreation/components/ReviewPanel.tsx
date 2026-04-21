import { useRef, useState } from "react"
import AddPhotoAlternateRoundedIcon from "@mui/icons-material/AddPhotoAlternateRounded"
import EditRoundedIcon from "@mui/icons-material/EditRounded"
import CheckRoundedIcon from "@mui/icons-material/CheckRounded"
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded"
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded"
import FitnessCenterRoundedIcon from "@mui/icons-material/FitnessCenterRounded"
import GrainRoundedIcon from "@mui/icons-material/GrainRounded"
import WaterDropRoundedIcon from "@mui/icons-material/WaterDropRounded"
import SpaRoundedIcon from "@mui/icons-material/SpaRounded"
import type { MealDraft } from "../types/meal.types"

interface Props {
    draft: MealDraft | null
    onSubmit: () => void
    onConfirm: (image: File) => void
    onConfirmAndLog: (image: File) => void
    onDiscard: () => void
    onRecalculate?: () => void
    onEditMobile?: () => void
    onBack?: () => void
    isMobile?: boolean
    loading?: boolean
    error?: string | null
    submitReady: boolean
}

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
@keyframes floatup{0%,100%{transform:translateY(0) scale(1);opacity:.4}50%{transform:translateY(-14px) scale(1.3);opacity:.8}}
@keyframes ringpulse{0%,100%{box-shadow:0 0 0 1px rgba(127,250,136,0.2),0 0 20px rgba(127,250,136,0.08),inset 0 0 40px rgba(127,250,136,0.04)}50%{box-shadow:0 0 0 1px rgba(127,250,136,0.6),0 0 50px rgba(127,250,136,0.2),inset 0 0 80px rgba(127,250,136,0.08)}}
@keyframes dotblink{0%,80%,100%{opacity:.2}40%{opacity:1}}
`

const PARTICLES = [
    { left: "12%",  top: "22%", dur: 2.4, delay: 0    },
    { left: "78%",  top: "35%", dur: 2.9, delay: 0.5  },
    { left: "35%",  top: "58%", dur: 2.2, delay: 0.9  },
    { left: "88%",  top: "18%", dur: 3.1, delay: 0.2  },
    { left: "22%",  top: "78%", dur: 2.6, delay: 1.1  },
    { left: "62%",  top: "82%", dur: 2.8, delay: 0.7  },
    { left: "50%",  top: "12%", dur: 2.3, delay: 0.3  },
    { left: "5%",   top: "50%", dur: 3.0, delay: 1.3  },
]

function GlowCard({ children, className = "", speed = 2.8, delay = 0, rounded = "rounded-2xl", innerRounded = "rounded-[15px]", innerClass = "" }: {
    children?: React.ReactNode
    className?: string
    speed?: number
    delay?: number
    rounded?: string
    innerRounded?: string
    innerClass?: string
}) {
    return (
        <div
            className={`relative overflow-hidden ${rounded} ${className}`}
            style={{ padding: "2px", animation: `throb ${(speed * 0.7).toFixed(1)}s ease-in-out infinite`, animationDelay: `${delay}s` }}
        >
            {/* Primary clockwise wave */}
            <div style={{
                position: "absolute", top: "50%", left: "50%",
                width: "200%", aspectRatio: "1 / 1",
                background: "conic-gradient(from 0deg, rgba(127,250,136,0.5) 0%, rgba(127,250,136,0.8) 18%, #ffffff 27%, #7FFA88 33%, rgba(127,250,136,0.5) 48%, rgba(127,250,136,0.2) 72%, rgba(127,250,136,0.5) 100%)",
                animation: `beamspin ${speed}s linear infinite`,
                animationDelay: `${delay}s`,
                willChange: "transform",
                backfaceVisibility: "hidden",
                pointerEvents: "none",
            }} />
            {/* Secondary counter-clockwise wave — different speed creates interference */}
            <div style={{
                position: "absolute", top: "50%", left: "50%",
                width: "200%", aspectRatio: "1 / 1",
                background: "conic-gradient(from 90deg, transparent 0%, rgba(127,250,136,0.25) 22%, rgba(180,255,190,0.55) 42%, rgba(127,250,136,0.25) 62%, transparent 100%)",
                animation: `beamrev ${(speed * 1.55).toFixed(1)}s linear infinite`,
                willChange: "transform",
                backfaceVisibility: "hidden",
                pointerEvents: "none",
            }} />
            <div className={`relative h-full ${innerRounded} ${innerClass}`} style={{ background: "var(--surface)" }}>
                {children}
            </div>
        </div>
    )
}

export default function ReviewPanel({
    draft, onSubmit, onConfirm, onConfirmAndLog, onDiscard, onRecalculate, onEditMobile,
    onBack, isMobile, loading, error, submitReady,
}: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [dragging, setDragging] = useState(false)
    const [image, setImage] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    function handleFile(file: File | null) {
        if (!file) return
        if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) return
        if (file.size > 5 * 1024 * 1024) return
        setImage(file)
        setImagePreview(URL.createObjectURL(file))
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault()
        setDragging(false)
        handleFile(e.dataTransfer.files[0])
    }

    /* ── Skeleton while AI calculates ───────────────────────────────── */
    if (loading && !draft) {
        const skeletonCards = (
            <>
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
                    {[
                        { speed: 2.6, delay: 0    },
                        { speed: 2.2, delay: 0.35 },
                        { speed: 2.9, delay: 0.15 },
                        { speed: 2.4, delay: 0.5  },
                    ].map((cfg, i) => (
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
            </>
        )

        /* ── Mobile ── */
        if (isMobile) {
            return (
                <div className="flex flex-col gap-4 h-full">
                    <style>{BEAM_KEYFRAMES}</style>
                    <div className="flex flex-col gap-4 h-full">
                        {skeletonCards}
                        <button type="button" disabled className="flex items-center justify-center gap-1.5 w-full p-2.5 rounded-xl border border-border/20 text-sm text-text-muted opacity-40 pointer-events-none">
                            <EditRoundedIcon sx={{ fontSize: 15 }} /> Edit Ingredients
                        </button>
                        <div className="flex flex-col gap-1.5">
                            <p className="text-sm text-text-muted">Meal photo <span className="text-red-400">*</span></p>
                            <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-border/30 opacity-50" style={isMobile ? { minHeight: "80px" } : { aspectRatio: "16/9" }}>
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                        <AddPhotoAlternateRoundedIcon sx={{ fontSize: 24 }} style={{ color: "var(--primary)" }} />
                                    </div>
                                    <p className="text-sm font-medium text-text">Upload meal photo</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 mt-auto">
                            <button type="button" disabled className="w-full flex items-center justify-center gap-1.5 p-3 rounded-xl text-sm font-semibold bg-primary/30 text-black/50 pointer-events-none">
                                <CheckRoundedIcon sx={{ fontSize: 16 }} /> Confirm &amp; Log
                            </button>
                            <div className="flex gap-2">
                                <button type="button" disabled className="flex-1 flex items-center justify-center gap-1.5 p-3 rounded-xl text-sm font-medium border border-border/20 text-text-muted/40 pointer-events-none">
                                    <CheckRoundedIcon sx={{ fontSize: 15 }} /> Confirm only
                                </button>
                                <button type="button" disabled className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-red-400/30 rounded-xl border border-red-400/10 pointer-events-none">
                                    <DeleteOutlineRoundedIcon sx={{ fontSize: 13 }} /> Discard meal
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }

        /* ── Desktop ── */
        return (
            <div className="flex flex-col gap-4">
                <style>{BEAM_KEYFRAMES}</style>
                {skeletonCards}
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-5 h-full">
            {draft ? (
                /* ── Post-submission: macros + image + actions ─────── */
                <div className="flex flex-col gap-4 h-full">
                    {/* Calories highlight */}
                    <div className="relative overflow-hidden rounded-2xl border border-[#FF6B35]/20 bg-gradient-to-br from-[#FF6B35]/8 via-surface to-surface p-4 flex items-center gap-3">
                        <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-[#FF6B35]/10 blur-2xl pointer-events-none" />
                        <div className="w-10 h-10 rounded-full bg-[#FF6B35]/15 flex items-center justify-center flex-shrink-0">
                            <LocalFireDepartmentRoundedIcon sx={{ fontSize: 20 }} style={{ color: "#FF6B35" }} />
                        </div>
                        <div>
                            <p className="text-[11px] text-text-muted/70 uppercase tracking-widest font-medium">Calories</p>
                            <p className="text-2xl font-bold text-text leading-tight">
                                {draft.macros.calories.toLocaleString()}
                                <span className="text-sm font-normal text-text-muted ml-1">kcal</span>
                            </p>
                        </div>
                    </div>

                    {/* Macro grid */}
                    <div className="grid grid-cols-2 gap-2.5">
                        {MACROS.map(({ key, label, unit, icon, color }) => (
                            <div key={key} className="rounded-xl border border-border/20 bg-surface p-3 flex items-center gap-2.5">
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: `${color}18` }}
                                >
                                    <span style={{ color }}>{icon}</span>
                                </div>
                                <div>
                                    <p className="text-[10px] text-text-muted/70 uppercase tracking-wide font-medium">{label}</p>
                                    <p className="text-base font-bold text-text leading-tight">
                                        {draft.macros[key]}
                                        <span className="text-xs font-normal text-text-muted ml-0.5">{unit}</span>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Recalculate (desktop) / Edit Ingredients (mobile) */}
                    <button
                        type="button"
                        onClick={isMobile ? onEditMobile : onRecalculate}
                        disabled={loading}
                        className="flex items-center justify-center gap-1.5 w-full p-2.5 rounded-xl border border-border/20
                            text-sm text-text-muted hover:text-primary hover:border-primary/30
                            transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none"
                    >
                        <EditRoundedIcon sx={{ fontSize: 15 }} />
                        {isMobile ? "Edit Ingredients" : "Recalculate"}
                    </button>

                    {/* Image upload */}
                    <div className={`flex flex-col gap-1.5 ${isMobile ? "flex-1 min-h-0" : ""}`}>
                        <p className="text-sm text-text-muted">
                            Meal photo <span className="text-red-400">*</span>
                        </p>
                        <div
                            className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 border-2 border-dashed
                                ${isMobile ? "h-full" : ""}
                                ${dragging
                                    ? "border-primary/70 bg-primary/5 shadow-[0_0_20px_rgba(127,250,136,0.2)]"
                                    : imagePreview
                                        ? "border-transparent"
                                        : "border-border/30 hover:border-primary/40"
                                }`}
                            style={isMobile ? undefined : { aspectRatio: "16/9" }}
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={e => { e.preventDefault(); setDragging(true) }}
                            onDragLeave={() => setDragging(false)}
                            onDrop={handleDrop}
                        >
                            {imagePreview ? (
                                <>
                                    <img src={imagePreview} alt="Meal" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                                        <EditRoundedIcon sx={{ fontSize: 18 }} className="text-white" />
                                        <span className="text-white text-sm font-medium">Change photo</span>
                                    </div>
                                </>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <AddPhotoAlternateRoundedIcon sx={{ fontSize: 20 }} style={{ color: "var(--primary)" }} />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-text">Upload meal photo</p>
                                        {!isMobile && <p className="text-[11px] text-text-muted mt-0.5">JPG, PNG or WebP · max 5 MB</p>}
                                    </div>
                                    {dragging && <p className="text-xs text-primary font-medium">Drop it here</p>}
                                </div>
                            )}
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            className="hidden"
                            onChange={e => handleFile(e.target.files?.[0] ?? null)}
                        />
                    </div>

                    {/* Actions */}
                    <div className={`flex flex-col gap-2 ${isMobile ? "mt-auto pt-1" : "mt-1"}`}>
                        <button
                            type="button"
                            onClick={() => image && onConfirmAndLog(image)}
                            disabled={!image || loading}
                            className={`w-full flex items-center justify-center gap-1.5 p-3 rounded-xl text-sm font-semibold transition-all duration-300
                                ${image && !loading
                                    ? "bg-primary text-black hover:bg-primary-hover hover:shadow-[0_0_18px_rgba(127,250,136,0.45)] active:scale-[0.98]"
                                    : "bg-primary/30 text-black/50 pointer-events-none"
                                }`}
                        >
                            {loading
                                ? <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                : <><CheckRoundedIcon sx={{ fontSize: 16 }} /> Confirm &amp; Log</>
                            }
                        </button>
                        <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => image && onConfirm(image)}
                            disabled={!image || loading}
                            className={`flex-1 flex items-center justify-center gap-1.5 p-3 rounded-xl text-sm font-medium border transition-all duration-200
                                ${image && !loading
                                    ? "border-border/40 text-text-muted hover:border-primary/40 hover:text-primary"
                                    : "border-border/20 text-text-muted/40 pointer-events-none"
                                }`}
                        >
                            <CheckRoundedIcon sx={{ fontSize: 15 }} /> Confirm only
                        </button>
                        <button
                            type="button"
                            onClick={onDiscard}
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-red-400/60 rounded-xl border border-red-400/20
                                hover:text-red-400 hover:border-red-400/40 transition-colors duration-200 disabled:opacity-30 disabled:pointer-events-none"
                        >
                            <DeleteOutlineRoundedIcon sx={{ fontSize: 13 }} />
                            Discard meal
                        </button>
                        </div>
                    </div>
                </div>
            ) : (
                /* ── Pre-submission: empty state + create button ───── */
                <div className="flex flex-col flex-1 gap-4">
                    <div className="flex-1 flex flex-col items-center justify-center gap-3 opacity-40">
                        <div className="w-12 h-12 rounded-full border-2 border-dashed border-border/40 flex items-center justify-center">
                            <LocalFireDepartmentRoundedIcon sx={{ fontSize: 22 }} style={{ color: "var(--text-muted)" }} />
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-text-muted font-medium">AI macros appear here</p>
                            <p className="text-xs text-text-muted/60 mt-1">Fill in your meal details &amp; ingredients first</p>
                        </div>
                    </div>

                    {!isMobile && (
                        <div className="flex flex-col gap-2.5">
                            {error && <p className="text-xs text-red-400 text-center">{error}</p>}
                            <button
                                type="button"
                                onClick={onSubmit}
                                disabled={!submitReady || loading}
                                className={`w-full flex items-center justify-center gap-2 p-3 rounded-xl text-sm font-semibold transition-all duration-300
                                    ${submitReady && !loading
                                        ? "bg-primary text-black hover:bg-primary-hover hover:shadow-[0_0_18px_rgba(127,250,136,0.45)] active:scale-[0.98]"
                                        : "bg-primary/30 text-black/50 pointer-events-none"
                                    }`}
                            >
                                {loading
                                    ? <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                    : "Create Meal"
                                }
                            </button>
                        </div>
                    )}

                    {isMobile && error && (
                        <p className="text-xs text-red-400 text-center">{error}</p>
                    )}
                </div>
            )}
        </div>
    )
}

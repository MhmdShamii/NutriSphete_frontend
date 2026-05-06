import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { completeTargets, fetchMe, clearError } from "../../auth/authSlice"
import type { AppDispatch, RootState } from "../../../app/store"
import { useToast } from "../../../context/ToastContext"
import type { TargetsPayload } from "../../auth/types"
import Button from "../../../components/ui/Button"
import StepHeader from "../components/StepHeader"
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded"
import FitnessCenterRoundedIcon from "@mui/icons-material/FitnessCenterRounded"
import GrainRoundedIcon from "@mui/icons-material/GrainRounded"
import WaterDropRoundedIcon from "@mui/icons-material/WaterDropRounded"

function buildSteps(hasBodyFat: boolean) {
    return [
        { label: "Analyzing your body metrics", duration: 900 },
        { label: hasBodyFat ? "Running Katch-McArdle formula" : "Running Mifflin-St Jeor formula", duration: 800 },
        { label: "Applying activity multiplier", duration: 700 },
        { label: "Optimizing macro distribution", duration: 900 },
        { label: "Personalizing your nutrition plan", duration: 800 },
    ]
}

function AiLoader({ onDone, hasBodyFat }: { onDone: () => void; hasBodyFat: boolean }) {
    const steps = buildSteps(hasBodyFat)
    const [activeIndex, setActiveIndex] = useState(0)
    const [doneIndexes, setDoneIndexes] = useState<number[]>([])
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        let step = 0
        let elapsed = 0
        const total = steps.reduce((s, a) => s + a.duration, 0)

        function runStep() {
            if (step >= steps.length) { onDone(); return }
            setActiveIndex(step)

            const stepStart = elapsed
            const stepDuration = steps[step].duration
            const tick = 30

            const interval = setInterval(() => {
                elapsed += tick
                setProgress(Math.min((elapsed / total) * 100, 100))
            }, tick)

            setTimeout(() => {
                clearInterval(interval)
                setDoneIndexes(prev => [...prev, step])
                elapsed = stepStart + stepDuration
                step++
                runStep()
            }, stepDuration)
        }

        runStep()
    }, [])

    return (
        <div className="flex flex-col gap-5 py-2">
            {/* Banner */}
            <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-surface to-surface p-5 flex items-center gap-4">
                {/* Glow blobs */}
                <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-primary/20 blur-2xl pointer-events-none" />
                <div className="absolute -bottom-6 -right-6 w-20 h-20 rounded-full bg-primary/10 blur-2xl pointer-events-none" />

                {/* Orb */}
                <div className="relative flex-shrink-0 w-14 h-14 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" style={{ animationDuration: "1.6s" }} />
                    <div className="absolute inset-1.5 rounded-full bg-primary/25 animate-pulse" />
                    <div className="relative w-9 h-9 rounded-full bg-primary shadow-[0_0_24px_rgba(127,250,136,0.75)] flex items-center justify-center">
                        <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
                            <path d="M7 1C7 1 10 4 10 7C10 10 7 13 7 13" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
                            <path d="M7 1C7 1 4 4 4 7C4 10 7 13 7 13" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
                            <path d="M1 7H13" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </div>
                </div>

                <div className="flex flex-col gap-0.5 relative">
                    <p className="text-[10px] font-semibold text-primary/70 uppercase tracking-widest">NutriSphere AI</p>
                    <p className="text-base font-semibold text-text leading-tight">Generating your plan</p>
                    {hasBodyFat && (
                        <p className="text-[11px] text-text-muted/60 mt-0.5">Using Katch-McArdle for higher accuracy</p>
                    )}
                </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-[3px] bg-border/20 rounded-full overflow-hidden">
                <div
                    className="h-full bg-primary rounded-full transition-all duration-75 shadow-[0_0_8px_rgba(127,250,136,0.6)]"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Step list */}
            <div className="flex flex-col gap-2.5">
                {steps.map((step, i) => {
                    const isDone = doneIndexes.includes(i)
                    const isActive = activeIndex === i && !isDone

                    return (
                        <div key={i} className={`flex items-center gap-3 text-sm transition-all duration-300
                            ${isDone ? "text-primary" : isActive ? "text-text" : "text-text-muted/30"}
                        `}>
                            <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                                {isDone ? (
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                        <path d="M2.5 7L5.5 10L11.5 4" stroke="#7FFA88" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                ) : isActive ? (
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                ) : (
                                    <span className="w-1.5 h-1.5 rounded-full bg-border/30" />
                                )}
                            </div>
                            {step.label}
                            {isActive && <span className="text-primary animate-pulse ml-0.5">...</span>}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default function TargetsStep() {
    const dispatch = useDispatch<AppDispatch>()
    const navigate = useNavigate()
    const location = useLocation()
    const hasBodyFat = !!(location.state as { hasBodyFat?: boolean } | null)?.hasBodyFat
    const { showError } = useToast()
    const { loading, error, user } = useSelector((state: RootState) => state.auth)

    useEffect(() => {
        if (error) {
            showError(error)
            dispatch(clearError())
        }
    }, [error])

    const [aiDone, setAiDone] = useState(false)
    const [form, setForm] = useState<TargetsPayload>({
        daily_calorie_target: user?.profile?.daily_calorie_target ?? 2000,
        daily_protein_g: user?.profile?.daily_protein_g ?? 150,
        daily_carbs_g: user?.profile?.daily_carbs_g ?? 200,
        daily_fat_g: user?.profile?.daily_fat_g ?? 65,
    })

    // Once AI loader finishes, update form with latest profile values
    function handleAiDone() {
        if (user?.profile) {
            setForm({
                daily_calorie_target: user.profile.daily_calorie_target ?? 2000,
                daily_protein_g: user.profile.daily_protein_g ?? 150,
                daily_carbs_g: user.profile.daily_carbs_g ?? 200,
                daily_fat_g: user.profile.daily_fat_g ?? 65,
            })
        }
        setAiDone(true)
    }

    function set<K extends keyof TargetsPayload>(field: K, value: string) {
        const num = Number(value.replace(/\D/g, ""))
        setForm(p => ({ ...p, [field]: num }))
    }

    const valid = form.daily_calorie_target >= 500 && form.daily_calorie_target <= 10000

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!valid) return
        try {
            await dispatch(completeTargets(form)).unwrap()
            await dispatch(fetchMe()).unwrap()
            navigate("/onboarding/health-conditions", { replace: true })
        } catch { }
    }

    if (!aiDone) return <AiLoader onDone={handleAiDone} hasBodyFat={hasBodyFat} />

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <StepHeader step={3} total={4} title="Your targets" subtitle={
                user?.profile?.daily_calorie_target
                    ? "Calculated for you — tweak if you'd like"
                    : "Set your daily nutrition targets"
            } />

            <div className="flex flex-col gap-4">

                {/* Calories */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm text-text-muted flex items-center gap-1.5">
                        <LocalFireDepartmentRoundedIcon sx={{ fontSize: 16 }} style={{ color: "#FF6B35" }} />
                        Daily calories (kcal)
                    </label>
                    <input
                        id="calories"
                        placeholder="2000"
                        value={form.daily_calorie_target || ""}
                        onChange={(e) => set("daily_calorie_target", e.target.value)}
                        className={`bg-surface border rounded-lg p-3 outline-none w-full text-text transition-all duration-300 text-sm
                            ${form.daily_calorie_target > 0 && (form.daily_calorie_target < 500 || form.daily_calorie_target > 10000)
                                ? "border-red-400 focus:border-red-400 focus:shadow-[0_0_10px_rgba(239,68,68,0.35)]"
                                : "border-border/30 focus:border-primary/60 focus:shadow-[0_0_12px_rgba(127,250,136,0.35)]"
                            }`}
                    />
                    {form.daily_calorie_target > 0 && (form.daily_calorie_target < 500 || form.daily_calorie_target > 10000) && (
                        <p className="text-xs text-red-400">Must be between 500–10,000</p>
                    )}
                </div>

                {/* Macros row */}
                <div className="flex gap-3">
                    {([
                        { id: "protein", field: "daily_protein_g", label: "Protein (g)", placeholder: "150", icon: <FitnessCenterRoundedIcon sx={{ fontSize: 14 }} />, color: "#4F9CF9" },
                        { id: "carbs", field: "daily_carbs_g", label: "Carbs (g)", placeholder: "200", icon: <GrainRoundedIcon sx={{ fontSize: 14 }} />, color: "#FFC107" },
                        { id: "fat", field: "daily_fat_g", label: "Fat (g)", placeholder: "65", icon: <WaterDropRoundedIcon sx={{ fontSize: 14 }} />, color: "#FF6B9D" },
                    ] as const).map(({ id, field, label, placeholder, icon, color }) => (
                        <div key={id} className="flex flex-col gap-2 flex-1">
                            <label className="text-sm text-text-muted flex items-center gap-1.5">
                                <span style={{ color }}>{icon}</span>
                                {label}
                            </label>
                            <input
                                id={id}
                                placeholder={placeholder}
                                value={form[field] || ""}
                                onChange={(e) => set(field, e.target.value)}
                                className="bg-surface border border-border/30 rounded-lg p-3 outline-none w-full text-text
                                    text-sm transition-all duration-300
                                    focus:border-primary/60 focus:shadow-[0_0_12px_rgba(127,250,136,0.35)]"
                            />
                        </div>
                    ))}
                </div>

            </div>

            <Button type="submit" disabled={!valid || loading} className="flex items-center justify-center gap-2 w-full">
                {loading
                    ? <span className="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full" />
                    : "Let's go!"}
            </Button>
        </form>
    )
}

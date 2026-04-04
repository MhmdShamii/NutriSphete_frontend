import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { completeTargets, fetchMe } from "../../auth/authSlice"
import type { AppDispatch, RootState } from "../../../app/store"
import type { TargetsPayload } from "../../auth/types"
import Input from "../../../components/ui/Input"
import Button from "../../../components/ui/Button"
import StepHeader from "../components/StepHeader"
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded"
import FitnessCenterRoundedIcon from "@mui/icons-material/FitnessCenterRounded"
import GrainRoundedIcon from "@mui/icons-material/GrainRounded"
import WaterDropRoundedIcon from "@mui/icons-material/WaterDropRounded"

const AI_STEPS = [
    { label: "Analyzing your body metrics",       duration: 900 },
    { label: "Running Mifflin-St Jeor formula",   duration: 800 },
    { label: "Applying activity multiplier",      duration: 700 },
    { label: "Optimizing macro distribution",     duration: 900 },
    { label: "Personalizing your nutrition plan", duration: 800 },
]

function AiLoader({ onDone }: { onDone: () => void }) {
    const [activeIndex, setActiveIndex] = useState(0)
    const [doneIndexes, setDoneIndexes] = useState<number[]>([])
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        let step = 0
        let elapsed = 0
        const total = AI_STEPS.reduce((s, a) => s + a.duration, 0)

        function runStep() {
            if (step >= AI_STEPS.length) { onDone(); return }
            setActiveIndex(step)

            const stepStart = elapsed
            const stepDuration = AI_STEPS[step].duration
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
        <div className="flex flex-col gap-6 py-2">
            {/* Pulsing orb */}
            <div className="flex justify-center">
                <div className="relative w-16 h-16 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                    <div className="absolute inset-2 rounded-full bg-primary/30 animate-pulse" />
                    <div className="relative w-8 h-8 rounded-full bg-primary shadow-[0_0_20px_rgba(127,250,136,0.7)]
                        flex items-center justify-center">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M7 1C7 1 10 4 10 7C10 10 7 13 7 13" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
                            <path d="M7 1C7 1 4 4 4 7C4 10 7 13 7 13" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
                            <path d="M1 7H13" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-1 text-center">
                <p className="text-xs text-text-muted/60 uppercase tracking-widest">NutriSphere AI</p>
                <p className="text-lg font-semibold text-text">Generating your plan</p>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1 bg-border/20 rounded-full overflow-hidden">
                <div
                    className="h-full bg-primary rounded-full transition-all duration-75 shadow-[0_0_8px_rgba(127,250,136,0.6)]"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Step list */}
            <div className="flex flex-col gap-2">
                {AI_STEPS.map((step, i) => {
                    const isDone   = doneIndexes.includes(i)
                    const isActive = activeIndex === i && !isDone

                    return (
                        <div key={i} className={`flex items-center gap-3 text-sm transition-all duration-300
                            ${isDone ? "text-primary" : isActive ? "text-text" : "text-text-muted/30"}
                        `}>
                            <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                                {isDone ? (
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                        <path d="M2.5 7L5.5 10L11.5 4" stroke="#7FFA88" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                ) : isActive ? (
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                ) : (
                                    <span className="w-1.5 h-1.5 rounded-full bg-border/30" />
                                )}
                            </div>
                            {step.label}
                            {isActive && <span className="text-primary animate-pulse">...</span>}
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
    const { loading, error, user } = useSelector((state: RootState) => state.auth)

    const [aiDone, setAiDone] = useState(false)
    const [form, setForm] = useState<TargetsPayload>({
        daily_calorie_target: user?.profile?.daily_calorie_target ?? 2000,
        daily_protein_g:      user?.profile?.daily_protein_g      ?? 150,
        daily_carbs_g:        user?.profile?.daily_carbs_g         ?? 200,
        daily_fat_g:          user?.profile?.daily_fat_g           ?? 65,
    })

    // Once AI loader finishes, update form with latest profile values
    function handleAiDone() {
        if (user?.profile) {
            setForm({
                daily_calorie_target: user.profile.daily_calorie_target ?? 2000,
                daily_protein_g:      user.profile.daily_protein_g      ?? 150,
                daily_carbs_g:        user.profile.daily_carbs_g         ?? 200,
                daily_fat_g:          user.profile.daily_fat_g           ?? 65,
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
            navigate("/", { replace: true })
        } catch {}
    }

    if (!aiDone) return <AiLoader onDone={handleAiDone} />

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <StepHeader step={3} total={3} title="Your targets" subtitle={
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
                        { id: "protein", field: "daily_protein_g",  label: "Protein (g)", placeholder: "150", icon: <FitnessCenterRoundedIcon sx={{ fontSize: 14 }} />, color: "#4F9CF9" },
                        { id: "carbs",   field: "daily_carbs_g",    label: "Carbs (g)",   placeholder: "200", icon: <GrainRoundedIcon sx={{ fontSize: 14 }} />,       color: "#FFC107" },
                        { id: "fat",     field: "daily_fat_g",      label: "Fat (g)",     placeholder: "65",  icon: <WaterDropRoundedIcon sx={{ fontSize: 14 }} />,   color: "#FF6B9D" },
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

            {error && <p className="text-xs text-red-400 text-center">{error}</p>}

            <Button type="submit" disabled={!valid || loading} className="flex items-center justify-center gap-2 w-full">
                {loading
                    ? <span className="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full" />
                    : "Let's go!"}
            </Button>
        </form>
    )
}

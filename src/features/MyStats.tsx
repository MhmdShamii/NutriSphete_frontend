import { useState, useEffect, useMemo, useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import { updateTargets } from "./auth/authSlice"
import type { AppDispatch, RootState } from "../app/store"
import { useNavigate } from "react-router-dom"
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded"
import FitnessCenterRoundedIcon from "@mui/icons-material/FitnessCenterRounded"
import GrainRoundedIcon from "@mui/icons-material/GrainRounded"
import WaterDropRoundedIcon from "@mui/icons-material/WaterDropRounded"
import WhatshotRoundedIcon from "@mui/icons-material/WhatshotRounded"
import RestaurantRoundedIcon from "@mui/icons-material/RestaurantRounded"
import EditRoundedIcon from "@mui/icons-material/EditRounded"
import CloseRoundedIcon from "@mui/icons-material/CloseRounded"
import MonitorWeightRoundedIcon from "@mui/icons-material/MonitorWeightRounded"
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded"
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded"
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded"
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    AreaChart, Area, Line, ComposedChart,
} from "recharts"
import { getWeightHistory, logWeight as logWeightApi } from "../services/stats/weightApi"
import type { WeightEntry } from "../services/stats/weightApi"
import { getCalories } from "../services/stats/caloriesApi"
import type { CalorieDay } from "../services/stats/caloriesApi"
import { getMacros } from "../services/stats/macrosApi"
import type { MacroDay } from "../services/stats/macrosApi"
import { getTodayAnalytics, getDayAnalytics } from "../services/stats/todayLogsApi"
import type { TodayAnalytics, TodayLogEntry } from "../services/stats/todayLogsApi"
import { getTodayMacros } from "../services/stats/todayMacrosApi"
import type { TodayMacros } from "../services/stats/todayMacrosApi"
import { confirmQuickLog, deleteQuickLog } from "../services/log/quickLogApi"
import { getStreak } from "../services/stats/streakApi"

const DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]



// ─── Shared helpers ───────────────────────────────────────────────────────────
function toDateStr(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`p-4 rounded-2xl flex flex-col gap-3 ${className}`}
            style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", backdropFilter: "blur(20px)" }}>
            {children}
        </div>
    )
}

function PanelTitle({ children }: { children: React.ReactNode }) {
    return <span className="text-sm font-semibold text-text flex-shrink-0">{children}</span>
}

const TOOLTIP_STYLE = {
    contentStyle: { background: "#1a1f1b", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, fontSize: 11 },
    labelStyle: { color: "#B3BCB5" },
    cursor: { fill: "rgba(255,255,255,0.04)" },
}

// ─── Shared modal shell ───────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
            onClick={onClose}>
            <div className="w-full max-w-sm flex flex-col gap-5 p-5 rounded-2xl"
                style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", backdropFilter: "blur(24px)" }}
                onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                    <span className="text-base font-semibold text-text">{title}</span>
                    <button onClick={onClose} className="text-text-muted hover:text-text transition-colors">
                        <CloseRoundedIcon sx={{ fontSize: 20 }} />
                    </button>
                </div>
                {children}
            </div>
        </div>
    )
}

function ModalInput({ label, value, onChange, unit, color }: {
    label: string; value: string; onChange: (v: string) => void; unit: string; color: string
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium" style={{ color }}>{label}</span>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)" }}>
                <input
                    type="number" value={value}
                    onChange={e => onChange(e.target.value)}
                    className="flex-1 bg-transparent text-sm font-semibold text-text outline-none min-w-0"
                    style={{ appearance: "textfield" }}
                />
                <span className="text-xs text-text-muted flex-shrink-0">{unit}</span>
            </div>
        </div>
    )
}

// ─── Update targets modal ─────────────────────────────────────────────────────
function UpdateTargetsModal({ onClose }: { onClose: () => void }) {
    const dispatch = useDispatch<AppDispatch>()
    const { user, loading, error } = useSelector((state: RootState) => state.auth)
    const profile = user?.profile

    const [calories, setCalories] = useState(String(profile?.daily_calorie_target ?? ""))
    const [protein,  setProtein]  = useState(String(profile?.daily_protein_g ?? ""))
    const [carbs,    setCarbs]    = useState(String(profile?.daily_carbs_g ?? ""))
    const [fats,     setFats]     = useState(String(profile?.daily_fat_g ?? ""))

    const calNum = Number(calories)
    const valid = calNum >= 500 && calNum <= 10000 && Number(protein) >= 0 && Number(carbs) >= 0 && Number(fats) >= 0

    async function handleSave() {
        if (!valid) return
        try {
            await dispatch(updateTargets({
                daily_calorie_target: calNum,
                daily_protein_g: Number(protein),
                daily_carbs_g: Number(carbs),
                daily_fat_g: Number(fats),
            })).unwrap()
            onClose()
        } catch { }
    }

    return (
        <Modal title="Update Targets" onClose={onClose}>
            <div className="flex flex-col gap-3">
                <ModalInput label="Daily Calories" value={calories} onChange={setCalories} unit="kcal" color="#7FFA88" />
                <ModalInput label="Protein"  value={protein}  onChange={setProtein}  unit="g" color="#4F9CF9" />
                <ModalInput label="Carbs"    value={carbs}    onChange={setCarbs}    unit="g" color="#FFC107" />
                <ModalInput label="Fats"     value={fats}     onChange={setFats}     unit="g" color="#FF6B9D" />
            </div>
            {error && <p className="text-xs text-red-400 text-center">{error}</p>}
            <button
                onClick={handleSave}
                disabled={!valid || loading}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-black transition-all duration-200 hover:opacity-90 active:scale-95 disabled:opacity-40"
                style={{ background: "var(--primary)", boxShadow: "0 0 16px rgba(127,250,136,0.3)" }}>
                {loading
                    ? <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    : "Save Targets"}
            </button>
        </Modal>
    )
}

// ─── Log weight modal ─────────────────────────────────────────────────────────
function LogWeightModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
    const [weight, setWeight]   = useState("")
    const [note, setNote]       = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError]     = useState<string | null>(null)

    const kg     = parseFloat(weight)
    const valid  = weight !== "" && !isNaN(kg) && kg > 0 && kg < 700

    async function handleSave() {
        if (!valid || loading) return
        setLoading(true)
        setError(null)
        try {
            await logWeightApi({ weight_kg: kg, note: note || undefined })
            onSuccess()
            onClose()
        } catch {
            setError("Could not save weight. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal title="Log Weight" onClose={onClose}>
            {/* Weight input */}
            <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-text-muted">Current weight</span>
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)" }}>
                    <input
                        type="number" placeholder="e.g. 81.5" value={weight}
                        onChange={e => { setWeight(e.target.value); setError(null) }}
                        className="flex-1 bg-transparent text-2xl font-bold text-text outline-none min-w-0"
                        style={{ appearance: "textfield" } as React.CSSProperties}
                        autoFocus
                    />
                    <span className="text-sm text-text-muted flex-shrink-0">kg</span>
                </div>
            </div>

            {/* Optional note */}
            <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-text-muted">Note <span className="opacity-50">(optional)</span></span>
                <input
                    type="text"
                    placeholder="e.g. after morning workout"
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    maxLength={120}
                    className="px-3 py-2.5 rounded-xl bg-transparent text-sm text-text outline-none placeholder:text-text-muted/40"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)" }}
                />
            </div>

            {error && <p className="text-xs text-red-400 text-center">{error}</p>}

            <button onClick={handleSave}
                disabled={!valid || loading}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-black transition-all duration-200 hover:opacity-90 active:scale-95 disabled:opacity-40"
                style={{ background: "var(--primary)", boxShadow: "0 0 16px rgba(127,250,136,0.3)" }}>
                {loading
                    ? <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    : "Log Weight"}
            </button>
        </Modal>
    )
}

// ─── Week navigation ──────────────────────────────────────────────────────────
function getWeekStart(offset: number): Date {
    const now = new Date()
    const monday = new Date(now)
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7) + offset * 7)
    monday.setHours(0, 0, 0, 0)
    return monday
}

function formatWeekRange(start: Date): string {
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }
    return `${start.toLocaleDateString("en-US", opts)} – ${end.toLocaleDateString("en-US", opts)}`
}

function useWeekNav() {
    const [offset, setOffset] = useState(0)
    const weekStart = useMemo(() => getWeekStart(offset), [offset])
    const isCurrentWeek = offset === 0
    const label = isCurrentWeek ? "This Week" : formatWeekRange(weekStart)
    return {
        offset, weekStart, label, isCurrentWeek,
        prev: () => setOffset(o => o - 1),
        next: () => setOffset(o => Math.min(o + 1, 0)),
    }
}

function WeekNav({ label, onPrev, onNext, isCurrentWeek }: {
    label: string; onPrev: () => void; onNext: () => void; isCurrentWeek: boolean
}) {
    return (
        <div className="flex items-center gap-0.5">
            <button onClick={onPrev}
                className="p-0.5 rounded-lg text-text-muted hover:text-text transition-colors hover:bg-white/5">
                <ChevronLeftRoundedIcon sx={{ fontSize: 16 }} />
            </button>
            <span className="text-[10px] text-text-muted px-1 whitespace-nowrap min-w-[72px] text-center">
                {label}
            </span>
            <button onClick={onNext} disabled={isCurrentWeek}
                className="p-0.5 rounded-lg transition-colors hover:bg-white/5"
                style={{ color: isCurrentWeek ? "rgba(179,188,181,0.25)" : undefined }}>
                <ChevronRightRoundedIcon sx={{ fontSize: 16 }} />
            </button>
        </div>
    )
}

// ─── Macro progress bar ───────────────────────────────────────────────────────
function MacroBar({ label, value, max, unit, color, icon }: {
    label: string; value: number; max: number | null; unit: string; color: string; icon: React.ReactNode
}) {
    const pct = max !== null ? Math.min((value / max) * 100, 100) : null
    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <span style={{ color }}>{icon}</span>
                    <span className="text-xs font-medium text-text">{label}</span>
                </div>
                <span className="text-xs font-semibold text-text">
                    {value}
                    {max !== null
                        ? <span className="text-text-muted font-normal">/{max}{unit}</span>
                        : <span className="text-text-muted font-normal"> {unit}</span>}
                </span>
            </div>
            {pct !== null && (
                <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
                </div>
            )}
        </div>
    )
}

// ─── Today's macros panel ─────────────────────────────────────────────────────
function TodaysMacros({
    onEditTargets, refreshKey,
}: {
    onEditTargets: () => void
    refreshKey: number
}) {
    const [data, setData]       = useState<TodayMacros | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false
        setLoading(true)
        getTodayMacros()
            .then(d  => { if (!cancelled) setData(d) })
            .catch(() => { if (!cancelled) setData(null) })
            .finally(() => { if (!cancelled) setLoading(false) })
        return () => { cancelled = true }
    }, [refreshKey])

    const cal   = data?.calories_consumed ?? 0
    const prot  = data?.protein_consumed  ?? 0
    const carbs = data?.carbs_consumed    ?? 0
    const fats  = data?.fats_consumed     ?? 0

    const calMax  = data?.calories_target ?? null
    const protMax = data?.protein_target  ?? null
    const carbMax = data?.carbs_target    ?? null
    const fatsMax = data?.fats_target     ?? null

    return (
        <div className="flex flex-col gap-2.5 flex-1 min-h-0">
            <div className="flex items-center justify-between flex-shrink-0">
                <PanelTitle>Today's Macros</PanelTitle>
                <button onClick={onEditTargets}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-text-muted hover:text-text transition-colors"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)" }}>
                    <EditRoundedIcon sx={{ fontSize: 12 }} />
                    Targets
                </button>
            </div>
            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <span className="inline-block w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
            ) : (
                <div className="flex flex-col gap-2.5 flex-1 justify-center">
                    <MacroBar label="Calories" value={cal}   max={calMax}  unit="kcal" color="#7FFA88"
                        icon={<LocalFireDepartmentRoundedIcon sx={{ fontSize: 13 }} />} />
                    <MacroBar label="Protein"  value={prot}  max={protMax} unit="g"    color="#4F9CF9"
                        icon={<FitnessCenterRoundedIcon sx={{ fontSize: 13 }} />} />
                    <MacroBar label="Carbs"    value={carbs} max={carbMax} unit="g"    color="#FFC107"
                        icon={<GrainRoundedIcon sx={{ fontSize: 13 }} />} />
                    <MacroBar label="Fats"     value={fats}  max={fatsMax} unit="g"    color="#FF6B9D"
                        icon={<WaterDropRoundedIcon sx={{ fontSize: 13 }} />} />
                </div>
            )}
        </div>
    )
}

// ─── Calorie area chart ───────────────────────────────────────────────────────
function buildCalChartData(days: CalorieDay[], weekStart: Date, todayStr: string, fallbackTarget: number | null) {
    const byDate = new Map(days.map(d => [d.date, d]))
    return DAYS_SHORT.map((label, i) => {
        const d       = new Date(weekStart)
        d.setDate(weekStart.getDate() + i)
        const dateStr = toDateStr(d)

        const entry  = byDate.get(dateStr)
        const target = entry?.calories_target ?? fallbackTarget

        // Future days → no cal dot/line, but keep target
        if (dateStr > todayStr) {
            return { label, cal: null as number | null, target, disabled: true }
        }

        // null/null → before profile creation → disabled, but still show target if known
        if (!entry || (entry.calories_consumed === null && entry.calories_target === null)) {
            return { label, cal: null as number | null, target, disabled: true }
        }

        return { label, cal: entry.calories_consumed ?? 0, target, disabled: false }
    })
}

function CalorieChart() {
    const nav                       = useWeekNav()
    const [days, setDays]           = useState<CalorieDay[]>([])
    const [loading, setLoading]     = useState(false)

    useEffect(() => {
        let cancelled = false
        setLoading(true)
        const start = toDateStr(nav.weekStart)
        const end   = toDateStr(new Date(nav.weekStart.getTime() + 6 * 24 * 60 * 60 * 1000))
        getCalories({ start, end })
            .then(data => { if (!cancelled) setDays(data) })
            .catch(() => { if (!cancelled) setDays([]) })
            .finally(() => { if (!cancelled) setLoading(false) })
        return () => { cancelled = true }
    }, [nav.weekStart])

    // Today's calorie total (current week only)
    const todayStr   = toDateStr(new Date())
    const todayEntry = days.find(d => d.date === todayStr)
    const todayCal   = todayEntry?.calories_consumed ?? null

    // Average for past weeks (exclude null/disabled days)
    const logged     = days.filter(d => d.calories_consumed !== null && d.calories_consumed > 0)
    const avgCal     = logged.length
        ? Math.round(logged.reduce((s, d) => s + (d.calories_consumed ?? 0), 0) / logged.length)
        : null

    const displayCal = nav.isCurrentWeek ? todayCal : avgCal

    // Most recent non-null target, used as fallback for days that return null
    const fallbackTarget = [...days]
        .sort((a, b) => b.date.localeCompare(a.date))
        .find(d => d.calories_target !== null)?.calories_target ?? null
    const goalCal   = fallbackTarget
    const chartData = buildCalChartData(days, nav.weekStart, todayStr, fallbackTarget)

    return (
        <div className="flex flex-col gap-1 flex-1 min-h-0">
            <div className="flex items-center justify-between flex-shrink-0">
                <PanelTitle>Calorie History</PanelTitle>
                <div className="flex items-center gap-2">
                    {goalCal !== null && (
                        <span className="text-[10px] text-primary px-2 py-0.5 rounded-lg"
                            style={{ background: "rgba(127,250,136,0.08)", border: "1px solid rgba(127,250,136,0.15)" }}>
                            Goal: {goalCal.toLocaleString()}
                        </span>
                    )}
                    <WeekNav label={nav.label} onPrev={nav.prev} onNext={nav.next} isCurrentWeek={nav.isCurrentWeek} />
                </div>
            </div>

            <div className="flex items-baseline gap-1.5 flex-shrink-0">
                {loading ? (
                    <span className="text-sm text-text-muted animate-pulse">Loading…</span>
                ) : displayCal !== null ? (
                    <>
                        <span className="text-2xl font-bold text-text">{displayCal.toLocaleString()}</span>
                        <span className="text-xs text-text-muted">
                            {nav.isCurrentWeek ? "kcal today" : "kcal avg/day"}
                        </span>
                    </>
                ) : (
                    <span className="text-sm text-text-muted/50">
                        {nav.isCurrentWeek ? "Nothing logged today" : "No data this week"}
                    </span>
                )}
            </div>

            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                        <defs>
                            <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%"  stopColor="#7FFA88" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#7FFA88" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#B3BCB5" }} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, "auto"]} tick={{ fontSize: 9, fill: "#B3BCB5" }} axisLine={false} tickLine={false} />
                        <Tooltip
                            {...TOOLTIP_STYLE}
                            formatter={(v: number | null, name: string, props: { payload?: { disabled?: boolean } }) => {
                                if (name === "Target") return v !== null ? [`${v.toLocaleString()} kcal`, "Target"] : [null, null]
                                if (props.payload?.disabled || v === null) return ["—", "Calories"]
                                return [`${v.toLocaleString()} kcal`, "Calories"]
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="cal"
                            stroke="#7FFA88"
                            strokeWidth={2}
                            fill="url(#calGrad)"
                            connectNulls={false}
                            dot={(props: { cx: number; cy: number; payload: { disabled?: boolean; cal: number | null } }) => {
                                if (props.payload.disabled || props.payload.cal === null) return <g key={props.cx} />
                                return <circle key={props.cx} cx={props.cx} cy={props.cy} r={3} fill="#7FFA88" />
                            }}
                            activeDot={{ r: 5, fill: "#7FFA88" }}
                        />
                        <Line
                            type="monotone"
                            dataKey="target"
                            stroke="#7FFA88"
                            strokeWidth={1.5}
                            strokeDasharray="5 4"
                            strokeOpacity={0.45}
                            dot={false}
                            activeDot={false}
                            connectNulls={true}
                            name="Target"
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

// ─── Macro history stacked bar chart ─────────────────────────────────────────
function buildMacroChartData(days: MacroDay[], weekStart: Date, todayStr: string) {
    const byDate = new Map(days.map(d => [d.date, d]))
    return DAYS_SHORT.map((label, i) => {
        const d       = new Date(weekStart)
        d.setDate(weekStart.getDate() + i)
        const dateStr = toDateStr(d)

        // Future days → empty slot
        if (dateStr > todayStr) {
            return { label, protein: null as number | null, carbs: null as number | null, fats: null as number | null, disabled: true }
        }

        const entry = byDate.get(dateStr)
        // All three fields are always in the same state — check protein_consumed
        if (!entry || entry.protein_consumed === null) {
            return { label, protein: null as number | null, carbs: null as number | null, fats: null as number | null, disabled: true }
        }
        // 0/null → nothing logged; number/number → normal
        return {
            label,
            protein:  entry.protein_consumed,
            carbs:    entry.carbs_consumed ?? 0,
            fats:     entry.fats_consumed  ?? 0,
            disabled: false,
        }
    })
}

const MACRO_LEGEND = [
    { key: "protein", label: "Protein", color: "#4F9CF9" },
    { key: "carbs",   label: "Carbs",   color: "#FFC107" },
    { key: "fats",    label: "Fats",    color: "#FF6B9D" },
] as const

function MacroHistoryChart() {
    const nav                     = useWeekNav()
    const [days, setDays]         = useState<MacroDay[]>([])
    const [loading, setLoading]   = useState(false)

    useEffect(() => {
        let cancelled = false
        setLoading(true)
        const start = toDateStr(nav.weekStart)
        const end   = toDateStr(new Date(nav.weekStart.getTime() + 6 * 24 * 60 * 60 * 1000))
        getMacros({ start, end })
            .then(data => { if (!cancelled) setDays(data) })
            .catch(() => { if (!cancelled) setDays([]) })
            .finally(() => { if (!cancelled) setLoading(false) })
        return () => { cancelled = true }
    }, [nav.weekStart])

    const todayStr  = toDateStr(new Date())
    const chartData = buildMacroChartData(days, nav.weekStart, todayStr)

    return (
        <div className="flex flex-col gap-2 flex-1 min-h-0">
            <div className="flex items-center justify-between flex-shrink-0">
                <PanelTitle>Macro History</PanelTitle>
                <WeekNav label={nav.label} onPrev={nav.prev} onNext={nav.next} isCurrentWeek={nav.isCurrentWeek} />
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
                {MACRO_LEGEND.map(m => (
                    <div key={m.key} className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full" style={{ background: m.color }} />
                        <span className="text-[10px] text-text-muted">{m.label}</span>
                    </div>
                ))}
                {loading && <span className="text-[10px] text-text-muted/40 ml-auto animate-pulse">Loading…</span>}
            </div>

            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} barSize={22} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                        <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#B3BCB5" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 9, fill: "#B3BCB5" }} axisLine={false} tickLine={false} />
                        <Tooltip
                            {...TOOLTIP_STYLE}
                            formatter={(v: number | null, name: string, props: { payload?: { disabled?: boolean } }) => {
                                if (props.payload?.disabled || v === null) return ["—", name]
                                return [`${v}g`, name]
                            }}
                        />
                        <Bar dataKey="protein" stackId="a" fill="#4F9CF9" name="Protein" />
                        <Bar dataKey="carbs"   stackId="a" fill="#FFC107" name="Carbs" />
                        <Bar dataKey="fats"    stackId="a" fill="#FF6B9D" name="Fats" radius={[5, 5, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

// ─── Weight area chart (lifetime) ─────────────────────────────────────────────
function formatWeightLabel(dateStr: string): string {
    // Parse as local date to avoid UTC-offset day shifts
    const [y, m, d] = dateStr.split("-").map(Number)
    return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function WeightChart({ onLogWeight, refreshKey }: { onLogWeight: () => void; refreshKey: number }) {
    const [entries, setEntries] = useState<WeightEntry[]>([])
    const [loading, setLoading] = useState(true)

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const data = await getWeightHistory()
            setEntries(data)
        } catch {
            setEntries([])
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchData() }, [refreshKey, fetchData])

    // API returns newest→oldest; reverse for left→right chronological order
    const chartData = [...entries].reverse().map(e => ({
        label: formatWeightLabel(e.logged_at),
        val:   parseFloat(e.weight_kg),
        note:  e.note,
    }))

    const latest    = entries.length > 0 ? parseFloat(entries[0].weight_kg) : null
    const prev      = entries.length > 1 ? parseFloat(entries[1].weight_kg) : null
    const diff      = latest !== null && prev !== null ? (latest - prev).toFixed(1) : null
    const isDown    = diff !== null && parseFloat(diff) <= 0
    const oldest    = entries.length > 1 ? parseFloat(entries[entries.length - 1].weight_kg) : null
    const totalDiff = latest !== null && oldest !== null ? (latest - oldest).toFixed(1) : null

    // Cap visible x-axis labels to avoid crowding
    const tickInterval = chartData.length > 6 ? Math.ceil(chartData.length / 6) - 1 : 0

    return (
        <div className="flex flex-col gap-1 flex-1 min-h-0">

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <PanelTitle>Weight</PanelTitle>
                <div className="flex items-center gap-2">
                    {diff !== null && (
                        <span className={`text-xs font-semibold ${isDown ? "text-primary" : "text-red-400"}`}>
                            {parseFloat(diff) > 0 ? "+" : ""}{diff} kg
                        </span>
                    )}
                    <button onClick={onLogWeight}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-text-muted hover:text-text transition-colors"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)" }}>
                        <MonitorWeightRoundedIcon sx={{ fontSize: 12 }} />
                        Log
                    </button>
                </div>
            </div>

            {/* Latest reading + lifetime delta */}
            <div className="flex items-baseline gap-2 flex-shrink-0">
                {loading ? (
                    <span className="text-sm text-text-muted animate-pulse">Loading…</span>
                ) : latest !== null ? (
                    <>
                        <span className="text-2xl font-bold text-text">{latest}</span>
                        <span className="text-xs text-text-muted">kg</span>
                        {totalDiff !== null && (
                            <span className={`text-[11px] font-medium ${parseFloat(totalDiff) <= 0 ? "text-primary" : "text-red-400"}`}>
                                ({parseFloat(totalDiff) > 0 ? "+" : ""}{totalDiff} kg total)
                            </span>
                        )}
                        {entries[0]?.note && (
                            <span className="text-[10px] text-text-muted/60 truncate max-w-[100px]">{entries[0].note}</span>
                        )}
                    </>
                ) : (
                    <span className="text-sm text-text-muted/50">No entries yet</span>
                )}
            </div>

            {/* Chart */}
            <div className="flex-1 min-h-0">
                {!loading && chartData.length === 0 ? (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                        <MonitorWeightRoundedIcon sx={{ fontSize: 22 }} className="text-text-muted/20" />
                        <span className="text-[11px] text-text-muted/40 text-center">
                            Log your weight to start tracking progress
                        </span>
                    </div>
                ) : chartData.length === 1 ? (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                        <span className="text-xs text-text-muted/60">First entry logged</span>
                        <span className="text-[11px] text-text-muted/40">Log again to see your trend</span>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                            <defs>
                                <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%"  stopColor="#7FFA88" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#7FFA88" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="label"
                                tick={{ fontSize: 9, fill: "#B3BCB5" }}
                                axisLine={false}
                                tickLine={false}
                                interval={tickInterval}
                            />
                            <YAxis
                                domain={["auto", "auto"]}
                                tick={{ fontSize: 9, fill: "#B3BCB5" }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                {...TOOLTIP_STYLE}
                                formatter={(v: number, _: string, props: { payload?: { note?: string | null } }) => {
                                    const note = props.payload?.note
                                    return [note ? `${v} kg — ${note}` : `${v} kg`, "Weight"]
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="val"
                                stroke="#7FFA88"
                                strokeWidth={2}
                                fill="url(#weightGrad)"
                                dot={{ r: 3, fill: "#7FFA88", strokeWidth: 0 }}
                                activeDot={{ r: 5, fill: "#7FFA88" }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>

        </div>
    )
}

// ─── Meal log ─────────────────────────────────────────────────────────────────
function fmtTime(iso: string): string {
    return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
}

function fmtDateLabel(dateStr: string): string {
    const todayStr     = toDateStr(new Date())
    const yesterdayStr = toDateStr(new Date(Date.now() - 86_400_000))
    if (dateStr === todayStr)     return "Today"
    if (dateStr === yesterdayStr) return "Yesterday"
    const [y, m, d] = dateStr.split("-").map(Number)
    return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function shiftDate(dateStr: string, days: number): string {
    const [y, m, d] = dateStr.split("-").map(Number)
    const dt = new Date(y, m - 1, d + days)
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`
}

function localTodayStr(): string {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
}

function LogCard({
    entry, index, allowActions, onConfirmed, onDiscarded,
}: {
    entry: TodayLogEntry; index: number; allowActions: boolean; onConfirmed: () => void; onDiscarded: () => void
}) {
    const navigate              = useNavigate()
    const [confirming, setConfirming] = useState(false)
    const [discarding, setDiscarding] = useState(false)
    const busy   = confirming || discarding
    const accent = ["#7FFA88", "#4F9CF9", "#FFC107", "#FF6B9D", "#a78bfa"][index % 5]
    const isMeal    = entry.type === "meal"
    const name      = entry.log_name ?? "Log"
    const isPending = entry.confirmed_at === null
    const cal   = parseFloat(entry.calories)
    const prot  = parseFloat(entry.protein)
    const carbs = parseFloat(entry.carbs)
    const fats  = parseFloat(entry.fats)

    async function handleConfirm(e: React.MouseEvent) {
        e.stopPropagation()
        if (busy) return
        setConfirming(true)
        try {
            await confirmQuickLog(entry.id)
            onConfirmed()
        } catch {
            setConfirming(false)
        }
    }

    async function handleDiscard(e: React.MouseEvent) {
        e.stopPropagation()
        if (busy) return
        setDiscarding(true)
        try {
            await deleteQuickLog(entry.id)
            onDiscarded()
        } catch {
            setDiscarding(false)
        }
    }

    return (
        <div
            className={`flex gap-3 p-3 rounded-2xl transition-all duration-200 hover:bg-white/[0.04] ${isMeal && entry.meal_post ? "cursor-pointer" : ""} ${isPending ? "opacity-70" : ""}`}
            style={{ border: `1px solid ${isPending ? "rgba(251,146,60,0.25)" : "var(--glass-border)"}`, background: "rgba(255,255,255,0.02)" }}
            onClick={isMeal && entry.meal_post ? () => navigate(`/meals/${entry.meal_post!.id}`) : undefined}>

            {/* Thumbnail (meal) or icon (custom/estimate) */}
            {isMeal && entry.meal_post ? (
                <div className="flex-shrink-0 w-11 h-11 rounded-xl overflow-hidden"
                    style={{ border: `1px solid ${accent}40` }}>
                    <img src={entry.meal_post.image_url} alt={name} className="w-full h-full object-cover" />
                </div>
            ) : (
                <div className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ background: `${accent}15`, border: `1px solid ${accent}30` }}>
                    <RestaurantRoundedIcon sx={{ fontSize: 18 }} style={{ color: accent }} />
                </div>
            )}

            {/* Content */}
            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-sm font-semibold text-text truncate">{name}</span>
                        <span className="text-[9px] text-text-muted/50 flex-shrink-0">
                            {entry.type === "custom" ? "quick log" : entry.type === "estimate" ? "estimation" : "meal"}
                        </span>
                    </div>
                    <span className="text-[10px] tabular-nums text-text-muted flex-shrink-0">{fmtTime(entry.logged_at)}</span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                    <LocalFireDepartmentRoundedIcon sx={{ fontSize: 12 }} style={{ color: accent }} />
                    <span className="text-xs font-bold" style={{ color: accent }}>{Math.round(cal)} kcal</span>
                    <span className="text-text-muted/30 text-xs">·</span>
                    <FitnessCenterRoundedIcon sx={{ fontSize: 11 }} className="text-[#4F9CF9]" />
                    <span className="text-[11px] text-text font-medium">{Math.round(prot)}g</span>
                    <span className="text-text-muted/30 text-xs">·</span>
                    <GrainRoundedIcon sx={{ fontSize: 11 }} className="text-[#FFC107]" />
                    <span className="text-[11px] text-text font-medium">{Math.round(carbs)}g</span>
                    <span className="text-text-muted/30 text-xs">·</span>
                    <WaterDropRoundedIcon sx={{ fontSize: 11 }} className="text-[#FF6B9D]" />
                    <span className="text-[11px] text-text font-medium">{Math.round(fats)}g</span>
                </div>

                {isPending && allowActions && (
                    <div className="flex items-center gap-2 mt-0.5">
                        <button
                            onClick={handleConfirm}
                            disabled={busy}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all duration-200 hover:opacity-90 active:scale-95 disabled:opacity-40"
                            style={{ background: "rgba(251,146,60,0.12)", border: "1px solid rgba(251,146,60,0.3)", color: "#fb923c" }}>
                            {confirming
                                ? <span className="inline-block w-3 h-3 border border-orange-400 border-t-transparent rounded-full animate-spin" />
                                : <CheckCircleOutlineRoundedIcon sx={{ fontSize: 12 }} />}
                            Confirm
                        </button>
                        <button
                            onClick={handleDiscard}
                            disabled={busy}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all duration-200 hover:opacity-90 active:scale-95 disabled:opacity-40"
                            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
                            {discarding
                                ? <span className="inline-block w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
                                : <CloseRoundedIcon sx={{ fontSize: 12 }} />}
                            Discard
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

function MealLog({
    data, loading, onRefresh,
}: {
    data: TodayAnalytics | null; loading: boolean; onRefresh: () => void
}) {
    const todayStr                        = localTodayStr()
    const [selectedDate, setSelectedDate] = useState(() => localTodayStr())
    const isToday                         = selectedDate === todayStr

    const [historyData,    setHistoryData]    = useState<TodayAnalytics | null>(null)
    const [historyLoading, setHistoryLoading] = useState(false)

    useEffect(() => {
        if (isToday) { setHistoryData(null); return }
        let cancelled = false
        setHistoryLoading(true)
        setHistoryData(null)
        getDayAnalytics(selectedDate)
            .then(d  => { if (!cancelled) setHistoryData(d) })
            .catch(() => { if (!cancelled) setHistoryData(null) })
            .finally(() => { if (!cancelled) setHistoryLoading(false) })
        return () => { cancelled = true }
    }, [selectedDate, isToday])

    const displayData    = isToday ? data    : historyData
    const displayLoading = isToday ? loading : historyLoading
    const logs           = displayData?.logs ?? []
    const isEmpty        = !displayLoading && (displayData === null || displayData.logs_count === 0)

    return (
        <div className="flex flex-col gap-4 p-4 h-full overflow-hidden rounded-2xl"
            style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", backdropFilter: "blur(20px)" }}>

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-text">Log</span>
                    <span className="text-xs text-text-muted">
                        {displayLoading
                            ? "Loading…"
                            : logs.length > 0
                                ? `${logs.length} item${logs.length !== 1 ? "s" : ""} · ${Math.round(displayData?.calories_consumed ?? 0).toLocaleString()} kcal`
                                : "Nothing logged"}
                    </span>
                </div>

                <div className="flex items-center gap-1">
                    {/* Prev day */}
                    <button
                        onClick={() => setSelectedDate(d => shiftDate(d, -1))}
                        className="p-1 rounded-lg text-text-muted hover:text-text transition-colors hover:bg-white/5">
                        <ChevronLeftRoundedIcon sx={{ fontSize: 16 }} />
                    </button>

                    {/* Date label */}
                    <span className={`text-xs font-semibold px-2 py-1 rounded-lg min-w-[72px] text-center transition-colors ${isToday ? "text-primary" : "text-text"}`}
                        style={{ background: isToday ? "rgba(127,250,136,0.08)" : "rgba(255,255,255,0.04)", border: `1px solid ${isToday ? "rgba(127,250,136,0.2)" : "var(--glass-border)"}` }}>
                        {fmtDateLabel(selectedDate)}
                    </span>

                    {/* Next day — disabled on today */}
                    <button
                        onClick={() => setSelectedDate(d => shiftDate(d, 1))}
                        disabled={isToday}
                        className="p-1 rounded-lg transition-colors hover:bg-white/5"
                        style={{ color: isToday ? "rgba(179,188,181,0.25)" : undefined }}>
                        <ChevronRightRoundedIcon sx={{ fontSize: 16 }} />
                    </button>
                </div>
            </div>

            <div className="h-px flex-shrink-0" style={{ background: "var(--glass-border)" }} />

            {/* Body */}
            {displayLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <span className="inline-block w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
            ) : isEmpty ? (
                <div className="flex flex-col items-center gap-3 flex-1 justify-center text-center">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{ background: "rgba(127,250,136,0.07)", border: "1px solid rgba(127,250,136,0.13)" }}>
                        <RestaurantRoundedIcon sx={{ fontSize: 22 }} className="text-primary/40" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-text">No meals logged</span>
                        <span className="text-xs text-text-muted/50">
                            {isToday ? "Add a meal to start tracking" : "Nothing was logged on this day"}
                        </span>
                    </div>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 min-h-0 pr-0.5">
                    {[...logs]
                        .sort((a, b) => a.logged_at.localeCompare(b.logged_at))
                        .map((entry, i) => (
                            <LogCard
                                key={entry.id}
                                entry={entry}
                                index={i}
                                allowActions={isToday}
                                onConfirmed={onRefresh}
                                onDiscarded={onRefresh}
                            />
                        ))}
                </div>
            )}

        </div>
    )
}

// ─── Clock (isolated so the 1 s interval only re-renders this tiny node) ──────
function Clock() {
    const [now, setNow] = useState(new Date())
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000)
        return () => clearInterval(id)
    }, [])
    return (
        <div className="flex flex-col gap-0 min-w-0">
            <span className="text-base font-semibold text-text leading-tight">
                {now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </span>
            <span className="text-xs text-text-muted tabular-nums">
                {now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
        </div>
    )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function MyStats() {
    const [currentStreak,    setCurrentStreak]    = useState<number | null>(null)
    const [showTargets,      setShowTargets]      = useState(false)
    const [showWeight,       setShowWeight]       = useState(false)
    const [weightRefreshKey, setWeightRefreshKey] = useState(0)
    const [todayData,        setTodayData]        = useState<TodayAnalytics | null>(null)
    const [todayLoading,     setTodayLoading]     = useState(true)
    const [todayRefreshKey,  setTodayRefreshKey]  = useState(0)

    useEffect(() => {
        let cancelled = false
        setTodayLoading(true)
        getTodayAnalytics()
            .then(d => { if (!cancelled) setTodayData(d) })
            .catch(() => { if (!cancelled) setTodayData(null) })
            .finally(() => { if (!cancelled) setTodayLoading(false) })
        return () => { cancelled = true }
    }, [todayRefreshKey])

    useEffect(() => {
        getStreak()
            .then(s => setCurrentStreak(s))
            .catch(() => setCurrentStreak(null))
    }, [])

    return (
        <div className="w-full flex flex-col gap-4 lg:h-full">
            {showTargets && <UpdateTargetsModal onClose={() => setShowTargets(false)} />}
            {showWeight  && <LogWeightModal     onClose={() => setShowWeight(false)}  onSuccess={() => setWeightRefreshKey(k => k + 1)} />}

            {/* ── Header ── */}
            <div className="flex flex-wrap items-center gap-3 flex-shrink-0">

                <Clock />

                <div className="flex-1" />

                {/* Streak indicator */}
                {currentStreak !== null && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                        style={{ background: "rgba(251,146,60,0.08)", border: "1px solid rgba(251,146,60,0.2)" }}>
                        <WhatshotRoundedIcon sx={{ fontSize: 16 }} className="text-orange-400" />
                        <span className="text-sm font-bold text-orange-400">{currentStreak}</span>
                        <span className="text-xs text-text-muted">day streak</span>
                    </div>
                )}

            </div>

            {/* ── Main section ── */}
            <div className="flex flex-col lg:flex-row flex-1 min-h-0 gap-4">

                {/* Charts grid: 2×2 on large, 1 col on small */}
                <div className="flex-[2] grid grid-cols-1 sm:grid-cols-2 gap-4 lg:grid-rows-2 lg:min-h-0">

                    <Panel className="min-h-[220px] lg:min-h-0">
                        <TodaysMacros
                            onEditTargets={() => setShowTargets(true)}
                            refreshKey={todayRefreshKey}
                        />
                    </Panel>

                    <Panel className="min-h-[220px] lg:min-h-0">
                        <CalorieChart />
                    </Panel>

                    <Panel className="min-h-[220px] lg:min-h-0">
                        <MacroHistoryChart />
                    </Panel>

                    <Panel className="min-h-[220px] lg:min-h-0">
                        <WeightChart onLogWeight={() => setShowWeight(true)} refreshKey={weightRefreshKey} />
                    </Panel>

                </div>

                {/* Meal log: full width on small, sidebar on large */}
                <div className="flex-1 min-h-[400px] lg:min-h-0">
                    <MealLog
                        data={todayData}
                        loading={todayLoading}
                        onRefresh={() => setTodayRefreshKey(k => k + 1)}
                    />
                </div>

            </div>

        </div>
    )
}

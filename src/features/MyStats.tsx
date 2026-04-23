import { useState, useEffect, useMemo } from "react"
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
import AddRoundedIcon from "@mui/icons-material/AddRounded"
import EditRoundedIcon from "@mui/icons-material/EditRounded"
import CloseRoundedIcon from "@mui/icons-material/CloseRounded"
import MonitorWeightRoundedIcon from "@mui/icons-material/MonitorWeightRounded"
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded"
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded"
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    AreaChart, Area,
} from "recharts"
import type { MealDraft } from "./mealCreation/types/meal.types"

// ─── Types & placeholder data ─────────────────────────────────────────────────
interface LogEntry { logged_at: string; meal: MealDraft }

const PLACEHOLDER_LOGS: LogEntry[] = [
    {
        logged_at: "08:24",
        meal: {
            id: 1, name: "Oatmeal with Berries", description: "", image_url: "",
            confirmed: true, servings: 1, visibility: "private",
            ingredients: [], preparation_steps: [],
            macros: { calories: 320, protein: 12, carbs: 54, fats: 6, fiber: 7 },
        },
    },
    {
        logged_at: "13:10",
        meal: {
            id: 2, name: "Grilled Chicken Salad", description: "", image_url: "",
            confirmed: true, servings: 1, visibility: "private",
            ingredients: [], preparation_steps: [],
            macros: { calories: 480, protein: 42, carbs: 18, fats: 22, fiber: 5 },
        },
    },
    {
        logged_at: "16:00",
        meal: {
            id: 3, name: "Greek Yogurt", description: "", image_url: "",
            confirmed: true, servings: 1, visibility: "private",
            ingredients: [], preparation_steps: [],
            macros: { calories: 150, protein: 15, carbs: 12, fats: 3, fiber: 0 },
        },
    },
]

const CALORIE_HISTORY = [1820, 2100, 1650, 2340, 1980, 2560, 950]
const DAYS_SHORT      = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const GOAL_CAL        = 2400

const MACRO_HISTORY = [
    { protein: 110, carbs: 220, fats: 60 },
    { protein: 145, carbs: 250, fats: 75 },
    { protein: 98,  carbs: 190, fats: 55 },
    { protein: 160, carbs: 270, fats: 80 },
    { protein: 130, carbs: 240, fats: 70 },
    { protein: 155, carbs: 280, fats: 85 },
    { protein: 69,  carbs: 84,  fats: 31 },
]

const WEIGHT_DATA = [83.2, 82.8, 82.5, 82.9, 82.1, 81.8, 81.5]

// ─── Shared helpers ───────────────────────────────────────────────────────────
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
function LogWeightModal({ onClose }: { onClose: () => void }) {
    const [weight, setWeight] = useState("")

    function handleSave() {
        if (!weight || isNaN(Number(weight))) return
        // TODO: dispatch API call to log weight
        onClose()
    }

    return (
        <Modal title="Log Weight" onClose={onClose}>
            <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-text-muted">Current weight</span>
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)" }}>
                    <input
                        type="number" placeholder="e.g. 81.5" value={weight}
                        onChange={e => setWeight(e.target.value)}
                        className="flex-1 bg-transparent text-2xl font-bold text-text outline-none min-w-0"
                        style={{ appearance: "textfield" }}
                        autoFocus
                    />
                    <span className="text-sm text-text-muted flex-shrink-0">kg</span>
                </div>
            </div>
            <button onClick={handleSave}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-black transition-all duration-200 hover:opacity-90 active:scale-95 disabled:opacity-40"
                style={{ background: "var(--primary)", boxShadow: "0 0 16px rgba(127,250,136,0.3)" }}
                disabled={!weight}>
                Log Weight
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
    label: string; value: number; max: number; unit: string; color: string; icon: React.ReactNode
}) {
    const pct = Math.min((value / max) * 100, 100)
    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <span style={{ color }}>{icon}</span>
                    <span className="text-xs font-medium text-text">{label}</span>
                </div>
                <span className="text-xs font-semibold text-text">
                    {value}<span className="text-text-muted font-normal">/{max}{unit}</span>
                </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
            </div>
        </div>
    )
}

// ─── Today's macros panel ─────────────────────────────────────────────────────
function TodaysMacros({ onEditTargets }: { onEditTargets: () => void }) {
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
            <div className="flex flex-col gap-2.5 flex-1 justify-center">
                <MacroBar label="Calories" value={950}  max={2400} unit=" kcal" color="#7FFA88"
                    icon={<LocalFireDepartmentRoundedIcon sx={{ fontSize: 13 }} />} />
                <MacroBar label="Protein"  value={69}   max={150}  unit="g"     color="#4F9CF9"
                    icon={<FitnessCenterRoundedIcon sx={{ fontSize: 13 }} />} />
                <MacroBar label="Carbs"    value={84}   max={270}  unit="g"     color="#FFC107"
                    icon={<GrainRoundedIcon sx={{ fontSize: 13 }} />} />
                <MacroBar label="Fats"     value={31}   max={80}   unit="g"     color="#FF6B9D"
                    icon={<WaterDropRoundedIcon sx={{ fontSize: 13 }} />} />
            </div>
        </div>
    )
}

// ─── Calorie area chart ───────────────────────────────────────────────────────
const CAL_DATA = CALORIE_HISTORY.map((cal, i) => ({ day: DAYS_SHORT[i], cal }))

function CalorieChart() {
    const nav = useWeekNav()
    // TODO: fetch from /api/stats/calories?week=<nav.weekStart.toISOString()> when !nav.isCurrentWeek
    //       fetch from /api/stats/calories/current when nav.isCurrentWeek
    const data = CAL_DATA // replace with fetched data

    return (
        <div className="flex flex-col gap-1 flex-1 min-h-0">
            <div className="flex items-center justify-between flex-shrink-0">
                <PanelTitle>Calorie History</PanelTitle>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-primary px-2 py-0.5 rounded-lg"
                        style={{ background: "rgba(127,250,136,0.08)", border: "1px solid rgba(127,250,136,0.15)" }}>
                        Goal: {GOAL_CAL.toLocaleString()}
                    </span>
                    <WeekNav label={nav.label} onPrev={nav.prev} onNext={nav.next} isCurrentWeek={nav.isCurrentWeek} />
                </div>
            </div>
            <div className="flex items-baseline gap-1.5 flex-shrink-0">
                <span className="text-2xl font-bold text-text">{CALORIE_HISTORY[CALORIE_HISTORY.length - 1].toLocaleString()}</span>
                <span className="text-xs text-text-muted">{nav.isCurrentWeek ? "kcal today" : "kcal avg/day"}</span>
            </div>
            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                        <defs>
                            <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%"  stopColor="#7FFA88" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#7FFA88" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="day" tick={{ fontSize: 9, fill: "#B3BCB5" }} axisLine={false} tickLine={false} />
                        <YAxis domain={["auto", "auto"]} tick={{ fontSize: 9, fill: "#B3BCB5" }} axisLine={false} tickLine={false} />
                        <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => [`${v} kcal`, "Calories"]} />
                        <Area type="monotone" dataKey="cal" stroke="#7FFA88" strokeWidth={2}
                            fill="url(#calGrad)" dot={{ r: 3, fill: "#7FFA88", strokeWidth: 0 }}
                            activeDot={{ r: 5, fill: "#7FFA88" }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

// ─── Macro history stacked bar chart ─────────────────────────────────────────
const MACRO_DATA = MACRO_HISTORY.map((d, i) => ({ day: DAYS_SHORT[i], ...d }))

function MacroHistoryChart() {
    const nav = useWeekNav()
    // TODO: fetch from /api/stats/macros?week=<nav.weekStart.toISOString()> when !nav.isCurrentWeek
    //       fetch from /api/stats/macros/current when nav.isCurrentWeek
    const data = MACRO_DATA // replace with fetched data

    return (
        <div className="flex flex-col gap-2 flex-1 min-h-0">
            <div className="flex items-center justify-between flex-shrink-0">
                <PanelTitle>Macro History</PanelTitle>
                <div className="flex items-center gap-2">
                    <WeekNav label={nav.label} onPrev={nav.prev} onNext={nav.next} isCurrentWeek={nav.isCurrentWeek} />
                </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
                {[
                    { label: "Protein", color: "#4F9CF9" },
                    { label: "Carbs",   color: "#FFC107" },
                    { label: "Fats",    color: "#FF6B9D" },
                ].map(m => (
                    <div key={m.label} className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full" style={{ background: m.color }} />
                        <span className="text-[10px] text-text-muted">{m.label}</span>
                    </div>
                ))}
            </div>
            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} barSize={22} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                        <XAxis dataKey="day" tick={{ fontSize: 9, fill: "#B3BCB5" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 9, fill: "#B3BCB5" }} axisLine={false} tickLine={false} />
                        <Tooltip {...TOOLTIP_STYLE} formatter={(v: number, name: string) => [`${v}g`, name]} />
                        <Bar dataKey="protein" stackId="a" fill="#4F9CF9" />
                        <Bar dataKey="carbs"   stackId="a" fill="#FFC107" />
                        <Bar dataKey="fats"    stackId="a" fill="#FF6B9D" radius={[5, 5, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

// ─── Weight area chart ────────────────────────────────────────────────────────
const WEIGHT_CHART_DATA = WEIGHT_DATA.map((val, i) => ({ day: DAYS_SHORT[i], val }))

function WeightChart({ onLogWeight }: { onLogWeight: () => void }) {
    const nav    = useWeekNav()
    // TODO: fetch from /api/stats/weight?week=<nav.weekStart.toISOString()> when !nav.isCurrentWeek
    //       fetch from /api/stats/weight/current when nav.isCurrentWeek
    const data   = WEIGHT_CHART_DATA // replace with fetched data
    const last   = WEIGHT_DATA[WEIGHT_DATA.length - 1]
    const prev   = WEIGHT_DATA[WEIGHT_DATA.length - 2]
    const diff   = (last - prev).toFixed(1)
    const isDown = last < prev

    return (
        <div className="flex flex-col gap-1 flex-1 min-h-0">
            <div className="flex items-center justify-between flex-shrink-0">
                <PanelTitle>Weight</PanelTitle>
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold ${isDown ? "text-primary" : "text-red-400"}`}>
                        {isDown ? "" : "+"}{diff} kg
                    </span>
                    <WeekNav label={nav.label} onPrev={nav.prev} onNext={nav.next} isCurrentWeek={nav.isCurrentWeek} />
                    <button onClick={onLogWeight}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-text-muted hover:text-text transition-colors"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)" }}>
                        <MonitorWeightRoundedIcon sx={{ fontSize: 12 }} />
                        Log
                    </button>
                </div>
            </div>
            <div className="flex items-baseline gap-1.5 flex-shrink-0">
                <span className="text-2xl font-bold text-text">{last}</span>
                <span className="text-xs text-text-muted">kg</span>
            </div>
            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                        <defs>
                            <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%"  stopColor="#7FFA88" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#7FFA88" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="day" tick={{ fontSize: 9, fill: "#B3BCB5" }} axisLine={false} tickLine={false} />
                        <YAxis domain={["auto", "auto"]} tick={{ fontSize: 9, fill: "#B3BCB5" }} axisLine={false} tickLine={false} />
                        <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => [`${v} kg`, "Weight"]} />
                        <Area type="monotone" dataKey="val" stroke="#7FFA88" strokeWidth={2}
                            fill="url(#weightGrad)" dot={{ r: 3, fill: "#7FFA88", strokeWidth: 0 }}
                            activeDot={{ r: 5, fill: "#7FFA88" }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

// ─── Meal log ─────────────────────────────────────────────────────────────────
function MealLog({ logs }: { logs: LogEntry[] }) {
    const navigate   = useNavigate()
    const sorted     = [...logs].sort((a, b) => a.logged_at.localeCompare(b.logged_at))
    const totalCal   = logs.reduce((s, e) => s + e.meal.macros.calories, 0)
    const totalProt  = logs.reduce((s, e) => s + e.meal.macros.protein, 0)
    const totalCarbs = logs.reduce((s, e) => s + e.meal.macros.carbs, 0)
    const totalFats  = logs.reduce((s, e) => s + e.meal.macros.fats, 0)

    return (
        <div className="flex flex-col gap-4 p-4 h-full overflow-hidden rounded-2xl"
            style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", backdropFilter: "blur(20px)" }}>

            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-text">Today's Log</span>
                    <span className="text-xs text-text-muted">
                        {logs.length > 0 ? `${logs.length} meal${logs.length !== 1 ? "s" : ""} logged` : "Nothing logged yet"}
                    </span>
                </div>
                {logs.length > 0 && (
                    <span className="text-lg font-bold text-primary">{totalCal.toLocaleString()}
                        <span className="text-xs font-normal text-text-muted ml-1">kcal</span>
                    </span>
                )}
            </div>

            {/* Macro summary strip */}
            {logs.length > 0 && (
                <div className="flex gap-2 flex-shrink-0">
                    {[
                        { label: "P", val: totalProt,  unit: "g", color: "#4F9CF9" },
                        { label: "C", val: totalCarbs, unit: "g", color: "#FFC107" },
                        { label: "F", val: totalFats,  unit: "g", color: "#FF6B9D" },
                    ].map(m => (
                        <div key={m.label} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl"
                            style={{ background: `${m.color}0f`, border: `1px solid ${m.color}20` }}>
                            <span className="text-[10px] font-medium text-text-muted">{m.label}</span>
                            <span className="text-xs font-bold" style={{ color: m.color }}>{m.val}{m.unit}</span>
                        </div>
                    ))}
                </div>
            )}

            <div className="h-px flex-shrink-0" style={{ background: "var(--glass-border)" }} />

            {/* Cards */}
            {logs.length === 0 ? (
                <div className="flex flex-col items-center gap-3 flex-1 justify-center text-center">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{ background: "rgba(127,250,136,0.07)", border: "1px solid rgba(127,250,136,0.13)" }}>
                        <RestaurantRoundedIcon sx={{ fontSize: 22 }} className="text-primary/40" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-text">No meals logged today</span>
                        <span className="text-xs text-text-muted/50">Add a meal to start tracking</span>
                    </div>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 min-h-0 pr-0.5">
                    {sorted.map(({ meal, logged_at }, i) => {
                        const m        = meal.macros
                        const fromPost = !!meal.image_url
                        const accent   = ["#7FFA88", "#4F9CF9", "#FFC107", "#FF6B9D", "#a78bfa"][i % 5]

                        return (
                            <div key={meal.id}
                                className={`flex items-center gap-3 p-3 rounded-2xl transition-all duration-200 hover:bg-white/[0.04] ${fromPost ? "cursor-pointer" : ""}`}
                                style={{ border: "1px solid var(--glass-border)", background: "rgba(255,255,255,0.02)" }}
                                onClick={fromPost ? () => navigate(`/feed/${meal.id}`) : undefined}>

                                {/* Icon */}
                                <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                                    style={{ background: `${accent}15`, border: `1px solid ${accent}30` }}>
                                    <RestaurantRoundedIcon sx={{ fontSize: 18 }} style={{ color: accent }} />
                                </div>

                                {/* Name + macros */}
                                <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-sm font-semibold text-text truncate">{meal.name}</span>
                                        <span className="text-xs tabular-nums text-text-muted flex-shrink-0">{logged_at}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xs font-bold" style={{ color: accent }}>{m.calories} kcal</span>
                                        <span className="text-text-muted/30 text-xs">·</span>
                                        <span className="text-[11px] text-text-muted">P <span className="text-text font-medium">{m.protein}g</span></span>
                                        <span className="text-text-muted/30 text-xs">·</span>
                                        <span className="text-[11px] text-text-muted">C <span className="text-text font-medium">{m.carbs}g</span></span>
                                        <span className="text-text-muted/30 text-xs">·</span>
                                        <span className="text-[11px] text-text-muted">F <span className="text-text font-medium">{m.fats}g</span></span>
                                    </div>
                                </div>

                                {/* Post thumbnail — only when image exists */}
                                {fromPost && (
                                    <div className="flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden"
                                        style={{ border: `1px solid ${accent}40` }}>
                                        <img src={meal.image_url} alt={meal.name} className="w-full h-full object-cover" />
                                    </div>
                                )}

                            </div>
                        )
                    })}
                </div>
            )}

        </div>
    )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function MyStats() {
    const [now, setNow] = useState(new Date())

    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000)
        return () => clearInterval(id)
    }, [])

    const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
    const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })

    const currentStreak  = 7
    const [showTargets, setShowTargets] = useState(false)
    const [showWeight,  setShowWeight]  = useState(false)

    return (
        <div className="w-full h-full flex flex-col gap-4 overflow-y-auto">
            {showTargets && <UpdateTargetsModal onClose={() => setShowTargets(false)} />}
            {showWeight  && <LogWeightModal     onClose={() => setShowWeight(false)}  />}

            {/* ── Header ── */}
            <div className="flex flex-wrap items-center gap-3 flex-shrink-0">

                {/* Date + time */}
                <div className="flex flex-col gap-0 min-w-0">
                    <span className="text-base font-semibold text-text leading-tight">{dateStr}</span>
                    <span className="text-xs text-text-muted tabular-nums">{timeStr}</span>
                </div>

                <div className="flex-1" />

                {/* Streak indicator */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                    style={{ background: "rgba(251,146,60,0.08)", border: "1px solid rgba(251,146,60,0.2)" }}>
                    <WhatshotRoundedIcon sx={{ fontSize: 16 }} className="text-orange-400" />
                    <span className="text-sm font-bold text-orange-400">{currentStreak}</span>
                    <span className="text-xs text-text-muted">day streak</span>
                </div>

                {/* Log meal */}
                <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-black
                    transition-all duration-200 hover:opacity-90 active:scale-95 flex-shrink-0"
                    style={{ background: "var(--primary)", boxShadow: "0 0 20px rgba(127,250,136,0.35)" }}>
                    <AddRoundedIcon sx={{ fontSize: 18 }} />
                    Log Meal
                </button>
            </div>

            {/* ── Main section ── */}
            <div className="flex flex-col lg:flex-row flex-1 min-h-0 gap-4">

                {/* Charts grid: 2×2 on large, 1 col on small */}
                <div className="flex-[2] grid grid-cols-1 sm:grid-cols-2 gap-4 lg:grid-rows-2 lg:min-h-0">

                    <Panel className="min-h-[220px] lg:min-h-0">
                        <TodaysMacros onEditTargets={() => setShowTargets(true)} />
                    </Panel>

                    <Panel className="min-h-[220px] lg:min-h-0">
                        <CalorieChart />
                    </Panel>

                    <Panel className="min-h-[220px] lg:min-h-0">
                        <MacroHistoryChart />
                    </Panel>

                    <Panel className="min-h-[220px] lg:min-h-0">
                        <WeightChart onLogWeight={() => setShowWeight(true)} />
                    </Panel>

                </div>

                {/* Meal log: full width on small, sidebar on large */}
                <div className="flex-1 min-h-[400px] lg:min-h-0">
                    <MealLog logs={PLACEHOLDER_LOGS} />
                </div>

            </div>

        </div>
    )
}

import { useState, useRef, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded"
import SendRoundedIcon from "@mui/icons-material/SendRounded"
import AddPhotoAlternateRoundedIcon from "@mui/icons-material/AddPhotoAlternateRounded"
import CloseRoundedIcon from "@mui/icons-material/CloseRounded"
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded"
import FitnessCenterRoundedIcon from "@mui/icons-material/FitnessCenterRounded"
import GrainRoundedIcon from "@mui/icons-material/GrainRounded"
import WaterDropRoundedIcon from "@mui/icons-material/WaterDropRounded"
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded"
import UndoRoundedIcon from "@mui/icons-material/UndoRounded"
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded"
import RestaurantRoundedIcon from "@mui/icons-material/RestaurantRounded"
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded"
import GlassCard from "../../components/ui/GlassCard"
import { sendChatMessageApi, getChatHistoryApi } from "../../services/cahtbot/chatApi"

// ─── Parsed content types ─────────────────────────────────────────────────────

type Role = "user" | "assistant"

interface MacroValue { consumed: number; target: number }

interface ParsedText {
    type: "text"
    message: string
}

interface ParsedMacroSummary {
    type: "macro_summary"
    message: string
    summary: {
        calories: MacroValue
        protein: MacroValue
        carbs: MacroValue
        fats: MacroValue
        meals: { name: string; calories: number; logged_at: string }[]
    }
}

interface SuggestedMeal {
    title: string
    description?: string
    calories: number
    protein: number
    carbs: number
    fats: number
    fiber: number
    meal_post_id: number | null
    ingredients: { name: string; portion: string; unit: string }[]
    steps: { step_number?: number; order?: number; description: string }[]
}

interface ParsedMealSuggestion {
    type: "meal_suggestion"
    message: string
    meals: SuggestedMeal[]
}

interface ParsedMealRecommendation {
    type: "meal_recommendation"
    message: string
    items: {
        meal_post_id: number
        name: string
        calories: number
        protein: number
        carbs: number
        fats: number
    }[]
}

interface ParsedMealLogged {
    type: "meal_logged"
    message: string
    log: {
        meal_name: string
        calories: number
        protein: number
        carbs: number
        fats: number
        calories_remaining: number
        protein_remaining: number
    }
}

interface ParsedMealDeleted {
    type: "meal_deleted"
    message: string
    log: {
        meal_name: string
        calories_removed: number
        calories_remaining: number
    }
}

interface WeeklySummaryDay {
    date: string
    calories_consumed: number
    calories_target: number
    is_hit?: boolean
    status?: string
}

interface ParsedWeeklySummary {
    type: "weekly_summary"
    message: string
    summary: {
        average_calories: number
        days_hit: number
        days_missed: number
        best_day?: string
        worst_day?: string
        days: WeeklySummaryDay[]
    }
}

interface ParsedTargetsUpdated {
    type: "targets_updated"
    message: string
    targets: {
        calories: number
        protein: number
        carbs: number
        fat: number
    }
}

type ParsedContent =
    | ParsedText
    | ParsedMacroSummary
    | ParsedMealSuggestion
    | ParsedMealRecommendation
    | ParsedMealLogged
    | ParsedMealDeleted
    | ParsedWeeklySummary
    | ParsedTargetsUpdated

interface Message {
    id: number
    role: Role
    content: string
    images?: string[]
    parsed: ParsedContent
}

// ─── Parse helper ─────────────────────────────────────────────────────────────

function extractText(obj: Record<string, unknown>, fallback: string): string {
    for (const key of ["chat_response", "message", "text"]) {
        const v = obj[key]
        if (typeof v === "string" && v.trim()) return v
    }
    return fallback
}

function normalizeApiResponse(obj: Record<string, unknown>, message: string): ParsedContent {
    const type = obj.type as string

    if (type === "macro_summary") {
        const d = (obj.summary ?? obj.data ?? {}) as Record<string, unknown>

        // Handles both shapes:
        //   nested  → { calories: { consumed, target }, ... }
        //   flat    → { calories_consumed, calories_target, ... }
        function mv(key: string): MacroValue {
            const nested = d[key]
            if (nested && typeof nested === "object") {
                const n = nested as Record<string, unknown>
                return { consumed: Number(n.consumed ?? 0), target: Number(n.target ?? 0) }
            }
            return {
                consumed: Number(d[`${key}_consumed`] ?? 0),
                target:   Number(d[`${key}_target`]   ?? 0),
            }
        }

        return {
            type: "macro_summary",
            message,
            summary: {
                calories: mv("calories"),
                protein:  mv("protein"),
                carbs:    mv("carbs"),
                fats:     mv("fats"),
                meals:    (d.meals as MacroSummaryMeal[]) ?? [],
            },
        }
    }

    if (type === "meal_logged") {
        const d = (obj.log ?? obj.data ?? {}) as Record<string, unknown>
        return {
            type: "meal_logged",
            message,
            log: {
                meal_name:          String(d.meal_name ?? ""),
                calories:           Number(d.calories ?? 0),
                protein:            Number(d.protein  ?? 0),
                carbs:              Number(d.carbs    ?? 0),
                fats:               Number(d.fats     ?? 0),
                calories_remaining: Number(d.calories_remaining ?? 0),
                protein_remaining:  Number(d.protein_remaining  ?? 0),
            },
        }
    }

    if (type === "meal_deleted") {
        const d = (obj.log ?? obj.data ?? {}) as Record<string, unknown>
        return {
            type: "meal_deleted",
            message,
            log: {
                meal_name:          String(d.meal_name ?? ""),
                calories_removed:   Number(d.calories_removed  ?? 0),
                calories_remaining: Number(d.calories_remaining ?? 0),
            },
        }
    }

    if (type === "meal_suggestion") {
        const rawMeals: Record<string, unknown>[] = Array.isArray(obj.meals)
            ? (obj.meals as Record<string, unknown>[])
            : obj.meal != null ? [obj.meal as Record<string, unknown>] : []

        return {
            type: "meal_suggestion",
            message,
            meals: rawMeals.map(m => ({
                title:        String(m.title ?? ""),
                description:  m.description ? String(m.description) : undefined,
                calories:     Number(m.calories ?? 0),
                protein:      Number(m.protein  ?? 0),
                carbs:        Number(m.carbs    ?? 0),
                fats:         Number(m.fats     ?? 0),
                fiber:        Number(m.fiber    ?? 0),
                meal_post_id: m.meal_post_id != null ? Number(m.meal_post_id) : null,
                ingredients: ((m.ingredients ?? []) as Record<string, unknown>[]).map(ing => ({
                    name:    String(ing.name    ?? ""),
                    portion: String(ing.portion ?? ""),
                    unit:    String(ing.unit    ?? ""),
                })),
                steps: ((m.steps ?? []) as Record<string, unknown>[]).map(s => ({
                    step_number: s.step != null ? Number(s.step) : (s.step_number != null ? Number(s.step_number) : undefined),
                    order:       s.order != null ? Number(s.order) : undefined,
                    description: String(s.description ?? ""),
                })),
            })),
        }
    }

    if (type === "weekly_summary") {
        const s = (obj.summary ?? {}) as Record<string, unknown>
        return {
            type: "weekly_summary",
            message,
            summary: {
                average_calories: Number(s.average_calories ?? 0),
                days_hit:         Number(s.days_hit         ?? 0),
                days_missed:      Number(s.days_missed       ?? 0),
                best_day:         s.best_day  ? String(s.best_day)  : undefined,
                worst_day:        s.worst_day ? String(s.worst_day) : undefined,
                days:             (s.days as WeeklySummaryDay[]) ?? [],
            },
        }
    }

    if (type === "targets_updated") {
        const t = (obj.targets ?? {}) as Record<string, unknown>
        return {
            type: "targets_updated",
            message,
            targets: {
                calories: Number(t.calories ?? 0),
                protein:  Number(t.protein  ?? 0),
                carbs:    Number(t.carbs    ?? 0),
                fat:      Number(t.fat      ?? 0),
            },
        }
    }

    if (type === "meal_recommendation" && Array.isArray(obj.data)) {
        return {
            type: "meal_recommendation",
            message,
            items: (obj.data as Record<string, unknown>[]).map(item => ({
                meal_post_id: Number(item.meal_post_id),
                name:         String(item.name ?? ""),
                calories:     Number(item.calories ?? 0),
                protein:      Number(item.protein  ?? 0),
                carbs:        Number(item.carbs    ?? 0),
                fats:         Number(item.fats     ?? 0),
            })),
        }
    }

    return { type: "text", message }
}

type MacroSummaryMeal = { name: string; calories: number; logged_at: string }

function parseMessage(raw: { id: number; role: Role; content: string; images?: string[] }): Message {
    if (raw.role === "assistant") {
        try {
            const obj = JSON.parse(raw.content) as Record<string, unknown>
            const message = extractText(obj, raw.content)
            const parsed = normalizeApiResponse(obj, message)
            return { ...raw, parsed }
        } catch {
            return { ...raw, parsed: { type: "text", message: raw.content } }
        }
    }
    return { ...raw, parsed: { type: "text", message: raw.content } }
}

// ─── Lightweight markdown renderer ───────────────────────────────────────────

function renderInline(text: string): React.ReactNode {
    if (!text) return null
    const parts: React.ReactNode[] = []
    const re = /\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`/g
    let last = 0
    let m: RegExpExecArray | null
    while ((m = re.exec(text)) !== null) {
        if (m.index > last) parts.push(text.slice(last, m.index))
        if (m[1]) parts.push(<strong key={m.index} className="font-semibold">{m[1]}</strong>)
        else if (m[2]) parts.push(<em key={m.index}>{m[2]}</em>)
        else if (m[3]) parts.push(
            <code key={m.index} className="px-1 py-0.5 rounded text-[11px] font-mono"
                style={{ background: "rgba(255,255,255,0.08)" }}>{m[3]}</code>
        )
        last = m.index + m[0].length
    }
    if (last < text.length) parts.push(text.slice(last))
    return parts.length === 1 ? parts[0] : <>{parts}</>
}

function MarkdownText({ text }: { text: string }) {
    if (!text) return null

    // Group lines into segments: list runs vs single lines
    type Segment =
        | { kind: "text"; line: string; key: number }
        | { kind: "heading"; level: 1 | 2; content: string; key: number }
        | { kind: "list"; items: string[]; key: number }
        | { kind: "spacer"; key: number }

    const segments: Segment[] = []
    let listAcc: string[] = []
    let k = 0

    function flushList() {
        if (!listAcc.length) return
        segments.push({ kind: "list", items: [...listAcc], key: k++ })
        listAcc = []
    }

    for (const line of text.split("\n")) {
        const h1 = line.match(/^# (.+)/)
        const h2 = line.match(/^## (.+)/)
        const li = line.match(/^[-•] (.+)/)

        if (li) {
            listAcc.push(li[1])
        } else {
            flushList()
            if (h1) {
                segments.push({ kind: "heading", level: 1, content: h1[1], key: k++ })
            } else if (h2) {
                segments.push({ kind: "heading", level: 2, content: h2[1], key: k++ })
            } else if (!line.trim()) {
                if (segments.length) segments.push({ kind: "spacer", key: k++ })
            } else {
                segments.push({ kind: "text", line, key: k++ })
            }
        }
    }
    flushList()

    return (
        <div className="flex flex-col gap-1">
            {segments.map(seg => {
                if (seg.kind === "heading") return (
                    <p key={seg.key} className={`font-semibold text-text ${seg.level === 1 ? "text-sm" : "text-xs"}`}>
                        {renderInline(seg.content)}
                    </p>
                )
                if (seg.kind === "list") return (
                    <ul key={seg.key} className="flex flex-col gap-0.5 pl-3 mt-0.5">
                        {seg.items.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-text leading-relaxed list-none">
                                <span className="mt-2 w-1 h-1 rounded-full bg-text-muted/50 flex-shrink-0" />
                                <span>{renderInline(item)}</span>
                            </li>
                        ))}
                    </ul>
                )
                if (seg.kind === "spacer") return <div key={seg.key} className="h-1" />
                return (
                    <p key={seg.key} className="text-sm text-text leading-relaxed">
                        {renderInline(seg.line)}
                    </p>
                )
            })}
        </div>
    )
}

// ─── Shared UI primitives ─────────────────────────────────────────────────────

function MacroPill({ color, icon, value, unit }: {
    color: string; icon: React.ReactNode; value: number; unit: string
}) {
    return (
        <div className="flex items-center gap-1 px-2 py-1 rounded-lg flex-shrink-0"
            style={{ background: `${color}12`, border: `1px solid ${color}28` }}>
            <span style={{ color }}>{icon}</span>
            <span className="text-[11px] font-semibold" style={{ color }}>{Math.round(value)}</span>
            <span className="text-[10px] text-text-muted">{unit}</span>
        </div>
    )
}

function AnimatedBar({ consumed, target, color }: { consumed: number; target: number; color: string }) {
    const pct = target > 0 ? Math.min((consumed / target) * 100, 100) : 0
    const [width, setWidth] = useState(0)
    useEffect(() => {
        const t = setTimeout(() => setWidth(pct), 80)
        return () => clearTimeout(t)
    }, [pct])
    return (
        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
            <div className="h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${width}%`, background: color }} />
        </div>
    )
}

function barFillColor(consumed: number, target: number): string {
    if (target <= 0) return "#7FFA88"
    const r = consumed / target
    if (r <= 1) return "#7FFA88"
    if (r <= 1.15) return "#FFC107"
    return "#f87171"
}

const MACRO_ICON_COLOR = [
    { label: "Calories", color: "#7FFA88", icon: <LocalFireDepartmentRoundedIcon sx={{ fontSize: 13 }} /> },
    { label: "Protein", color: "#4F9CF9", icon: <FitnessCenterRoundedIcon sx={{ fontSize: 13 }} /> },
    { label: "Carbs", color: "#FFC107", icon: <GrainRoundedIcon sx={{ fontSize: 13 }} /> },
    { label: "Fats", color: "#FF6B9D", icon: <WaterDropRoundedIcon sx={{ fontSize: 13 }} /> },
]

// ─── 1 — UserBubble ───────────────────────────────────────────────────────────

function UserBubble({ text, images }: { text: string; images?: string[] }) {
    return (
        <div className="flex justify-end">
            <div className="max-w-[82%] sm:max-w-[72%] flex flex-col gap-1.5 items-end">
                {images && images.length > 0 && <MessageImages images={images} />}
                {text && (
                    <div className="px-4 py-2.5 rounded-2xl rounded-br-sm bg-primary text-black/85
                        text-sm font-medium leading-relaxed shadow-[0_0_12px_rgba(127,250,136,0.25)]
                        break-words whitespace-pre-wrap">
                        {text}
                    </div>
                )}
            </div>
        </div>
    )
}

// ─── 2 — AssistantBubble ─────────────────────────────────────────────────────

function AssistantBubble({ text }: { text: string }) {
    return (
        <div className="px-4 py-3 rounded-2xl rounded-tl-sm"
            style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
            <MarkdownText text={text} />
        </div>
    )
}

// ─── 3 — MacroSummaryCard ─────────────────────────────────────────────────────

function MacroSummaryCard({ text, data }: { text: string; data: ParsedMacroSummary["summary"] }) {
    const bars = [
        { label: "Calories", ...MACRO_ICON_COLOR[0], mv: data.calories },
        { label: "Protein", ...MACRO_ICON_COLOR[1], mv: data.protein },
        { label: "Carbs", ...MACRO_ICON_COLOR[2], mv: data.carbs },
        { label: "Fats", ...MACRO_ICON_COLOR[3], mv: data.fats },
    ]

    return (
        <div className="flex flex-col gap-3 rounded-2xl overflow-hidden"
            style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>

            {/* Header text */}
            <div className="px-4 pt-3">
                <p className="text-xs text-text-muted leading-relaxed">{text}</p>
            </div>

            <div className="h-px mx-4" style={{ background: "var(--glass-border)" }} />

            {/* Progress bars */}
            <div className="flex flex-col gap-3 px-4">
                {bars.map(({ label, color, icon, mv }) => {
                    const over = mv.consumed > mv.target && mv.target > 0
                    const unit = label === "Calories" ? "kcal" : "g"
                    return (
                        <div key={label} className="flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <span style={{ color }}>{icon}</span>
                                    <span className="text-xs font-medium text-text">{label}</span>
                                </div>
                                <span className="text-xs font-semibold tabular-nums"
                                    style={{ color: over ? "#f87171" : "var(--text)" }}>
                                    {Math.round(mv.consumed)}
                                    <span className="font-normal text-text-muted">/{Math.round(mv.target)}{unit}</span>
                                </span>
                            </div>
                            <AnimatedBar consumed={mv.consumed} target={mv.target} color={over ? "#f87171" : color} />
                        </div>
                    )
                })}
            </div>

            {/* Meals list */}
            {data.meals.length > 0 && (
                <>
                    <div className="h-px mx-4" style={{ background: "var(--glass-border)" }} />
                    <div className="flex flex-col gap-1.5 px-4 pb-3">
                        <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                            {data.meals.length} meal{data.meals.length !== 1 ? "s" : ""} today
                        </span>
                        {data.meals.map((meal, i) => (
                            <div key={i} className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-primary/60" />
                                    <span className="text-xs text-text truncate">{meal.name}</span>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    <LocalFireDepartmentRoundedIcon sx={{ fontSize: 10 }} className="text-primary/60" />
                                    <span className="text-[11px] font-medium text-primary/80">{Math.round(meal.calories)}</span>
                                    <span className="text-[10px] text-text-muted">· {meal.logged_at}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {data.meals.length === 0 && (
                <div className="px-4 pb-3 flex items-center gap-2 text-text-muted/40">
                    <RestaurantRoundedIcon sx={{ fontSize: 13 }} />
                    <span className="text-xs">No meals logged yet</span>
                </div>
            )}
        </div>
    )
}

// ─── 4 — MealSuggestionCard (single meal) ────────────────────────────────────

const SUGGESTION_ACCENTS = ["rgba(127,250,136,0.2)", "rgba(79,156,249,0.2)", "rgba(255,193,7,0.2)", "rgba(255,107,157,0.2)", "rgba(167,139,250,0.2)"]

function SingleMealCard({ meal, index, onSendMessage }: {
    meal: SuggestedMeal
    index: number
    onSendMessage: (msg: string) => void
}) {
    const navigate = useNavigate()
    const [logging, setLogging] = useState(false)
    const borderColor = SUGGESTION_ACCENTS[index % SUGGESTION_ACCENTS.length]

    async function handleLog() {
        if (logging) return
        setLogging(true)
        await onSendMessage(
            `log this meal: ${meal.title} - ${meal.calories} kcal, ${meal.protein}g protein, ${meal.carbs}g carbs, ${meal.fats}g fats, ${meal.fiber}g fiber`
        )
        setLogging(false)
    }

    const stepNum = (s: { step_number?: number; order?: number }, i: number) =>
        s.step_number ?? s.order ?? i + 1

    return (
        <div className="flex flex-col gap-3 rounded-2xl overflow-hidden"
            style={{ background: "var(--glass-bg)", border: `1px solid ${borderColor}` }}>

            {/* Title + description */}
            <div className="px-4 pt-3 flex flex-col gap-0.5">
                <p className="text-sm font-bold text-text leading-tight">{meal.title}</p>
                {meal.description && (
                    <p className="text-xs text-text-muted leading-relaxed">{meal.description}</p>
                )}
            </div>

            {/* Macro pills */}
            <div className="flex flex-wrap gap-1.5 px-4">
                <MacroPill color="#7FFA88" icon={<LocalFireDepartmentRoundedIcon sx={{ fontSize: 12 }} />} value={meal.calories} unit="kcal" />
                <MacroPill color="#4F9CF9" icon={<FitnessCenterRoundedIcon sx={{ fontSize: 11 }} />} value={meal.protein} unit="g" />
                <MacroPill color="#FFC107" icon={<GrainRoundedIcon sx={{ fontSize: 11 }} />} value={meal.carbs} unit="g" />
                <MacroPill color="#FF6B9D" icon={<WaterDropRoundedIcon sx={{ fontSize: 11 }} />} value={meal.fats} unit="g" />
            </div>

            {/* Ingredients */}
            {meal.ingredients.length > 0 && (
                <>
                    <div className="h-px mx-4" style={{ background: "var(--glass-border)" }} />
                    <div className="flex flex-col gap-2 px-4">
                        <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Ingredients</span>
                        <div className="flex flex-wrap gap-1.5">
                            {meal.ingredients.map((ing, i) => (
                                <div key={i}
                                    className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs"
                                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)" }}>
                                    <span className="font-medium text-text">{ing.name}</span>
                                    <span className="text-text-muted/50">·</span>
                                    <span className="text-text-muted">{ing.portion} {ing.unit}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* Steps */}
            {meal.steps.length > 0 && (
                <>
                    <div className="h-px mx-4" style={{ background: "var(--glass-border)" }} />
                    <div className="flex flex-col gap-2 px-4">
                        <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Preparation</span>
                        <div className="flex flex-col gap-2.5">
                            {meal.steps.map((step, i) => (
                                <div key={i} className="flex gap-2.5">
                                    <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5"
                                        style={{ background: "rgba(127,250,136,0.12)", color: "var(--primary)", border: "1px solid rgba(127,250,136,0.25)" }}>
                                        {stepNum(step, i)}
                                    </div>
                                    <p className="text-xs text-text leading-relaxed">{step.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* Action buttons */}
            <div className="flex gap-2 px-4 pb-3 pt-1">
                <button
                    onClick={handleLog}
                    disabled={logging}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold flex-1 justify-center
                        transition-all duration-200 hover:opacity-90 active:scale-95 disabled:opacity-40"
                    style={{ background: "var(--btn-bg)", color: "var(--btn-text)", boxShadow: "0 0 10px var(--btn-shadow)" }}>
                    {logging
                        ? <span className="inline-block w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                        : <CheckCircleRoundedIcon sx={{ fontSize: 14 }} />}
                    Log This Meal
                </button>

                {meal.meal_post_id !== null && (
                    <button
                        onClick={() => navigate(`/meals/${meal.meal_post_id}`)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-text-muted
                            transition-all duration-200 hover:text-text active:scale-95"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--glass-border)" }}>
                        <OpenInNewRoundedIcon sx={{ fontSize: 13 }} />
                        View Meal
                    </button>
                )}
            </div>
        </div>
    )
}

function MealSuggestionCard({ text, meals, onSendMessage }: {
    text: string
    meals: SuggestedMeal[]
    onSendMessage: (msg: string) => void
}) {
    return (
        <div className="flex flex-col gap-2">
            <p className="text-xs text-text-muted px-0.5 leading-relaxed">{text}</p>
            {meals.map((meal, i) => (
                <SingleMealCard key={i} meal={meal} index={i} onSendMessage={onSendMessage} />
            ))}
        </div>
    )
}

// ─── 5 — MealLoggedCard ───────────────────────────────────────────────────────

function MealLoggedCard({ text, data, onSendMessage }: {
    text: string
    data: ParsedMealLogged["log"]
    onSendMessage: (msg: string) => void
}) {
    const [undoing, setUndoing] = useState(false)

    async function handleUndo() {
        if (undoing) return
        setUndoing(true)
        await onSendMessage("remove my last log")
        setUndoing(false)
    }

    const calOver = data.calories_remaining < 0
    const protOver = data.protein_remaining < 0

    return (
        <div className="flex flex-col gap-3 rounded-2xl overflow-hidden"
            style={{ background: "rgba(127,250,136,0.05)", border: "1px solid rgba(127,250,136,0.22)" }}>

            {/* Success header */}
            <div className="flex items-center gap-2.5 px-4 pt-3">
                <CheckCircleRoundedIcon sx={{ fontSize: 20 }} className="text-primary flex-shrink-0" />
                <div>
                    <p className="text-sm font-bold text-text">{data.meal_name}</p>
                    <p className="text-[11px] text-text-muted">{text}</p>
                </div>
            </div>

            <div className="h-px mx-4" style={{ background: "rgba(127,250,136,0.15)" }} />

            {/* Macros */}
            <div className="flex flex-wrap gap-1.5 px-4">
                <MacroPill color="#7FFA88" icon={<LocalFireDepartmentRoundedIcon sx={{ fontSize: 12 }} />} value={data.calories} unit="kcal" />
                <MacroPill color="#4F9CF9" icon={<FitnessCenterRoundedIcon sx={{ fontSize: 11 }} />} value={data.protein} unit="g" />
                <MacroPill color="#FFC107" icon={<GrainRoundedIcon sx={{ fontSize: 11 }} />} value={data.carbs} unit="g" />
                <MacroPill color="#FF6B9D" icon={<WaterDropRoundedIcon sx={{ fontSize: 11 }} />} value={data.fats} unit="g" />
            </div>

            {/* Remaining */}
            <div className="flex flex-wrap gap-2 px-4">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                    style={{
                        background: calOver ? "rgba(248,113,113,0.08)" : "rgba(127,250,136,0.08)",
                        border: `1px solid ${calOver ? "rgba(248,113,113,0.25)" : "rgba(127,250,136,0.25)"}`,
                    }}>
                    <LocalFireDepartmentRoundedIcon sx={{ fontSize: 11 }} style={{ color: calOver ? "#f87171" : "#7FFA88" }} />
                    <span className="text-[11px] font-semibold" style={{ color: calOver ? "#f87171" : "#7FFA88" }}>
                        {calOver
                            ? `${Math.abs(Math.round(data.calories_remaining))} kcal over`
                            : `${Math.round(data.calories_remaining)} kcal left`}
                    </span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                    style={{
                        background: protOver ? "rgba(248,113,113,0.08)" : "rgba(79,156,249,0.08)",
                        border: `1px solid ${protOver ? "rgba(248,113,113,0.25)" : "rgba(79,156,249,0.25)"}`,
                    }}>
                    <FitnessCenterRoundedIcon sx={{ fontSize: 11 }} style={{ color: protOver ? "#f87171" : "#4F9CF9" }} />
                    <span className="text-[11px] font-semibold" style={{ color: protOver ? "#f87171" : "#4F9CF9" }}>
                        {protOver
                            ? `${Math.abs(Math.round(data.protein_remaining))}g over`
                            : `${Math.round(data.protein_remaining)}g protein left`}
                    </span>
                </div>
            </div>

            {/* Undo */}
            <div className="px-4 pb-3">
                <button
                    onClick={handleUndo}
                    disabled={undoing}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-text-muted
                        transition-all duration-200 hover:text-text active:scale-95 disabled:opacity-40"
                    style={{ background: "var(--muted-bg)", border: "1px solid var(--glass-border)" }}>
                    {undoing
                        ? <span className="inline-block w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                        : <UndoRoundedIcon sx={{ fontSize: 13 }} />}
                    Undo
                </button>
            </div>
        </div>
    )
}

// ─── 6 — MealDeletedCard ─────────────────────────────────────────────────────

function MealDeletedCard({ text, data }: {
    text: string
    data: ParsedMealDeleted["log"]
}) {
    return (
        <div className="flex flex-col gap-2.5 p-4 rounded-2xl"
            style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>

            <div className="flex items-center gap-2">
                <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} className="text-text-muted flex-shrink-0" />
                <p className="text-sm text-text leading-relaxed">{text}</p>
            </div>

            <div className="flex flex-wrap gap-2 pt-0.5">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                    style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)" }}>
                    <LocalFireDepartmentRoundedIcon sx={{ fontSize: 11 }} style={{ color: "#f87171" }} />
                    <span className="text-[11px] font-semibold" style={{ color: "#f87171" }}>
                        {data.meal_name} · -{Math.round(data.calories_removed)} kcal
                    </span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                    style={{ background: "rgba(127,250,136,0.08)", border: "1px solid rgba(127,250,136,0.2)" }}>
                    <LocalFireDepartmentRoundedIcon sx={{ fontSize: 11 }} className="text-primary" />
                    <span className="text-[11px] font-semibold text-primary">
                        {Math.round(data.calories_remaining)} kcal remaining
                    </span>
                </div>
            </div>
        </div>
    )
}

// ─── 7 — WeeklySummaryCard ────────────────────────────────────────────────────

function fmtDate(dateStr: string): string {
    const [y, m, d] = dateStr.split("-").map(Number)
    return new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
}

function isDayHit(day: WeeklySummaryDay): boolean {
    if (typeof day.is_hit === "boolean") return day.is_hit
    if (day.status) return day.status === "HIT"
    return false
}

function WeeklySummaryCard({ text, data }: {
    text: string
    data: ParsedWeeklySummary["summary"]
}) {
    const totalDays = data.days_hit + data.days_missed
    const hitPct    = totalDays > 0 ? Math.round((data.days_hit / totalDays) * 100) : 0

    const stats = [
        { label: "Avg calories", value: data.average_calories > 0 ? Math.round(data.average_calories).toLocaleString() : "—" },
        { label: "Days on target", value: `${data.days_hit}/${totalDays}` },
        { label: "Hit rate", value: totalDays > 0 ? `${hitPct}%` : "—" },
    ]

    return (
        <div className="flex flex-col gap-3 rounded-2xl overflow-hidden"
            style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>

            {/* Header */}
            <div className="px-4 pt-3">
                <p className="text-xs text-text-muted leading-relaxed">{text}</p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-px mx-4 rounded-xl overflow-hidden"
                style={{ background: "var(--glass-border)" }}>
                {stats.map((s, i) => (
                    <div key={i} className="flex flex-col items-center gap-0.5 py-2.5"
                        style={{ background: "var(--glass-bg)" }}>
                        <span className="text-sm font-bold text-text">{s.value}</span>
                        <span className="text-[10px] text-text-muted text-center px-1 leading-tight">{s.label}</span>
                    </div>
                ))}
            </div>

            {/* Best / worst day */}
            {(data.best_day || data.worst_day) && (
                <div className="flex gap-2 px-4">
                    {data.best_day && (
                        <div className="flex-1 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
                            style={{ background: "rgba(127,250,136,0.08)", border: "1px solid rgba(127,250,136,0.2)" }}>
                            <LocalFireDepartmentRoundedIcon sx={{ fontSize: 11 }} className="text-primary flex-shrink-0" />
                            <div className="flex flex-col min-w-0">
                                <span className="text-[9px] font-semibold text-primary uppercase tracking-wide">Best day</span>
                                <span className="text-[11px] text-text truncate">{fmtDate(data.best_day)}</span>
                            </div>
                        </div>
                    )}
                    {data.worst_day && (
                        <div className="flex-1 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
                            style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.18)" }}>
                            <LocalFireDepartmentRoundedIcon sx={{ fontSize: 11 }} style={{ color: "#f87171" }} className="flex-shrink-0" />
                            <div className="flex flex-col min-w-0">
                                <span className="text-[9px] font-semibold uppercase tracking-wide" style={{ color: "#f87171" }}>Worst day</span>
                                <span className="text-[11px] text-text truncate">{fmtDate(data.worst_day)}</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Days list */}
            {data.days.length > 0 && (
                <>
                    <div className="h-px mx-4" style={{ background: "var(--glass-border)" }} />
                    <div className="flex flex-col gap-1.5 px-4 pb-3">
                        {data.days.map((day, i) => {
                            const hit = isDayHit(day)
                            const pct = day.calories_target > 0
                                ? Math.min(Math.round((day.calories_consumed / day.calories_target) * 100), 100)
                                : 0
                            return (
                                <div key={i} className="flex flex-col gap-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-xs text-text-muted">{fmtDate(day.date)}</span>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <span className="text-xs tabular-nums text-text">
                                                {Math.round(day.calories_consumed)}
                                                <span className="text-text-muted">/{Math.round(day.calories_target)} kcal</span>
                                            </span>
                                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                                                style={hit
                                                    ? { background: "rgba(127,250,136,0.12)", color: "#7FFA88", border: "1px solid rgba(127,250,136,0.25)" }
                                                    : { background: "rgba(248,113,113,0.1)", color: "#f87171", border: "1px solid rgba(248,113,113,0.2)" }}>
                                                {hit ? "HIT" : "MISSED"}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                                        <div className="h-full rounded-full transition-all duration-700"
                                            style={{ width: `${pct}%`, background: hit ? "#7FFA88" : "#f87171" }} />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </>
            )}
        </div>
    )
}

// ─── 7 — MealRecommendationCard ──────────────────────────────────────────────

function MealRecommendationCard({ text, items }: {
    text: string
    items: ParsedMealRecommendation["items"]
}) {
    const navigate = useNavigate()
    const ACCENTS = ["#7FFA88", "#4F9CF9", "#FFC107", "#FF6B9D", "#a78bfa"]

    return (
        <div className="flex flex-col gap-2 rounded-2xl overflow-hidden"
            style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>

            <div className="px-4 pt-3">
                <p className="text-xs text-text-muted leading-relaxed">{text}</p>
            </div>

            <div className="flex flex-col gap-2 px-4 pb-3">
                {items.map((item, i) => {
                    const accent = ACCENTS[i % ACCENTS.length]
                    return (
                        <button
                            key={item.meal_post_id}
                            onClick={() => navigate(`/meals/${item.meal_post_id}`)}
                            className="flex flex-col gap-2 p-3 rounded-xl text-left w-full transition-all duration-200 hover:opacity-85 active:scale-[0.98]"
                            style={{ background: `${accent}08`, border: `1px solid ${accent}28` }}>
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                                    style={{ background: `${accent}15`, border: `1px solid ${accent}28` }}>
                                    <RestaurantRoundedIcon sx={{ fontSize: 13 }} style={{ color: accent }} />
                                </div>
                                <span className="text-sm font-semibold text-text">{item.name}</span>
                                <OpenInNewRoundedIcon sx={{ fontSize: 13 }} className="ml-auto text-text-muted/40" />
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                <MacroPill color="#7FFA88" icon={<LocalFireDepartmentRoundedIcon sx={{ fontSize: 12 }} />} value={item.calories} unit="kcal" />
                                <MacroPill color="#4F9CF9" icon={<FitnessCenterRoundedIcon      sx={{ fontSize: 11 }} />} value={item.protein}  unit="g" />
                                <MacroPill color="#FFC107" icon={<GrainRoundedIcon              sx={{ fontSize: 11 }} />} value={item.carbs}    unit="g" />
                                <MacroPill color="#FF6B9D" icon={<WaterDropRoundedIcon          sx={{ fontSize: 11 }} />} value={item.fats}     unit="g" />
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

// ─── TargetsUpdatedCard ───────────────────────────────────────────────────────

function TargetsUpdatedCard({ text, targets }: {
    text: string
    targets: ParsedTargetsUpdated["targets"]
}) {
    const rows = [
        { label: "Calories", value: targets.calories, unit: "kcal", color: "#7FFA88", icon: <LocalFireDepartmentRoundedIcon sx={{ fontSize: 13 }} /> },
        { label: "Protein",  value: targets.protein,  unit: "g",    color: "#4F9CF9", icon: <FitnessCenterRoundedIcon      sx={{ fontSize: 13 }} /> },
        { label: "Carbs",    value: targets.carbs,    unit: "g",    color: "#FFC107", icon: <GrainRoundedIcon              sx={{ fontSize: 13 }} /> },
        { label: "Fat",      value: targets.fat,      unit: "g",    color: "#FF6B9D", icon: <WaterDropRoundedIcon          sx={{ fontSize: 13 }} /> },
    ]

    return (
        <div className="flex flex-col gap-3 rounded-2xl overflow-hidden"
            style={{ background: "var(--glass-bg)", border: "1px solid rgba(127,250,136,0.22)" }}>

            {/* Header */}
            <div className="flex items-center gap-2.5 px-4 pt-3">
                <CheckCircleRoundedIcon sx={{ fontSize: 18 }} className="text-primary flex-shrink-0" />
                <p className="text-sm text-text leading-relaxed">{text}</p>
            </div>

            <div className="h-px mx-4" style={{ background: "rgba(127,250,136,0.15)" }} />

            {/* Targets grid */}
            <div className="grid grid-cols-2 gap-2 px-4 pb-4">
                {rows.map(({ label, value, unit, color, icon }) => (
                    <div key={label} className="flex flex-col gap-1.5 p-3 rounded-xl"
                        style={{ background: `${color}0d`, border: `1px solid ${color}22` }}>
                        <div className="flex items-center gap-1.5">
                            <span style={{ color }}>{icon}</span>
                            <span className="text-[11px] font-medium text-text-muted">{label}</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-lg font-bold" style={{ color }}>{value.toLocaleString()}</span>
                            <span className="text-[10px] text-text-muted">{unit}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ─── MessageRenderer ──────────────────────────────────────────────────────────

function MessageRenderer({ message, onSendMessage }: {
    message: Message
    onSendMessage: (msg: string) => void
}) {
    const { role, parsed } = message

    if (role === "user") {
        return <UserBubble text={parsed.message} images={message.images} />
    }

    // Assistant wrapper: avatar + content
    let content: React.ReactNode

    switch (parsed.type) {
        case "macro_summary":
            content = <MacroSummaryCard text={parsed.message} data={parsed.summary} />
            break
        case "meal_suggestion":
            content = <MealSuggestionCard text={parsed.message} meals={parsed.meals} onSendMessage={onSendMessage} />
            break
        case "meal_logged":
            content = <MealLoggedCard text={parsed.message} data={parsed.log} onSendMessage={onSendMessage} />
            break
        case "meal_deleted":
            content = <MealDeletedCard text={parsed.message} data={parsed.log} />
            break
        case "meal_recommendation":
            content = <MealRecommendationCard text={parsed.message} items={parsed.items} />
            break
        case "weekly_summary":
            content = <WeeklySummaryCard text={parsed.message} data={parsed.summary} />
            break
        case "targets_updated":
            content = <TargetsUpdatedCard text={parsed.message} targets={parsed.targets} />
            break
        default:
            content = <AssistantBubble text={parsed.message} />
    }

    return (
        <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                <AutoAwesomeRoundedIcon sx={{ fontSize: 12 }} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0 max-w-[93%] sm:max-w-[88%]">{content}</div>
        </div>
    )
}

// ─── Typing indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
    return (
        <div className="flex items-end gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                <AutoAwesomeRoundedIcon sx={{ fontSize: 12 }} className="text-primary" />
            </div>
            <div className="flex items-center gap-1 px-3.5 py-2.5 rounded-2xl rounded-bl-sm"
                style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-text-muted/60 animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-text-muted/60 animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-text-muted/60 animate-bounce [animation-delay:300ms]" />
            </div>
        </div>
    )
}

// ─── Image lightbox ───────────────────────────────────────────────────────────

function MessageImages({ images }: { images: string[] }) {
    const [lightbox, setLightbox] = useState<string | null>(null)
    const grid = images.length === 1 ? "grid-cols-1" : "grid-cols-2"

    return (
        <>
            <div className={`grid ${grid} gap-1.5`}>
                {images.map((src, i) => (
                    <div key={i} onClick={() => setLightbox(src)}
                        className={`overflow-hidden cursor-zoom-in ${images.length === 3 && i === 2 ? "col-span-2" : ""}`}
                        style={{ borderRadius: 10 }}>
                        <img src={src} alt="" className="w-full object-cover"
                            style={{ maxHeight: images.length === 1 ? 260 : 160 }} />
                    </div>
                ))}
            </div>
            {lightbox && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    onClick={() => setLightbox(null)}>
                    <button className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                        onClick={() => setLightbox(null)}>
                        <CloseRoundedIcon sx={{ fontSize: 18 }} />
                    </button>
                    <img src={lightbox} alt="" className="max-w-full max-h-full rounded-2xl object-contain"
                        onClick={e => e.stopPropagation()} />
                </div>
            )}
        </>
    )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AiChat() {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const [attachedImages, setAttachedImages] = useState<{ file: File; url: string }[]>([])
    const [loading, setLoading] = useState(false)
    const [historyLoading, setHistoryLoading] = useState(true)
    const [loadingOlder, setLoadingOlder] = useState(false)
    const [cursor, setCursor] = useState<string | null>(null)
    const [hasMore, setHasMore] = useState(false)

    const messagesRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Load history — apply parseMessage to every entry
    useEffect(() => {
        getChatHistoryApi()
            .then(res => {
                const sorted = [...res.data].reverse()
                setMessages(sorted.map(m => parseMessage({ id: m.id, role: m.role, content: m.content })))
                setCursor(res.meta.next_cursor)
                setHasMore(res.meta.has_more)
            })
            .catch(() => {
                setMessages([parseMessage({
                    id: 0,
                    role: "assistant",
                    content: JSON.stringify({
                        type: "text",
                        message: "Hi! I'm your NutriSphere AI. Ask me anything about nutrition, meal planning, or your health goals.",
                    }),
                })])
            })
            .finally(() => setHistoryLoading(false))
    }, [])

    useEffect(() => {
        if (historyLoading) return
        const el = messagesRef.current
        if (!el) return
        el.scrollTop = el.scrollHeight
    }, [messages, loading, historyLoading])

    useEffect(() => {
        return () => attachedImages.forEach(img => URL.revokeObjectURL(img.url))
    }, [])

    // Shared send — used by both the input and card action buttons
    const sendMessage = useCallback(async (text: string) => {
        if (!text.trim() || loading) return
        setMessages(prev => [...prev,
        parseMessage({ id: Date.now(), role: "user", content: text })
        ])
        setLoading(true)
        try {
            const rawContent = await sendChatMessageApi(text)
            setMessages(prev => [...prev,
            parseMessage({ id: Date.now() + 1, role: "assistant", content: JSON.stringify(rawContent) })
            ])
        } catch {
            setMessages(prev => [...prev,
            parseMessage({
                id: Date.now() + 1,
                role: "assistant",
                content: JSON.stringify({ type: "text", message: "Something went wrong. Please try again." }),
            })
            ])
        } finally {
            setLoading(false)
            inputRef.current?.focus()
        }
    }, [loading])

    async function loadOlderMessages() {
        if (!cursor || !hasMore || loadingOlder) return
        const el = messagesRef.current
        const prevScrollHeight = el?.scrollHeight ?? 0
        setLoadingOlder(true)
        try {
            const res = await getChatHistoryApi(cursor)
            const older = [...res.data].reverse()
            setMessages(prev => [
                ...older.map(m => parseMessage({ id: m.id, role: m.role, content: m.content })),
                ...prev,
            ])
            setCursor(res.meta.next_cursor)
            setHasMore(res.meta.has_more)
            requestAnimationFrame(() => {
                if (!el) return
                el.scrollTop = el.scrollHeight - prevScrollHeight
            })
        } catch { /* silently ignore */ }
        finally { setLoadingOlder(false) }
    }

    function handleScroll() {
        const el = messagesRef.current
        if (!el || el.scrollTop > 60) return
        loadOlderMessages()
    }

    function autoResize() {
        const el = inputRef.current
        if (!el) return
        el.style.height = "auto"
        el.style.height = `${Math.min(el.scrollHeight, 112)}px`
    }

    function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
        setInput(e.target.value)
        autoResize()
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files ?? [])
        const images = files
            .filter(f => f.type.startsWith("image/"))
            .slice(0, 4 - attachedImages.length)
            .map(file => ({ file, url: URL.createObjectURL(file) }))
        setAttachedImages(prev => [...prev, ...images].slice(0, 4))
        e.target.value = ""
    }

    function removeImage(index: number) {
        setAttachedImages(prev => {
            URL.revokeObjectURL(prev[index].url)
            return prev.filter((_, i) => i !== index)
        })
    }

    async function handleSend() {
        const text = input.trim()
        if ((!text && attachedImages.length === 0) || loading) return
        setInput("")
        setAttachedImages([])
        if (inputRef.current) inputRef.current.style.height = "auto"
        await sendMessage(text)
    }

    const canSend = (input.trim().length > 0 || attachedImages.length > 0) && !loading

    function handleInputFocus() {
        // On mobile the layout is frozen at 100svh so the keyboard overlaps — scroll input into view
        setTimeout(() => {
            inputRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
        }, 320)
    }

    return (
        <div className="h-full flex flex-col min-h-0">

            {/* Header */}
            <div className="flex items-center gap-3 flex-shrink-0 mb-2 sm:mb-4">
                <div className="relative">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <AutoAwesomeRoundedIcon sx={{ fontSize: 18 }} className="text-primary" />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-primary rounded-full ring-2 ring-background shadow-[0_0_6px_rgba(127,250,136,0.8)]" />
                </div>
                <div>
                    <p className="text-sm font-semibold text-text">NutriSphere AI</p>
                    <p className="text-xs text-text-muted">Nutrition & health assistant</p>
                </div>
            </div>

            {/* Messages */}
            <div
                ref={messagesRef}
                onScroll={handleScroll}
                className="flex-1 min-h-0 overflow-y-auto no-scrollbar rounded-2xl p-3 sm:p-4 flex flex-col gap-3 sm:gap-4 shadow-xl"
                style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}
            >
                {historyLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <span className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    </div>
                ) : (
                    <>
                        {hasMore && (
                            <button onClick={loadOlderMessages} disabled={loadingOlder}
                                className="self-center text-xs text-text-muted hover:text-primary transition-colors py-1 flex items-center gap-1.5 disabled:opacity-50">
                                {loadingOlder
                                    ? <span className="w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                                    : "Load older messages"}
                            </button>
                        )}
                        {messages.map(msg => (
                            <MessageRenderer key={msg.id} message={msg} onSendMessage={sendMessage} />
                        ))}
                        {loading && <TypingIndicator />}
                    </>
                )}
            </div>

            {/* Input */}
            <GlassCard className="flex flex-col rounded-2xl px-3 sm:px-4 pt-2.5 sm:pt-3 pb-2.5 sm:pb-3 flex-shrink-0 mt-2 sm:mt-3 gap-2">

                {attachedImages.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                        {attachedImages.map((img, i) => (
                            <div key={i} className="relative group">
                                <img src={img.url} alt=""
                                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover"
                                    style={{ border: "1px solid var(--glass-border)" }} />
                                <button onClick={() => removeImage(i)}
                                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-black/70 text-white
                                        flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-150">
                                    <CloseRoundedIcon sx={{ fontSize: 12 }} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex items-end gap-2">
                    <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
                        onChange={handleFileChange} />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={attachedImages.length >= 4}
                        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0
                            text-text-muted hover:text-primary hover:bg-primary/10
                            disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200">
                        <AddPhotoAlternateRoundedIcon sx={{ fontSize: 18 }} />
                    </button>

                    <textarea
                        ref={inputRef}
                        rows={1}
                        value={input}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        onFocus={handleInputFocus}
                        placeholder="Ask about nutrition, meals, goals…"
                        className="flex-1 bg-transparent text-sm text-text placeholder:text-text-muted/40
                            outline-none resize-none leading-relaxed py-0.5 overflow-y-auto"
                    />

                    <button
                        onClick={handleSend}
                        disabled={!canSend}
                        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0
                            bg-primary text-black/80 hover:opacity-90 active:scale-95
                            disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-200"
                        style={{ boxShadow: canSend ? "0 0 14px rgba(127,250,136,0.45)" : "none" }}>
                        <SendRoundedIcon sx={{ fontSize: 16 }} />
                    </button>
                </div>
            </GlassCard>

        </div>
    )
}

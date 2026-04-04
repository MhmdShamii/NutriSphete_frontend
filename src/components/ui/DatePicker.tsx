import { useState, useRef, useEffect } from "react"
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded"
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded"
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded"

type Props = {
    value: string           // "YYYY-MM-DD"
    onChange: (v: string) => void
    label?: string
    placeholder?: string
}

const DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]
const MONTHS = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"]

function parseDate(v: string): Date | null {
    if (!v) return null
    const d = new Date(v + "T00:00:00")
    return isNaN(d.getTime()) ? null : d
}

function toISO(y: number, m: number, d: number) {
    return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
}

function formatDisplay(v: string) {
    const d = parseDate(v)
    if (!d) return ""
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
}

export default function DatePicker({ value, onChange, label, placeholder = "Select date" }: Props) {
    const today = new Date()
    const selected = parseDate(value)

    const [open, setOpen] = useState(false)
    const [viewYear, setViewYear] = useState(selected?.getFullYear() ?? today.getFullYear() - 20)
    const [viewMonth, setViewMonth] = useState(selected?.getMonth() ?? today.getMonth())
    const [yearInput, setYearInput] = useState(String(selected?.getFullYear() ?? today.getFullYear() - 20))
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener("mousedown", handleOutside)
        return () => document.removeEventListener("mousedown", handleOutside)
    }, [])

    function prevMonth() {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
        else setViewMonth(m => m - 1)
    }

    function nextMonth() {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
        else setViewMonth(m => m + 1)
    }

    // Build days grid (Monday-first)
    const firstDay = new Date(viewYear, viewMonth, 1)
    const startOffset = (firstDay.getDay() + 6) % 7   // Mon=0
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
    const cells: (number | null)[] = [
        ...Array(startOffset).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ]
    // pad to full rows
    while (cells.length % 7 !== 0) cells.push(null)

    function selectDay(day: number) {
        onChange(toISO(viewYear, viewMonth, day))
        setOpen(false)
    }

    function isSelected(day: number) {
        return selected?.getFullYear() === viewYear &&
            selected?.getMonth() === viewMonth &&
            selected?.getDate() === day
    }

    function isToday(day: number) {
        return today.getFullYear() === viewYear &&
            today.getMonth() === viewMonth &&
            today.getDate() === day
    }

    function isFuture(day: number) {
        return new Date(viewYear, viewMonth, day) > today
    }

    return (
        <div ref={ref} className="relative w-full">
            {label && <label className="text-sm text-text-muted block mb-2">{label}</label>}

            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="flex w-full items-center justify-between h-11 px-3 rounded-lg
                    border border-border/30 bg-surface text-sm transition-all duration-200
                    hover:border-primary/40
                    focus:outline-none focus:border-primary/60 focus:shadow-[0_0_12px_rgba(127,250,136,0.25)]"
            >
                <span className={value ? "text-text" : "text-text-muted/60"}>
                    {value ? formatDisplay(value) : placeholder}
                </span>
                <CalendarTodayRoundedIcon sx={{ fontSize: 16 }} className="text-text-muted" />
            </button>

            {/* Calendar popover */}
            <div className={`
                absolute z-50 mt-2 w-72 rounded-2xl shadow-xl p-4
                transition-all duration-200 origin-top-left
                ${open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}
            `}
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <button type="button" onClick={prevMonth}
                        className="p-1 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-colors">
                        <ChevronLeftRoundedIcon sx={{ fontSize: 20 }} />
                    </button>

                    <div className="flex flex-col items-center gap-0.5">
                        {/* Month */}
                        <select
                            value={viewMonth}
                            onChange={e => setViewMonth(Number(e.target.value))}
                            className="bg-transparent text-sm font-semibold text-text outline-none cursor-pointer text-center"
                        >
                            {MONTHS.map((m, i) => <option key={i} value={i} className="bg-surface">{m}</option>)}
                        </select>

                        {/* Year with − + controls */}
                        <div className="flex items-center gap-1">
                            <button type="button"
                                onClick={() => { const y = viewYear - 1; if (y > 1900) { setViewYear(y); setYearInput(String(y)) } }}
                                className="w-5 h-5 flex items-center justify-center rounded text-text-muted hover:text-primary hover:bg-primary/10 text-xs transition-colors">
                                −
                            </button>
                            <input
                                type="text"
                                value={yearInput}
                                onChange={e => {
                                    const raw = e.target.value.replace(/\D/g, "").slice(0, 4)
                                    setYearInput(raw)
                                    const y = Number(raw)
                                    if (raw.length === 4 && y > 1900 && y <= today.getFullYear()) setViewYear(y)
                                }}
                                onBlur={() => setYearInput(String(viewYear))}
                                className="bg-transparent text-sm font-semibold text-text outline-none w-10 text-center"
                            />
                            <button type="button"
                                onClick={() => { const y = viewYear + 1; if (y <= today.getFullYear()) { setViewYear(y); setYearInput(String(y)) } }}
                                className="w-5 h-5 flex items-center justify-center rounded text-text-muted hover:text-primary hover:bg-primary/10 text-xs transition-colors">
                                +
                            </button>
                        </div>
                    </div>

                    <button type="button" onClick={nextMonth}
                        className="p-1 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-colors">
                        <ChevronRightRoundedIcon sx={{ fontSize: 20 }} />
                    </button>
                </div>

                {/* Day names */}
                <div className="grid grid-cols-7 mb-1">
                    {DAYS.map(d => (
                        <div key={d} className="text-center text-xs text-text-muted/60 font-medium py-1">{d}</div>
                    ))}
                </div>

                {/* Days grid */}
                <div className="grid grid-cols-7 gap-y-1">
                    {cells.map((day, i) => (
                        <div key={i} className="flex items-center justify-center">
                            {day ? (
                                <button
                                    type="button"
                                    disabled={isFuture(day)}
                                    onClick={() => selectDay(day)}
                                    className={`w-8 h-8 rounded-full text-xs font-medium transition-all duration-150
                                        ${isSelected(day)
                                            ? "bg-primary text-black shadow-[0_0_10px_rgba(127,250,136,0.5)]"
                                            : isToday(day)
                                                ? "border border-primary/50 text-primary"
                                                : isFuture(day)
                                                    ? "text-text-muted/30 cursor-not-allowed"
                                                    : "text-text-muted hover:bg-primary/10 hover:text-primary"
                                        }
                                    `}
                                >
                                    {day}
                                </button>
                            ) : null}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

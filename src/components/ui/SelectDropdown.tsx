import { useState, useRef, useEffect } from "react"
import ArrowDropDownRoundedIcon from "@mui/icons-material/ArrowDropDownRounded"
import CheckRoundedIcon from "@mui/icons-material/CheckRounded"

export type Option = { value: string; label: string }

type Props = {
    options: Option[]
    value: string
    onChange: (value: string) => void
    label?: string
    placeholder?: string
    className?: string
}

export default function SelectDropdown({ options, value, onChange, label, placeholder = "Select", className = "" }: Props) {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    const selected = options.find(o => o.value === value)

    useEffect(() => {
        function handleOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener("mousedown", handleOutside)
        return () => document.removeEventListener("mousedown", handleOutside)
    }, [])

    return (
        <div ref={ref} className={`relative w-full ${className}`}>
            {label && <label className="text-sm text-text-muted block mb-2">{label}</label>}

            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="flex w-full items-center justify-between h-11 px-3 rounded-lg
                    border border-border/30 bg-surface text-sm transition-all duration-200
                    hover:border-primary/40
                    focus:outline-none focus:border-primary/60 focus:shadow-[0_0_12px_rgba(127,250,136,0.25)]"
            >
                <span className={selected ? "text-text" : "text-text-muted/60"}>{selected?.label ?? placeholder}</span>
                <ArrowDropDownRoundedIcon
                    sx={{ fontSize: 20 }}
                    className={`text-text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                />
            </button>

            <div className={`
                absolute z-50 mt-2 w-full rounded-xl shadow-xl overflow-hidden
                transition-all duration-200 origin-top
                ${open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}
            `}
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
                <div className="py-1 max-h-52 overflow-y-auto">
                    {options.map(o => (
                        <button
                            key={o.value}
                            type="button"
                            onClick={() => { onChange(o.value); setOpen(false) }}
                            className={`flex w-full items-center justify-between px-3 py-2.5 text-sm transition-colors duration-150
                                hover:bg-primary/10 hover:text-primary
                                ${o.value === value ? "text-primary bg-primary/5" : "text-text-muted"}
                            `}
                        >
                            {o.label}
                            {o.value === value && <CheckRoundedIcon sx={{ fontSize: 14 }} />}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

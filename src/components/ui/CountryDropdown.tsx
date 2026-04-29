import { useState, useRef, useEffect } from "react"
import ArrowDropDown from "@mui/icons-material/ArrowDropDown"
import SearchRoundedIcon from "@mui/icons-material/SearchRounded"
import isoCountries from "i18n-iso-countries"
import en from "i18n-iso-countries/langs/en.json"

isoCountries.registerLocale(en)

function alpha3to2(alpha3: string) {
    return isoCountries.alpha3ToAlpha2(alpha3)?.toLowerCase()
}

export type Country = {
    name: string
    "alpha-3": string
    phone_code: string
}

type Props = {
    countries: Country[]
    selected?: Country | null
    onSelect?: (country: Country) => void
    className?: string
    show?: "name" | "code"
    label?: string
}

export default function CountryDropdown({
    countries,
    selected,
    onSelect,
    className = "",
    show = "name",
    label,
}: Props) {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState("")
    const ref = useRef<HTMLDivElement>(null)
    const searchRef = useRef<HTMLInputElement>(null)

    const filtered = countries.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
    )

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false)
                setSearch("")
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    useEffect(() => {
        if (open) setTimeout(() => searchRef.current?.focus(), 50)
        else setSearch("")
    }, [open])

    return (
        <div ref={ref} className={`relative w-full ${className}`}>

            {label && <label className="text-sm text-text-muted block mb-2">{label}</label>}

            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex w-full items-center justify-between rounded-lg border border-border/30 bg-surface px-3 h-11
                    text-text-muted transition-all duration-200
                    hover:border-primary/40
                    focus:outline-none focus:border-primary/60 focus:shadow-[0_0_12px_rgba(127,250,136,0.25)]"
            >
                {selected ? (
                    <span className="flex items-center gap-2 text-text">
                        <span className={`fi fi-${alpha3to2(selected["alpha-3"])}`} />
                        {show === "name" ? selected.name : selected.phone_code}
                    </span>
                ) : (
                    <span className="text-text-muted/60">Select country</span>
                )}
                <ArrowDropDown
                    sx={{ fontSize: 20 }}
                    className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                />
            </button>

            {/* Dropdown */}
            <div className={`
                absolute z-50 mt-2 w-full rounded-xl shadow-xl overflow-hidden
                transition-all duration-200 origin-top
                ${open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}
            `}
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
                {/* Search input */}
                <div className="p-2 border-b border-border/20">
                    <div className="flex items-center gap-2 bg-surface rounded-lg px-3 py-2">
                        <SearchRoundedIcon sx={{ fontSize: 16 }} className="text-text-muted" />
                        <input
                            ref={searchRef}
                            type="text"
                            placeholder="Search country..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="flex-1 bg-transparent outline-none text-sm text-text placeholder:text-text-muted/50"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="max-h-52 overflow-y-auto">
                    {filtered.length === 0 ? (
                        <p className="text-sm text-text-muted text-center py-4">No results</p>
                    ) : (
                        filtered.map((country) => (
                            <button
                                key={country["alpha-3"]}
                                type="button"
                                onClick={() => { onSelect?.(country); setOpen(false) }}
                                className={`flex w-full items-center gap-3 px-3 py-2 text-sm transition-colors duration-150
                                    hover:bg-primary/10 hover:text-primary
                                    ${selected?.["alpha-3"] === country["alpha-3"] ? "text-primary bg-primary/5" : "text-text-muted"}
                                `}
                            >
                                <span className={`fi fi-${alpha3to2(country["alpha-3"])}`} />
                                <span className="flex-1 text-left">{show === "name" ? country.name : country.phone_code}</span>
                                {selected?.["alpha-3"] === country["alpha-3"] && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                )}
                            </button>
                        ))
                    )}
                </div>
            </div>

        </div>
    )
}

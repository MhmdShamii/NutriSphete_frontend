import { useState, useRef, useEffect } from "react"
import countries from "../../assets/data/countries.json"
import ArrowDropDown from "@mui/icons-material/ArrowDropDown"
import isoCountries from "i18n-iso-countries"
import en from "i18n-iso-countries/langs/en.json"

isoCountries.registerLocale(en)

function alpha3to2(alpha3: string) {
    return isoCountries.alpha3ToAlpha2(alpha3)?.toLowerCase()
}

type Country = {
    name: string
    "alpha-3": string
    phone_code: string
}

type Props = {
    selected?: Country | null
    onSelect?: (country: Country) => void
    className?: string
    show?: "name" | "code"
}

export default function CountryDropdown({
    selected,
    onSelect,
    className = "",
    show = "name"
}: Props) {

    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    return (
        <div ref={ref} className={`relative w-full ${className}`}>

            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex w-full items-center justify-between rounded-lg border border-border/30 bg-surface px-3 h-11 text-text-muted"
            >

                {selected ? (
                    <span className="flex items-center gap-2">

                        <span className={`fi fi-${alpha3to2(selected["alpha-3"])}`} />

                        {show === "name"
                            ? selected.name
                            : selected.phone_code}

                    </span>
                ) : (
                    "Select"
                )}

                <ArrowDropDown
                    sx={{ fontSize: 20 }}
                    className={`transition-transform ${open ? "rotate-180" : ""}`}
                />

            </button>

            <div
                className={`absolute z-50 mt-2 w-full rounded-lg border border-border/30 bg-surface shadow-lg transition-all duration-200 transform ${open ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
                    }`}
            >

                <div className="max-h-60 overflow-y-auto">

                    {countries.map((country: Country) => (

                        <button
                            key={country["alpha-3"]}
                            type="button"
                            onClick={() => {
                                onSelect?.(country)
                                setOpen(false)
                            }}
                            className="flex w-full items-center gap-3 px-3 py-2 hover:bg-primary/5"
                        >

                            <span className={`fi fi-${alpha3to2(country["alpha-3"])}`} />

                            <span className="flex-1 text-left">
                                {show === "name"
                                    ? country.name
                                    : country.phone_code}
                            </span>

                        </button>

                    ))}

                </div>

            </div>

        </div>
    )
}
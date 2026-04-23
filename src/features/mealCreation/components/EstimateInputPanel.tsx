import { useState } from "react"

interface Props {
    name: string
    onNameChange: (v: string) => void
    onDescriptionChange: (v: string) => void
    onEstimate: () => void
    onNext?: () => void
    onBack?: () => void
    isMobile?: boolean
    loading?: boolean
    isReady: boolean
}

function buildDescription(portion: string, extras: string, notes: string): string {
    const parts: string[] = []
    if (portion.trim()) parts.push(`portion: ${portion.trim()}`)
    if (extras.trim())  parts.push(`extras: ${extras.trim()}`)
    if (notes.trim())   parts.push(`description: ${notes.trim()}`)
    return parts.join("\n")
}

export default function EstimateInputPanel({
    name, onNameChange, onDescriptionChange,
    onEstimate, onNext, onBack, isMobile, loading, isReady,
}: Props) {
    const [portion, setPortion] = useState("")
    const [extras,  setExtras]  = useState("")
    const [notes,   setNotes]   = useState("")

    function update(field: "portion" | "extras" | "notes", value: string) {
        const next = { portion, extras, notes, [field]: value }
        if (field === "portion") setPortion(value)
        if (field === "extras")  setExtras(value)
        if (field === "notes")   setNotes(value)
        onDescriptionChange(buildDescription(next.portion, next.extras, next.notes))
    }

    return (
        <div className="flex flex-col gap-5 h-full">
            {isMobile && (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-primary">1</span>
                    </div>
                    <div>
                        <p className="font-semibold text-text text-sm leading-tight">Describe Your Meal</p>
                        <p className="text-[11px] text-text-muted">Name &amp; details for AI estimation</p>
                    </div>
                </div>
            )}

            {/* Meal name */}
            <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                    <label className="text-sm text-text-muted">
                        Meal name <span className="text-red-400">*</span>
                    </label>
                    <span className={`text-[11px] ${name.length > 240 ? "text-red-400" : "text-text-muted/50"}`}>
                        {name.length}/255
                    </span>
                </div>
                <input
                    placeholder="e.g. Shawarma Wrap"
                    value={name}
                    maxLength={255}
                    onChange={e => onNameChange(e.target.value)}
                    className="bg-surface border border-border/30 rounded-xl p-3 outline-none w-full text-text text-sm
                        transition-all duration-300 placeholder:text-text-muted/40
                        focus:border-primary/60 focus:shadow-[0_0_12px_rgba(127,250,136,0.25)]"
                />
            </div>

            {/* Optional accuracy fields */}
            <div className="flex flex-col gap-3">
                <p className="text-xs text-text-muted/60 uppercase tracking-wide font-medium">
                    Optional — improves AI accuracy
                </p>

                {/* Portion */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm text-text-muted">Portion size</label>
                    <input
                        placeholder="e.g. Large wrap, 2 pieces, 400 g"
                        value={portion}
                        maxLength={200}
                        onChange={e => update("portion", e.target.value)}
                        className="bg-surface border border-border/30 rounded-xl p-3 outline-none w-full text-text text-sm
                            transition-all duration-300 placeholder:text-text-muted/40
                            focus:border-primary/60 focus:shadow-[0_0_12px_rgba(127,250,136,0.25)]"
                    />
                </div>

                {/* Extras */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm text-text-muted">Extras / modifications</label>
                    <input
                        placeholder="e.g. Extra garlic sauce, no pickles, double meat"
                        value={extras}
                        maxLength={200}
                        onChange={e => update("extras", e.target.value)}
                        className="bg-surface border border-border/30 rounded-xl p-3 outline-none w-full text-text text-sm
                            transition-all duration-300 placeholder:text-text-muted/40
                            focus:border-primary/60 focus:shadow-[0_0_12px_rgba(127,250,136,0.25)]"
                    />
                </div>

                {/* Notes */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm text-text-muted">Additional notes</label>
                    <textarea
                        placeholder="e.g. From a street vendor, very oily, ate with fries..."
                        value={notes}
                        maxLength={600}
                        rows={isMobile ? 3 : 4}
                        onChange={e => update("notes", e.target.value)}
                        className="bg-surface border border-border/30 rounded-xl p-3 outline-none w-full text-text text-sm resize-none
                            transition-all duration-300 placeholder:text-text-muted/40
                            focus:border-primary/60 focus:shadow-[0_0_12px_rgba(127,250,136,0.25)]"
                    />
                    <p className="text-[11px] text-text-muted/40">
                        The more detail you add — size, extras, cooking method — the more accurate the estimate.
                    </p>
                </div>
            </div>

            {isMobile && (
                <div className="flex gap-2.5 mt-auto pt-2">
                    {onBack && (
                        <button
                            type="button"
                            onClick={onBack}
                            className="flex-1 p-3 rounded-xl border border-border/30 text-text-muted text-sm font-medium
                                hover:border-border/60 transition-all duration-200"
                        >
                            Back
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={onNext}
                        disabled={!isReady || loading}
                        className={`flex-[2] flex items-center justify-center gap-2 p-3 rounded-xl text-sm font-semibold transition-all duration-300
                            ${isReady && !loading
                                ? "bg-primary text-black hover:bg-primary-hover hover:shadow-[0_0_18px_rgba(127,250,136,0.45)] active:scale-[0.98]"
                                : "bg-primary/30 text-black/50 pointer-events-none"
                            }`}
                    >
                        {loading
                            ? <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                            : "Estimate Macros"
                        }
                    </button>
                </div>
            )}
        </div>
    )
}

import { useRef, useState, useEffect } from "react"
import AddRoundedIcon from "@mui/icons-material/AddRounded"
import CloseRoundedIcon from "@mui/icons-material/CloseRounded"
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded"
import SelectDropdown from "../../../components/ui/SelectDropdown"
import type { MealFormData, Ingredient, PrepStep } from "../types/meal.types"
import { searchIngredients, type IngredientResult } from "../../../services/ingredients/ingredientsApi"

const UNIT_OPTIONS = [
    "g", "kg", "oz", "lb",
    "ml", "L", "cup", "tbsp", "tsp",
    "piece", "serving", "slice", "pinch", "clove",
].map(u => ({ value: u, label: u }))

function generateId() {
    return Math.random().toString(36).slice(2)
}

interface IngredientRowProps {
    ingredient: Ingredient
    index: number
    onUpdate: (field: keyof Omit<Ingredient, "localId">, value: string) => void
    onRemove: () => void
    canRemove: boolean
}

function IngredientRow({ ingredient, index, onUpdate, onRemove, canRemove }: IngredientRowProps) {
    const [results, setResults] = useState<IngredientResult[]>([])
    const [open, setOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        if (timerRef.current) clearTimeout(timerRef.current)
        const q = ingredient.name.trim()
        if (q.length < 2) { setResults([]); setOpen(false); return }
        timerRef.current = setTimeout(async () => {
            try {
                const data = await searchIngredients(q)
                setResults(data)
                setOpen(data.length > 0)
            } catch { setResults([]) }
        }, 350)
        return () => { if (timerRef.current) clearTimeout(timerRef.current) }
    }, [ingredient.name])

    useEffect(() => {
        function handler(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [])

    return (
        <div className="flex gap-2 items-center">
            <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary flex-shrink-0">
                {index + 1}
            </span>

            {/* Name + autocomplete */}
            <div ref={containerRef} className="flex-1 relative min-w-0">
                <input
                    value={ingredient.name}
                    onChange={e => onUpdate("name", e.target.value)}
                    onFocus={() => results.length > 0 && setOpen(true)}
                    placeholder="Ingredient name"
                    className="bg-surface border border-border/30 rounded-xl px-3 h-11 outline-none w-full text-text text-sm
                        transition-all duration-200 placeholder:text-text-muted/40
                        focus:border-primary/60 focus:shadow-[0_0_10px_rgba(127,250,136,0.2)]"
                />
                {open && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-1 rounded-xl overflow-hidden shadow-xl border border-border/30"
                        style={{ background: "var(--surface)" }}>
                        {results.slice(0, 7).map(r => (
                            <button
                                key={r.id}
                                type="button"
                                onMouseDown={() => { onUpdate("name", r.name_en); setOpen(false); setResults([]) }}
                                className="w-full flex items-center justify-between px-3 py-2 hover:bg-primary/10 transition-colors duration-150"
                            >
                                <div className="flex items-baseline gap-2 min-w-0">
                                    <span className="text-sm text-text truncate">{r.name_en}</span>
                                    <span className="text-[11px] text-text-muted/50 flex-shrink-0">{r.name_ar}</span>
                                </div>
                                {r.verified && (
                                    <CheckCircleRoundedIcon sx={{ fontSize: 14 }} style={{ color: "var(--primary)" }} className="flex-shrink-0 ml-2" />
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Portion */}
            <input
                type="text"
                inputMode="decimal"
                value={ingredient.portion}
                onChange={e => {
                    const val = e.target.value
                    if (val === "" || /^\d*\.?\d*$/.test(val)) onUpdate("portion", val)
                }}
                placeholder="0"
                className="bg-surface border border-border/30 rounded-xl px-2 h-11 outline-none text-text text-sm text-center
                    transition-all duration-200 placeholder:text-text-muted/40
                    focus:border-primary/60 focus:shadow-[0_0_10px_rgba(127,250,136,0.2)]
                    w-16 flex-shrink-0"
            />

            {/* Unit */}
            <div className="w-24 flex-shrink-0">
                <SelectDropdown
                    options={UNIT_OPTIONS}
                    value={ingredient.unit}
                    onChange={v => onUpdate("unit", v)}
                    placeholder="Unit"
                />
            </div>

            {/* Remove */}
            <button
                type="button"
                onClick={onRemove}
                disabled={!canRemove}
                className="w-7 h-7 rounded-full flex items-center justify-center text-text-muted/40
                    hover:bg-red-400/10 hover:text-red-400 transition-all duration-200 flex-shrink-0
                    disabled:opacity-20 disabled:pointer-events-none"
            >
                <CloseRoundedIcon sx={{ fontSize: 16 }} />
            </button>
        </div>
    )
}

interface PrepStepRowProps {
    step: PrepStep
    index: number
    onUpdate: (value: string) => void
    onRemove: () => void
}

function PrepStepRow({ step, index, onUpdate, onRemove }: PrepStepRowProps) {
    return (
        <div className="flex gap-2 items-start">
            <span className="w-6 h-6 rounded-full bg-surface border border-border/30 flex items-center justify-center text-[11px] font-semibold text-text-muted flex-shrink-0 mt-2.5">
                {index + 1}
            </span>
            <textarea
                value={step.description}
                onChange={e => onUpdate(e.target.value)}
                placeholder={`Describe step ${index + 1}...`}
                rows={2}
                maxLength={1000}
                className="flex-1 bg-surface border border-border/30 rounded-xl px-3 py-2 outline-none text-text text-sm resize-none
                    transition-all duration-200 placeholder:text-text-muted/40
                    focus:border-primary/60 focus:shadow-[0_0_10px_rgba(127,250,136,0.2)]"
            />
            <button
                type="button"
                onClick={onRemove}
                className="w-7 h-7 rounded-full flex items-center justify-center text-text-muted/40
                    hover:bg-red-400/10 hover:text-red-400 transition-all duration-200 flex-shrink-0 mt-2"
            >
                <CloseRoundedIcon sx={{ fontSize: 16 }} />
            </button>
        </div>
    )
}

interface Props {
    form: MealFormData
    onChange: <K extends keyof MealFormData>(field: K, value: MealFormData[K]) => void
    onNext?: () => void
    onBack?: () => void
    isMobile?: boolean
    loading?: boolean
    error?: string | null
}

export default function IngredientsPanel({ form, onChange, onNext, onBack, isMobile }: Props) {
    function updateIngredient(index: number, field: keyof Omit<Ingredient, "localId">, value: string) {
        const updated = [...form.ingredients]
        updated[index] = { ...updated[index], [field]: value }
        onChange("ingredients", updated)
    }

    function addIngredient() {
        if (form.ingredients.length >= 20) return
        onChange("ingredients", [...form.ingredients, { localId: generateId(), name: "", portion: "", unit: "g" }])
    }

    function removeIngredient(index: number) {
        onChange("ingredients", form.ingredients.filter((_, i) => i !== index))
    }

    function clearIngredients() {
        onChange("ingredients", [{ localId: generateId(), name: "", portion: "", unit: "g" }])
    }

    function updateStep(index: number, value: string) {
        const updated = [...form.preparation_steps]
        updated[index] = { ...updated[index], description: value }
        onChange("preparation_steps", updated)
    }

    function addStep() {
        if (form.preparation_steps.length >= 20) return
        onChange("preparation_steps", [...form.preparation_steps, { localId: generateId(), description: "" }])
    }

    function removeStep(index: number) {
        onChange("preparation_steps", form.preparation_steps.filter((_, i) => i !== index))
    }

    function clearSteps() {
        onChange("preparation_steps", [])
    }

    const ingredientsValid =
        form.ingredients.length >= 1 &&
        form.ingredients.every(i => i.name.trim() && Number(i.portion) >= 0.1 && i.unit.trim())

    return (
        <div className="flex flex-col gap-5 h-full">
            {isMobile && (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-primary">2</span>
                    </div>
                    <div>
                        <p className="font-semibold text-text text-sm leading-tight">Ingredients &amp; Steps</p>
                        <p className="text-[11px] text-text-muted">What goes into your meal</p>
                    </div>
                </div>
            )}

            {/* Ingredients */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-text-muted">
                        Ingredients <span className="text-red-400">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                        {form.ingredients.length > 1 && (
                            <button
                                type="button"
                                onClick={clearIngredients}
                                className="text-[11px] text-red-400/60 hover:text-red-400 transition-colors duration-200"
                            >
                                Clear all
                            </button>
                        )}
                        <span className={`text-[11px] ${form.ingredients.length >= 18 ? "text-red-400" : "text-text-muted/50"}`}>
                            {form.ingredients.length}/20
                        </span>
                    </div>
                </div>

                {/* Column labels */}
                <div className="flex gap-2 items-center">
                    <span className="w-5 flex-shrink-0" />
                    <span className="flex-1 text-[10px] text-text-muted/50 uppercase tracking-wide">Name</span>
                    <span className="w-16 flex-shrink-0 text-[10px] text-text-muted/50 uppercase tracking-wide text-center">Portion</span>
                    <span className="w-24 flex-shrink-0 text-[10px] text-text-muted/50 uppercase tracking-wide text-center">Unit</span>
                    <span className="w-7 flex-shrink-0" />
                </div>

                <div className="flex flex-col gap-2">
                    {form.ingredients.map((ing, i) => (
                        <IngredientRow
                            key={ing.localId}
                            ingredient={ing}
                            index={i}
                            onUpdate={(field, value) => updateIngredient(i, field, value)}
                            onRemove={() => removeIngredient(i)}
                            canRemove={form.ingredients.length > 1}
                        />
                    ))}
                </div>

                {form.ingredients.length < 20 && (
                    <button
                        type="button"
                        onClick={addIngredient}
                        className="flex items-center gap-1.5 text-sm text-primary/60 hover:text-primary transition-colors duration-200 py-0.5 w-fit"
                    >
                        <AddRoundedIcon sx={{ fontSize: 16 }} />
                        Add ingredient
                    </button>
                )}
            </div>

            <div className="border-t border-border/20" />

            {/* Prep steps */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-text-muted">
                        Preparation Steps
                        <span className="text-[11px] font-normal text-text-muted/50 ml-2">optional</span>
                    </label>
                    {form.preparation_steps.length > 0 && (
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={clearSteps}
                                className="text-[11px] text-red-400/60 hover:text-red-400 transition-colors duration-200"
                            >
                                Clear all
                            </button>
                            <span className={`text-[11px] ${form.preparation_steps.length >= 18 ? "text-red-400" : "text-text-muted/50"}`}>
                                {form.preparation_steps.length}/20
                            </span>
                        </div>
                    )}
                </div>

                {form.preparation_steps.length > 0 && (
                    <div className="flex flex-col gap-2">
                        {form.preparation_steps.map((step, i) => (
                            <PrepStepRow
                                key={step.localId}
                                step={step}
                                index={i}
                                onUpdate={value => updateStep(i, value)}
                                onRemove={() => removeStep(i)}
                            />
                        ))}
                    </div>
                )}

                <button
                    type="button"
                    onClick={addStep}
                    className="flex items-center gap-1.5 text-sm text-primary/60 hover:text-primary transition-colors duration-200 py-0.5 w-fit"
                >
                    <AddRoundedIcon sx={{ fontSize: 16 }} />
                    {form.preparation_steps.length === 0 ? "Add preparation step" : "Add step"}
                </button>
            </div>

            {isMobile && (
                <div className="flex gap-2.5 mt-auto pt-2">
                    <button
                        type="button"
                        onClick={onBack}
                        className="flex-1 p-3 rounded-xl border border-border/30 text-text-muted text-sm font-medium
                            hover:border-border/60 transition-all duration-200"
                    >
                        Back
                    </button>
                    <button
                        type="button"
                        onClick={onNext}
                        disabled={!ingredientsValid}
                        className={`flex-[2] p-3 rounded-xl text-sm font-semibold transition-all duration-300
                            ${ingredientsValid
                                ? "bg-primary text-black hover:bg-primary-hover hover:shadow-[0_0_18px_rgba(127,250,136,0.45)] active:scale-[0.98]"
                                : "bg-primary/30 text-black/50 pointer-events-none"
                            }`}
                    >
                        Continue to Review
                    </button>
                </div>
            )}
        </div>
    )
}

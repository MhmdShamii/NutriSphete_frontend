import type { MealFormData } from "../types/meal.types"
import PublicRoundedIcon from "@mui/icons-material/PublicRounded"
import LockRoundedIcon from "@mui/icons-material/LockRounded"

interface Props {
    form: MealFormData
    onChange: <K extends keyof MealFormData>(field: K, value: MealFormData[K]) => void
    onNext?: () => void
    isMobile?: boolean
}

export default function BasicInfoPanel({ form, onChange, onNext, isMobile }: Props) {
    const panel1Valid =
        form.name.trim().length > 0 &&
        form.name.length <= 255 &&
        form.servings >= 1 &&
        form.servings <= 100

    return (
        <div className="flex flex-col gap-5 h-full">
            {/* Mobile header */}
            {isMobile && (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-primary">1</span>
                    </div>
                    <div>
                        <p className="font-semibold text-text text-sm leading-tight">Meal Details</p>
                        <p className="text-[11px] text-text-muted">Name, servings &amp; visibility</p>
                    </div>
                </div>
            )}

            {/* Name */}
            <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                    <label className="text-sm text-text-muted">
                        Meal name <span className="text-red-400">*</span>
                    </label>
                    <span className={`text-[11px] ${form.name.length > 240 ? "text-red-400" : "text-text-muted/50"}`}>
                        {form.name.length}/255
                    </span>
                </div>
                <input
                    placeholder="e.g. Grilled Chicken Bowl"
                    value={form.name}
                    maxLength={255}
                    onChange={e => onChange("name", e.target.value)}
                    className="bg-surface border border-border/30 rounded-xl p-3 outline-none w-full text-text text-sm
                        transition-all duration-300 placeholder:text-text-muted/40
                        focus:border-primary/60 focus:shadow-[0_0_12px_rgba(127,250,136,0.25)]"
                />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                    <label className="text-sm text-text-muted">Description</label>
                    <span className={`text-[11px] ${form.description.length > 950 ? "text-red-400" : "text-text-muted/50"}`}>
                        {form.description.length}/1000
                    </span>
                </div>
                <textarea
                    placeholder="Describe your meal..."
                    value={form.description}
                    maxLength={1000}
                    rows={4}
                    onChange={e => onChange("description", e.target.value)}
                    className="bg-surface border border-border/30 rounded-xl p-3 outline-none w-full text-text text-sm resize-none
                        transition-all duration-300 placeholder:text-text-muted/40
                        focus:border-primary/60 focus:shadow-[0_0_12px_rgba(127,250,136,0.25)]"
                />
            </div>

            {/* Servings + Visibility row */}
            <div className="flex gap-3">
                {/* Servings stepper */}
                <div className="flex flex-col gap-1.5 flex-1">
                    <label className="text-sm text-text-muted">
                        Servings <span className="text-red-400">*</span>
                    </label>
                    <div className="flex items-center bg-surface border border-border/30 rounded-xl overflow-hidden h-10">
                        <button
                            type="button"
                            onClick={() => onChange("servings", Math.max(1, form.servings - 1))}
                            className="w-10 h-10 flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary/10 transition-colors duration-200 flex-shrink-0 text-lg font-light"
                        >
                            −
                        </button>
                        <span className="flex-1 text-center text-text text-sm font-semibold tabular-nums">
                            {form.servings}
                        </span>
                        <button
                            type="button"
                            onClick={() => onChange("servings", Math.min(100, form.servings + 1))}
                            className="w-10 h-10 flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary/10 transition-colors duration-200 flex-shrink-0 text-lg font-light"
                        >
                            +
                        </button>
                    </div>
                </div>

                {/* Visibility toggle */}
                <div className="flex flex-col gap-1.5 flex-1">
                    <label className="text-sm text-text-muted">
                        Visibility <span className="text-red-400">*</span>
                    </label>
                    <div className="flex bg-surface border border-border/30 rounded-xl p-0.5 h-10">
                        <button
                            type="button"
                            onClick={() => onChange("visibility", "public")}
                            className={`flex-1 flex items-center justify-center gap-1.5 rounded-[10px] text-xs font-medium transition-all duration-200
                                ${form.visibility === "public"
                                    ? "bg-primary text-black shadow-[0_0_12px_rgba(127,250,136,0.35)]"
                                    : "text-text-muted hover:text-text"
                                }`}
                        >
                            <PublicRoundedIcon sx={{ fontSize: 13 }} />
                            Public
                        </button>
                        <button
                            type="button"
                            onClick={() => onChange("visibility", "private")}
                            className={`flex-1 flex items-center justify-center gap-1.5 rounded-[10px] text-xs font-medium transition-all duration-200
                                ${form.visibility === "private"
                                    ? "bg-primary text-black shadow-[0_0_12px_rgba(127,250,136,0.35)]"
                                    : "text-text-muted hover:text-text"
                                }`}
                        >
                            <LockRoundedIcon sx={{ fontSize: 13 }} />
                            Private
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile next button */}
            {isMobile && (
                <button
                    type="button"
                    onClick={onNext}
                    disabled={!panel1Valid}
                    className={`mt-auto w-full p-3 rounded-xl font-semibold text-sm transition-all duration-300
                        ${panel1Valid
                            ? "bg-primary text-black hover:bg-primary-hover hover:shadow-[0_0_18px_rgba(127,250,136,0.45)] active:scale-[0.98]"
                            : "bg-primary/30 text-black/50 pointer-events-none"
                        }`}
                >
                    Continue to Ingredients
                </button>
            )}
        </div>
    )
}

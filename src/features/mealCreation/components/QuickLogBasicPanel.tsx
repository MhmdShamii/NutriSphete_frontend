import type { QuickLogFormData } from "../types/meal.types"

interface Props {
    form: QuickLogFormData
    onChange: <K extends keyof QuickLogFormData>(field: K, value: QuickLogFormData[K]) => void
    onNext?: () => void
    isMobile?: boolean
}

export default function QuickLogBasicPanel({ form, onChange, onNext, isMobile }: Props) {
    const valid = form.name.trim().length > 0 && form.name.length <= 255

    return (
        <div className="flex flex-col gap-5 h-full">
            {isMobile && (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-primary">1</span>
                    </div>
                    <div>
                        <p className="font-semibold text-text text-sm leading-tight">Meal Details</p>
                        <p className="text-[11px] text-text-muted">Name &amp; description</p>
                    </div>
                </div>
            )}

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
                    placeholder="e.g. Chicken Bowl"
                    value={form.name}
                    maxLength={255}
                    onChange={e => onChange("name", e.target.value)}
                    className="bg-surface border border-border/30 rounded-xl p-3 outline-none w-full text-text text-sm
                        transition-all duration-300 placeholder:text-text-muted/40
                        focus:border-primary/60 focus:shadow-[0_0_12px_rgba(127,250,136,0.25)]"
                />
            </div>

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

            {isMobile && (
                <button
                    type="button"
                    onClick={onNext}
                    disabled={!valid}
                    className={`mt-auto w-full p-3 rounded-xl font-semibold text-sm transition-all duration-300
                        ${valid
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

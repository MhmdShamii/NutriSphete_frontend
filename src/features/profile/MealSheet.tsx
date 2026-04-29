import CloseRoundedIcon from "@mui/icons-material/CloseRounded"
import type { ProfileMeal } from "../../services/meals/mealsApis"

interface Props {
    meal: ProfileMeal
    onClose: () => void
}

export default function MealSheet({ meal, onClose }: Props) {
    const { calories, protein, carbs, fats } = meal.macros
    const total = protein + carbs + fats || 1

    const macros = [
        { label: "Protein",  value: Math.round(protein), unit: "g", color: "#818cf8", pct: protein / total },
        { label: "Carbs",    value: Math.round(carbs),   unit: "g", color: "#34d399", pct: carbs   / total },
        { label: "Fat",      value: Math.round(fats),    unit: "g", color: "#fb7185", pct: fats    / total },
    ]

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

            <div
                className="relative w-full sm:max-w-lg mx-auto flex flex-col rounded-t-3xl overflow-hidden"
                style={{ maxHeight: "88dvh", background: "var(--surface)" }}
            >
                {/* Drag handle */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-white/20 z-10 flex-shrink-0" />

                {/* Hero */}
                <div className="relative w-full h-56 sm:h-72 flex-shrink-0 overflow-hidden">
                    {meal.image_url
                        ? <img src={meal.image_url} alt={meal.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"
                            style={{ background: "var(--glass-bg)" }}>
                            <span className="text-6xl opacity-10">🍽</span>
                          </div>
                    }
                    {/* Deep gradient so title reads cleanly */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface)] via-black/30 to-black/10" />

                    {/* Close */}
                    <button
                        onClick={onClose}
                        className="absolute top-5 right-4 w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white transition-colors"
                        style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)" }}
                    >
                        <CloseRoundedIcon sx={{ fontSize: 15 }} />
                    </button>

                    {/* Title + servings sitting on the gradient */}
                    <div className="absolute bottom-0 left-0 right-0 px-5 pb-4 flex items-end justify-between gap-3">
                        <h2 className="text-lg font-bold text-white leading-tight">{meal.name}</h2>
                        <span className="text-xs text-white/60 flex-shrink-0 pb-0.5">
                            {meal.servings} {meal.servings === 1 ? "serving" : "servings"}
                        </span>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto overscroll-contain">

                    {/* Calorie headline */}
                    <div className="flex items-baseline gap-1.5 px-5 pt-5 pb-4"
                        style={{ borderBottom: "1px solid var(--glass-border)" }}>
                        <span className="text-3xl font-bold text-text">{Math.round(calories)}</span>
                        <span className="text-sm text-text-muted">kcal</span>
                        <span className="text-xs text-text-muted/50 ml-1">per serving</span>
                    </div>

                    {/* Macro bar + breakdown */}
                    <div className="px-5 py-4 flex flex-col gap-4"
                        style={{ borderBottom: "1px solid var(--glass-border)" }}>

                        {/* Segmented bar */}
                        <div className="flex h-2 rounded-full overflow-hidden gap-px">
                            {macros.map(m => (
                                <div
                                    key={m.label}
                                    className="rounded-full transition-all"
                                    style={{ width: `${m.pct * 100}%`, background: m.color }}
                                />
                            ))}
                        </div>

                        {/* Labels */}
                        <div className="flex justify-between">
                            {macros.map(m => (
                                <div key={m.label} className="flex flex-col gap-0.5">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: m.color }} />
                                        <span className="text-xs text-text-muted">{m.label}</span>
                                    </div>
                                    <span className="text-sm font-semibold text-text pl-3.5">
                                        {m.value}{m.unit}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Fiber */}
                    {meal.macros.fiber > 0 && (
                        <div className="flex items-center justify-between px-5 py-3.5"
                            style={{ borderBottom: "1px solid var(--glass-border)" }}>
                            <span className="text-sm text-text-muted">Fiber</span>
                            <span className="text-sm font-medium text-text">{Math.round(meal.macros.fiber)}g</span>
                        </div>
                    )}

                    <div className="h-8" />
                </div>
            </div>
        </div>
    )
}

import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded"
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded"
import EditRoundedIcon from "@mui/icons-material/EditRounded"
import CheckRoundedIcon from "@mui/icons-material/CheckRounded"
import type { FlaggedIngredient } from "../types/meal.types"

const SEVERITY_STYLES: Record<string, string> = {
    high: "bg-red-500/15 text-red-400 border-red-500/20",
    medium: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    low: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
}

interface Props {
    flaggedIngredients: FlaggedIngredient[]
    onEdit: () => void
    onIgnore: () => void
    onDiscard: () => void
    loading?: boolean
    confirmLabel?: string
    discardLabel?: string
    hideEdit?: boolean
}

export default function HealthWarningModal({ flaggedIngredients, onEdit, onIgnore, onDiscard, loading, confirmLabel = "Ignore", discardLabel = "Discard Meal", hideEdit = false }: Props) {
    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            <div
                className="relative w-full sm:max-w-md mx-auto flex flex-col gap-4 p-5
                    rounded-t-3xl sm:rounded-3xl overflow-y-auto"
                style={{ maxHeight: "80vh", background: "var(--surface)", border: "1px solid var(--glass-border)" }}
            >
                {/* header */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: "rgba(251,146,60,0.12)", border: "1px solid rgba(251,146,60,0.2)" }}>
                        <WarningAmberRoundedIcon sx={{ fontSize: 20 }} style={{ color: "#FB923C" }} />
                    </div>
                    <div>
                        <p className="font-semibold text-text text-sm">Health Warning</p>
                        <p className="text-xs text-text-muted">Some ingredients may affect your health conditions</p>
                    </div>
                </div>

                {/* flagged list */}
                <div className="flex flex-col gap-2">
                    {flaggedIngredients.map((item, i) => (
                        <div key={i} className="rounded-xl border border-border/20 p-3 flex flex-col gap-1"
                            style={{ background: "rgba(251,146,60,0.04)" }}>
                            <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-medium text-text capitalize">{item.ingredient}</p>
                                <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${SEVERITY_STYLES[item.severity] ?? SEVERITY_STYLES.medium}`}>
                                    {item.severity}
                                </span>
                            </div>
                            <p className="text-xs font-medium" style={{ color: "#FB923C" }}>{item.condition}</p>
                            <p className="text-xs text-text-muted/70">{item.concern}</p>
                        </div>
                    ))}
                </div>

                {/* actions */}
                <div className="flex flex-col gap-2 pt-1">
                    {!hideEdit && (
                        <button
                            type="button"
                            onClick={onEdit}
                            disabled={loading}
                            className="flex items-center justify-center gap-1.5 w-full p-2.5 rounded-xl border border-border/20
                                text-sm text-text-muted hover:text-primary hover:border-primary/30
                                transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none"
                        >
                            <EditRoundedIcon sx={{ fontSize: 15 }} />
                            Edit Meal
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={onIgnore}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-1.5 p-3 rounded-xl text-sm font-semibold
                            transition-all duration-300 bg-primary text-black hover:bg-primary-hover
                            hover:shadow-[0_0_18px_rgba(127,250,136,0.45)] active:scale-[0.98]
                            disabled:opacity-40 disabled:pointer-events-none"
                    >
                        {loading
                            ? <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                            : <><CheckRoundedIcon sx={{ fontSize: 16 }} /> {confirmLabel}</>
                        }
                    </button>
                    <button
                        type="button"
                        onClick={onDiscard}
                        disabled={loading}
                        className="flex items-center justify-center gap-1 w-full py-1.5 text-xs text-red-400/60
                            hover:text-red-400 transition-colors duration-200 disabled:opacity-30 disabled:pointer-events-none"
                    >
                        <DeleteOutlineRoundedIcon sx={{ fontSize: 13 }} />
                        {discardLabel}
                    </button>
                </div>
            </div>
        </div>
    )
}

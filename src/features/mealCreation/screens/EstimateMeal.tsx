import { useState } from "react"
import type { QuickLogEntry, FlaggedIngredient } from "../types/meal.types"
import { estimateMeal, confirmQuickLog, deleteQuickLog } from "../../../services/log/quickLogApi"
import EstimateInputPanel from "../components/EstimateInputPanel"
import QuickLogReviewPanel from "../components/QuickLogReviewPanel"
import HealthWarningModal from "../components/HealthWarningModal"
import { useToast } from "../../../context/ToastContext"
import { extractApiError } from "../../../utils/apiError"

const steps = [
    { n: 1, label: "Describe Your Meal", sub: "Name & details for AI estimation" },
    { n: 2, label: "Estimated Macros",   sub: "Review AI estimate — confirm or discard" },
]

export default function EstimateMeal() {
    const { showError } = useToast()
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [resetKey, setResetKey] = useState(0)
    const [entry, setEntry] = useState<QuickLogEntry | null>(null)
    const [mobileStep, setMobileStep] = useState<0 | 1>(0)
    const [loading, setLoading] = useState(false)
    const [showWarning, setShowWarning] = useState(false)
    const [warningIngredients, setWarningIngredients] = useState<FlaggedIngredient[]>([])

    const isReady = name.trim().length > 0 && name.length <= 255

    async function handleEstimate() {
        if (!isReady) return
        setLoading(true)
        setEntry(null)
        setMobileStep(1)
        try {
            const res = await estimateMeal(name, description)
            setEntry(res.logged_meal)
            if (res.health_warning?.is_flagged) {
                setWarningIngredients(res.health_warning.flagged_ingredients)
                setShowWarning(true)
            }
        } catch (err) {
            setEntry(null)
            if (window.innerWidth < 640) setMobileStep(0)
            showError(extractApiError(err))
        } finally {
            setLoading(false)
        }
    }

    function reset() {
        setName("")
        setDescription("")
        setEntry(null)
        setMobileStep(0)
        setResetKey(k => k + 1)
    }

    async function handleConfirm() {
        if (!entry) return
        setLoading(true)
        try {
            await confirmQuickLog(entry.id)
            reset()
        } catch (err) {
            showError(extractApiError(err))
        } finally {
            setLoading(false)
        }
    }

    async function handleDiscard() {
        if (!entry) return
        setLoading(true)
        try {
            await deleteQuickLog(entry.id)
            reset()
        } catch (err) {
            showError(extractApiError(err))
        } finally {
            setLoading(false)
        }
    }

    function handleWarningEdit() {
        setShowWarning(false)
        if (window.innerWidth < 640) setMobileStep(0)
    }

    function handleWarningIgnore() {
        setShowWarning(false)
    }

    async function handleWarningDiscard() {
        setShowWarning(false)
        await handleDiscard()
    }

    const panelBase = "flex-1 min-w-0 overflow-y-auto px-5 py-5"
    const panelDivider = "border-r border-border/20"

    return (
        <>
            {showWarning && (
                <HealthWarningModal
                    flaggedIngredients={warningIngredients}
                    onEdit={handleWarningEdit}
                    onIgnore={handleWarningIgnore}
                    onDiscard={handleWarningDiscard}
                    loading={loading}
                />
            )}

            {/* ── Desktop: 2 panels ────────────────────────────────────── */}
            <div className="hidden sm:flex flex-col flex-1 min-h-0">
                <div className="flex flex-shrink-0 border-b border-border/20">
                    {steps.map((s, i) => (
                        <div key={s.n} className={`flex-1 flex items-center gap-3 px-5 py-3.5 ${i < 1 ? "border-r border-border/20" : ""}`}>
                            <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold text-primary">{s.n}</span>
                            </div>
                            <div>
                                <p className="font-semibold text-text text-sm leading-tight">{s.label}</p>
                                <p className="text-[11px] text-text-muted">{s.sub}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex flex-1 min-h-0">
                    <div className={`${panelBase} ${panelDivider}`}>
                        <EstimateInputPanel
                            key={resetKey}
                            name={name}
                            onNameChange={setName}
                            onDescriptionChange={setDescription}
                            onEstimate={handleEstimate}
                            loading={loading}
                            isReady={isReady}
                        />
                    </div>
                    <div className={panelBase}>
                        <QuickLogReviewPanel
                            entry={entry}
                            onCalculate={handleEstimate}
                            onRecalculate={handleEstimate}
                            onConfirm={handleConfirm}
                            onDiscard={handleDiscard}
                            loading={loading}
                            submitReady={isReady}
                            submitLabel="Estimate Macros"
                        />
                    </div>
                </div>
            </div>

            {/* ── Mobile: 2 steps ──────────────────────────────────────── */}
            <div className="flex sm:hidden flex-col flex-1 min-h-0 px-4 py-4">
                {mobileStep === 0 && (
                    <EstimateInputPanel
                        key={resetKey}
                        name={name}
                        onNameChange={setName}
                        onDescriptionChange={setDescription}
                        onEstimate={handleEstimate}
                        onNext={handleEstimate}
                        isMobile
                        loading={loading}
                        isReady={isReady}
                    />
                )}
                {mobileStep === 1 && (
                    <QuickLogReviewPanel
                        entry={entry}
                        onCalculate={handleEstimate}
                        onRecalculate={handleEstimate}
                        onConfirm={handleConfirm}
                        onDiscard={handleDiscard}
                        onBack={() => setMobileStep(0)}
                        onEdit={() => setMobileStep(0)}
                        editLabel="Edit Estimated Meal"
                        isMobile
                        loading={loading}
                        submitReady={isReady}
                    />
                )}
            </div>
        </>
    )
}

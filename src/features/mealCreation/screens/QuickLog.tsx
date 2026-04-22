import { useState } from "react"
import type { QuickLogFormData, QuickLogEntry, FlaggedIngredient } from "../types/meal.types"
import { createQuickLog, confirmQuickLog, deleteQuickLog } from "../../../services/log/quickLogApi"
import QuickLogBasicPanel from "../components/QuickLogBasicPanel"
import QuickLogInputPanel from "../components/QuickLogInputPanel"
import QuickLogReviewPanel from "../components/QuickLogReviewPanel"
import HealthWarningModal from "../components/HealthWarningModal"

function generateId() {
    return Math.random().toString(36).slice(2)
}

const initialForm: QuickLogFormData = {
    name: "",
    description: "",
    ingredients: [{ localId: generateId(), name: "", portion: "", unit: "g" }],
}

function extractError(err: unknown) {
    return (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? "Something went wrong. Please try again."
}

const steps = [
    { n: 1, label: "Meal Details",  sub: "Name & description" },
    { n: 2, label: "Ingredients",   sub: "What goes into your meal" },
    { n: 3, label: "Review",        sub: "AI macros — confirm or discard" },
]

export default function QuickLog() {
    const [form, setForm] = useState<QuickLogFormData>(initialForm)
    const [entry, setEntry] = useState<QuickLogEntry | null>(null)
    const [mobileStep, setMobileStep] = useState<0 | 1 | 2>(0)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showWarning, setShowWarning] = useState(false)
    const [warningIngredients, setWarningIngredients] = useState<FlaggedIngredient[]>([])

    function setField<K extends keyof QuickLogFormData>(field: K, value: QuickLogFormData[K]) {
        setForm(prev => ({ ...prev, [field]: value }))
    }

    const basicValid = form.name.trim().length > 0 && form.name.length <= 255
    const ingredientsValid =
        form.ingredients.length >= 1 &&
        form.ingredients.every(i => i.name.trim() && Number(i.portion) >= 0.1 && i.unit.trim())
    const submitReady = basicValid && ingredientsValid

    async function handleCalculate() {
        if (!submitReady) return
        setLoading(true)
        setError(null)
        setEntry(null)
        try {
            const res = await createQuickLog(form)
            setEntry(res.logged_meal)
            setMobileStep(2)
            if (res.health_warning.is_flagged) {
                setWarningIngredients(res.health_warning.flagged_ingredients)
                setShowWarning(true)
            }
        } catch (err) {
            setEntry(null)
            setError(extractError(err))
        } finally {
            setLoading(false)
        }
    }

    async function handleConfirm() {
        if (!entry) return
        setLoading(true)
        setError(null)
        try {
            await confirmQuickLog(entry.id)
            setForm(initialForm)
            setEntry(null)
            setMobileStep(0)
        } catch (err) {
            setError(extractError(err))
        } finally {
            setLoading(false)
        }
    }

    async function handleDiscard() {
        if (!entry) return
        setLoading(true)
        setError(null)
        try {
            await deleteQuickLog(entry.id)
            setForm(initialForm)
            setEntry(null)
            setMobileStep(0)
        } catch (err) {
            setError(extractError(err))
        } finally {
            setLoading(false)
        }
    }

    function handleWarningEdit() {
        setShowWarning(false)
        if (window.innerWidth < 640) setMobileStep(1)
    }

    async function handleWarningIgnore() {
        setShowWarning(false)
        await handleConfirm()
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

            {/* ── Desktop ──────────────────────────────────────────────── */}
            <div className="hidden sm:flex flex-col flex-1 min-h-0">
                {/* Step header */}
                <div className="flex flex-shrink-0 border-b border-border/20">
                    {steps.map((s, i) => (
                        <div key={s.n} className={`flex-1 flex items-center gap-3 px-5 py-3.5 ${i < 2 ? "border-r border-border/20" : ""}`}>
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

                {/* Panels */}
                <div className="flex flex-1 min-h-0">
                    <div className={`${panelBase} ${panelDivider}`}>
                        <QuickLogBasicPanel form={form} onChange={setField} />
                    </div>
                    <div className={`${panelBase} ${panelDivider}`}>
                        <QuickLogInputPanel form={form} onChange={setField} loading={loading} />
                    </div>
                    <div className={panelBase}>
                        <QuickLogReviewPanel
                            entry={entry}
                            onCalculate={handleCalculate}
                            onRecalculate={handleCalculate}
                            onConfirm={handleConfirm}
                            onDiscard={handleDiscard}
                            loading={loading}
                            error={error}
                            submitReady={submitReady}
                        />
                    </div>
                </div>
            </div>

            {/* ── Mobile: 3 steps ──────────────────────────────────────── */}
            <div className="flex sm:hidden flex-col flex-1 min-h-0 px-4 py-4">
                {mobileStep === 0 && (
                    <QuickLogBasicPanel
                        form={form}
                        onChange={setField}
                        onNext={() => setMobileStep(1)}
                        isMobile
                    />
                )}
                {mobileStep === 1 && (
                    <QuickLogInputPanel
                        form={form}
                        onChange={setField}
                        onNext={() => { setMobileStep(2); handleCalculate() }}
                        onBack={() => setMobileStep(0)}
                        isMobile
                        loading={loading}
                    />
                )}
                {mobileStep === 2 && (
                    <QuickLogReviewPanel
                        entry={entry}
                        onCalculate={handleCalculate}
                        onRecalculate={handleCalculate}
                        onConfirm={handleConfirm}
                        onDiscard={handleDiscard}
                        onBack={() => setMobileStep(1)}
                        isMobile
                        loading={loading}
                        error={error}
                        submitReady={submitReady}
                    />
                )}
            </div>
        </>
    )
}

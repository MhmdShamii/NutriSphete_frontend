import { useState } from "react"
import { createMeal, confirmMeal, discardMeal, logMeal } from "../../../services/meals/mealsApis"
import { deleteQuickLog } from "../../../services/log/quickLogApi"
import type { MealFormData, MealDraft, FlaggedIngredient } from "../types/meal.types"
import HealthWarningModal from "../components/HealthWarningModal"
import BasicInfoPanel from "../components/BasicInfoPanel"
import IngredientsPanel from "../components/IngredientsPanel"
import ReviewPanel from "../components/ReviewPanel"
import QuickLog from "./QuickLog"
import EstimateMeal from "./EstimateMeal"
import { useToast } from "../../../context/ToastContext"
import { extractApiError } from "../../../utils/apiError"

function generateId() {
    return Math.random().toString(36).slice(2)
}

function makeInitialForm(): MealFormData {
    return {
        name: "",
        description: "",
        visibility: "public",
        servings: 1,
        ingredients: [{ localId: generateId(), name: "", portion: "", unit: "g" }],
        preparation_steps: [],
    }
}

export default function CreateMeal() {
    const { showError, showSuccess, showWarning: toastWarning } = useToast()
    const [view, setView] = useState<"post" | "quick" | "estimate">("post")
    const [form, setForm] = useState<MealFormData>(makeInitialForm)
    const [formKey, setFormKey] = useState(0)
    const [mobileStep, setMobileStep] = useState<0 | 1 | 2>(0)
    const [draft, setDraft] = useState<MealDraft | null>(null)
    const [reviewKey, setReviewKey] = useState(0)
    const [loading, setLoading] = useState(false)
    const [showWarning, setShowWarning] = useState(false)
    const [warningIngredients, setWarningIngredients] = useState<FlaggedIngredient[]>([])
    const [warningContext, setWarningContext] = useState<"create" | "log">("create")
    const [pendingLogId, setPendingLogId] = useState<number | null>(null)

    function setField<K extends keyof MealFormData>(field: K, value: MealFormData[K]) {
        setForm(prev => ({ ...prev, [field]: value }))
    }

    function resetDraft() {
        setDraft(null)
        setReviewKey(k => k + 1)
    }

    function resetForm() {
        setForm(makeInitialForm())
        setDraft(null)
        setMobileStep(0)
        setFormKey(k => k + 1)
        setReviewKey(k => k + 1)
    }

    const panel1Valid =
        form.name.trim().length > 0 &&
        form.name.length <= 255 &&
        form.servings >= 1 &&
        form.servings <= 100

    const ingredientsValid =
        form.ingredients.length >= 1 &&
        form.ingredients.every(i => i.name.trim() && Number(i.portion) >= 0.1 && i.unit.trim())

    const submitReady = panel1Valid && ingredientsValid

    async function handleSubmit() {
        if (!submitReady) return
        setLoading(true)
        try {
            const [res] = await Promise.all([
                createMeal(form),
                new Promise<void>(resolve => setTimeout(resolve, 4500)),
            ])
            setDraft(res.meal)
            if (res.health_warning?.is_flagged) {
                setWarningContext("create")
                setWarningIngredients(res.health_warning.flagged_ingredients)
                setShowWarning(true)
            }
        } catch (err: unknown) {
            if (window.innerWidth < 640) setMobileStep(1)
            showError(extractApiError(err))
        } finally {
            setLoading(false)
        }
    }

    async function handleConfirm(image: File) {
        if (!draft) return
        setLoading(true)
        try {
            await confirmMeal(draft.id, image)
            resetForm()
        } catch (err) {
            showError(extractApiError(err))
        } finally {
            setLoading(false)
        }
    }

    async function handleConfirmAndLog(image: File) {
        if (!draft) return
        setLoading(true)
        try {
            await confirmMeal(draft.id, image)
            // Meal is now confirmed on the backend. Log it separately so a
            // logMeal failure doesn't prevent the confirmed meal from resetting.
            let logFailed = false
            try {
                const logRes = await logMeal(draft.id)
                if (logRes.health_warning?.is_flagged) {
                    setPendingLogId(logRes.logged_meal.id)
                    setWarningContext("log")
                    setWarningIngredients(logRes.health_warning.flagged_ingredients)
                    setShowWarning(true)
                    return
                }
            } catch {
                logFailed = true
            }
            resetForm()
            if (logFailed) toastWarning("Meal saved! Couldn't add it to today's log — try logging from your profile.")
            else showSuccess("Meal logged successfully!")
        } catch (err) {
            showError(extractApiError(err))
        } finally {
            setLoading(false)
        }
    }

    function handleWarningIgnore() {
        if (warningContext === "log") {
            // Meal-post logs are confirmed on creation — no second API call needed
            setPendingLogId(null)
            setShowWarning(false)
            resetForm()
            showSuccess("Meal logged successfully!")
        } else {
            // "create" context: draft is already set, just close and let user proceed to review
            setShowWarning(false)
        }
    }

    async function handleWarningDiscard() {
        setLoading(true)
        try {
            if (warningContext === "log" && pendingLogId !== null) {
                await deleteQuickLog(pendingLogId)
                setPendingLogId(null)
            } else if (warningContext === "create" && draft) {
                await discardMeal(draft.id)
            }
            setShowWarning(false)
            resetForm()
        } catch (err) {
            showError(extractApiError(err))
        } finally {
            setLoading(false)
        }
    }

    function handleWarningEdit() {
        setShowWarning(false)
        if (window.innerWidth < 640) {
            handleEditMobile()
        }
    }

    async function handleDiscard() {
        if (!draft) return
        setLoading(true)
        try {
            await discardMeal(draft.id)
            resetForm()
        } catch (err) {
            showError(extractApiError(err))
        } finally {
            setLoading(false)
        }
    }

    // Desktop: discard old draft, then create new one with updated form
    async function handleRecalculate() {
        if (!draft) return
        setLoading(true)
        try {
            await discardMeal(draft.id)
            setDraft(null)
            const res = await createMeal(form)
            setDraft(res.meal)
            setReviewKey(k => k + 1)
        } catch (err: unknown) {
            setDraft(null)
            setReviewKey(k => k + 1)
            showError(extractApiError(err))
        } finally {
            setLoading(false)
        }
    }

    // Mobile: explicitly discard then go back to ingredients
    async function handleEditMobile() {
        if (!draft) return
        setLoading(true)
        try {
            await discardMeal(draft.id)
            resetDraft()
            setMobileStep(1)
        } catch (err) {
            showError(extractApiError(err))
        } finally {
            setLoading(false)
        }
    }

    const panelBase = "flex-1 min-w-0 overflow-y-auto px-5 py-5"
    const panelDivider = "border-r border-border/20"

    const steps = [
        { n: 1, label: "Meal Details",        sub: "Name, servings & visibility" },
        { n: 2, label: "Ingredients & Steps", sub: "What goes into your meal" },
        { n: 3, label: "Photo & Review",       sub: draft ? "AI macros — confirm or discard" : "Add photo & create meal" },
    ]

    function switchView(v: "post" | "quick" | "estimate") {
        if (v === view) return
        resetForm()
        setView(v)
    }

    return (
        <div className="flex flex-col h-full overflow-y-auto no-scrollbar">
            {showWarning && (
                <HealthWarningModal
                    flaggedIngredients={warningIngredients}
                    onEdit={handleWarningEdit}
                    onIgnore={handleWarningIgnore}
                    onDiscard={handleWarningDiscard}
                    loading={loading}
                    confirmLabel={warningContext === "create" ? "Proceed Anyway" : "Ignore"}
                />
            )}

            {/* ── Toggle — rendered once, always on top ───────────────── */}
            <div className="flex flex-shrink-0 items-center justify-center border-b border-border/20 px-3 sm:px-5 py-2">
                <div className="flex sm:inline-flex w-full sm:w-auto bg-surface border border-border/30 rounded-xl p-0.5 overflow-hidden">
                    {(["post", "quick", "estimate"] as const).map(v => (
                        <button
                            key={v}
                            type="button"
                            onClick={() => switchView(v)}
                            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-[10px] text-xs font-semibold cursor-pointer transition-all duration-200 text-center
                                ${view === v ? "bg-primary text-black" : "text-text-muted hover:text-text"}`}
                        >
                            {v === "post" ? "Meal Post" : v === "quick" ? "Quick Log" : "Estimate"}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Quick Log ────────────────────────────────────────────── */}
            {view === "quick" && <QuickLog />}

            {/* ── Estimate ─────────────────────────────────────────────── */}
            {view === "estimate" && <EstimateMeal />}

            {/* ── Meal Post ────────────────────────────────────────────── */}
            {view === "post" && (
                <>
                    {/* Desktop step header */}
                    <div className="hidden sm:flex flex-shrink-0 border-b border-border/20">
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

                    {/* Desktop panels */}
                    <div className="hidden sm:flex flex-1 min-h-0">
                        <div className={`${panelBase} ${panelDivider}`}>
                            <BasicInfoPanel key={formKey} form={form} onChange={setField} />
                        </div>
                        <div className={`${panelBase} ${panelDivider}`}>
                            <IngredientsPanel key={formKey} form={form} onChange={setField} loading={loading} />
                        </div>
                        <div className={panelBase}>
                            <ReviewPanel
                                key={reviewKey}
                                draft={draft}
                                onSubmit={handleSubmit}
                                onConfirm={handleConfirm}
                                onConfirmAndLog={handleConfirmAndLog}
                                onDiscard={handleDiscard}
                                onRecalculate={handleRecalculate}
                                loading={loading}
                                submitReady={submitReady}
                            />
                        </div>
                    </div>

                    {/* Mobile steps */}
                    <div className="flex sm:hidden flex-col flex-1 min-h-0 px-4 py-4">
                        {mobileStep === 0 && (
                            <BasicInfoPanel key={formKey} form={form} onChange={setField} onNext={() => setMobileStep(1)} isMobile />
                        )}
                        {mobileStep === 1 && (
                            <IngredientsPanel
                                key={formKey}
                                form={form}
                                onChange={setField}
                                onNext={() => { setMobileStep(2); handleSubmit() }}
                                onBack={() => setMobileStep(0)}
                                isMobile
                                loading={loading}
                            />
                        )}
                        {mobileStep === 2 && (
                            <ReviewPanel
                                key={reviewKey}
                                draft={draft}
                                onSubmit={handleSubmit}
                                onConfirm={handleConfirm}
                                onConfirmAndLog={handleConfirmAndLog}
                                onDiscard={handleDiscard}
                                onEditMobile={handleEditMobile}
                                onBack={() => setMobileStep(1)}
                                isMobile
                                loading={loading}
                                submitReady={submitReady}
                            />
                        )}
                    </div>
                </>
            )}
        </div>
    )
}

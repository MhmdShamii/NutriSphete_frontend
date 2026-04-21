import { useState } from "react"
import { createMeal, confirmMeal, discardMeal, logMeal } from "../../../services/meals/mealsApis"
import type { MealFormData, MealDraft } from "../types/meal.types"
import BasicInfoPanel from "../components/BasicInfoPanel"
import IngredientsPanel from "../components/IngredientsPanel"
import ReviewPanel from "../components/ReviewPanel"
import QuickLog from "./QuickLog"

function generateId() {
    return Math.random().toString(36).slice(2)
}

const initialForm: MealFormData = {
    name: "",
    description: "",
    visibility: "public",
    servings: 1,
    ingredients: [{ localId: generateId(), name: "", portion: "", unit: "g" }],
    preparation_steps: [],
}

export default function CreateMeal() {
    const [view, setView] = useState<"post" | "quick">("post")
    const [form, setForm] = useState<MealFormData>(initialForm)
    const [mobileStep, setMobileStep] = useState<0 | 1 | 2>(0)
    const [draft, setDraft] = useState<MealDraft | null>(null)
    const [reviewKey, setReviewKey] = useState(0)
    const [loading, setLoading] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)

    function setField<K extends keyof MealFormData>(field: K, value: MealFormData[K]) {
        setForm(prev => ({ ...prev, [field]: value }))
    }

    function resetDraft() {
        setDraft(null)
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
        setSubmitError(null)
        try {
            const [res] = await Promise.all([
                createMeal(form),
                new Promise<void>(resolve => setTimeout(resolve, 4500)),
            ])
            setDraft(res.meal)
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
            setSubmitError(msg ?? "Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    async function handleConfirm(image: File) {
        if (!draft) return
        setLoading(true)
        setSubmitError(null)
        try {
            await confirmMeal(draft.id, image)
            setForm(initialForm)
            resetDraft()
            setMobileStep(0)
        } catch {
            setSubmitError("Failed to confirm meal.")
        } finally {
            setLoading(false)
        }
    }

    async function handleConfirmAndLog(image: File) {
        if (!draft) return
        setLoading(true)
        setSubmitError(null)
        try {
            await confirmMeal(draft.id, image)
            await logMeal(draft.id)
            setForm(initialForm)
            resetDraft()
            setMobileStep(0)
        } catch {
            setSubmitError("Failed to confirm and log meal.")
        } finally {
            setLoading(false)
        }
    }

    async function handleDiscard() {
        if (!draft) return
        setLoading(true)
        try {
            await discardMeal(draft.id)
            setForm(initialForm)
            resetDraft()
            setMobileStep(0)
        } catch {
            setSubmitError("Failed to discard meal.")
        } finally {
            setLoading(false)
        }
    }

    // Desktop: discard old draft, then create new one with updated form
    async function handleRecalculate() {
        if (!draft) return
        setLoading(true)
        setSubmitError(null)
        try {
            await discardMeal(draft.id)
            setDraft(null)
            const res = await createMeal(form)
            setDraft(res.meal)
            setReviewKey(k => k + 1)
        } catch (err: unknown) {
            setDraft(null)
            setReviewKey(k => k + 1)
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
            setSubmitError(msg ?? "Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    // Mobile: explicitly discard then go back to ingredients
    async function handleEditMobile() {
        if (!draft) return
        setLoading(true)
        setSubmitError(null)
        try {
            await discardMeal(draft.id)
            resetDraft()
            setMobileStep(1)
        } catch {
            setSubmitError("Failed to reset. Try again.")
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

    return (
        <div className="flex flex-col h-full">

            {/* ── Toggle — rendered once, always on top ───────────────── */}
            <div className="flex flex-shrink-0 items-center justify-center border-b border-border/20 px-5 py-2.5">
                <div className="flex bg-surface border border-border/30 rounded-xl p-0.5 overflow-hidden">
                    <button
                        type="button"
                        onClick={() => setView("post")}
                        className={`px-5 py-1.5 rounded-[10px] text-xs font-semibold cursor-pointer transition-all duration-200
                            ${view === "post" ? "bg-primary text-black" : "text-text-muted hover:text-text"}`}
                    >
                        Meal Post
                    </button>
                    <button
                        type="button"
                        onClick={() => setView("quick")}
                        className={`px-5 py-1.5 rounded-[10px] text-xs font-semibold cursor-pointer transition-all duration-200
                            ${view === "quick" ? "bg-primary text-black" : "text-text-muted hover:text-text"}`}
                    >
                        Quick Log
                    </button>
                </div>
            </div>

            {/* ── Quick Log ────────────────────────────────────────────── */}
            {view === "quick" && <QuickLog />}

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
                            <BasicInfoPanel form={form} onChange={setField} />
                        </div>
                        <div className={`${panelBase} ${panelDivider}`}>
                            <IngredientsPanel form={form} onChange={setField} loading={loading} error={submitError} />
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
                                error={submitError}
                                submitReady={submitReady}
                            />
                        </div>
                    </div>

                    {/* Mobile steps */}
                    <div className="flex sm:hidden flex-col flex-1 min-h-0 px-4 py-4">
                        {mobileStep === 0 && (
                            <BasicInfoPanel form={form} onChange={setField} onNext={() => setMobileStep(1)} isMobile />
                        )}
                        {mobileStep === 1 && (
                            <IngredientsPanel
                                form={form}
                                onChange={setField}
                                onNext={() => { setMobileStep(2); handleSubmit() }}
                                onBack={() => setMobileStep(0)}
                                isMobile
                                loading={loading}
                                error={submitError}
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
                                error={submitError}
                                submitReady={submitReady}
                            />
                        )}
                    </div>
                </>
            )}
        </div>
    )
}

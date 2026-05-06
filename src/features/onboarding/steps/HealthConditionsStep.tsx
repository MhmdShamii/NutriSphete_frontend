import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { completeHealthConditions, fetchMe, clearError } from "../../auth/authSlice"
import { getHealthConditionsApi, addHealthConditionApi, removeHealthConditionApi } from "../../../services/auth/authApi"
import type { AppDispatch, RootState } from "../../../app/store"
import type { HealthCondition } from "../../auth/types"
import StepHeader from "../components/StepHeader"
import Button from "../../../components/ui/Button"
import { useToast } from "../../../context/ToastContext"

type SelectedItem = {
    userConditionId: number    // id from POST response — used for DELETE
    conditionId: number | null // original predefined condition id, null for custom
    name: string
}

export default function HealthConditionsStep() {
    const dispatch = useDispatch<AppDispatch>()
    const navigate = useNavigate()
    const { showError } = useToast()
    const { loading, error } = useSelector((state: RootState) => state.auth)

    useEffect(() => {
        if (error) {
            showError(error)
            dispatch(clearError())
        }
    }, [error])

    const [conditions, setConditions] = useState<HealthCondition[]>([])
    const [selected, setSelected] = useState<SelectedItem[]>([])
    const [query, setQuery] = useState("")
    const [open, setOpen] = useState(false)
    const [adding, setAdding] = useState(false)
    const [removing, setRemoving] = useState<Set<number>>(new Set())

    const inputRef = useRef<HTMLInputElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        getHealthConditionsApi().then(setConditions).catch(() => {})
    }, [])

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (
                dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
                inputRef.current && !inputRef.current.contains(e.target as Node)
            ) setOpen(false)
        }
        document.addEventListener("mousedown", handleClick)
        return () => document.removeEventListener("mousedown", handleClick)
    }, [])

    const pickedConditionIds = new Set(selected.map(s => s.conditionId).filter(Boolean) as number[])
    const selectedCustomNames = new Set(selected.filter(s => s.conditionId === null).map(s => s.name.toLowerCase()))

    const queryTrimmed = query.trim()
    const filtered = conditions.filter(c =>
        !pickedConditionIds.has(c.id) &&
        c.name.toLowerCase().includes(query.toLowerCase())
    )
    const exactMatch = conditions.some(c => c.name.toLowerCase() === queryTrimmed.toLowerCase())
    const showAddCustom =
        queryTrimmed.length > 0 &&
        !exactMatch &&
        !selectedCustomNames.has(queryTrimmed.toLowerCase())

    async function handleSelectPredefined(c: HealthCondition) {
        setOpen(false)
        setQuery("")
        setAdding(true)
        try {
            const result = await addHealthConditionApi({ health_condition_id: c.id })
            setSelected(prev => [...prev, { userConditionId: result.id, conditionId: c.id, name: c.name }])
        } catch {
            showError("Failed to add condition — please try again")
        } finally {
            setAdding(false)
            inputRef.current?.focus()
        }
    }

    async function handleAddCustom() {
        if (!queryTrimmed) return
        setOpen(false)
        const text = queryTrimmed
        setQuery("")
        setAdding(true)
        try {
            const result = await addHealthConditionApi({ custom_condition: text })
            setSelected(prev => [...prev, { userConditionId: result.id, conditionId: null, name: text }])
        } catch {
            showError("Failed to add condition — please try again")
        } finally {
            setAdding(false)
            inputRef.current?.focus()
        }
    }

    async function handleRemove(item: SelectedItem) {
        setRemoving(prev => new Set(prev).add(item.userConditionId))
        try {
            await removeHealthConditionApi(item.userConditionId)
            setSelected(prev => prev.filter(s => s.userConditionId !== item.userConditionId))
        } catch {
            showError("Failed to remove condition — please try again")
        } finally {
            setRemoving(prev => { const next = new Set(prev); next.delete(item.userConditionId); return next })
        }
    }

    async function handleComplete() {
        try {
            await dispatch(completeHealthConditions()).unwrap()
            await dispatch(fetchMe()).unwrap()
            navigate("/stats", { replace: true })
        } catch {}
    }

    return (
        <div className="flex flex-col gap-6">
            <StepHeader
                step={4} total={4}
                title="Health conditions"
                subtitle="Helps us tailor your plan safely — you can skip this"
            />

            <div className="flex flex-col gap-3">

                {/* Search input */}
                <div className="relative">
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={e => { setQuery(e.target.value); setOpen(true) }}
                        onFocus={() => setOpen(true)}
                        placeholder={adding ? "Adding..." : "Search or enter a condition..."}
                        disabled={adding}
                        className="bg-surface border border-border/30 rounded-lg p-3 outline-none w-full text-text text-sm
                            transition-all duration-300 focus:border-primary/60 focus:shadow-[0_0_12px_rgba(127,250,136,0.35)]
                            disabled:opacity-50"
                    />
                    {adding && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2
                            w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    )}

                    {/* Dropdown */}
                    {open && query.length > 0 && (filtered.length > 0 || showAddCustom) && (
                        <div
                            ref={dropdownRef}
                            className="absolute z-20 top-full mt-1 w-full bg-surface border border-border/30 rounded-xl shadow-xl overflow-hidden"
                        >
                            {filtered.slice(0, 8).map(c => (
                                <button
                                    key={c.id}
                                    type="button"
                                    onMouseDown={e => { e.preventDefault(); handleSelectPredefined(c) }}
                                    className="w-full text-left px-4 py-2.5 text-sm text-text hover:bg-primary/10 transition-colors duration-150"
                                >
                                    {c.name}
                                </button>
                            ))}
                            {showAddCustom && (
                                <button
                                    type="button"
                                    onMouseDown={e => { e.preventDefault(); handleAddCustom() }}
                                    className="w-full text-left px-4 py-2.5 text-sm text-primary/80 hover:bg-primary/10 border-t border-border/20 transition-colors duration-150"
                                >
                                    Add custom: <span className="font-medium text-primary">"{queryTrimmed}"</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Selected chips */}
                {selected.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {selected.map(item => {
                            const isRemoving = removing.has(item.userConditionId)
                            return (
                                <span
                                    key={item.userConditionId}
                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium
                                        bg-primary/15 text-primary border border-primary/25 transition-opacity duration-200"
                                    style={{ opacity: isRemoving ? 0.5 : 1 }}
                                >
                                    {item.name}
                                    <button
                                        type="button"
                                        disabled={isRemoving}
                                        onClick={() => handleRemove(item)}
                                        className="text-primary/60 hover:text-primary transition-colors leading-none disabled:cursor-not-allowed"
                                    >
                                        {isRemoving
                                            ? <span className="w-2.5 h-2.5 border border-primary border-t-transparent rounded-full animate-spin inline-block" />
                                            : "×"}
                                    </button>
                                </span>
                            )
                        })}
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-2">
                <Button
                    type="button"
                    disabled={loading || adding || removing.size > 0}
                    onClick={handleComplete}
                    className="flex items-center justify-center gap-2 w-full"
                >
                    {loading
                        ? <span className="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full" />
                        : selected.length > 0 ? "Continue" : "Continue without conditions"}
                </Button>
                <button
                    type="button"
                    disabled={loading || adding || removing.size > 0}
                    onClick={handleComplete}
                    className="text-sm text-text-muted/60 hover:text-text-muted transition-colors py-1 disabled:opacity-40"
                >
                    Skip
                </button>
            </div>
        </div>
    )
}

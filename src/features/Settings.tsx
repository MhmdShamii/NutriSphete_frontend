import { useState, useRef, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "../app/store"
import { updateMe, updateTargets, fetchMe, clearError } from "./auth/authSlice"
import { uploadAvatarApi, deleteAvatarApi } from "../services/auth/authApi"
import { useToast } from "../context/ToastContext"
import type { UpdateMePayload } from "./auth/types"
import CountryDropdown, { type Country } from "../components/ui/CountryDropdown"
import countriesData from "../assets/data/countries.json"
import AvatarUI from "../components/ui/Avatar"
import {
    getUserHealthConditionsApi,
    deleteUserHealthConditionApi,
    getHealthConditionsApi,
    addHealthConditionApi,
    type UserHealthCondition,
} from "../services/auth/authApi"
import type { HealthCondition } from "./auth/types"
import PersonRoundedIcon from "@mui/icons-material/PersonRounded"
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded"
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded"
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded"
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded"
import CheckRoundedIcon from "@mui/icons-material/CheckRounded"

const countries = countriesData as Country[]

type Section = "personal" | "nutrition" | "health"

const NAV: { key: Section; label: string; icon: React.ReactNode }[] = [
    {
        key: "personal",
        label: "Personal Info",
        icon: <PersonRoundedIcon sx={{ fontSize: 17 }} />,
    },
    {
        key: "nutrition",
        label: "Nutrition Goals",
        icon: <LocalFireDepartmentRoundedIcon sx={{ fontSize: 17 }} />,
    },
    {
        key: "health",
        label: "Health Conditions",
        icon: <FavoriteRoundedIcon sx={{ fontSize: 17 }} />,
    },
]

const inputCls =
    "w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-text outline-none " +
    "focus:border-primary/60 focus:bg-primary/5 focus:shadow-[0_0_14px_rgba(127,250,136,0.10)] " +
    "transition-all duration-200 placeholder:text-text-muted/30"

// ─── Personal Info ────────────────────────────────────────────────────────────

function PersonalInfoSection() {
    const dispatch = useDispatch<AppDispatch>()
    const { showSuccess, showError } = useToast()
    const { user, loading, error } = useSelector((state: RootState) => state.auth)

    const [form, setForm] = useState({ first_name: "", last_name: "" })
    const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
    const snapshot = useRef({ first_name: "", last_name: "", country_code: "" })
    const [dirty, setDirty] = useState(false)

    const [avatarMenuOpen, setAvatarMenuOpen] = useState(false)
    const [avatarLoading, setAvatarLoading] = useState(false)
    const avatarMenuRef = useRef<HTMLDivElement>(null)
    const avatarInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        function handleOutside(e: MouseEvent) {
            if (avatarMenuRef.current && !avatarMenuRef.current.contains(e.target as Node)) {
                setAvatarMenuOpen(false)
            }
        }
        document.addEventListener("mousedown", handleOutside)
        return () => document.removeEventListener("mousedown", handleOutside)
    }, [])

    useEffect(() => {
        if (error) {
            showError(error)
            dispatch(clearError())
        }
    }, [error])

    useEffect(() => {
        if (!user) return
        const first_name = user.first_name ?? ""
        const last_name = user.last_name ?? ""
        const country_code = user.country.code ?? ""
        setForm({ first_name, last_name })
        setSelectedCountry(countries.find(c => c["alpha-3"] === country_code) ?? null)
        snapshot.current = { first_name, last_name, country_code }
        setDirty(false)
    }, [user])

    function checkDirty(newForm = form, newCountry = selectedCountry) {
        const newCode = newCountry?.["alpha-3"] ?? ""
        setDirty(
            newForm.first_name.trim() !== snapshot.current.first_name ||
            newForm.last_name.trim() !== snapshot.current.last_name ||
            newCode !== snapshot.current.country_code
        )
    }

    async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        e.target.value = ""
        setAvatarMenuOpen(false)
        setAvatarLoading(true)
        try {
            await uploadAvatarApi(file)
            await dispatch(fetchMe())
            showSuccess("Avatar updated")
        } catch {
            showError("Failed to upload avatar")
        } finally {
            setAvatarLoading(false)
        }
    }

    async function handleAvatarDelete() {
        setAvatarMenuOpen(false)
        setAvatarLoading(true)
        try {
            await deleteAvatarApi()
            await dispatch(fetchMe())
            showSuccess("Avatar removed")
        } catch {
            showError("Failed to remove avatar")
        } finally {
            setAvatarLoading(false)
        }
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault()
        const patch: UpdateMePayload = {}
        if (form.first_name.trim() !== snapshot.current.first_name) patch.first_name = form.first_name.trim()
        if (form.last_name.trim() !== snapshot.current.last_name) patch.last_name = form.last_name.trim()
        const newCode = selectedCountry?.["alpha-3"] ?? ""
        if (newCode !== snapshot.current.country_code) patch.country_code = newCode
        if (Object.keys(patch).length === 0) return
        try {
            await dispatch(updateMe(patch)).unwrap()
            showSuccess("Profile updated")
        } catch { }
    }

    if (!user) return null

    return (
        <div className="flex flex-col gap-5">
            <div>
                <h2 className="text-base font-semibold text-text">Personal Information</h2>
                <p className="text-xs text-text-muted mt-0.5">Update your name, country, and profile photo.</p>
            </div>

            {/* Avatar */}
            <div
                className="flex items-center gap-4 p-4 rounded-2xl"
                style={{ border: "1px solid var(--glass-border)", background: "var(--glass-bg)" }}
            >
                <div ref={avatarMenuRef} className="relative flex-shrink-0">
                    <button
                        type="button"
                        onClick={() => setAvatarMenuOpen(o => !o)}
                        className="relative group block rounded-full focus:outline-none"
                    >
                        <AvatarUI
                            src={user.image.avatar}
                            name={`${user.first_name ?? ""} ${user.last_name ?? ""}`}
                            size={64}
                            className="shadow-lg"
                        />
                        <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100
                            transition-opacity duration-200 flex items-center justify-center">
                            {avatarLoading
                                ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                : <PhotoCameraRoundedIcon sx={{ fontSize: 18 }} className="text-white" />
                            }
                        </div>
                    </button>

                    {avatarMenuOpen && (
                        <div
                            className="absolute left-0 top-full mt-2 w-44 rounded-2xl shadow-xl z-50 overflow-hidden"
                            style={{ background: "var(--surface)", border: "1px solid var(--glass-border)" }}
                        >
                            <label className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-muted
                                hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer">
                                <PhotoCameraRoundedIcon sx={{ fontSize: 15 }} />
                                Upload photo
                                <input
                                    ref={avatarInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleAvatarUpload}
                                />
                            </label>
                            {user.image.avatar && (
                                <button
                                    type="button"
                                    onClick={handleAvatarDelete}
                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm
                                        text-red-400 hover:bg-red-400/10 transition-colors"
                                >
                                    <DeleteOutlineRoundedIcon sx={{ fontSize: 15 }} />
                                    Remove photo
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div>
                    <p className="text-sm font-medium text-text">Profile photo</p>
                    <p className="text-xs text-text-muted mt-0.5">JPG, PNG or GIF. Click the photo to change.</p>
                </div>
            </div>

            {/* Name + Country */}
            <form onSubmit={handleSave} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-text-muted">First name</label>
                        <input
                            className={inputCls}
                            value={form.first_name}
                            onChange={e => {
                                const v = { ...form, first_name: e.target.value }
                                setForm(v)
                                checkDirty(v, selectedCountry)
                            }}
                            placeholder="First name"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-text-muted">Last name</label>
                        <input
                            className={inputCls}
                            value={form.last_name}
                            onChange={e => {
                                const v = { ...form, last_name: e.target.value }
                                setForm(v)
                                checkDirty(v, selectedCountry)
                            }}
                            placeholder="Last name"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-text-muted">Country</label>
                    <CountryDropdown
                        countries={countries}
                        selected={selectedCountry}
                        onSelect={c => { setSelectedCountry(c); checkDirty(form, c) }}
                        show="name"
                    />
                </div>

                <div className="flex justify-end pt-1">
                    <button
                        type="submit"
                        disabled={!dirty || loading}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold
                            bg-primary text-black hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed
                            transition-all duration-200"
                    >
                        {loading
                            ? <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                            : <CheckRoundedIcon sx={{ fontSize: 15 }} />
                        }
                        Save changes
                    </button>
                </div>
            </form>
        </div>
    )
}

// ─── Nutrition Goals ──────────────────────────────────────────────────────────

type MacroField = { key: keyof NutritionForm; label: string; unit: string; color: string }

type NutritionForm = {
    daily_calorie_target: string
    daily_protein_g: string
    daily_carbs_g: string
    daily_fat_g: string
}

const MACROS: MacroField[] = [
    { key: "daily_calorie_target", label: "Daily Calories", unit: "kcal", color: "text-primary" },
    { key: "daily_protein_g",      label: "Protein",        unit: "g",    color: "text-blue-400" },
    { key: "daily_carbs_g",        label: "Carbohydrates",  unit: "g",    color: "text-amber-400" },
    { key: "daily_fat_g",          label: "Fat",            unit: "g",    color: "text-pink-400" },
]

function NutritionGoalsSection() {
    const dispatch = useDispatch<AppDispatch>()
    const { showSuccess, showError } = useToast()
    const { user, loading, error } = useSelector((state: RootState) => state.auth)

    const [form, setForm] = useState<NutritionForm>({
        daily_calorie_target: "",
        daily_protein_g: "",
        daily_carbs_g: "",
        daily_fat_g: "",
    })
    const snapshot = useRef<NutritionForm>({ daily_calorie_target: "", daily_protein_g: "", daily_carbs_g: "", daily_fat_g: "" })
    const [dirty, setDirty] = useState(false)

    useEffect(() => {
        if (error) {
            showError(error)
            dispatch(clearError())
        }
    }, [error])

    useEffect(() => {
        if (!user?.profile) return
        const initial: NutritionForm = {
            daily_calorie_target: String(user.profile.daily_calorie_target ?? ""),
            daily_protein_g:      String(user.profile.daily_protein_g ?? ""),
            daily_carbs_g:        String(user.profile.daily_carbs_g ?? ""),
            daily_fat_g:          String(user.profile.daily_fat_g ?? ""),
        }
        setForm(initial)
        snapshot.current = initial
        setDirty(false)
    }, [user])

    function handleChange(key: keyof NutritionForm, value: string) {
        const updated = { ...form, [key]: value }
        setForm(updated)
        setDirty(
            updated.daily_calorie_target !== snapshot.current.daily_calorie_target ||
            updated.daily_protein_g !== snapshot.current.daily_protein_g ||
            updated.daily_carbs_g !== snapshot.current.daily_carbs_g ||
            updated.daily_fat_g !== snapshot.current.daily_fat_g
        )
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault()
        const calories = Number(form.daily_calorie_target)
        const protein  = Number(form.daily_protein_g)
        const carbs    = Number(form.daily_carbs_g)
        const fat      = Number(form.daily_fat_g)

        if ([calories, protein, carbs, fat].some(v => isNaN(v) || v < 0)) {
            showError("All values must be valid positive numbers")
            return
        }

        try {
            await dispatch(updateTargets({
                daily_calorie_target: calories,
                daily_protein_g:      protein,
                daily_carbs_g:        carbs,
                daily_fat_g:          fat,
            })).unwrap()
            showSuccess("Nutrition goals updated")
            setDirty(false)
            snapshot.current = { ...form }
        } catch { }
    }

    if (!user) return null

    const totalMacroCalories = (
        Number(form.daily_protein_g) * 4 +
        Number(form.daily_carbs_g) * 4 +
        Number(form.daily_fat_g) * 9
    )

    return (
        <div className="flex flex-col gap-5">
            <div>
                <h2 className="text-base font-semibold text-text">Nutrition Goals</h2>
                <p className="text-xs text-text-muted mt-0.5">Set your daily calorie and macronutrient targets.</p>
            </div>

            <div
                className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl"
                style={{ border: "1px solid rgba(127,250,136,0.15)", background: "rgba(127,250,136,0.06)" }}
            >
                <svg className="flex-shrink-0 mt-px" width="14" height="14" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="9" stroke="#7FFA88" strokeWidth="1.5" strokeOpacity="0.6" />
                    <path d="M10 9v5" stroke="#7FFA88" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.8" />
                    <circle cx="10" cy="6.5" r="0.75" fill="#7FFA88" fillOpacity="0.8" />
                </svg>
                <p className="text-xs text-primary/70 leading-relaxed">
                    Changes to your nutrition targets will take effect starting <span className="font-semibold text-primary/90">tomorrow</span>. Today's progress continues to be tracked against your current goals.
                </p>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-4">
                {MACROS.map(({ key, label, unit, color }) => (
                    <div key={key} className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-text-muted flex items-center gap-1.5">
                            <span className={`inline-block w-1.5 h-1.5 rounded-full ${color} opacity-80`}
                                style={{ background: "currentColor" }} />
                            {label}
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                inputMode="numeric"
                                className={inputCls + " pr-14"}
                                value={form[key]}
                                onChange={e => handleChange(key, e.target.value)}
                                placeholder="0"
                            />
                            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-text-muted pointer-events-none">
                                {unit}
                            </span>
                        </div>
                    </div>
                ))}

                {/* Macro breakdown */}
                {(Number(form.daily_protein_g) > 0 || Number(form.daily_carbs_g) > 0 || Number(form.daily_fat_g) > 0) && (
                    <div
                        className="p-3.5 rounded-2xl flex flex-col gap-2.5"
                        style={{ border: "1px solid var(--glass-border)", background: "var(--glass-bg)" }}
                    >
                        <p className="text-xs text-text-muted font-medium">Macro breakdown</p>
                        <div className="flex gap-1 h-2 rounded-full overflow-hidden">
                            {[
                                { g: Number(form.daily_protein_g) * 4, cls: "bg-blue-400" },
                                { g: Number(form.daily_carbs_g) * 4,   cls: "bg-amber-400" },
                                { g: Number(form.daily_fat_g) * 9,     cls: "bg-pink-400" },
                            ].map((m, i) => (
                                totalMacroCalories > 0
                                    ? <div key={i} className={`${m.cls} transition-all duration-300`}
                                        style={{ width: `${(m.g / totalMacroCalories) * 100}%` }} />
                                    : null
                            ))}
                        </div>
                        <div className="flex gap-4 flex-wrap">
                            {[
                                { label: "Protein",  g: Number(form.daily_protein_g), cal: Number(form.daily_protein_g) * 4, cls: "text-blue-400" },
                                { label: "Carbs",    g: Number(form.daily_carbs_g),   cal: Number(form.daily_carbs_g) * 4,   cls: "text-amber-400" },
                                { label: "Fat",      g: Number(form.daily_fat_g),     cal: Number(form.daily_fat_g) * 9,     cls: "text-pink-400" },
                            ].map(m => (
                                <div key={m.label} className="flex items-center gap-1.5">
                                    <span className={`text-xs font-semibold ${m.cls}`}>{m.g}g</span>
                                    <span className="text-xs text-text-muted">{m.label}</span>
                                    <span className="text-xs text-text-muted/40">· {m.cal} kcal</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex justify-end pt-1">
                    <button
                        type="submit"
                        disabled={!dirty || loading}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold
                            bg-primary text-black hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed
                            transition-all duration-200"
                    >
                        {loading
                            ? <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                            : <CheckRoundedIcon sx={{ fontSize: 15 }} />
                        }
                        Save changes
                    </button>
                </div>
            </form>
        </div>
    )
}

// ─── Health Conditions ────────────────────────────────────────────────────────

type SelectedItem = {
    userConditionId: number
    conditionId: number | null
    name: string
}

function toSelectedItem(c: UserHealthCondition): SelectedItem {
    return {
        userConditionId: c.id,
        conditionId: c.condition?.id ?? null,
        name: c.condition?.name ?? c.custom_condition ?? "",
    }
}

function HealthSection() {
    const { showError } = useToast()

    const [selected, setSelected] = useState<SelectedItem[]>([])
    const [loadingInit, setLoadingInit] = useState(true)

    const [catalog, setCatalog] = useState<HealthCondition[]>([])
    const [query, setQuery] = useState("")
    const [open, setOpen] = useState(false)
    const [adding, setAdding] = useState(false)
    const [removing, setRemoving] = useState<Set<number>>(new Set())

    const inputRef = useRef<HTMLInputElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        Promise.all([
            getUserHealthConditionsApi(),
            getHealthConditionsApi(),
        ]).then(([userConditions, allConditions]) => {
            setSelected(userConditions.map(toSelectedItem))
            setCatalog(allConditions)
        }).catch(() => showError("Failed to load health conditions")).finally(() => setLoadingInit(false))
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
    const filtered = catalog.filter(c =>
        !pickedConditionIds.has(c.id) &&
        c.name.toLowerCase().includes(query.toLowerCase())
    )
    const exactMatch = catalog.some(c => c.name.toLowerCase() === queryTrimmed.toLowerCase())
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
            await deleteUserHealthConditionApi(item.userConditionId)
            setSelected(prev => prev.filter(s => s.userConditionId !== item.userConditionId))
        } catch {
            showError("Failed to remove condition — please try again")
        } finally {
            setRemoving(prev => { const next = new Set(prev); next.delete(item.userConditionId); return next })
        }
    }

    return (
        <div className="flex flex-col gap-5">
            <div>
                <h2 className="text-base font-semibold text-text">Health Conditions</h2>
                <p className="text-xs text-text-muted mt-0.5">
                    Add conditions you have so we can tailor your plan safely.
                </p>
            </div>

            {loadingInit ? (
                <div className="flex items-center gap-2 py-4">
                    <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-text-muted">Loading conditions…</span>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {/* Search / add input */}
                    <div className="relative">
                        <input
                            ref={inputRef}
                            value={query}
                            onChange={e => { setQuery(e.target.value); setOpen(true) }}
                            onFocus={() => setOpen(true)}
                            placeholder={adding ? "Adding…" : "Search or type a condition…"}
                            disabled={adding}
                            className={inputCls + " disabled:opacity-50"}
                        />
                        {adding && (
                            <span className="absolute right-3.5 top-1/2 -translate-y-1/2
                                w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        )}

                        {open && query.length > 0 && (filtered.length > 0 || showAddCustom) && (
                            <div
                                ref={dropdownRef}
                                className="absolute z-20 top-full mt-1 w-full rounded-2xl shadow-xl overflow-hidden"
                                style={{ background: "var(--surface)", border: "1px solid var(--glass-border)" }}
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
                                        className="w-full text-left px-4 py-2.5 text-sm text-primary/80 hover:bg-primary/10
                                            border-t transition-colors duration-150"
                                        style={{ borderColor: "var(--glass-border)" }}
                                    >
                                        Add: <span className="font-semibold text-primary">"{queryTrimmed}"</span>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Selected chips */}
                    {selected.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {selected.map(item => {
                                const isRemoving = removing.has(item.userConditionId)
                                return (
                                    <span
                                        key={item.userConditionId}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                                            bg-primary/15 text-primary border border-primary/25 transition-opacity duration-200"
                                        style={{ opacity: isRemoving ? 0.5 : 1 }}
                                    >
                                        {item.name}
                                        <button
                                            type="button"
                                            disabled={isRemoving}
                                            onClick={() => handleRemove(item)}
                                            className="text-primary/50 hover:text-primary transition-colors leading-none disabled:cursor-not-allowed ml-0.5"
                                        >
                                            {isRemoving
                                                ? <span className="w-2.5 h-2.5 border border-primary border-t-transparent rounded-full animate-spin inline-block" />
                                                : "×"}
                                        </button>
                                    </span>
                                )
                            })}
                        </div>
                    ) : (
                        <p className="text-xs text-text-muted/50 py-1">No conditions added yet.</p>
                    )}
                </div>
            )}
        </div>
    )
}

// ─── Settings Page ────────────────────────────────────────────────────────────

export default function Settings() {
    const [section, setSection] = useState<Section>("personal")

    return (
        <div className="w-full flex flex-col sm:flex-row gap-4 pb-10">

            {/* Sidebar nav */}
            <nav className="sm:w-52 flex-shrink-0">
                <div
                    className="flex sm:flex-col gap-1 p-2 rounded-2xl sm:sticky sm:top-4"
                    style={{ border: "1px solid var(--glass-border)", background: "var(--glass-bg)", backdropFilter: "blur(20px)" }}
                >
                    {NAV.map(({ key, label, icon }) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setSection(key)}
                            className={`flex-1 sm:flex-none flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm
                                font-medium transition-all duration-200 text-left
                                ${section === key
                                    ? "bg-primary/15 text-primary"
                                    : "text-text-muted hover:text-text hover:bg-white/5"
                                }`}
                        >
                            {icon}
                            <span className="hidden sm:inline">{label}</span>
                        </button>
                    ))}
                </div>
            </nav>

            {/* Section content */}
            <div
                className="flex-1 min-w-0 p-5 sm:p-6 rounded-2xl"
                style={{ border: "1px solid var(--glass-border)", background: "var(--glass-bg)", backdropFilter: "blur(20px)" }}
            >
                {section === "personal"  && <PersonalInfoSection />}
                {section === "nutrition" && <NutritionGoalsSection />}
                {section === "health"    && <HealthSection />}
            </div>

        </div>
    )
}

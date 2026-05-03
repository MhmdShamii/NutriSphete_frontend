import { useState, useRef, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import type { RootState, AppDispatch } from "../app/store"
import { updateMe, updateTargets, fetchMe, clearError, logout } from "./auth/authSlice"
import {
    uploadAvatarApi,
    deleteAvatarApi,
    getUserHealthConditionsApi,
    deleteUserHealthConditionApi,
    getHealthConditionsApi,
    addHealthConditionApi,
    logoutAllDevicesApi,
    type UserHealthCondition,
} from "../services/auth/authApi"
import { useToast } from "../context/ToastContext"
import type { UpdateMePayload, HealthCondition } from "./auth/types"
import CountryDropdown, { type Country } from "../components/ui/CountryDropdown"
import countriesData from "../assets/data/countries.json"
import AvatarUI from "../components/ui/Avatar"
import PersonRoundedIcon from "@mui/icons-material/PersonRounded"
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded"
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded"
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded"
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded"
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded"
import CheckRoundedIcon from "@mui/icons-material/CheckRounded"
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded"
import DevicesRoundedIcon from "@mui/icons-material/DevicesRounded"

const countries = countriesData as Country[]

type Section = "personal" | "nutrition" | "health" | "danger"

const NAV: { key: Section; label: string; icon: React.ReactNode }[] = [
    { key: "personal",  label: "Personal Info",       icon: <PersonRoundedIcon sx={{ fontSize: 17 }} /> },
    { key: "nutrition", label: "Nutrition Goals",     icon: <LocalFireDepartmentRoundedIcon sx={{ fontSize: 17 }} /> },
    { key: "health",    label: "Health Conditions",   icon: <FavoriteRoundedIcon sx={{ fontSize: 17 }} /> },
    { key: "danger",    label: "Account",             icon: <WarningAmberRoundedIcon sx={{ fontSize: 17 }} /> },
]

const inputCls =
    "w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-text outline-none " +
    "focus:border-primary/60 focus:bg-primary/5 focus:shadow-[0_0_14px_rgba(127,250,136,0.10)] " +
    "transition-all duration-200 placeholder:text-text-muted/30"

function findScrollContainer(el: HTMLElement | null): HTMLElement | null {
    let current = el?.parentElement ?? null
    while (current && current !== document.body) {
        const { overflow, overflowY } = window.getComputedStyle(current)
        if (["auto", "scroll"].includes(overflow) || ["auto", "scroll"].includes(overflowY)) return current
        current = current.parentElement
    }
    return null
}

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
        if (error) { showError(error); dispatch(clearError()) }
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
        setDirty(
            newForm.first_name.trim() !== snapshot.current.first_name ||
            newForm.last_name.trim() !== snapshot.current.last_name ||
            (newCountry?.["alpha-3"] ?? "") !== snapshot.current.country_code
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
        } catch { showError("Failed to upload avatar") }
        finally { setAvatarLoading(false) }
    }

    async function handleAvatarDelete() {
        setAvatarMenuOpen(false)
        setAvatarLoading(true)
        try {
            await deleteAvatarApi()
            await dispatch(fetchMe())
            showSuccess("Avatar removed")
        } catch { showError("Failed to remove avatar") }
        finally { setAvatarLoading(false) }
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

            <div className="flex items-center gap-4 p-4 rounded-2xl"
                style={{ border: "1px solid var(--glass-border)", background: "var(--glass-bg)" }}>
                <div ref={avatarMenuRef} className="relative flex-shrink-0">
                    <button type="button" onClick={() => setAvatarMenuOpen(o => !o)}
                        className="relative group block rounded-full focus:outline-none">
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
                                : <PhotoCameraRoundedIcon sx={{ fontSize: 18 }} className="text-white" />}
                        </div>
                    </button>

                    {avatarMenuOpen && (
                        <div className="absolute left-0 top-full mt-2 w-44 rounded-2xl shadow-xl z-50 overflow-hidden"
                            style={{ background: "var(--surface)", border: "1px solid var(--glass-border)" }}>
                            <label className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-muted
                                hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer">
                                <PhotoCameraRoundedIcon sx={{ fontSize: 15 }} />
                                Upload photo
                                <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                            </label>
                            {user.image.avatar && (
                                <button type="button" onClick={handleAvatarDelete}
                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-400/10 transition-colors">
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

            <form onSubmit={handleSave} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-text-muted">First name</label>
                        <input className={inputCls} value={form.first_name} placeholder="First name"
                            onChange={e => { const v = { ...form, first_name: e.target.value }; setForm(v); checkDirty(v, selectedCountry) }} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-text-muted">Last name</label>
                        <input className={inputCls} value={form.last_name} placeholder="Last name"
                            onChange={e => { const v = { ...form, last_name: e.target.value }; setForm(v); checkDirty(v, selectedCountry) }} />
                    </div>
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-text-muted">Country</label>
                    <CountryDropdown countries={countries} selected={selectedCountry} show="name"
                        onSelect={c => { setSelectedCountry(c); checkDirty(form, c) }} />
                </div>
                <div className="flex justify-end pt-1">
                    <button type="submit" disabled={!dirty || loading}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold
                        bg-primary text-black hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200">
                        {loading
                            ? <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                            : <CheckRoundedIcon sx={{ fontSize: 15 }} />}
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
        daily_calorie_target: "", daily_protein_g: "", daily_carbs_g: "", daily_fat_g: "",
    })
    const snapshot = useRef<NutritionForm>({ daily_calorie_target: "", daily_protein_g: "", daily_carbs_g: "", daily_fat_g: "" })
    const [dirty, setDirty] = useState(false)

    useEffect(() => {
        if (error) { showError(error); dispatch(clearError()) }
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
                daily_protein_g: protein,
                daily_carbs_g: carbs,
                daily_fat_g: fat,
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

            <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl"
                style={{ border: "1px solid rgba(127,250,136,0.15)", background: "rgba(127,250,136,0.06)" }}>
                <svg className="flex-shrink-0 mt-px" width="14" height="14" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="9" stroke="#7FFA88" strokeWidth="1.5" strokeOpacity="0.6" />
                    <path d="M10 9v5" stroke="#7FFA88" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.8" />
                    <circle cx="10" cy="6.5" r="0.75" fill="#7FFA88" fillOpacity="0.8" />
                </svg>
                <p className="text-xs text-primary/70 leading-relaxed">
                    Changes to your nutrition targets will take effect starting{" "}
                    <span className="font-semibold text-primary/90">tomorrow</span>. Today's progress continues to be tracked against your current goals.
                </p>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-4">
                {MACROS.map(({ key, label, unit, color }) => (
                    <div key={key} className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-text-muted flex items-center gap-1.5">
                            <span className={`inline-block w-1.5 h-1.5 rounded-full ${color}`} style={{ background: "currentColor" }} />
                            {label}
                        </label>
                        <div className="relative">
                            <input type="text" inputMode="numeric" className={inputCls + " pr-14"}
                                value={form[key]} onChange={e => handleChange(key, e.target.value)} placeholder="0" />
                            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-text-muted pointer-events-none">{unit}</span>
                        </div>
                    </div>
                ))}

                {(Number(form.daily_protein_g) > 0 || Number(form.daily_carbs_g) > 0 || Number(form.daily_fat_g) > 0) && (
                    <div className="p-3.5 rounded-2xl flex flex-col gap-2.5"
                        style={{ border: "1px solid var(--glass-border)", background: "var(--glass-bg)" }}>
                        <p className="text-xs text-text-muted font-medium">Macro breakdown</p>
                        <div className="flex gap-1 h-2 rounded-full overflow-hidden">
                            {[
                                { g: Number(form.daily_protein_g) * 4, cls: "bg-blue-400" },
                                { g: Number(form.daily_carbs_g) * 4,   cls: "bg-amber-400" },
                                { g: Number(form.daily_fat_g) * 9,     cls: "bg-pink-400" },
                            ].map((m, i) => totalMacroCalories > 0
                                ? <div key={i} className={`${m.cls} transition-all duration-300`} style={{ width: `${(m.g / totalMacroCalories) * 100}%` }} />
                                : null
                            )}
                        </div>
                        <div className="flex gap-4 flex-wrap">
                            {[
                                { label: "Protein", g: Number(form.daily_protein_g), cal: Number(form.daily_protein_g) * 4, cls: "text-blue-400" },
                                { label: "Carbs",   g: Number(form.daily_carbs_g),   cal: Number(form.daily_carbs_g) * 4,   cls: "text-amber-400" },
                                { label: "Fat",     g: Number(form.daily_fat_g),     cal: Number(form.daily_fat_g) * 9,     cls: "text-pink-400" },
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
                    <button type="submit" disabled={!dirty || loading}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold
                        bg-primary text-black hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200">
                        {loading
                            ? <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                            : <CheckRoundedIcon sx={{ fontSize: 15 }} />}
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
        Promise.all([getUserHealthConditionsApi(), getHealthConditionsApi()])
            .then(([userConditions, allConditions]) => {
                setSelected(userConditions.map(toSelectedItem))
                setCatalog(allConditions)
            })
            .catch(() => showError("Failed to load health conditions"))
            .finally(() => setLoadingInit(false))
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
    const filtered = catalog.filter(c => !pickedConditionIds.has(c.id) && c.name.toLowerCase().includes(query.toLowerCase()))
    const exactMatch = catalog.some(c => c.name.toLowerCase() === queryTrimmed.toLowerCase())
    const showAddCustom = queryTrimmed.length > 0 && !exactMatch && !selectedCustomNames.has(queryTrimmed.toLowerCase())

    async function handleSelectPredefined(c: HealthCondition) {
        setOpen(false); setQuery(""); setAdding(true)
        try {
            const result = await addHealthConditionApi({ health_condition_id: c.id })
            setSelected(prev => [...prev, { userConditionId: result.id, conditionId: c.id, name: c.name }])
        } catch { showError("Failed to add condition — please try again") }
        finally { setAdding(false); inputRef.current?.focus() }
    }

    async function handleAddCustom() {
        if (!queryTrimmed) return
        setOpen(false); const text = queryTrimmed; setQuery(""); setAdding(true)
        try {
            const result = await addHealthConditionApi({ custom_condition: text })
            setSelected(prev => [...prev, { userConditionId: result.id, conditionId: null, name: text }])
        } catch { showError("Failed to add condition — please try again") }
        finally { setAdding(false); inputRef.current?.focus() }
    }

    async function handleRemove(item: SelectedItem) {
        setRemoving(prev => new Set(prev).add(item.userConditionId))
        try {
            await deleteUserHealthConditionApi(item.userConditionId)
            setSelected(prev => prev.filter(s => s.userConditionId !== item.userConditionId))
        } catch { showError("Failed to remove condition — please try again") }
        finally {
            setRemoving(prev => { const next = new Set(prev); next.delete(item.userConditionId); return next })
        }
    }

    return (
        <div className="flex flex-col gap-5">
            <div>
                <h2 className="text-base font-semibold text-text">Health Conditions</h2>
                <p className="text-xs text-text-muted mt-0.5">Add conditions you have so we can tailor your plan safely.</p>
            </div>

            {loadingInit ? (
                <div className="flex items-center gap-2 py-4">
                    <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-text-muted">Loading conditions…</span>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    <div className="relative">
                        <input ref={inputRef} value={query}
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
                            <div ref={dropdownRef}
                                className="absolute z-20 top-full mt-1 w-full rounded-2xl shadow-xl overflow-hidden"
                                style={{ background: "var(--surface)", border: "1px solid var(--glass-border)" }}>
                                {filtered.slice(0, 8).map(c => (
                                    <button key={c.id} type="button"
                                        onMouseDown={e => { e.preventDefault(); handleSelectPredefined(c) }}
                                        className="w-full text-left px-4 py-2.5 text-sm text-text hover:bg-primary/10 transition-colors duration-150">
                                        {c.name}
                                    </button>
                                ))}
                                {showAddCustom && (
                                    <button type="button"
                                        onMouseDown={e => { e.preventDefault(); handleAddCustom() }}
                                        className="w-full text-left px-4 py-2.5 text-sm text-primary/80 hover:bg-primary/10
                                        border-t transition-colors duration-150"
                                        style={{ borderColor: "var(--glass-border)" }}>
                                        Add: <span className="font-semibold text-primary">"{queryTrimmed}"</span>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {selected.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {selected.map(item => {
                                const isRemoving = removing.has(item.userConditionId)
                                return (
                                    <span key={item.userConditionId}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                                        bg-primary/15 text-primary border border-primary/25 transition-opacity duration-200"
                                        style={{ opacity: isRemoving ? 0.5 : 1 }}>
                                        {item.name}
                                        <button type="button" disabled={isRemoving} onClick={() => handleRemove(item)}
                                            className="text-primary/50 hover:text-primary transition-colors leading-none disabled:cursor-not-allowed ml-0.5">
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

// ─── Danger Zone ──────────────────────────────────────────────────────────────

function DangerZoneSection() {
    const dispatch = useDispatch<AppDispatch>()
    const navigate = useNavigate()
    const { showError } = useToast()

    const [confirmAllDevices, setConfirmAllDevices] = useState(false)
    const [loadingAll, setLoadingAll] = useState(false)

    function handleLogout() {
        dispatch(logout())
        navigate("/auth", { replace: true })
    }

    async function handleLogoutAll() {
        if (!confirmAllDevices) { setConfirmAllDevices(true); return }
        setLoadingAll(true)
        try {
            await logoutAllDevicesApi()
            dispatch(logout())
            navigate("/auth", { replace: true })
        } catch {
            showError("Failed to log out from all devices")
            setConfirmAllDevices(false)
        } finally {
            setLoadingAll(false)
        }
    }

    return (
        <div className="flex flex-col gap-5">
            <div>
                <h2 className="text-base font-semibold text-text">Account</h2>
                <p className="text-xs text-text-muted mt-0.5">Manage your active sessions.</p>
            </div>

            <div className="flex flex-col gap-3">
                {/* Logout current device */}
                <div className="flex items-center justify-between gap-4 p-4 rounded-2xl"
                    style={{ border: "1px solid var(--glass-border)", background: "var(--glass-bg)" }}>
                    <div>
                        <p className="text-sm font-medium text-text">Log out</p>
                        <p className="text-xs text-text-muted mt-0.5">Sign out of your account on this device.</p>
                    </div>
                    <button type="button" onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium flex-shrink-0
                        text-text-muted border border-white/10 hover:border-red-400/40 hover:text-red-400
                        hover:bg-red-400/8 transition-all duration-200">
                        <LogoutRoundedIcon sx={{ fontSize: 15 }} />
                        Log out
                    </button>
                </div>

                {/* Logout all devices */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl"
                    style={{ border: "1px solid var(--glass-border)", background: "var(--glass-bg)" }}>
                    <div>
                        <p className="text-sm font-medium text-text">Log out from all devices</p>
                        <p className="text-xs text-text-muted mt-0.5">
                            Revokes all active sessions, including this one.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {confirmAllDevices && (
                            <button type="button" onClick={() => setConfirmAllDevices(false)}
                                className="px-3.5 py-2 rounded-xl text-xs font-medium text-text-muted
                                border border-white/10 hover:border-white/20 hover:text-text transition-all duration-200">
                                Cancel
                            </button>
                        )}
                        <button type="button" onClick={handleLogoutAll} disabled={loadingAll}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                            transition-all duration-200 disabled:opacity-50
                            ${confirmAllDevices
                                ? "bg-red-500/90 text-white hover:bg-red-500"
                                : "text-text-muted border border-white/10 hover:border-red-400/40 hover:text-red-400 hover:bg-red-400/8"
                            }`}>
                            {loadingAll
                                ? <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                : <DevicesRoundedIcon sx={{ fontSize: 15 }} />}
                            {confirmAllDevices ? "Yes, log out everywhere" : "Log out all devices"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── Settings Page ────────────────────────────────────────────────────────────

const SECTIONS: { key: Section; component: React.ReactNode }[] = [
    { key: "personal",  component: <PersonalInfoSection /> },
    { key: "nutrition", component: <NutritionGoalsSection /> },
    { key: "health",    component: <HealthSection /> },
    { key: "danger",    component: <DangerZoneSection /> },
]

export default function Settings() {
    const [active, setActive] = useState<Section>("personal")
    const rootRef = useRef<HTMLDivElement>(null)

    function scrollToSection(key: Section) {
        setActive(key)
        const container = findScrollContainer(rootRef.current)
        const el = document.getElementById(`settings-${key}`)
        if (!container || !el) return
        const containerTop = container.getBoundingClientRect().top
        const elTop = el.getBoundingClientRect().top
        container.scrollTo({ top: container.scrollTop + (elTop - containerTop) - 16, behavior: "smooth" })
    }

    return (
        <div ref={rootRef} className="w-full flex gap-6 pb-10">

            {/* Sidebar — desktop only */}
            <nav className="hidden sm:block w-48 flex-shrink-0">
                <div className="sticky top-4 flex flex-col gap-1 p-2 rounded-2xl"
                    style={{ border: "1px solid var(--glass-border)", background: "var(--glass-bg)", backdropFilter: "blur(20px)" }}>
                    {NAV.map(({ key, label, icon }) => (
                        <button key={key} type="button" onClick={() => scrollToSection(key)}
                            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium
                            transition-all duration-200 text-left w-full
                            ${active === key
                                ? "bg-primary/15 text-primary"
                                : "text-text-muted hover:text-text hover:bg-white/5"
                            }`}>
                            {icon}
                            {label}
                        </button>
                    ))}
                </div>
            </nav>

            {/* All sections stacked */}
            <div className="flex-1 min-w-0 flex flex-col gap-6">
                {SECTIONS.map(({ key, component }, i) => (
                    <div key={key}>
                        <div id={`settings-${key}`}
                            className="p-5 sm:p-6 rounded-2xl"
                            style={{ border: "1px solid var(--glass-border)", background: "var(--glass-bg)", backdropFilter: "blur(20px)" }}>
                            {component}
                        </div>
                        {i < SECTIONS.length - 1 && <div className="h-px mt-6" style={{ background: "var(--glass-border)" }} />}
                    </div>
                ))}
            </div>

        </div>
    )
}

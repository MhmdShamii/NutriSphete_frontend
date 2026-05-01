import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { completeBasicInfo, fetchMe } from "../../auth/authSlice"
import type { AppDispatch, RootState } from "../../../app/store"
import type { BasicInfoPayload } from "../../auth/types"
import Input from "../../../components/ui/Input"
import Button from "../../../components/ui/Button"
import SelectDropdown from "../../../components/ui/SelectDropdown"
import DatePicker from "../../../components/ui/DatePicker"
import StepHeader from "../components/StepHeader"

const initialForm: BasicInfoPayload = {
    date_of_birth: "", gender: "male",
    weight_kg: 0, height_cm: 0,
    activity_level: "moderate", goal: "maintain", dietary_preferences: "none"
}

export default function BasicInfoStep() {
    const dispatch = useDispatch<AppDispatch>()
    const navigate = useNavigate()
    const { loading, error } = useSelector((state: RootState) => state.auth)
    const [form, setForm] = useState<BasicInfoPayload>(initialForm)

    function set<K extends keyof BasicInfoPayload>(field: K, value: BasicInfoPayload[K]) {
        setForm(p => ({ ...p, [field]: value }))
    }

    const valid = form.date_of_birth && form.weight_kg > 0 && form.height_cm > 0

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!valid) return
        const payload: BasicInfoPayload = { ...form }
        if (!payload.body_fat_pct) delete payload.body_fat_pct
        try {
            await dispatch(completeBasicInfo(payload)).unwrap()
            await dispatch(fetchMe()).unwrap()
            navigate("/onboarding/targets", { state: { hasBodyFat: !!payload.body_fat_pct } })
        } catch {}
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <StepHeader step={2} total={4} title="Your body & goals" subtitle="Help us calculate your ideal nutrition plan" />

            <div className="flex flex-col gap-4">

                <div className="flex flex-col sm:flex-row gap-3">
                    <DatePicker
                        label="Date of birth"
                        value={form.date_of_birth}
                        onChange={(v) => set("date_of_birth", v)}
                        placeholder="Pick a date"
                    />
                    <SelectDropdown
                        label="Gender"
                        value={form.gender}
                        onChange={(v) => set("gender", v as BasicInfoPayload["gender"])}
                        options={[
                            { value: "male",   label: "Male" },
                            { value: "female", label: "Female" },
                        ]}
                    />
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <Input id="weight" label="Weight (kg)" placeholder="70"
                        value={form.weight_kg || ""}
                        onChange={(v) => set("weight_kg", Number(v.replace(/\D/g, "")))} />
                    <Input id="height" label="Height (cm)" placeholder="175"
                        value={form.height_cm || ""}
                        onChange={(v) => set("height_cm", Number(v.replace(/\D/g, "")))} />
                </div>

                <div className="flex flex-col gap-1">
                    <Input id="body_fat_pct" label="Body Fat % (optional)" placeholder="e.g. 18"
                        value={form.body_fat_pct ?? ""}
                        onChange={(v) => {
                            const n = Number(v.replace(/[^\d.]/g, ""))
                            set("body_fat_pct", v === "" ? null : Math.min(70, Math.max(1, n)))
                        }} />
                    <p className="text-xs text-[var(--color-text-muted)]">Optional — enables more accurate calorie estimation</p>
                </div>

                <SelectDropdown
                    label="Activity level"
                    value={form.activity_level}
                    onChange={(v) => set("activity_level", v as BasicInfoPayload["activity_level"])}
                    options={[
                        { value: "sedentary",   label: "Sedentary — little or no exercise" },
                        { value: "light",       label: "Light — 1–3 days/week" },
                        { value: "moderate",    label: "Moderate — 3–5 days/week" },
                        { value: "active",      label: "Active — 6–7 days/week" },
                        { value: "very_active", label: "Very active — hard exercise daily" },
                    ]}
                />

                <SelectDropdown
                    label="Goal"
                    value={form.goal}
                    onChange={(v) => set("goal", v as BasicInfoPayload["goal"])}
                    options={[
                        { value: "lose_weight", label: "Lose weight" },
                        { value: "gain_muscle", label: "Gain muscle" },
                        { value: "maintain",    label: "Maintain weight" },
                    ]}
                />

                <SelectDropdown
                    label="Dietary preferences"
                    value={form.dietary_preferences}
                    onChange={(v) => set("dietary_preferences", v as BasicInfoPayload["dietary_preferences"])}
                    options={[
                        { value: "none",        label: "No preference" },
                        { value: "vegetarian",  label: "Vegetarian" },
                        { value: "vegan",       label: "Vegan" },
                        { value: "pescatarian", label: "Pescatarian" },
                    ]}
                />
            </div>

            {error && <p className="text-xs text-red-400 text-center">{error}</p>}

            <Button type="submit" disabled={!valid || loading} className="flex items-center justify-center gap-2 w-full">
                {loading
                    ? <span className="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full" />
                    : "Continue"}
            </Button>
        </form>
    )
}

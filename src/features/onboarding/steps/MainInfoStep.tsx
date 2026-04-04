import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { completeMainInfo, fetchMe } from "../../auth/authSlice"
import type { AppDispatch, RootState } from "../../../app/store"
import type { MainInfoPayload } from "../../auth/types"
import { uploadAvatarApi } from "../../../services/auth/authApi"
import CountryDropdown, { type Country } from "../../../components/ui/CountryDropdown"
import Input from "../../../components/ui/Input"
import Button from "../../../components/ui/Button"
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded"
import StepHeader from "../components/StepHeader"
import countriesData from "../../../assets/data/countries.json"

const countries = countriesData as Country[]

export default function MainInfoStep() {
    const dispatch = useDispatch<AppDispatch>()
    const navigate = useNavigate()
    const { loading, error } = useSelector((state: RootState) => state.auth)

    const [form, setForm] = useState<MainInfoPayload>({ first_name: "", last_name: "", country_code: "" })
    const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

    function handleCountrySelect(country: Country) {
        setSelectedCountry(country)
        setForm(p => ({ ...p, country_code: country["alpha-3"] }))
    }

    function handleAvatarChange(file: File | null) {
        setAvatarFile(file)
        setAvatarPreview(file ? URL.createObjectURL(file) : null)
    }

    const valid = form.first_name.trim() && form.last_name.trim() && form.country_code

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!valid) return
        try {
            // Upload avatar first if selected (non-blocking if it fails)
            if (avatarFile) {
                await uploadAvatarApi(avatarFile).catch(() => {})
            }
            await dispatch(completeMainInfo(form)).unwrap()
            await dispatch(fetchMe()).unwrap()
            navigate("/onboarding/basic-info")
        } catch { }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <StepHeader step={1} total={3} title="Tell us about yourself" subtitle="We'll use this to personalise your experience" />

            {/* Avatar picker */}
            <div className="flex flex-col items-center gap-2">
                <label className="relative w-20 h-20 rounded-full cursor-pointer group">
                    {/* Avatar circle */}
                    <div className={`w-full h-full rounded-full overflow-hidden transition-all duration-200
                        ${avatarPreview
                            ? "ring-2 ring-primary shadow-[0_0_14px_rgba(127,250,136,0.4)]"
                            : "bg-surface border-2 border-dashed border-border/40 group-hover:border-primary"
                        }`}
                    >
                        {avatarPreview
                            ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center">
                                <CameraAltRoundedIcon sx={{ fontSize: 24 }} className="text-text-muted/50 group-hover:text-primary transition-colors" />
                              </div>
                        }
                    </div>

                    {/* Overlay on hover when image selected */}
                    {avatarPreview && (
                        <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100
                            flex items-center justify-center transition-opacity duration-200">
                            <CameraAltRoundedIcon sx={{ fontSize: 20 }} className="text-white" />
                        </div>
                    )}

                    <input type="file" accept="image/*" className="hidden"
                        onChange={(e) => handleAvatarChange(e.target.files?.[0] ?? null)} />
                </label>
                <p className="text-xs text-text-muted">
                    {avatarPreview ? "Click to change" : "Profile photo (optional)"}
                </p>
            </div>

            <div className="flex flex-col gap-4">
                <div className="flex gap-3">
                    <Input id="first_name" label="First name" placeholder="John"
                        value={form.first_name}
                        onChange={(v) => setForm(p => ({ ...p, first_name: v }))} />
                    <Input id="last_name" label="Last name" placeholder="Doe"
                        value={form.last_name}
                        onChange={(v) => setForm(p => ({ ...p, last_name: v }))} />
                </div>

                <CountryDropdown
                    label="Country"
                    countries={countries}
                    selected={selectedCountry}
                    onSelect={handleCountrySelect}
                    show="name"
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

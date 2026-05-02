import { useState, useEffect, useRef } from "react"
import { useParams } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "../app/store"
import { fetchMe, updateMe } from "./auth/authSlice"
import type { UpdateMePayload } from "./auth/types"
import { uploadAvatarApi, deleteAvatarApi } from "../services/auth/authApi"
import CountryDropdown, { type Country } from "../components/ui/CountryDropdown"
import countriesData from "../assets/data/countries.json"
import isoCountries from "i18n-iso-countries"
import en from "i18n-iso-countries/langs/en.json"
import {
    getUserPublicProfileApi,
    followUserApi,
    unfollowUserApi,
    type PublicUserProfile,
} from "../services/social/followApi"
import FollowListModal from "./profile/FollowListModal"
import ProfileRecipes from "./profile/ProfileRecipes"
import BookmarkRoundedIcon from "@mui/icons-material/BookmarkRounded"
import LockRoundedIcon from "@mui/icons-material/LockRounded"
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded"
import EditRoundedIcon from "@mui/icons-material/EditRounded"
import CloseRoundedIcon from "@mui/icons-material/CloseRounded"
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded"
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded"
import PersonAddRoundedIcon from "@mui/icons-material/PersonAddRounded"
import HowToRegRoundedIcon from "@mui/icons-material/HowToRegRounded"

isoCountries.registerLocale(en)

const countries = countriesData as Country[]

type Tab = "recipes" | "private" | "saved"

function alpha3to2(alpha3: string | null) {
    if (!alpha3) return null
    return isoCountries.alpha3ToAlpha2(alpha3)?.toLowerCase() ?? null
}

function Shimmer({ className, style }: { className?: string; style?: React.CSSProperties }) {
    return (
        <div className={`relative overflow-hidden rounded-xl bg-white/5 ${className ?? ""}`} style={style}>
            <div className="absolute inset-0 -translate-x-full animate-shimmer"
                style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)" }} />
        </div>
    )
}

function ProfileSkeleton() {
    return (
        <div className="w-full flex flex-col pb-6">
            <div className="w-full flex flex-col overflow-hidden"
                style={{ border: "1px solid var(--glass-border)", borderRadius: "24px 24px 0 0", background: "var(--glass-bg)", backdropFilter: "blur(20px)" }}
            >
                <Shimmer className="w-full h-32 sm:h-40 !rounded-none" style={{ borderRadius: "24px 24px 0 0" } as React.CSSProperties} />

                <div className="px-5 sm:px-6 pb-4">
                    <div className="relative w-fit -mt-9 sm:-mt-11 mb-3">
                        <Shimmer className="w-20 h-20 sm:w-24 sm:h-24 !rounded-full" />
                    </div>
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-col gap-1.5">
                            <Shimmer className="h-4 w-32" />
                            <Shimmer className="h-3 w-44" />
                        </div>
                        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                            <div className="flex flex-col items-center gap-1">
                                <Shimmer className="h-4 w-8" />
                                <Shimmer className="h-2.5 w-14" />
                            </div>
                            <div className="w-px h-6 bg-border/30" />
                            <div className="flex flex-col items-center gap-1">
                                <Shimmer className="h-4 w-8" />
                                <Shimmer className="h-2.5 w-14" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex border-t gap-1 p-2" style={{ borderColor: "var(--glass-border)" }}>
                    {[1, 2, 3].map(i => <Shimmer key={i} className="flex-1 h-10" />)}
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex flex-col rounded-2xl overflow-hidden"
                        style={{ border: "1px solid var(--glass-border)", background: "var(--glass-bg)" }}
                    >
                        <Shimmer className="w-full aspect-square !rounded-none" />
                        <div className="p-3 flex flex-col gap-2">
                            <Shimmer className="h-3.5 w-3/4" />
                            <Shimmer className="h-3 w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function ProfileBanner({ coverImage }: { coverImage: string | null }) {
    if (coverImage) {
        return <img src={coverImage} alt="banner" className="w-full h-full object-cover" />
    }
    return (
        <>
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-primary/50" />
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/10 blur-[60px] rounded-full" />
            <div className="absolute bottom-0 -left-10 w-56 h-40 bg-black/20 blur-[50px] rounded-full" />
            <div className="absolute -top-6 right-20 w-36 h-36 rounded-full border border-black/15" />
            <div className="absolute -top-2 right-16 w-24 h-24 rounded-full border border-black/10" />
            <div className="absolute bottom-[-20px] left-32 w-44 h-44 rounded-full border border-black/10" />
            <div className="absolute inset-0 opacity-[0.06]"
                style={{ backgroundImage: "repeating-linear-gradient(-45deg,#000 0,#000 1px,transparent 0,transparent 12px)" }} />
            <div className="absolute bottom-4 right-5 flex items-center gap-1.5 opacity-30">
                <svg width="14" height="14" viewBox="0 0 36 36" fill="none">
                    <path d="M18 8C13 8 9 13 9 18C9 22 11.5 25.5 15 27C15 27 14 23 16 20C17.5 17.5 21 17 23 15C25 13 24 9 22 8C21 8 19.5 8 18 8Z" fill="black" />
                </svg>
                <span className="text-xs font-semibold text-black tracking-widest uppercase">NutriSphere</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/20 to-transparent" />
        </>
    )
}

// ─── Visited user profile ────────────────────────────────────────────────────

function VisitedProfile({ userId }: { userId: number }) {
    const [profile, setProfile] = useState<PublicUserProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)
    const [followLoading, setFollowLoading] = useState(false)
    const [followModal, setFollowModal] = useState<"followers" | "following" | null>(null)

    useEffect(() => {
        setLoading(true)
        setNotFound(false)
        getUserPublicProfileApi(userId)
            .then(setProfile)
            .catch(() => setNotFound(true))
            .finally(() => setLoading(false))
    }, [userId])

    async function handleFollowToggle() {
        if (!profile || followLoading) return
        setFollowLoading(true)
        const wasFollowing = profile.is_following
        setProfile(p => p ? {
            ...p,
            is_following: !wasFollowing,
            followers_count: wasFollowing ? p.followers_count - 1 : p.followers_count + 1,
        } : p)
        try {
            if (wasFollowing) {
                await unfollowUserApi(userId)
            } else {
                await followUserApi(userId)
            }
        } catch {
            setProfile(p => p ? {
                ...p,
                is_following: wasFollowing,
                followers_count: wasFollowing ? p.followers_count + 1 : p.followers_count - 1,
            } : p)
        } finally {
            setFollowLoading(false)
        }
    }

    if (loading) return <ProfileSkeleton />

    if (notFound || !profile) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
                <span className="text-4xl opacity-20">👤</span>
                <p className="text-sm text-text-muted">User not found</p>
            </div>
        )
    }

    const flagCode = alpha3to2(profile.country.code)

    return (
        <div className="w-full flex flex-col pb-6">
            <div className="w-full flex flex-col"
                style={{ border: "1px solid var(--glass-border)", borderRadius: "24px 24px 0 0", background: "var(--glass-bg)", backdropFilter: "blur(20px)" }}
            >
                {/* Banner */}
                <div className="relative w-full h-32 sm:h-40 flex-shrink-0 overflow-hidden"
                    style={{ borderRadius: "24px 24px 0 0" }}>
                    <ProfileBanner coverImage={profile.image.cover_image} />
                </div>

                {/* Avatar + info — same structure as OwnProfile so the -mt overlap works */}
                <div className="px-5 sm:px-6 pb-4">
                    <div className="relative w-fit -mt-9 sm:-mt-11 mb-3">
                        <img
                            src={profile.image.avatar}
                            alt="avatar"
                            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover shadow-xl block"
                            style={{ border: "3px solid var(--background)" }}
                        />
                    </div>

                    <div className="flex flex-col gap-0.5 mb-2">
                        <div className="flex items-center gap-1.5">
                            <h2 className="text-base font-bold text-text truncate">
                                {profile.first_name} {profile.last_name}
                            </h2>
                            {flagCode && <span className={`fi fi-${flagCode} text-sm flex-shrink-0`} />}
                        </div>
                        {profile.country.name && (
                            <p className="text-xs text-text-muted/50">{profile.country.name}</p>
                        )}
                    </div>

                    <div className="flex items-center gap-5 mb-3">
                        <button type="button" onClick={() => setFollowModal("followers")}
                            className="flex items-center gap-1.5 hover:opacity-70 transition-opacity">
                            <span className="text-sm font-bold text-text">{profile.followers_count.toLocaleString()}</span>
                            <span className="text-xs text-text-muted">Followers</span>
                        </button>
                        <button type="button" onClick={() => setFollowModal("following")}
                            className="flex items-center gap-1.5 hover:opacity-70 transition-opacity">
                            <span className="text-sm font-bold text-text">{profile.following_count.toLocaleString()}</span>
                            <span className="text-xs text-text-muted">Following</span>
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={handleFollowToggle}
                        disabled={followLoading}
                        className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-60
                            ${profile.is_following
                                ? "bg-white/5 text-text-muted border border-white/10 hover:border-red-400/40 hover:text-red-400 hover:bg-red-400/8"
                                : "bg-primary text-black hover:bg-primary/90"
                            }`}
                    >
                        {followLoading
                            ? <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            : profile.is_following
                                ? <><HowToRegRoundedIcon sx={{ fontSize: 15 }} />Following</>
                                : profile.follows_you
                                    ? <><PersonAddRoundedIcon sx={{ fontSize: 15 }} />Follow Back</>
                                    : <><PersonAddRoundedIcon sx={{ fontSize: 15 }} />Follow</>
                        }
                    </button>
                </div>

                {/* Tabs — recipes only */}
                <div className="flex border-t" style={{ borderColor: "var(--glass-border)" }}>
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs sm:text-sm font-medium text-primary border-b-2 border-primary">
                        <MenuBookRoundedIcon sx={{ fontSize: 14 }} />Recipes
                    </button>
                </div>
            </div>

            <ProfileRecipes userId={userId} />

            {followModal && (
                <FollowListModal
                    userId={profile.id}
                    mode={followModal}
                    onClose={() => setFollowModal(null)}
                />
            )}
        </div>
    )
}

// ─── Own profile ─────────────────────────────────────────────────────────────

function OwnProfile() {
    const dispatch = useDispatch<AppDispatch>()
    const { user, loading, error } = useSelector((state: RootState) => state.auth)
    const [tab, setTab] = useState<Tab>("recipes")
    const [fetched, setFetched] = useState(false)
    const [editing, setEditing] = useState(false)
    const [form, setForm] = useState({ first_name: "", last_name: "" })
    const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
    const snapshot = useRef({ first_name: "", last_name: "", country_code: "" })

    const [followModal, setFollowModal] = useState<"followers" | "following" | null>(null)

    const [avatarMenuOpen, setAvatarMenuOpen] = useState(false)
    const [avatarLoading, setAvatarLoading] = useState(false)
    const avatarInputRef = useRef<HTMLInputElement>(null)
    const avatarMenuRef = useRef<HTMLDivElement>(null)

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
        dispatch(fetchMe()).finally(() => setFetched(true))
    }, [dispatch])

    useEffect(() => {
        if (!user || !editing) return
        const first_name = user.first_name ?? ""
        const last_name = user.last_name ?? ""
        const country_code = user.country.code ?? ""
        setForm({ first_name, last_name })
        setSelectedCountry(countries.find(c => c["alpha-3"] === country_code) ?? null)
        snapshot.current = { first_name, last_name, country_code }
    }, [editing, user])

    async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        e.target.value = ""
        setAvatarMenuOpen(false)
        setAvatarLoading(true)
        try {
            await uploadAvatarApi(file)
            await dispatch(fetchMe())
        } catch { } finally {
            setAvatarLoading(false)
        }
    }

    async function handleAvatarDelete() {
        setAvatarMenuOpen(false)
        setAvatarLoading(true)
        try {
            await deleteAvatarApi()
            await dispatch(fetchMe())
        } catch { } finally {
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
        if (Object.keys(patch).length === 0) { setEditing(false); return }
        try {
            await dispatch(updateMe(patch)).unwrap()
            setEditing(false)
        } catch { }
    }

    if (!fetched || loading) return <ProfileSkeleton />
    if (!user) return null

    const flagCode = alpha3to2(user.country.code)

    return (
        <div className="w-full flex flex-col pb-6">
            <div className="w-full flex flex-col"
                style={{ border: "1px solid var(--glass-border)", borderRadius: "24px 24px 0 0", background: "var(--glass-bg)", backdropFilter: "blur(20px)" }}
            >
                {/* Banner */}
                <div className="relative w-full h-32 sm:h-40 flex-shrink-0 overflow-hidden"
                    style={{ borderRadius: "24px 24px 0 0" }}>
                    <ProfileBanner coverImage={user.image.cover_image} />
                </div>

                {/* Avatar + info */}
                <div className="px-5 sm:px-6 pb-4">
                    <div ref={avatarMenuRef} className="relative w-fit -mt-9 sm:-mt-11 mb-3">
                        <button
                            type="button"
                            onClick={() => setAvatarMenuOpen(o => !o)}
                            className="relative group block rounded-full focus:outline-none"
                            style={{ border: "3px solid var(--background)", borderRadius: "9999px" }}
                        >
                            <img
                                src={user.image.avatar}
                                alt="avatar"
                                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover shadow-xl block"
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
                                    <PhotoCameraRoundedIcon sx={{ fontSize: 16 }} />
                                    Upload photo
                                    <input
                                        ref={avatarInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleAvatarUpload}
                                    />
                                </label>
                                <button
                                    type="button"
                                    onClick={handleAvatarDelete}
                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm
                                        text-red-400 hover:bg-red-400/10 transition-colors"
                                >
                                    <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
                                    Remove photo
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex items-start justify-between gap-3">
                        <form onSubmit={handleSave} className="flex-1 min-w-0">
                            {editing ? (
                                <div className="flex flex-col gap-2">
                                    <div className="flex gap-2">
                                        <input
                                            autoFocus
                                            value={form.first_name}
                                            onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))}
                                            placeholder="First name"
                                            className="flex-1 min-w-0 text-sm text-text bg-white/5 border border-white/10 rounded-lg
                                            px-3 py-2 outline-none focus:border-primary/60 focus:bg-primary/5
                                            focus:shadow-[0_0_12px_rgba(127,250,136,0.12)] transition-all duration-200
                                            placeholder:text-text-muted/30"
                                        />
                                        <input
                                            value={form.last_name}
                                            onChange={e => setForm(p => ({ ...p, last_name: e.target.value }))}
                                            placeholder="Last name"
                                            className="flex-1 min-w-0 text-sm text-text bg-white/5 border border-white/10 rounded-lg
                                            px-3 py-2 outline-none focus:border-primary/60 focus:bg-primary/5
                                            focus:shadow-[0_0_12px_rgba(127,250,136,0.12)] transition-all duration-200
                                            placeholder:text-text-muted/30"
                                        />
                                    </div>
                                    <CountryDropdown
                                        countries={countries}
                                        selected={selectedCountry}
                                        onSelect={setSelectedCountry}
                                        show="name"
                                    />
                                    <div className="flex items-center gap-2">
                                        <button type="submit" disabled={loading}
                                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium
                                            bg-primary text-black hover:bg-primary/90 disabled:opacity-50 transition-all duration-200">
                                            {loading
                                                ? <span className="w-3 h-3 border-[1.5px] border-black border-t-transparent rounded-full animate-spin" />
                                                : <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                                                    <path d="M2 7L5.5 10.5L12 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>}
                                            Save
                                        </button>
                                        <button type="button" onClick={() => setEditing(false)}
                                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium
                                            text-text-muted border border-white/10 hover:border-white/20 hover:text-text transition-all duration-200">
                                            <CloseRoundedIcon sx={{ fontSize: 12 }} />
                                            Cancel
                                        </button>
                                        {error && <p className="text-xs text-red-400">{error}</p>}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-0.5">
                                    <div className="flex items-center gap-1.5">
                                        <h2 className="text-sm font-semibold text-text sm:text-base truncate">
                                            {user.first_name} {user.last_name}
                                        </h2>
                                        {flagCode && (
                                            <span className={`fi fi-${flagCode} text-sm flex-shrink-0`} />
                                        )}
                                        <button type="button" onClick={() => setEditing(true)}
                                            className="p-1 rounded-md text-text-muted/40 hover:text-primary hover:bg-primary/10 transition-all duration-200 flex-shrink-0">
                                            <EditRoundedIcon sx={{ fontSize: 12 }} />
                                        </button>
                                    </div>
                                    <p className="hidden sm:block text-xs text-text-muted truncate">{user.email}</p>
                                    {user.country.name && (
                                        <p className="hidden sm:block text-xs text-text-muted/40">{user.country.name}</p>
                                    )}
                                </div>
                            )}
                        </form>

                        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0 pt-0.5">
                            <button
                                type="button"
                                onClick={() => setFollowModal("followers")}
                                className="flex flex-col items-center hover:opacity-70 transition-opacity"
                            >
                                <span className="text-sm font-bold text-text">{user.followers_count.toLocaleString()}</span>
                                <span className="text-xs text-text-muted">Followers</span>
                            </button>
                            <div className="w-px h-6 bg-border/30" />
                            <button
                                type="button"
                                onClick={() => setFollowModal("following")}
                                className="flex flex-col items-center hover:opacity-70 transition-opacity"
                            >
                                <span className="text-sm font-bold text-text">{user.following_count.toLocaleString()}</span>
                                <span className="text-xs text-text-muted">Following</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-t" style={{ borderColor: "var(--glass-border)" }}>
                    {([
                        { key: "recipes", label: "Recipes", icon: <MenuBookRoundedIcon sx={{ fontSize: 14 }} /> },
                        { key: "private", label: "Private", icon: <LockRoundedIcon sx={{ fontSize: 14 }} /> },
                        { key: "saved",   label: "Saved",   icon: <BookmarkRoundedIcon sx={{ fontSize: 14 }} /> },
                    ] as { key: Tab; label: string; icon: React.ReactNode }[]).map(t => (
                        <button key={t.key} onClick={() => setTab(t.key)}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs sm:text-sm font-medium transition-all duration-200
                                ${tab === t.key
                                    ? "text-primary border-b-2 border-primary"
                                    : "text-text-muted hover:text-text border-b-2 border-transparent"
                                }`}
                        >
                            {t.icon}{t.label}
                        </button>
                    ))}
                </div>
            </div>

            {tab === "recipes" && <ProfileRecipes userId={user.id} />}
            {tab === "private" && <ProfileRecipes userId={user.id} isPrivate />}
            {tab === "saved" && <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3" />}

            {followModal && (
                <FollowListModal
                    userId={user.id}
                    mode={followModal}
                    onClose={() => setFollowModal(null)}
                />
            )}
        </div>
    )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function Profile() {
    const { id: profileId } = useParams<{ id: string }>()

    if (profileId) {
        return <VisitedProfile userId={Number(profileId)} />
    }
    return <OwnProfile />
}

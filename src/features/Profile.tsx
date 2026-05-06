import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "../app/store"
import { fetchMe } from "./auth/authSlice"
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
import LazyImage from "../components/ui/LazyImage"
import AvatarUI from "../components/ui/Avatar"
import BookmarkRoundedIcon from "@mui/icons-material/BookmarkRounded"
import LockRoundedIcon from "@mui/icons-material/LockRounded"
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded"
import PersonAddRoundedIcon from "@mui/icons-material/PersonAddRounded"
import HowToRegRoundedIcon from "@mui/icons-material/HowToRegRounded"

isoCountries.registerLocale(en)

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
        return <LazyImage src={coverImage} alt="banner" className="w-full h-full object-cover" />
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
                        <AvatarUI
                            src={profile.image.avatar}
                            name={`${profile.first_name} ${profile.last_name}`}
                            size={80}
                            className="shadow-xl sm:!w-24 sm:!h-24"
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
    const { user, loading } = useSelector((state: RootState) => state.auth)
    const [tab, setTab] = useState<Tab>("recipes")
    const [fetched, setFetched] = useState(false)
    const [followModal, setFollowModal] = useState<"followers" | "following" | null>(null)

    useEffect(() => {
        dispatch(fetchMe()).finally(() => setFetched(true))
    }, [dispatch])

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
                    <div className="w-fit -mt-9 sm:-mt-11 mb-3"
                        style={{ border: "3px solid var(--background)", borderRadius: "9999px" }}>
                        <AvatarUI
                            src={user.image.avatar}
                            name={`${user.first_name} ${user.last_name}`}
                            size={80}
                            className="shadow-xl sm:!w-24 sm:!h-24"
                        />
                    </div>

                    <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                                <h2 className="text-sm font-semibold text-text sm:text-base truncate">
                                    {user.first_name} {user.last_name}
                                </h2>
                                {flagCode && <span className={`fi fi-${flagCode} text-sm flex-shrink-0`} />}
                            </div>
                            <p className="hidden sm:block text-xs text-text-muted truncate">{user.email}</p>
                            {user.country.name && (
                                <p className="hidden sm:block text-xs text-text-muted/40">{user.country.name}</p>
                            )}
                        </div>

                        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0 pt-0.5">
                            <button type="button" onClick={() => setFollowModal("followers")}
                                className="flex flex-col items-center hover:opacity-70 transition-opacity">
                                <span className="text-sm font-bold text-text">{user.followers_count.toLocaleString()}</span>
                                <span className="text-xs text-text-muted">Followers</span>
                            </button>
                            <div className="w-px h-6 bg-border/30" />
                            <button type="button" onClick={() => setFollowModal("following")}
                                className="flex flex-col items-center hover:opacity-70 transition-opacity">
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

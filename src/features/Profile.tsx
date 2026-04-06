import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "../app/store"
import { fetchMe } from "./auth/authSlice"
import BookmarkRoundedIcon from "@mui/icons-material/BookmarkRounded"
import LockRoundedIcon from "@mui/icons-material/LockRounded"
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded"

type Tab = "recipes" | "private" | "saved"

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
                {/* Banner skeleton */}
                <Shimmer className="w-full h-44 sm:h-52 !rounded-none" style={{ borderRadius: "24px 24px 0 0" } as React.CSSProperties} />

                {/* Avatar + info skeleton */}
                <div className="px-6 sm:px-8 pb-5">
                    <div className="relative w-fit -mt-12 sm:-mt-14 mb-4">
                        <Shimmer className="w-24 h-24 sm:w-28 sm:h-28 !rounded-full" />
                    </div>
                    <div className="flex items-end justify-between gap-4 flex-wrap">
                        <div className="flex flex-col gap-2">
                            <Shimmer className="h-5 w-36" />
                            <Shimmer className="h-3.5 w-48" />
                        </div>
                        <div className="flex items-center gap-5 pb-0.5">
                            <div className="flex flex-col items-center gap-1.5">
                                <Shimmer className="h-5 w-10" />
                                <Shimmer className="h-3 w-14" />
                            </div>
                            <div className="w-px h-8 bg-border/30" />
                            <div className="flex flex-col items-center gap-1.5">
                                <Shimmer className="h-5 w-10" />
                                <Shimmer className="h-3 w-14" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs skeleton */}
                <div className="flex border-t gap-1 p-2" style={{ borderColor: "var(--glass-border)" }}>
                    {[1, 2, 3].map(i => <Shimmer key={i} className="flex-1 h-10" />)}
                </div>
            </div>

            {/* Grid skeleton */}
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

export default function Profile() {
    const dispatch = useDispatch<AppDispatch>()
    const { user, loading } = useSelector((state: RootState) => state.auth)
    const [tab, setTab] = useState<Tab>("recipes")
    const [fetched, setFetched] = useState(false)

    useEffect(() => {
        dispatch(fetchMe()).finally(() => setFetched(true))
    }, [])

    if (!fetched || loading) return <ProfileSkeleton />
    if (!user) return null

    return (
        <div className="w-full flex flex-col pb-6">

            {/* ── Header ── */}
            <div className="w-full flex flex-col overflow-hidden"
                style={{ border: "1px solid var(--glass-border)", borderRadius: "24px 24px 0 0", background: "var(--glass-bg)", backdropFilter: "blur(20px)" }}
            >
                {/* Banner */}
                <div className="relative w-full h-44 sm:h-52 flex-shrink-0 overflow-hidden"
                    style={{ borderRadius: "24px 24px 0 0" }}
                >
                    {user.image.cover_image
                        ? <img src={user.image.cover_image} alt="banner" className="w-full h-full object-cover" />
                        : <>
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
                    }
                </div>

                {/* Avatar + info */}
                <div className="px-6 sm:px-8 pb-5">
                    <div className="relative w-fit -mt-12 sm:-mt-14 mb-4">
                        <img src={user.image.avatar} alt="avatar"
                            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover shadow-xl"
                            style={{ border: "4px solid var(--background)" }} />
                    </div>

                    {/* Name row */}
                    <div className="flex items-end justify-between gap-4 flex-wrap">
                        <div className="flex flex-col gap-0.5">
                            <h2 className="text-xl font-bold text-text">{user.first_name} {user.last_name}</h2>
                            <p className="text-sm text-text-muted">{user.email}</p>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-5 pb-0.5">
                            <div className="flex flex-col items-center">
                                <span className="text-base font-bold text-text">2.4k</span>
                                <span className="text-xs text-text-muted">Followers</span>
                            </div>
                            <div className="w-px h-8 bg-border/30" />
                            <div className="flex flex-col items-center">
                                <span className="text-base font-bold text-text">318</span>
                                <span className="text-xs text-text-muted">Following</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-t" style={{ borderColor: "var(--glass-border)" }}>
                    {([
                        { key: "recipes", label: "Recipes", icon: <MenuBookRoundedIcon sx={{ fontSize: 16 }} /> },
                        { key: "private", label: "Private", icon: <LockRoundedIcon sx={{ fontSize: 16 }} /> },
                        { key: "saved", label: "Saved", icon: <BookmarkRoundedIcon sx={{ fontSize: 16 }} /> },
                    ] as { key: Tab; label: string; icon: React.ReactNode }[]).map(t => (
                        <button key={t.key} onClick={() => setTab(t.key)}
                            className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition-all duration-200
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

            {/* ── Recipes ── */}
            {tab === "recipes" && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                </div>
            )}

            {/* ── Private ── */}
            {tab === "private" && (
                <div className="flex flex-col gap-3 mt-3">
                </div>
            )}

            {/* ── Saved ── */}
            {tab === "saved" && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                </div>
            )}

        </div>
    )
}

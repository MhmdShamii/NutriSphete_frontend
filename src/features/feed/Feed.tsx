import { useState, useEffect, useRef, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded"
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded"
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded"
import RepeatRoundedIcon from "@mui/icons-material/RepeatRounded"
import CheckRoundedIcon from "@mui/icons-material/CheckRounded"
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded"
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded"
import FitnessCenterRoundedIcon from "@mui/icons-material/FitnessCenterRounded"
import GrainRoundedIcon from "@mui/icons-material/GrainRounded"
import WaterDropRoundedIcon from "@mui/icons-material/WaterDropRounded"
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded"
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded"
import type { RootState } from "../../app/store"
import { getFeed, getFollowingFeed, type FeedPost } from "../../services/feed/feedApi"
import { likeMealApi, unlikeMealApi, logMeal } from "../../services/meals/mealsApis"
import { followUserApi, unfollowUserApi } from "../../services/social/followApi"
import { confirmQuickLog, deleteQuickLog } from "../../services/log/quickLogApi"
import AvatarUI from "../../components/ui/Avatar"
import LazyImage from "../../components/ui/LazyImage"
import HealthWarningModal from "../mealCreation/components/HealthWarningModal"
import CommentsSheet from "../meal/CommentsSheet"
import type { FlaggedIngredient } from "../mealCreation/types/meal.types"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
    if (diff < 60)    return `${diff}s`
    if (diff < 3600)  return `${Math.floor(diff / 60)}m`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`
    return `${Math.floor(diff / 86400)}d`
}

const Avatar = AvatarUI

// ─── Post carousel (image → ingredients → steps) ─────────────────────────────

function PostCarousel({
    imageUrl, mealName,
    ingredients, steps,
}: {
    imageUrl: string | null
    mealName: string
    ingredients: { name: string; amount: string }[]
    steps: { order: number; description: string }[]
}) {
    const hasSteps            = steps.length > 0
    const slideCount          = hasSteps ? 3 : 2
    const [active, setActive] = useState(0)
    const scrollRef           = useRef<HTMLDivElement>(null)

    function handleScroll() {
        if (!scrollRef.current) return
        const { scrollLeft, clientWidth } = scrollRef.current
        setActive(Math.round(scrollLeft / clientWidth))
    }

    function goTo(i: number) {
        scrollRef.current?.scrollTo({ left: i * (scrollRef.current.clientWidth ?? 0), behavior: "smooth" })
    }

    return (
        <div className="flex flex-col">
            <div className="w-full aspect-square overflow-hidden relative">
                {active > 0 && (
                    <button
                        onClick={() => goTo(active - 1)}
                        className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
                        style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)", color: "#fff" }}>
                        <ChevronLeftRoundedIcon sx={{ fontSize: 22 }} />
                    </button>
                )}
                {active < slideCount - 1 && (
                    <button
                        onClick={() => goTo(active + 1)}
                        className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
                        style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)", color: "#fff" }}>
                        <ChevronRightRoundedIcon sx={{ fontSize: 22 }} />
                    </button>
                )}
                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="flex h-full overflow-x-auto"
                    style={{ scrollSnapType: "x mandatory", scrollbarWidth: "none" } as React.CSSProperties}>

                    {/* Slide 0: Image */}
                    <div className="flex-shrink-0 w-full h-full relative bg-white/5" style={{ scrollSnapAlign: "start" }}>
                        {imageUrl ? (
                            <LazyImage
                                src={imageUrl}
                                alt={mealName}
                                className="w-full h-full object-cover"
                                fallback={
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-text-muted/30 text-sm">No image</span>
                                    </div>
                                }
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-text-muted/30 text-sm">No image</span>
                            </div>
                        )}
                    </div>

                    {/* Slide 1: Ingredients */}
                    <div className="flex-shrink-0 w-full h-full flex flex-col"
                        style={{ scrollSnapAlign: "start", background: "var(--glass-bg)" }}>
                        <div className="px-5 pt-4 pb-2 flex-shrink-0">
                            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Ingredients</span>
                        </div>
                        <div className="flex-1 overflow-y-auto px-5 pb-4">
                            {ingredients.map((ing, i) => (
                                <div key={i} className="flex items-center justify-between py-2.5"
                                    style={{ borderBottom: i < ingredients.length - 1 ? "1px solid var(--glass-border)" : "none" }}>
                                    <span className="text-sm text-text">{ing.name}</span>
                                    <span className="text-sm font-semibold text-text-muted">{ing.amount}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Slide 2: Steps */}
                    {hasSteps && (
                        <div className="flex-shrink-0 w-full h-full flex flex-col"
                            style={{ scrollSnapAlign: "start", background: "var(--glass-bg)" }}>
                            <div className="px-5 pt-4 pb-2 flex-shrink-0">
                                <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Preparation</span>
                            </div>
                            <div className="flex-1 overflow-y-auto px-5 pb-4 flex flex-col gap-4">
                                {steps.map(step => (
                                    <div key={step.order} className="flex gap-3">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold mt-0.5"
                                            style={{ background: "rgba(127,250,136,0.12)", color: "var(--primary)", border: "1px solid rgba(127,250,136,0.25)" }}>
                                            {step.order}
                                        </div>
                                        <span className="text-sm text-text leading-relaxed">{step.description}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Dot indicators */}
            <div className="flex justify-center items-center gap-1.5 py-2">
                {Array.from({ length: slideCount }).map((_, i) => (
                    <button key={i} onClick={() => goTo(i)}
                        className="transition-all duration-300"
                        style={{
                            width: active === i ? 16 : 5, height: 5, borderRadius: 3,
                            background: active === i ? "var(--primary)" : "rgba(127,250,136,0.2)",
                        }} />
                ))}
            </div>
        </div>
    )
}

// ─── Skeleton card ────────────────────────────────────────────────────────────

function Shimmer({ className }: { className?: string }) {
    return (
        <div className={`relative overflow-hidden bg-white/5 ${className ?? ""}`}>
            <div className="absolute inset-0 -translate-x-full animate-shimmer"
                style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent)" }} />
        </div>
    )
}

function PostSkeleton() {
    return (
        <div className="flex flex-col rounded-2xl overflow-hidden"
            style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
            <div className="flex items-center gap-3 px-4 pt-3 pb-2">
                <Shimmer className="w-10 h-10 rounded-full" />
                <div className="flex flex-col gap-1.5 flex-1">
                    <Shimmer className="h-3 w-28 rounded" />
                    <Shimmer className="h-2.5 w-20 rounded" />
                </div>
            </div>
            <Shimmer className="w-full aspect-square" />
            <div className="flex gap-2 px-4 py-3">
                {[80, 72, 72, 72].map((w, i) => <Shimmer key={i} className={`h-6 w-${w} rounded-lg`} style={{ width: w }} />)}
            </div>
            <div className="flex gap-2 px-4 pb-3">
                <Shimmer className="h-3 w-16 rounded" />
                <Shimmer className="h-3 w-24 rounded" />
            </div>
        </div>
    )
}

// ─── Post card ────────────────────────────────────────────────────────────────

type LogState = "idle" | "logging" | "logged"

function PostCard({ post: initialPost }: { post: FeedPost }) {
    const navigate      = useNavigate()
    const currentUserId = useSelector((s: RootState) => s.auth.user?.id ?? null)

    const authorName = `${initialPost.author.first_name} ${initialPost.author.last_name}`

    // Engagement state
    const [liked,        setLiked]        = useState(initialPost.engagement.is_liked)
    const [likeCount,    setLikeCount]    = useState(initialPost.engagement.likes_count)
    const [commentCount, setCommentCount] = useState(initialPost.engagement.comments_count)
    const [relogCount,   setRelogCount]   = useState(initialPost.engagement.relogs_count)

    // Follow state
    const [following,     setFollowing]     = useState(initialPost.author.is_following)
    const [followLoading, setFollowLoading] = useState(false)

    // Log (relog) state
    const [logState,           setLogState]           = useState<LogState>("idle")
    const [pendingLogId,       setPendingLogId]        = useState<number | null>(null)
    const [warningIngredients, setWarningIngredients]  = useState<FlaggedIngredient[]>([])

    // Comments sheet
    const [showComments, setShowComments] = useState(false)

    async function toggleLike() {
        const wasLiked = liked
        setLiked(!wasLiked)
        setLikeCount(c => wasLiked ? c - 1 : c + 1)
        try {
            if (wasLiked) await unlikeMealApi(initialPost.id)
            else          await likeMealApi(initialPost.id)
        } catch {
            setLiked(wasLiked)
            setLikeCount(c => wasLiked ? c + 1 : c - 1)
        }
    }

    async function toggleFollow() {
        if (followLoading) return
        const wasFollowing = following
        setFollowing(!wasFollowing)
        setFollowLoading(true)
        try {
            if (wasFollowing) await unfollowUserApi(initialPost.author.id)
            else              await followUserApi(initialPost.author.id)
        } catch {
            setFollowing(wasFollowing)
        } finally {
            setFollowLoading(false)
        }
    }

    async function handleLog() {
        if (logState !== "idle") return
        setLogState("logging")
        try {
            const res = await logMeal(initialPost.id)
            if (res.health_warning.is_flagged) {
                setPendingLogId(res.logged_meal.id)
                setWarningIngredients(res.health_warning.flagged_ingredients)
                setLogState("idle")
            } else {
                setLogState("logged")
                setRelogCount(c => c + 1)
            }
        } catch {
            setLogState("idle")
        }
    }

    function handleWarningIgnore() {
        setPendingLogId(null)
        setWarningIngredients([])
        setLogState("logged")
        setRelogCount(c => c + 1)
    }

    async function handleWarningDiscard() {
        if (!pendingLogId) return
        const id = pendingLogId
        setPendingLogId(null)
        setWarningIngredients([])
        try { await deleteQuickLog(id) } catch { /* ignore */ }
    }

    const showFollow = !following && currentUserId !== initialPost.author.id

    return (
        <>
            {showComments && (
                <CommentsSheet
                    mealId={initialPost.id}
                    mealName={initialPost.name}
                    onClose={() => setShowComments(false)}
                    onCountChange={delta => setCommentCount(c => c + delta)}
                />
            )}

            {warningIngredients.length > 0 && (
                <HealthWarningModal
                    flaggedIngredients={warningIngredients}
                    onEdit={handleWarningDiscard}
                    onIgnore={handleWarningIgnore}
                    onDiscard={handleWarningDiscard}
                    confirmLabel="Log anyway"
                    discardLabel="Remove from log"
                    hideEdit
                />
            )}

            <div className="flex flex-col rounded-2xl overflow-hidden"
                style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", backdropFilter: "blur(20px)" }}>

                {/* ── Header ── */}
                <div className="flex items-center gap-3 px-4 pt-3 pb-2">
                    <button onClick={() => navigate(`/profile/${initialPost.author.id}`)} className="flex-shrink-0">
                        <Avatar src={initialPost.author.avatar} name={authorName} size={38} />
                    </button>
                    <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => navigate(`/profile/${initialPost.author.id}`)}
                                className="text-sm font-semibold text-text leading-tight truncate hover:opacity-75 transition-opacity"
                            >
                                {authorName}
                            </button>
                            {showFollow && (
                                <button
                                    onClick={toggleFollow}
                                    disabled={followLoading}
                                    className="flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full transition-all disabled:opacity-50"
                                    style={{
                                        color: "var(--primary)",
                                        border: "1px solid rgba(127,250,136,0.4)",
                                        background: "rgba(127,250,136,0.08)",
                                    }}
                                >
                                    {followLoading ? "..." : "Follow"}
                                </button>
                            )}
                        </div>
                        <span className="text-[11px] text-text-muted">{timeAgo(initialPost.posted_at)}</span>
                    </div>
                    <button className="text-text-muted hover:text-text transition-colors p-1 rounded-lg hover:bg-white/5">
                        <MoreHorizRoundedIcon sx={{ fontSize: 20 }} />
                    </button>
                </div>

                {/* ── Macros bar ── */}
                <div className="flex items-center gap-2 px-4 pb-3 flex-wrap">
                    {[
                        { icon: <LocalFireDepartmentRoundedIcon sx={{ fontSize: 13 }} />, value: Math.round(initialPost.macros.calories), unit: "kcal", color: "#7FFA88" },
                        { icon: <FitnessCenterRoundedIcon      sx={{ fontSize: 12 }} />, value: Math.round(initialPost.macros.protein),  unit: "g",    color: "#4F9CF9" },
                        { icon: <GrainRoundedIcon              sx={{ fontSize: 12 }} />, value: Math.round(initialPost.macros.carbs),    unit: "g",    color: "#FFC107" },
                        { icon: <WaterDropRoundedIcon          sx={{ fontSize: 12 }} />, value: Math.round(initialPost.macros.fats),     unit: "g",    color: "#FF6B9D" },
                    ].map((m, i) => (
                        <div key={i} className="flex items-center gap-1 px-2 py-1 rounded-lg"
                            style={{ background: `${m.color}0d`, border: `1px solid ${m.color}25` }}>
                            <span style={{ color: m.color }}>{m.icon}</span>
                            <span className="text-[11px] font-semibold" style={{ color: m.color }}>{m.value}</span>
                            <span className="text-[10px] text-text-muted">{m.unit}</span>
                        </div>
                    ))}
                </div>

                {/* ── Carousel ── */}
                <PostCarousel
                    imageUrl={initialPost.image_url}
                    mealName={initialPost.name}
                    ingredients={initialPost.ingredients.map(i => ({
                        name: i.name_en,
                        amount: `${i.portion} ${i.unit}`,
                    }))}
                    steps={initialPost.preparation_steps.map(s => ({
                        order: s.step_number,
                        description: s.description,
                    }))}
                />

                {/* ── Action bar ── */}
                <div className="flex items-center gap-1 px-3 pt-2 pb-1">
                    <button
                        onClick={toggleLike}
                        className="p-2 rounded-xl transition-all duration-200 hover:bg-white/5 active:scale-90"
                        style={{ color: liked ? "#f87171" : undefined }}
                    >
                        {liked
                            ? <FavoriteRoundedIcon sx={{ fontSize: 22 }} />
                            : <FavoriteBorderRoundedIcon sx={{ fontSize: 22 }} className="text-text-muted" />}
                    </button>

                    <button
                        onClick={() => setShowComments(true)}
                        className="p-2 rounded-xl transition-all duration-200 hover:bg-white/5 text-text-muted"
                    >
                        <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 21 }} />
                    </button>

                    <button
                        onClick={handleLog}
                        disabled={logState === "logging"}
                        className="p-2 rounded-xl transition-all duration-200 hover:bg-white/5 active:scale-90 disabled:opacity-60"
                        style={{ color: logState === "logged" ? "var(--primary)" : undefined }}
                    >
                        {logState === "logging" ? (
                            <span className="inline-block w-[22px] h-[22px] border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                        ) : logState === "logged" ? (
                            <CheckRoundedIcon sx={{ fontSize: 22 }} />
                        ) : (
                            <RepeatRoundedIcon sx={{ fontSize: 22 }} className="text-text-muted" />
                        )}
                    </button>
                </div>

                {/* ── Counts ── */}
                <div className="flex items-center gap-3 px-4 pb-1">
                    <span className="text-xs font-semibold text-text">
                        {likeCount.toLocaleString()} <span className="font-normal text-text-muted">likes</span>
                    </span>
                    <span className="text-text-muted/30 text-xs">·</span>
                    <span className="text-xs font-semibold text-text">
                        {relogCount.toLocaleString()} <span className="font-normal text-text-muted">relogs</span>
                    </span>
                    <span className="text-text-muted/30 text-xs">·</span>
                    <button
                        onClick={() => setShowComments(true)}
                        className="text-xs font-semibold text-text hover:text-primary transition-colors"
                    >
                        {commentCount.toLocaleString()} <span className="font-normal text-text-muted">comments</span>
                    </button>
                </div>

                {/* ── Meal name + description ── */}
                <div className="flex flex-col gap-0.5 px-4 pt-1 pb-2">
                    <button
                        onClick={() => navigate(`/meals/${initialPost.id}`)}
                        className="text-sm font-bold text-text text-left hover:text-primary transition-colors"
                    >
                        {initialPost.name}
                    </button>
                    {initialPost.description && (
                        <span className="text-xs text-text-muted leading-relaxed break-words">{initialPost.description}</span>
                    )}
                </div>

                {/* ── First comment preview ── */}
                {initialPost.first_comment && (
                    <div className="px-4 pb-3">
                        <div className="flex gap-1.5 min-w-0">
                            <span className="text-xs font-semibold text-text truncate max-w-[40%]">
                                {initialPost.first_comment.author.first_name} {initialPost.first_comment.author.last_name}
                            </span>
                            <span className="text-xs text-text-muted line-clamp-1 min-w-0">{initialPost.first_comment.body}</span>
                        </div>
                        {commentCount > 1 && (
                            <button
                                onClick={() => setShowComments(true)}
                                className="text-[11px] text-text-muted/40 hover:text-text-muted transition-colors mt-1"
                            >
                                View all {commentCount} comments
                            </button>
                        )}
                    </div>
                )}
            </div>
        </>
    )
}

// ─── Feed ─────────────────────────────────────────────────────────────────────

type FeedTab = "explore" | "following"

export default function Feed() {
    const [tab,         setTab]         = useState<FeedTab>("explore")
    const [posts,       setPosts]       = useState<FeedPost[]>([])
    const [cursor,      setCursor]      = useState<string | null | undefined>(undefined)
    const [loading,     setLoading]     = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const sentinelRef = useRef<HTMLDivElement>(null)

    const fetchFn = tab === "explore" ? getFeed : getFollowingFeed

    // Reload when tab changes
    useEffect(() => {
        let cancelled = false
        setPosts([])
        setCursor(undefined)
        setLoading(true)
        fetchFn()
            .then(res => {
                if (cancelled) return
                setPosts(res.data)
                setCursor(res.next_cursor)
            })
            .catch(() => { if (!cancelled) setPosts([]) })
            .finally(() => { if (!cancelled) setLoading(false) })
        return () => { cancelled = true }
    }, [tab])

    const loadMore = useCallback(async () => {
        if (!cursor || loadingMore) return
        setLoadingMore(true)
        try {
            const res = await fetchFn(cursor)
            setPosts(prev => [...prev, ...res.data])
            setCursor(res.next_cursor)
        } finally {
            setLoadingMore(false)
        }
    }, [cursor, loadingMore, fetchFn])

    useEffect(() => {
        const sentinel = sentinelRef.current
        if (!sentinel) return
        const observer = new IntersectionObserver(
            entries => { if (entries[0].isIntersecting) loadMore() },
            { threshold: 0.1 }
        )
        observer.observe(sentinel)
        return () => observer.disconnect()
    }, [loadMore])

    const emptyMessage = tab === "following"
        ? "Follow people to see their posts here."
        : "Nothing here yet."

    return (
        <div className="h-full overflow-y-auto" style={{ scrollbarWidth: "none" }}>
            <div className="w-full max-w-lg mx-auto flex flex-col gap-4 pb-8">

                {/* Tab toggle */}
                <div className="flex items-center p-1 rounded-2xl sticky top-0 z-10"
                    style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", backdropFilter: "blur(20px)" }}>
                    {(["explore", "following"] as FeedTab[]).map(t => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all duration-200 capitalize"
                            style={tab === t ? {
                                background: "rgba(127,250,136,0.12)",
                                color: "var(--primary)",
                                border: "1px solid rgba(127,250,136,0.25)",
                            } : {
                                color: "var(--text-muted)",
                            }}
                        >
                            {t === "explore" ? "Explore" : "Following"}
                        </button>
                    ))}
                </div>

                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => <PostSkeleton key={i} />)
                ) : posts.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-24">
                        <span className="text-sm text-text-muted/40">{emptyMessage}</span>
                    </div>
                ) : (
                    posts.map(post => <PostCard key={post.id} post={post} />)
                )}

                <div ref={sentinelRef} />

                {loadingMore && (
                    <div className="flex justify-center py-4">
                        <span className="inline-block w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    </div>
                )}

                {cursor === null && posts.length > 0 && (
                    <p className="text-center text-xs text-text-muted/40 py-4">You're all caught up</p>
                )}
            </div>
        </div>
    )
}

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded"
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded"
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded"
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded"
import PlaylistAddRoundedIcon from "@mui/icons-material/PlaylistAddRounded"
import CheckRoundedIcon from "@mui/icons-material/CheckRounded"
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded"
import FitnessCenterRoundedIcon from "@mui/icons-material/FitnessCenterRounded"
import GrainRoundedIcon from "@mui/icons-material/GrainRounded"
import WaterDropRoundedIcon from "@mui/icons-material/WaterDropRounded"
import SpaRoundedIcon from "@mui/icons-material/SpaRounded"
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded"
import type { MealDetail, FlaggedIngredient } from "../mealCreation/types/meal.types"
import { getMealApi, likeMealApi, unlikeMealApi, logMeal } from "../../services/meals/mealsApis"
import { confirmQuickLog, deleteQuickLog } from "../../services/log/quickLogApi"
import HealthWarningModal from "../mealCreation/components/HealthWarningModal"
import CommentsSheet from "./CommentsSheet"
import LazyImage from "../../components/ui/LazyImage"
import Avatar from "../../components/ui/Avatar"

function Shimmer({ className }: { className?: string }) {
    return (
        <div className={`relative overflow-hidden bg-white/5 ${className ?? ""}`}>
            <div className="absolute inset-0 -translate-x-full animate-shimmer"
                style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent)" }} />
        </div>
    )
}

function MealPageSkeleton() {
    return (
        <div className="flex flex-col gap-4 p-4">
            <Shimmer className="w-full h-64 sm:h-80 rounded-3xl" />
            <div className="flex flex-col gap-2 px-1">
                <Shimmer className="h-6 w-2/3 rounded-xl" />
                <Shimmer className="h-4 w-full rounded-lg" />
                <Shimmer className="h-4 w-4/5 rounded-lg" />
            </div>
            <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => <Shimmer key={i} className="h-24 rounded-2xl" />)}
            </div>
            <div className="flex flex-col gap-2">
                {Array.from({ length: 5 }).map((_, i) => <Shimmer key={i} className="h-11 rounded-xl" />)}
            </div>
        </div>
    )
}

export default function MealPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    const [meal, setMeal] = useState<MealDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)
    const [liked, setLiked] = useState(false)
    const [likeCount, setLikeCount] = useState(0)
    const [commentCount, setCommentCount] = useState(0)
    const [logging, setLogging] = useState(false)
    const [logged, setLogged] = useState(false)
    const [pendingLogId,       setPendingLogId]       = useState<number | null>(null)
    const [warningIngredients, setWarningIngredients] = useState<FlaggedIngredient[]>([])
    const [showComments, setShowComments] = useState(false)

    useEffect(() => {
        if (!id) return
        setLoading(true)
        setNotFound(false)
        getMealApi(Number(id))
            .then(data => {
                setMeal(data)
                setLiked(data.engagement.is_liked)
                setLikeCount(data.engagement.likes_count)
                setCommentCount(data.engagement.comments_count)
            })
            .catch((err) => {
                if (err?.response?.status === 404) setNotFound(true)
            })
            .finally(() => setLoading(false))
    }, [id])

    async function toggleLike() {
        const wasLiked = liked
        setLiked(!wasLiked)
        setLikeCount(c => wasLiked ? c - 1 : c + 1)
        try {
            if (wasLiked) await unlikeMealApi(Number(id))
            else          await likeMealApi(Number(id))
        } catch {
            setLiked(wasLiked)
            setLikeCount(c => wasLiked ? c + 1 : c - 1)
        }
    }
    async function handleLog() {
        if (logging || logged || !meal) return
        setLogging(true)
        try {
            const res = await logMeal(meal.id)
            if (res.health_warning.is_flagged) {
                setPendingLogId(res.logged_meal.id)
                setWarningIngredients(res.health_warning.flagged_ingredients)
            } else {
                setLogged(true)
            }
        } catch {
            // silent — button resets
        } finally {
            setLogging(false)
        }
    }

    function handleWarningIgnore() {
        setPendingLogId(null)
        setWarningIngredients([])
        setLogged(true)
    }

    async function handleWarningDiscard() {
        if (!pendingLogId) return
        const id = pendingLogId
        setPendingLogId(null)
        setWarningIngredients([])
        try { await deleteQuickLog(id) } catch { /* ignore */ }
    }

    if (loading)  return <MealPageSkeleton />
    if (notFound) return (
        <div className="flex flex-col items-center justify-center gap-3 py-24">
            <p className="text-sm font-medium text-text">Meal not found</p>
            <p className="text-xs text-text-muted">This meal may be private or no longer exists.</p>
        </div>
    )
    if (!meal) return null

    const { calories, protein, carbs, fats, fiber } = meal.macros

    const macroItems = [
        { label: "Calories", value: Math.round(calories), unit: "kcal", icon: <LocalFireDepartmentRoundedIcon sx={{ fontSize: 18 }} />, color: "#FF6B35" },
        { label: "Protein",  value: Math.round(protein),  unit: "g",    icon: <FitnessCenterRoundedIcon sx={{ fontSize: 18 }} />,      color: "#4F9CF9" },
        { label: "Carbs",    value: Math.round(carbs),    unit: "g",    icon: <GrainRoundedIcon sx={{ fontSize: 18 }} />,              color: "#FFC107" },
        { label: "Fat",      value: Math.round(fats),     unit: "g",    icon: <WaterDropRoundedIcon sx={{ fontSize: 18 }} />,          color: "#FF6B9D" },
    ]

    return (
        <div className="flex flex-col pb-12">

            {/* ── Hero image ── */}
            <div className="relative px-4 pt-4">
                <div className="relative w-full h-64 sm:h-80 overflow-hidden rounded-3xl bg-white/5">
                    {meal.image_url
                        ? <LazyImage src={meal.image_url} alt={meal.name} className="w-full h-full object-cover"
                            fallback={<div className="absolute inset-0 flex items-center justify-center text-6xl opacity-10">🍽</div>} />
                        : <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-10">🍽</div>
                    }
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-3xl" />

                    {/* Back */}
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute top-3.5 left-3.5 w-8 h-8 rounded-full flex items-center justify-center text-white"
                        style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)" }}
                    >
                        <ArrowBackRoundedIcon sx={{ fontSize: 17 }} />
                    </button>

                    {/* Servings badge */}
                    <div className="absolute bottom-3.5 right-3.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs text-white/80"
                        style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)" }}>
                        <PeopleAltRoundedIcon sx={{ fontSize: 12 }} />
                        {meal.servings} {meal.servings === 1 ? "serving" : "servings"}
                    </div>
                </div>
            </div>

            {/* ── Title + author ── */}
            <div className="px-5 pt-4 flex flex-col gap-3">
                <div className="flex flex-col gap-1.5 min-w-0">
                    <h1 className="text-lg font-bold text-text leading-snug break-words">{meal.name}</h1>
                    {meal.description && (
                        <p className="text-sm text-text-muted leading-relaxed break-words">{meal.description}</p>
                    )}
                </div>

                {/* Author */}
                <button
                    onClick={() => navigate(`/profile/${meal.author.id}`)}
                    className="flex items-center gap-2.5 w-fit hover:opacity-75 transition-opacity"
                >
                    <Avatar src={meal.author.avatar} name={`${meal.author.first_name} ${meal.author.last_name}`} size={28} />
                    <span className="text-xs font-medium text-text-muted">
                        {meal.author.first_name} {meal.author.last_name}
                    </span>
                </button>
            </div>

            {/* ── Social bar ── */}
            <div className="flex items-center gap-1 px-4 py-1 mt-2"
                style={{ borderBottom: "1px solid var(--glass-border)" }}>
                <button
                    onClick={toggleLike}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-200 text-text-muted hover:text-text"
                >
                    {liked
                        ? <FavoriteRoundedIcon sx={{ fontSize: 18 }} className="text-red-400" />
                        : <FavoriteBorderRoundedIcon sx={{ fontSize: 18 }} />
                    }
                    <span className={`text-xs font-medium ${liked ? "text-red-400" : ""}`}>{likeCount.toLocaleString()}</span>
                </button>

                <button
                    onClick={() => setShowComments(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl transition-colors text-text-muted hover:text-text"
                >
                    <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 17 }} />
                    <span className="text-xs font-medium">{commentCount.toLocaleString()}</span>
                </button>

                <button
                    onClick={handleLog}
                    disabled={logging || logged}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-200 disabled:opacity-60
                        ${logged ? "text-primary" : "text-text-muted hover:text-text"}`}
                >
                    {logging
                        ? <span className="w-4 h-4 border-[1.5px] border-current border-t-transparent rounded-full animate-spin" />
                        : logged
                            ? <CheckRoundedIcon sx={{ fontSize: 17 }} />
                            : <PlaylistAddRoundedIcon sx={{ fontSize: 19 }} />
                    }
                    <span className="text-xs font-medium">{logged ? "Logged" : "Log"}</span>
                </button>
            </div>

            {/* ── Body ── */}
            <div className="px-4 pt-5 flex flex-col gap-5">

                {/* Macros 2×2 */}
                <div className="grid grid-cols-2 gap-3">
                    {macroItems.map(m => (
                        <div key={m.label} className="flex items-center gap-3 px-4 py-3.5 rounded-2xl"
                            style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ background: `${m.color}18`, border: `1px solid ${m.color}25` }}>
                                <span style={{ color: m.color }}>{m.icon}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-text leading-none">{m.value}<span className="text-xs font-normal text-text-muted ml-0.5">{m.unit}</span></span>
                                <span className="text-xs text-text-muted mt-0.5">{m.label}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Fiber pill */}
                {fiber > 0 && (
                    <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl self-start"
                        style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
                        <SpaRoundedIcon sx={{ fontSize: 15 }} style={{ color: "#7FFA88" }} />
                        <span className="text-xs text-text-muted">Fiber</span>
                        <span className="text-xs font-semibold text-text">{Math.round(fiber)}g</span>
                    </div>
                )}

                {/* Ingredients */}
                {meal.ingredients.length > 0 && (
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between px-1">
                            <h2 className="text-sm font-semibold text-text">Ingredients</h2>
                            <span className="text-xs text-text-muted">{meal.ingredients.length} items</span>
                        </div>
                        <div className="rounded-2xl overflow-hidden"
                            style={{ border: "1px solid var(--glass-border)" }}>
                            {meal.ingredients.map((ing, i) => (
                                <div key={ing.id ?? i}
                                    className="flex items-center justify-between px-4 py-3"
                                    style={{
                                        borderTop: i > 0 ? "1px solid var(--glass-border)" : undefined,
                                        background: i % 2 === 0 ? "var(--glass-bg)" : "transparent",
                                    }}>
                                    <span className="text-sm text-text">{ing.name_en}</span>
                                    <span className="text-xs text-text-muted tabular-nums">{ing.portion} {ing.unit}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Prep steps */}
                {meal.preparation_steps.length > 0 && (
                    <div className="flex flex-col gap-3">
                        <h2 className="text-sm font-semibold text-text px-1">Preparation</h2>
                        <div className="flex flex-col gap-3">
                            {meal.preparation_steps.map(step => (
                                <div key={step.step_number} className="flex gap-3.5 px-1">
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-bold text-black mt-0.5"
                                        style={{ background: "var(--primary)" }}>
                                        {step.step_number}
                                    </div>
                                    <p className="text-sm text-text-muted leading-relaxed break-words min-w-0 flex-1">{step.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>

            {showComments && meal && (
                <CommentsSheet
                    mealId={meal.id}
                    mealName={meal.name}
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
        </div>
    )
}

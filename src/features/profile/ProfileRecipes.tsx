import { useEffect, useRef, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded"
import EggRoundedIcon from "@mui/icons-material/EggRounded"
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded"
import { getUserMealsApi, getUserPrivateMealsApi, type ProfileMeal } from "../../services/meals/mealsApis"

function RecipeCardSkeleton() {
    return (
        <div className="flex flex-col rounded-2xl overflow-hidden"
            style={{ border: "1px solid var(--glass-border)", background: "var(--glass-bg)" }}>
            <div className="w-full aspect-[4/3] bg-white/5 animate-pulse" />
            <div className="p-3 flex flex-col gap-2">
                <div className="h-3.5 w-3/4 rounded bg-white/5 animate-pulse" />
                <div className="flex gap-2">
                    <div className="h-5 w-14 rounded-full bg-white/5 animate-pulse" />
                    <div className="h-5 w-14 rounded-full bg-white/5 animate-pulse" />
                </div>
            </div>
        </div>
    )
}

function RecipeCard({ meal, onClick }: { meal: ProfileMeal; onClick: () => void }) {
    return (
        <div onClick={onClick}
            className="flex flex-col rounded-2xl overflow-hidden transition-transform duration-200 hover:scale-[1.02] cursor-pointer"
            style={{ border: "1px solid var(--glass-border)", background: "var(--glass-bg)" }}>

            <div className="relative w-full aspect-[4/3] overflow-hidden bg-white/5 flex-shrink-0">
                {meal.image_url
                    ? <img src={meal.image_url} alt={meal.name} className="w-full h-full object-cover" />
                    : <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl opacity-20">🍽</span>
                    </div>
                }
                <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full
                    text-[10px] font-semibold text-white"
                    style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}>
                    <LocalFireDepartmentRoundedIcon sx={{ fontSize: 11 }} style={{ color: "#f97316" }} />
                    {Math.round(meal.macros.calories)} kcal
                </div>
            </div>

            <div className="p-3 flex flex-col gap-2">
                <p className="text-xs font-semibold text-text leading-snug line-clamp-2">{meal.name}</p>

                <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                        style={{ background: "rgba(99,102,241,0.12)", color: "#818cf8" }}>
                        <EggRoundedIcon sx={{ fontSize: 10 }} />
                        {Math.round(meal.macros.protein)}g protein
                    </span>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                        style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-muted)" }}>
                        <FavoriteRoundedIcon sx={{ fontSize: 10 }} />
                        {meal.engagement.likes_count}
                    </span>
                </div>
            </div>
        </div>
    )
}

interface Props {
    userId: number
    isPrivate?: boolean
}

export default function ProfileRecipes({ userId, isPrivate = false }: Props) {
    const navigate = useNavigate()
    const [meals, setMeals] = useState<ProfileMeal[]>([])
    const [nextCursor, setNextCursor] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const sentinelRef = useRef<HTMLDivElement>(null)
    const observerRef = useRef<IntersectionObserver | null>(null)
    const hasMoreRef = useRef(false)

    const fetchMeals = useCallback(async (cursor: string | undefined, replace: boolean) => {
        const setter = replace ? setLoading : setLoadingMore
        setter(true)
        try {
            const apiFn = isPrivate ? getUserPrivateMealsApi : getUserMealsApi
            const res = await apiFn(userId, cursor)
            setMeals(prev => replace ? res.data : [...prev, ...res.data])
            setNextCursor(res.meta.next_cursor)
            hasMoreRef.current = res.meta.next_cursor !== null
        } finally {
            setter(false)
        }
    }, [userId, isPrivate])

    useEffect(() => {
        setMeals([])
        setNextCursor(null)
        hasMoreRef.current = false
        fetchMeals(undefined, true)
    }, [fetchMeals])

    useEffect(() => {
        if (observerRef.current) observerRef.current.disconnect()
        observerRef.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && !loadingMore && hasMoreRef.current && nextCursor) {
                fetchMeals(nextCursor, false)
            }
        }, { threshold: 0.1 })
        if (sentinelRef.current) observerRef.current.observe(sentinelRef.current)
        return () => observerRef.current?.disconnect()
    }, [loadingMore, nextCursor, fetchMeals])

    if (loading) {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                {Array.from({ length: 6 }).map((_, i) => <RecipeCardSkeleton key={i} />)}
            </div>
        )
    }

    if (meals.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-3 mt-3 rounded-2xl"
                style={{ border: "1px solid var(--glass-border)", background: "var(--glass-bg)" }}>
                <span className="text-4xl opacity-20">🍽</span>
                <p className="text-sm text-text-muted">No recipes yet</p>
            </div>
        )
    }

    return (
        <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                {meals.map(meal => (
                    <RecipeCard key={meal.id} meal={meal} onClick={() => navigate(`/meals/${meal.id}`)} />
                ))}
                {loadingMore && Array.from({ length: 3 }).map((_, i) => <RecipeCardSkeleton key={`sk-${i}`} />)}
            </div>
            <div ref={sentinelRef} className="h-4" />
        </>
    )
}

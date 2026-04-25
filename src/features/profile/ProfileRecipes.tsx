import { useEffect, useRef, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded"
import EggRoundedIcon from "@mui/icons-material/EggRounded"
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded"
import { getUserMealsApi, type ProfileMeal } from "../../services/meals/mealsApis"

const MOCK_MEALS: ProfileMeal[] = [
    {
        id: 1,
        name: "Grilled Chicken & Quinoa Bowl",
        description: "",
        image_url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80",
        servings: 2,
        macros: { calories: 520, protein: 48, carbs: 42, fats: 14, fiber: 6 },
    },
    {
        id: 2,
        name: "Avocado Toast with Poached Eggs",
        description: "",
        image_url: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&q=80",
        servings: 1,
        macros: { calories: 380, protein: 18, carbs: 30, fats: 22, fiber: 8 },
    },
    {
        id: 3,
        name: "Salmon Teriyaki with Steamed Rice",
        description: "",
        image_url: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&q=80",
        servings: 2,
        macros: { calories: 610, protein: 42, carbs: 58, fats: 18, fiber: 3 },
    },
    {
        id: 4,
        name: "Greek Yogurt Parfait",
        description: "",
        image_url: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80",
        servings: 1,
        macros: { calories: 290, protein: 22, carbs: 36, fats: 6, fiber: 4 },
    },
    {
        id: 5,
        name: "Beef & Broccoli Stir Fry",
        description: "",
        image_url: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&q=80",
        servings: 3,
        macros: { calories: 480, protein: 38, carbs: 28, fats: 20, fiber: 5 },
    },
    {
        id: 6,
        name: "Overnight Oats with Berries",
        description: "",
        image_url: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=400&q=80",
        servings: 1,
        macros: { calories: 340, protein: 14, carbs: 52, fats: 8, fiber: 7 },
    },
    {
        id: 7,
        name: "Turkey & Veggie Wrap",
        description: "",
        image_url: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&q=80",
        servings: 1,
        macros: { calories: 420, protein: 32, carbs: 40, fats: 12, fiber: 5 },
    },
    {
        id: 8,
        name: "Lentil Soup",
        description: "",
        image_url: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&q=80",
        servings: 4,
        macros: { calories: 260, protein: 16, carbs: 38, fats: 4, fiber: 12 },
    },
    {
        id: 9,
        name: "Protein Pancakes",
        description: "",
        image_url: "https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=400&q=80",
        servings: 2,
        macros: { calories: 390, protein: 28, carbs: 44, fats: 10, fiber: 3 },
    },
]

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

            {/* Image */}
            <div className="relative w-full aspect-[4/3] overflow-hidden bg-white/5 flex-shrink-0">
                {meal.image_url
                    ? <img src={meal.image_url} alt={meal.name} className="w-full h-full object-cover" />
                    : <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl opacity-20">🍽</span>
                    </div>
                }
                {/* Calorie badge */}
                <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full
                    text-[10px] font-semibold text-white"
                    style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}>
                    <LocalFireDepartmentRoundedIcon sx={{ fontSize: 11 }} style={{ color: "#f97316" }} />
                    {Math.round(meal.macros.calories)} kcal
                </div>
            </div>

            {/* Body */}
            <div className="p-3 flex flex-col gap-2">
                <p className="text-xs font-semibold text-text leading-snug line-clamp-2">{meal.name}</p>

                <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Protein */}
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                        style={{ background: "rgba(99,102,241,0.12)", color: "#818cf8" }}>
                        <EggRoundedIcon sx={{ fontSize: 10 }} />
                        {Math.round(meal.macros.protein)}g protein
                    </span>
                    {/* Servings */}
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                        style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-muted)" }}>
                        <PeopleAltRoundedIcon sx={{ fontSize: 10 }} />
                        {meal.servings}
                    </span>
                </div>
            </div>
        </div>
    )
}

interface Props {
    userId: number | "me"
}

export default function ProfileRecipes({ userId }: Props) {
    const navigate = useNavigate()
    const [meals, setMeals] = useState<ProfileMeal[]>([])
    const [page, setPage] = useState(1)
    const [lastPage, setLastPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const sentinelRef = useRef<HTMLDivElement>(null)
    const observerRef = useRef<IntersectionObserver | null>(null)

    const fetchPage = useCallback(async (p: number, replace: boolean) => {
        const setter = replace ? setLoading : setLoadingMore
        setter(true)
        try {
            // TODO: remove mock once API is ready
            await new Promise(r => setTimeout(r, 600))
            setMeals(prev => replace ? MOCK_MEALS : [...prev, ...MOCK_MEALS])
            setLastPage(1)
            setPage(1)
        } finally {
            setter(false)
        }
    }, [userId])

    useEffect(() => {
        fetchPage(1, true)
    }, [fetchPage])

    // Infinite scroll via IntersectionObserver
    useEffect(() => {
        if (observerRef.current) observerRef.current.disconnect()
        observerRef.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && !loadingMore && page < lastPage) {
                fetchPage(page + 1, false)
            }
        }, { threshold: 0.1 })
        if (sentinelRef.current) observerRef.current.observe(sentinelRef.current)
        return () => observerRef.current?.disconnect()
    }, [loadingMore, page, lastPage, fetchPage])

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

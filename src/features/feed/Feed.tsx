import { useState, useEffect, useRef, useCallback } from "react"
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded"
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded"
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded"
import RepeatRoundedIcon from "@mui/icons-material/RepeatRounded"
import AddRoundedIcon from "@mui/icons-material/AddRounded"
import CheckRoundedIcon from "@mui/icons-material/CheckRounded"
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded"
import CloseRoundedIcon from "@mui/icons-material/CloseRounded"
import SendRoundedIcon from "@mui/icons-material/SendRounded"
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded"
import FitnessCenterRoundedIcon from "@mui/icons-material/FitnessCenterRounded"
import GrainRoundedIcon from "@mui/icons-material/GrainRounded"
import WaterDropRoundedIcon from "@mui/icons-material/WaterDropRounded"
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded"
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded"

// ─── Types ────────────────────────────────────────────────────────────────────
interface PostUser {
    id: number
    name: string
    username: string
    avatar_url: string | null
}

interface PostReply {
    id: number
    username: string
    name: string
    text: string
    created_at: string
    likes_count: number
    is_liked: boolean
}

interface PostComment {
    id: number
    username: string
    name: string
    text: string
    created_at: string
    likes_count: number
    is_liked: boolean
    replies: PostReply[]
}

interface FeedPost {
    id: number
    user: PostUser
    image_url: string | null
    meal_name: string
    description: string | null
    macros: { calories: number; protein: number; carbs: number; fats: number }
    ingredients: Array<{ name: string; amount: string }>
    steps: Array<{ order: number; description: string }>
    likes_count: number
    comments_count: number
    relogs_count: number
    is_liked: boolean
    is_relogged: boolean
    created_at: string
    comments: PostComment[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(iso: string): string {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
    if (diff < 60)    return `${diff}s`
    if (diff < 3600)  return `${Math.floor(diff / 60)}m`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`
    return `${Math.floor(diff / 86400)}d`
}

function Avatar({ name, size = 36 }: { name: string; size?: number }) {
    const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    const palette  = ["#7FFA88", "#4F9CF9", "#FFC107", "#FF6B9D", "#a78bfa"]
    const color    = palette[name.charCodeAt(0) % palette.length]
    return (
        <div style={{
            width: size, height: size, borderRadius: "50%", flexShrink: 0,
            background: `${color}20`, border: `1.5px solid ${color}50`,
            display: "flex", alignItems: "center", justifyContent: "center",
        }}>
            <span style={{ fontSize: size * 0.36, fontWeight: 700, color }}>{initials}</span>
        </div>
    )
}

// ─── Placeholder data ─────────────────────────────────────────────────────────
const BASE_POSTS: FeedPost[] = [
    {
        id: 1,
        user: { id: 1, name: "Alex Rivera", username: "alexrivera", avatar_url: null },
        image_url: "https://picsum.photos/seed/chickenbowl/600/600",
        meal_name: "Grilled Chicken Bowl",
        description: "High protein meal prep for the week 💪 Perfect for hitting those macros.",
        macros: { calories: 520, protein: 42, carbs: 38, fats: 14 },
        ingredients: [
            { name: "Chicken breast", amount: "200g" },
            { name: "Brown rice", amount: "150g" },
            { name: "Avocado", amount: "½ medium" },
            { name: "Cherry tomatoes", amount: "80g" },
            { name: "Baby spinach", amount: "30g" },
            { name: "Olive oil", amount: "1 tbsp" },
            { name: "Lemon juice", amount: "1 tbsp" },
        ],
        steps: [
            { order: 1, description: "Season chicken breast with salt, pepper, and garlic powder." },
            { order: 2, description: "Grill over medium-high heat for 6–7 minutes each side until cooked through." },
            { order: 3, description: "Cook rice in salted water according to package instructions." },
            { order: 4, description: "Slice chicken and assemble bowl with rice, tomatoes, spinach, and avocado." },
            { order: 5, description: "Drizzle with olive oil and a squeeze of lemon before serving." },
        ],
        likes_count: 124, comments_count: 18, relogs_count: 37,
        is_liked: false, is_relogged: false,
        created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
        comments: [
            {
                id: 1, username: "sarahfit", name: "Sarah Chen",
                text: "This looks absolutely incredible! 😍", likes_count: 14, is_liked: false,
                created_at: new Date(Date.now() - 1.5 * 3600000).toISOString(),
                replies: [
                    { id: 11, username: "alexrivera", name: "Alex Rivera", text: "Right?! The avocado really makes it 🥑", likes_count: 3, is_liked: false, created_at: new Date(Date.now() - 1 * 3600000).toISOString() },
                    { id: 12, username: "tombulks",   name: "Tom Baker",   text: "I make this every Sunday for meal prep 💪", likes_count: 1, is_liked: false, created_at: new Date(Date.now() - 0.5 * 3600000).toISOString() },
                ],
            },
            {
                id: 2, username: "mikenutrition", name: "Mike Torres",
                text: "Those macros are on point! Perfect P/C/F ratio.", likes_count: 8, is_liked: true,
                created_at: new Date(Date.now() - 1 * 3600000).toISOString(),
                replies: [
                    { id: 13, username: "alexrivera", name: "Alex Rivera", text: "Thanks! Took me a few tries to nail it 🙏", likes_count: 2, is_liked: false, created_at: new Date(Date.now() - 0.8 * 3600000).toISOString() },
                ],
            },
            {
                id: 3, username: "priyaeats", name: "Priya Sharma",
                text: "Adding this to my weekly rotation immediately!", likes_count: 5, is_liked: false,
                created_at: new Date(Date.now() - 0.5 * 3600000).toISOString(),
                replies: [],
            },
        ],
    },
    {
        id: 2,
        user: { id: 2, name: "Sarah Chen", username: "sarahfit", avatar_url: null },
        image_url: "https://picsum.photos/seed/overnightoats/600/600",
        meal_name: "Overnight Oats",
        description: "My go-to breakfast. Takes 5 mins to prep the night before — zero excuses!",
        macros: { calories: 380, protein: 18, carbs: 62, fats: 8 },
        ingredients: [
            { name: "Rolled oats",  amount: "80g" },
            { name: "Greek yogurt", amount: "150g" },
            { name: "Almond milk",  amount: "120ml" },
            { name: "Chia seeds",   amount: "1 tbsp" },
            { name: "Blueberries",  amount: "60g" },
            { name: "Honey",        amount: "1 tsp" },
        ],
        steps: [
            { order: 1, description: "Combine oats, chia seeds, and almond milk in a jar or bowl." },
            { order: 2, description: "Stir in Greek yogurt and honey until well mixed." },
            { order: 3, description: "Cover and refrigerate for at least 6 hours or overnight." },
            { order: 4, description: "Top with fresh blueberries just before eating." },
        ],
        likes_count: 89, comments_count: 11, relogs_count: 52,
        is_liked: true, is_relogged: false,
        created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
        comments: [
            {
                id: 4, username: "healthyeats", name: "Dana Kim",
                text: "Made this last night, absolutely love it!! The texture is perfect.", likes_count: 9, is_liked: true,
                created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
                replies: [
                    { id: 14, username: "sarahfit", name: "Sarah Chen", text: "So glad you liked it! The chia seeds are key 🌱", likes_count: 4, is_liked: false, created_at: new Date(Date.now() - 3.5 * 3600000).toISOString() },
                ],
            },
            {
                id: 5, username: "tombulks", name: "Tom Baker",
                text: "How long does it keep in the fridge?", likes_count: 2, is_liked: false,
                created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
                replies: [
                    { id: 15, username: "sarahfit", name: "Sarah Chen", text: "Up to 3 days no problem! Just keep it covered 👌", likes_count: 5, is_liked: false, created_at: new Date(Date.now() - 2.5 * 3600000).toISOString() },
                ],
            },
        ],
    },
    {
        id: 3,
        user: { id: 3, name: "Marcus Wright", username: "marcusfitness", avatar_url: null },
        image_url: "https://picsum.photos/seed/salmonquinoa/600/600",
        meal_name: "Salmon & Quinoa",
        description: "Omega-3 loaded dinner. Perfect post-workout recovery meal 🐟",
        macros: { calories: 640, protein: 48, carbs: 52, fats: 22 },
        ingredients: [
            { name: "Salmon fillet", amount: "180g" },
            { name: "Quinoa",        amount: "120g dry" },
            { name: "Asparagus",     amount: "100g" },
            { name: "Lemon",         amount: "½" },
            { name: "Garlic",        amount: "2 cloves" },
            { name: "Olive oil",     amount: "1.5 tbsp" },
            { name: "Fresh dill",    amount: "to taste" },
        ],
        steps: [
            { order: 1, description: "Cook quinoa in salted water for 15 minutes, fluff with a fork and set aside." },
            { order: 2, description: "Season salmon with salt, pepper, lemon zest, and fresh dill." },
            { order: 3, description: "Sear salmon skin-side down in olive oil for 4 minutes, then flip and cook 3 more." },
            { order: 4, description: "Roast asparagus at 200°C with olive oil and crushed garlic for 12 minutes." },
            { order: 5, description: "Plate quinoa, add salmon and asparagus, finish with a squeeze of lemon." },
        ],
        likes_count: 203, comments_count: 34, relogs_count: 91,
        is_liked: false, is_relogged: true,
        created_at: new Date(Date.now() - 12 * 3600000).toISOString(),
        comments: [
            {
                id: 6, username: "alexrivera", name: "Alex Rivera",
                text: "The dill really makes a difference 🌿 Never skipping it again.", likes_count: 22, is_liked: false,
                created_at: new Date(Date.now() - 11 * 3600000).toISOString(),
                replies: [
                    { id: 16, username: "marcusfitness", name: "Marcus Wright", text: "100%! Fresh dill is non-negotiable for this one 🐟", likes_count: 7, is_liked: false, created_at: new Date(Date.now() - 10 * 3600000).toISOString() },
                ],
            },
            {
                id: 7, username: "nutricoach", name: "Coach Lisa",
                text: "Perfect macro split for muscle building! I'm recommending this to all my clients.", likes_count: 18, is_liked: true,
                created_at: new Date(Date.now() - 10 * 3600000).toISOString(),
                replies: [
                    { id: 17, username: "marcusfitness", name: "Marcus Wright", text: "That means a lot, thank you! 🙏", likes_count: 3, is_liked: false, created_at: new Date(Date.now() - 9 * 3600000).toISOString() },
                    { id: 18, username: "sarahfit",      name: "Sarah Chen",    text: "Agreed, the quinoa instead of rice is a great call", likes_count: 5, is_liked: false, created_at: new Date(Date.now() - 8 * 3600000).toISOString() },
                ],
            },
        ],
    },
    {
        id: 4,
        user: { id: 4, name: "Priya Sharma", username: "priyaeats", avatar_url: null },
        image_url: "https://picsum.photos/seed/smoothiebowl/600/600",
        meal_name: "Protein Smoothie Bowl",
        description: "Mornings made easy and nutritious ✨",
        macros: { calories: 310, protein: 28, carbs: 42, fats: 6 },
        ingredients: [
            { name: "Whey protein",       amount: "1 scoop (30g)" },
            { name: "Frozen banana",      amount: "1 medium" },
            { name: "Frozen mixed berries", amount: "100g" },
            { name: "Almond milk",        amount: "60ml" },
            { name: "Granola",            amount: "25g" },
            { name: "Strawberries",       amount: "50g, sliced" },
        ],
        steps: [
            { order: 1, description: "Blend protein, frozen banana, berries, and almond milk until thick and smooth." },
            { order: 2, description: "Pour into a bowl — it should be thick enough to hold toppings without sinking." },
            { order: 3, description: "Top with granola and fresh strawberries. Serve immediately." },
        ],
        likes_count: 67, comments_count: 7, relogs_count: 23,
        is_liked: false, is_relogged: false,
        created_at: new Date(Date.now() - 18 * 3600000).toISOString(),
        comments: [
            {
                id: 8, username: "sarahfit", name: "Sarah Chen",
                text: "I make this every single Monday 🙌 It keeps me full until lunch.", likes_count: 11, is_liked: false,
                created_at: new Date(Date.now() - 17 * 3600000).toISOString(),
                replies: [
                    { id: 19, username: "priyaeats", name: "Priya Sharma", text: "Same! The protein content is incredible for breakfast 💪", likes_count: 2, is_liked: false, created_at: new Date(Date.now() - 16 * 3600000).toISOString() },
                ],
            },
            {
                id: 9, username: "mikenutrition", name: "Mike Torres",
                text: "What protein powder brand do you use?", likes_count: 3, is_liked: false,
                created_at: new Date(Date.now() - 15 * 3600000).toISOString(),
                replies: [],
            },
        ],
    },
    {
        id: 5,
        user: { id: 5, name: "Tom Baker", username: "tombulks", avatar_url: null },
        image_url: "https://picsum.photos/seed/beefstirfry/600/600",
        meal_name: "Beef Stir Fry",
        description: "Quick 20-minute dinner when I'm short on time after the gym.",
        macros: { calories: 580, protein: 45, carbs: 44, fats: 20 },
        ingredients: [
            { name: "Lean beef strips",    amount: "200g" },
            { name: "Broccoli",            amount: "150g" },
            { name: "Mixed bell peppers",  amount: "120g" },
            { name: "Snap peas",           amount: "80g" },
            { name: "Soy sauce",           amount: "2 tbsp" },
            { name: "Sesame oil",          amount: "1 tsp" },
            { name: "Ginger, grated",      amount: "1 tsp" },
            { name: "Jasmine rice",        amount: "130g dry" },
        ],
        steps: [
            { order: 1, description: "Cook rice according to package instructions." },
            { order: 2, description: "Heat wok over high heat and add sesame oil." },
            { order: 3, description: "Stir-fry beef strips for 3–4 minutes until browned, then set aside." },
            { order: 4, description: "Add vegetables and ginger, stir-fry for 3 minutes until tender-crisp." },
            { order: 5, description: "Return beef to wok, add soy sauce, toss everything together and serve over rice." },
        ],
        likes_count: 156, comments_count: 22, relogs_count: 68,
        is_liked: true, is_relogged: false,
        created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
        comments: [
            {
                id: 10, username: "marcusfitness", name: "Marcus Wright",
                text: "This has been in my weekly rotation for months! Never gets old.", likes_count: 16, is_liked: true,
                created_at: new Date(Date.now() - 23 * 3600000).toISOString(),
                replies: [
                    { id: 20, username: "tombulks",   name: "Tom Baker",   text: "Glad you like it! I usually double the recipe for the week 🍱", likes_count: 4, is_liked: false, created_at: new Date(Date.now() - 22 * 3600000).toISOString() },
                    { id: 21, username: "healthyeats", name: "Dana Kim",   text: "Do you meal prep this? How long does it stay fresh?", likes_count: 1, is_liked: false, created_at: new Date(Date.now() - 21 * 3600000).toISOString() },
                ],
            },
            {
                id: 11, username: "priyaeats", name: "Priya Sharma",
                text: "Adding sesame seeds on top is a game changer 🤌 Also try a dash of chili oil!", likes_count: 12, is_liked: false,
                created_at: new Date(Date.now() - 20 * 3600000).toISOString(),
                replies: [
                    { id: 22, username: "tombulks", name: "Tom Baker", text: "Chili oil is genius, trying that tonight 🌶️", likes_count: 6, is_liked: false, created_at: new Date(Date.now() - 19 * 3600000).toISOString() },
                ],
            },
        ],
    },
]

function makeBatch(startId: number): FeedPost[] {
    return BASE_POSTS.map((p, i) => ({
        ...p,
        id: startId + i,
        created_at: new Date(Date.now() - (startId * 3 + i) * 3600000).toISOString(),
    }))
}

// ─── Comments modal ───────────────────────────────────────────────────────────
function CommentRow({ c, isReply = false }: { c: PostComment | PostReply; isReply?: boolean }) {
    const [liked,       setLiked]       = useState(c.is_liked)
    const [likesCount,  setLikesCount]  = useState(c.likes_count)
    const [showReply,   setShowReply]   = useState(false)
    const replies = "replies" in c ? c.replies : []

    function toggleLike(e: React.MouseEvent) {
        e.stopPropagation()
        setLiked(v => !v)
        setLikesCount(n => liked ? n - 1 : n + 1)
    }

    return (
        <div className={`flex flex-col gap-1 ${isReply ? "ml-10" : ""}`}>
            <div className="flex gap-3">
                <Avatar name={c.name} size={isReply ? 28 : 34} />
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <span className="text-xs font-semibold text-text">{c.username} </span>
                            <span className="text-xs text-text-muted leading-relaxed">{c.text}</span>
                        </div>
                        <button onClick={toggleLike}
                            className="flex-shrink-0 flex items-center gap-0.5 ml-2 transition-all duration-200 active:scale-90"
                            style={{ color: liked ? "#f87171" : "var(--text-muted)" }}>
                            {liked
                                ? <FavoriteRoundedIcon sx={{ fontSize: 13 }} />
                                : <FavoriteBorderRoundedIcon sx={{ fontSize: 13 }} />}
                            <span className="text-[10px] font-medium">{likesCount > 0 ? likesCount : ""}</span>
                        </button>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-text-muted/50">{timeAgo(c.created_at)}</span>
                        {!isReply && (
                            <button onClick={() => setShowReply(v => !v)}
                                className="text-[10px] font-semibold text-text-muted/60 hover:text-text-muted transition-colors">
                                Reply
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Replies */}
            {replies.length > 0 && !isReply && (
                <div className="ml-10">
                    <button onClick={() => setShowReply(v => !v)}
                        className="flex items-center gap-1.5 mb-2 group">
                        <div className="h-px w-5 bg-text-muted/20" />
                        <span className="text-[10px] font-semibold text-text-muted/50 group-hover:text-text-muted transition-colors">
                            {showReply ? "Hide" : `${replies.length} ${replies.length === 1 ? "reply" : "replies"}`}
                        </span>
                    </button>
                    {showReply && (
                        <div className="flex flex-col gap-3">
                            {replies.map(r => (
                                <CommentRow key={r.id} c={r} isReply />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

function CommentsModal({
    post, onClose,
}: {
    post: FeedPost
    onClose: () => void
}) {
    const [comment, setComment] = useState("")
    const inputRef              = useRef<HTMLInputElement>(null)

    useEffect(() => {
        function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose() }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [onClose])

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }}
            onClick={onClose}>

            <div className="w-full sm:max-w-lg flex flex-col rounded-t-2xl sm:rounded-2xl overflow-hidden"
                style={{
                    maxHeight: "88vh",
                    background: "var(--glass-bg)",
                    border: "1px solid var(--glass-border)",
                    backdropFilter: "blur(28px)",
                }}
                onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
                    style={{ borderBottom: "1px solid var(--glass-border)" }}>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-bold text-text">Comments</span>
                        <span className="text-[11px] text-text-muted truncate max-w-[220px]">{post.meal_name}</span>
                    </div>
                    {/* Post stats */}
                    <div className="flex items-center gap-3 mr-3">
                        <div className="flex items-center gap-1">
                            <FavoriteRoundedIcon sx={{ fontSize: 13 }} style={{ color: "#f87171" }} />
                            <span className="text-[11px] font-semibold text-text-muted">{post.likes_count.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <RepeatRoundedIcon sx={{ fontSize: 13 }} style={{ color: "var(--primary)" }} />
                            <span className="text-[11px] font-semibold text-text-muted">{post.relogs_count.toLocaleString()}</span>
                        </div>
                    </div>
                    <button onClick={onClose}
                        className="p-1.5 rounded-lg text-text-muted hover:text-text transition-colors hover:bg-white/5">
                        <CloseRoundedIcon sx={{ fontSize: 18 }} />
                    </button>
                </div>

                {/* Comments list */}
                <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5"
                    style={{ scrollbarWidth: "none" }}>
                    {post.comments.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 py-10">
                            <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 28 }} className="text-text-muted/20" />
                            <span className="text-sm text-text-muted/40">No comments yet. Be the first!</span>
                        </div>
                    ) : (
                        post.comments.map(c => <CommentRow key={c.id} c={c} />)
                    )}
                </div>

                {/* Input */}
                <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
                    style={{ borderTop: "1px solid var(--glass-border)" }}>
                    <Avatar name="You" size={32} />
                    <input
                        ref={inputRef}
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        placeholder="Add a comment…"
                        className="flex-1 bg-transparent text-sm text-text placeholder:text-text-muted/40 outline-none"
                        onKeyDown={e => { if (e.key === "Enter" && comment.trim()) setComment("") }}
                    />
                    {comment.trim() && (
                        <button onClick={() => setComment("")}
                            className="flex-shrink-0 transition-all active:scale-90"
                            style={{ color: "var(--primary)" }}>
                            <SendRoundedIcon sx={{ fontSize: 18 }} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

// ─── Post carousel (image → ingredients → steps) ─────────────────────────────
function PostCarousel({
    imageUrl, mealName, ingredients, steps,
}: {
    imageUrl: string | null
    mealName: string
    ingredients: FeedPost["ingredients"]
    steps: FeedPost["steps"]
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
            {/* Slides container — square aspect ratio clips off-screen slides */}
            <div className="w-full aspect-square overflow-hidden relative">
                {/* Desktop prev arrow */}
                {active > 0 && (
                    <button
                        onClick={() => goTo(active - 1)}
                        className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
                        style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)", color: "#fff" }}>
                        <ChevronLeftRoundedIcon sx={{ fontSize: 22 }} />
                    </button>
                )}
                {/* Desktop next arrow */}
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
                    <div className="flex-shrink-0 w-full h-full bg-white/5" style={{ scrollSnapAlign: "start" }}>
                        {imageUrl ? (
                            <img src={imageUrl} alt={mealName} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
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

// ─── Post card ────────────────────────────────────────────────────────────────
type LogState = "idle" | "logging" | "logged"

function PostCard({ post: initial }: { post: FeedPost }) {
    const [post,         setPost]         = useState(initial)
    const [logState,     setLogState]     = useState<LogState>(initial.is_relogged ? "logged" : "idle")
    const [showComments, setShowComments] = useState(false)

    function toggleLike() {
        setPost(p => ({ ...p, is_liked: !p.is_liked, likes_count: p.is_liked ? p.likes_count - 1 : p.likes_count + 1 }))
    }

    function toggleRelog() {
        setPost(p => ({ ...p, is_relogged: !p.is_relogged, relogs_count: p.is_relogged ? p.relogs_count - 1 : p.relogs_count + 1 }))
    }

    async function handleLog() {
        if (logState !== "idle") return
        setLogState("logging")
        await new Promise(r => setTimeout(r, 900))
        setLogState("logged")
        setPost(p => ({ ...p, relogs_count: p.is_relogged ? p.relogs_count : p.relogs_count + 1, is_relogged: true }))
    }

    const latestComment = post.comments[0] ?? null

    return (
        <>
        {showComments && <CommentsModal post={post} onClose={() => setShowComments(false)} />}

        <div className="flex flex-col rounded-2xl overflow-hidden"
            style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", backdropFilter: "blur(20px)" }}>

            {/* ── Header ── */}
            <div className="flex items-center gap-3 px-4 pt-3 pb-2">
                <Avatar name={post.user.name} size={38} />
                <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-sm font-semibold text-text leading-tight truncate">{post.user.name}</span>
                    <span className="text-[11px] text-text-muted">@{post.user.username} · {timeAgo(post.created_at)}</span>
                </div>
                <button className="text-text-muted hover:text-text transition-colors p-1 rounded-lg hover:bg-white/5">
                    <MoreHorizRoundedIcon sx={{ fontSize: 20 }} />
                </button>
            </div>

            {/* ── Macros + Log Meal (above image) ── */}
            <div className="flex items-center gap-2 px-4 pb-3 flex-wrap">
                {[
                    { icon: <LocalFireDepartmentRoundedIcon sx={{ fontSize: 13 }} />, value: post.macros.calories, unit: "kcal", color: "#7FFA88" },
                    { icon: <FitnessCenterRoundedIcon      sx={{ fontSize: 12 }} />, value: post.macros.protein,  unit: "g",    color: "#4F9CF9" },
                    { icon: <GrainRoundedIcon              sx={{ fontSize: 12 }} />, value: post.macros.carbs,    unit: "g",    color: "#FFC107" },
                    { icon: <WaterDropRoundedIcon          sx={{ fontSize: 12 }} />, value: post.macros.fats,     unit: "g",    color: "#FF6B9D" },
                ].map((m, i) => (
                    <div key={i} className="flex items-center gap-1 px-2 py-1 rounded-lg"
                        style={{ background: `${m.color}0d`, border: `1px solid ${m.color}25` }}>
                        <span style={{ color: m.color }}>{m.icon}</span>
                        <span className="text-[11px] font-semibold" style={{ color: m.color }}>{m.value}</span>
                        <span className="text-[10px] text-text-muted">{m.unit}</span>
                    </div>
                ))}
                <div className="flex-1" />
                <button
                    onClick={handleLog}
                    disabled={logState === "logging"}
                    className="flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-60"
                    style={logState === "logged"
                        ? { background: "rgba(127,250,136,0.12)", border: "1px solid rgba(127,250,136,0.3)", color: "var(--primary)" }
                        : { background: "rgba(255,255,255,0.06)", border: "1px solid var(--glass-border)", color: "var(--text)" }}>
                    {logState === "logging" ? (
                        <span className="inline-block w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                    ) : logState === "logged" ? (
                        <CheckRoundedIcon sx={{ fontSize: 16 }} />
                    ) : (
                        <AddRoundedIcon sx={{ fontSize: 16 }} />
                    )}
                </button>
            </div>

            {/* ── Carousel: image → ingredients → steps ── */}
            <PostCarousel
                imageUrl={post.image_url}
                mealName={post.meal_name}
                ingredients={post.ingredients}
                steps={post.steps}
            />

            {/* ── Action bar ── */}
            <div className="flex items-center gap-1 px-3 pt-2 pb-1">
                <button onClick={toggleLike}
                    className="p-2 rounded-xl transition-all duration-200 hover:bg-white/5 active:scale-90"
                    style={{ color: post.is_liked ? "#f87171" : undefined }}>
                    {post.is_liked
                        ? <FavoriteRoundedIcon sx={{ fontSize: 22 }} />
                        : <FavoriteBorderRoundedIcon sx={{ fontSize: 22 }} className="text-text-muted" />}
                </button>
                <button onClick={() => setShowComments(true)}
                    className="p-2 rounded-xl transition-all duration-200 hover:bg-white/5 text-text-muted">
                    <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 21 }} />
                </button>
                <button onClick={toggleRelog}
                    className="p-2 rounded-xl transition-all duration-200 hover:bg-white/5 active:scale-90"
                    style={{ color: post.is_relogged ? "var(--primary)" : undefined }}>
                    <RepeatRoundedIcon sx={{ fontSize: 22 }} className={post.is_relogged ? "" : "text-text-muted"} />
                </button>
            </div>

            {/* ── Counts ── */}
            <div className="flex items-center gap-3 px-4 pb-1">
                <span className="text-xs font-semibold text-text">
                    {post.likes_count.toLocaleString()} <span className="font-normal text-text-muted">likes</span>
                </span>
                <span className="text-text-muted/30 text-xs">·</span>
                <span className="text-xs font-semibold text-text">
                    {post.relogs_count.toLocaleString()} <span className="font-normal text-text-muted">relogs</span>
                </span>
                <span className="text-text-muted/30 text-xs">·</span>
                <button onClick={() => setShowComments(true)}
                    className="text-xs font-semibold text-text hover:text-primary transition-colors">
                    {post.comments_count.toLocaleString()} <span className="font-normal text-text-muted">comments</span>
                </button>
            </div>

            {/* ── Meal name + description ── */}
            <div className="flex flex-col gap-0.5 px-4 pt-1 pb-2">
                <span className="text-sm font-bold text-text">{post.meal_name}</span>
                {post.description && (
                    <span className="text-xs text-text-muted leading-relaxed">{post.description}</span>
                )}
            </div>

            {/* ── Latest comment ── */}
            {latestComment && (
                <div className="px-4 pb-3">
                    <div className="flex gap-1.5">
                        <span className="text-xs font-semibold text-text flex-shrink-0">{latestComment.username}</span>
                        <span className="text-xs text-text-muted line-clamp-1">{latestComment.text}</span>
                    </div>
                    {post.comments_count > 1 && (
                        <button onClick={() => setShowComments(true)}
                            className="text-[11px] text-text-muted/40 hover:text-text-muted transition-colors mt-1">
                            View all {post.comments_count} comments
                        </button>
                    )}
                </div>
            )}

        </div>
        </>
    )
}

// ─── Feed ─────────────────────────────────────────────────────────────────────
export default function Feed() {
    const [posts,   setPosts]   = useState<FeedPost[]>(() => makeBatch(1))
    const [loading, setLoading] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const sentinelRef           = useRef<HTMLDivElement>(null)
    const batchRef              = useRef(2)

    const loadMore = useCallback(async () => {
        if (loading || !hasMore) return
        setLoading(true)
        await new Promise(r => setTimeout(r, 800))
        const next = makeBatch(batchRef.current * 10)
        batchRef.current += 1
        setPosts(p => [...p, ...next])
        if (batchRef.current > 5) setHasMore(false)
        setLoading(false)
    }, [loading, hasMore])

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

    return (
        <div className="h-full overflow-y-auto" style={{ scrollbarWidth: "none" }}>
        <div className="w-full max-w-lg mx-auto flex flex-col gap-4 pb-8">
            {posts.map(post => (
                <PostCard key={post.id} post={post} />
            ))}

            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} />

            {loading && (
                <div className="flex justify-center py-4">
                    <span className="inline-block w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
            )}

            {!hasMore && (
                <p className="text-center text-xs text-text-muted/40 py-4">You're all caught up</p>
            )}
        </div>
        </div>
    )
}

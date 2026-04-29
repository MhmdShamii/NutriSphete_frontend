import { useEffect, useRef, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import CloseRoundedIcon from "@mui/icons-material/CloseRounded"
import {
    getFollowersApi,
    getFollowingApi,
    followUserApi,
    unfollowUserApi,
    type FollowUser,
} from "../../services/social/followApi"

interface Props {
    userId: number
    mode: "followers" | "following"
    onClose: () => void
}

export default function FollowListModal({ userId, mode, onClose }: Props) {
    const navigate = useNavigate()
    const [users, setUsers] = useState<FollowUser[]>([])
    const [page, setPage] = useState(1)
    const [lastPage, setLastPage] = useState(1)
    const [loading, setLoading] = useState(false)
    const [loadingMore, setLoadingMore] = useState(false)
    const [toggling, setToggling] = useState<Set<number>>(new Set())
    const listRef = useRef<HTMLDivElement>(null)

    const fetchPage = useCallback(async (p: number, replace: boolean) => {
        const setter = replace ? setLoading : setLoadingMore
        setter(true)
        try {
            const fn = mode === "followers" ? getFollowersApi : getFollowingApi
            const res = await fn(userId, p)
            setUsers(prev => replace ? res.data : [...prev, ...res.data])
            setLastPage(res.meta.last_page)
            setPage(res.meta.current_page)
        } finally {
            setter(false)
        }
    }, [userId, mode])

    useEffect(() => {
        fetchPage(1, true)
    }, [fetchPage])

    async function handleScroll() {
        const el = listRef.current
        if (!el || loadingMore || page >= lastPage) return
        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 60) {
            fetchPage(page + 1, false)
        }
    }

    async function toggleFollow(user: FollowUser) {
        if (toggling.has(user.id)) return
        setToggling(prev => new Set(prev).add(user.id))
        const wasFollowing = user.is_following
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_following: !wasFollowing } : u))
        try {
            if (wasFollowing) {
                await unfollowUserApi(user.id)
            } else {
                await followUserApi(user.id)
            }
        } catch {
            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_following: wasFollowing } : u))
        } finally {
            setToggling(prev => { const s = new Set(prev); s.delete(user.id); return s })
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div
                className="relative w-full sm:max-w-sm mx-auto flex flex-col rounded-t-3xl sm:rounded-3xl overflow-hidden"
                style={{ maxHeight: "80vh", background: "var(--surface)", border: "1px solid var(--glass-border)" }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
                    style={{ borderBottom: "1px solid var(--glass-border)" }}>
                    <h3 className="text-sm font-semibold text-text capitalize">{mode}</h3>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-white/5 transition-colors"
                    >
                        <CloseRoundedIcon sx={{ fontSize: 16 }} />
                    </button>
                </div>

                {/* List */}
                <div
                    ref={listRef}
                    onScroll={handleScroll}
                    className="flex-1 overflow-y-auto overscroll-contain"
                >
                    {loading ? (
                        <div className="flex flex-col divide-y" style={{ borderColor: "var(--glass-border)" }}>
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                                    <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse flex-shrink-0" />
                                    <div className="flex-1 flex flex-col gap-1.5">
                                        <div className="h-3 w-28 rounded bg-white/5 animate-pulse" />
                                        <div className="h-2.5 w-20 rounded bg-white/5 animate-pulse" />
                                    </div>
                                    <div className="h-7 w-20 rounded-lg bg-white/5 animate-pulse" />
                                </div>
                            ))}
                        </div>
                    ) : users.length === 0 ? (
                        <p className="text-sm text-text-muted text-center py-12">No {mode} yet.</p>
                    ) : (
                        <div className="flex flex-col divide-y" style={{ borderColor: "var(--glass-border)" }}>
                            {users.map(user => (
                                <div key={user.id} className="flex items-center gap-3 px-5 py-3.5">
                                    <button
                                        type="button"
                                        onClick={() => { onClose(); navigate(`/profile/${user.id}`) }}
                                        className="flex items-center gap-3 flex-1 min-w-0 text-left"
                                    >
                                        <img
                                            src={user.avatar}
                                            alt={user.first_name}
                                            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                        />
                                        <p className="text-sm font-medium text-text truncate">
                                            {user.first_name} {user.last_name}
                                        </p>
                                    </button>
                                    <button
                                        onClick={() => toggleFollow(user)}
                                        disabled={toggling.has(user.id)}
                                        className={`flex-shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 disabled:opacity-50
                                            ${user.is_following
                                                ? "text-text-muted border border-white/10 hover:border-red-400/40 hover:text-red-400"
                                                : "bg-primary text-black hover:bg-primary/90"
                                            }`}
                                    >
                                        {toggling.has(user.id)
                                            ? <span className="w-3 h-3 border-[1.5px] border-current border-t-transparent rounded-full animate-spin inline-block" />
                                            : user.is_following ? "Following" : "Follow"
                                        }
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {loadingMore && (
                        <div className="flex justify-center py-4">
                            <span className="w-5 h-5 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

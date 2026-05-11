import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import type { AuthUser } from "../../features/auth/types"
import GlassCard from "../ui/GlassCard"
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded"
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded"
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded"
import {
    checkNotificationsApi,
    getNotificationsApi,
    type NotificationItem,
} from "../../services/social/followApi"
import CoachBadge from "../ui/CoachBadge"
import Avatar from "../ui/Avatar"
const logo = "/logo-64.png"
import nutriSphereSvg from "../../assets/NUTRISPHERE.svg"

function notifTarget(n: NotificationItem): string {
    if (n.type === "follow") return `/profile/${n.actor.id}`
    if (n.type === "coach_application" || n.type === "coach_application_approved" || n.type === "coach_application_rejected") return `/settings`
    const base = `/meals/${n.data.post_id}`
    if ((n.type === "comment" || n.type === "reply") && n.data.comment_id) {
        return `${base}#comment-${n.data.comment_id}`
    }
    return base
}

function notifMessage(n: NotificationItem): string {
    switch (n.type) {
        case "like": return `liked your post "${n.data.post_name}"`
        case "comment": return `commented on "${n.data.post_name}"`
        case "reply": return `replied to your comment on "${n.data.post_name}"`
        case "relog": return `relogged your meal "${n.data.post_name}"`
        case "follow": return `started following you`
        case "coach_application": return `submitted a coach application`
        case "coach_application_approved": return `approved your coach application`
        case "coach_application_rejected": return `reviewed your coach application`
    }
}

function relativeTime(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1) return "just now"
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    return `${Math.floor(h / 24)}d ago`
}

export default function TopBar({ user }: { user: AuthUser | null }) {
    const notifRef = useRef<HTMLDivElement>(null)
    const navigate = useNavigate()

    const [hasNewNotifications, setHasNewNotifications] = useState(false)
    const hasNewNotificationsRef = useRef(false)

    const [notifOpen, setNotifOpen] = useState(false)
    const [notifications, setNotifications] = useState<NotificationItem[]>([])
    const [notifLoading, setNotifLoading] = useState(false)

    useEffect(() => {
        function handleOutside(e: MouseEvent) {
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
        }
        document.addEventListener("mousedown", handleOutside)
        return () => document.removeEventListener("mousedown", handleOutside)
    }, [])

    async function checkNotifications() {
        try {
            const res = await checkNotificationsApi()
            setHasNewNotifications(res.has_new)
            hasNewNotificationsRef.current = res.has_new
        } catch (error) {
            console.error("Error checking notifications:", error)
        }
    }

    useEffect(() => {
        if (!user) return

        let timeoutId: ReturnType<typeof setTimeout>

        function scheduleNext() {
            const delay = Math.floor(Math.random() * 10000) + 15000
            timeoutId = setTimeout(async () => {
                if (!hasNewNotificationsRef.current) {
                    await checkNotifications()
                }
                scheduleNext()
            }, delay)
        }

        checkNotifications()
        scheduleNext()

        return () => clearTimeout(timeoutId)
    }, [user])

    async function handleBellClick() {
        if (notifOpen) {
            setNotifOpen(false)
            return
        }
        setNotifOpen(true)
        if (!hasNewNotificationsRef.current) return
        setNotifLoading(true)
        try {
            const data = await getNotificationsApi()
            setNotifications(prev => {
                const existingIds = new Set(prev.map(n => n.id))
                const fresh = data.filter(n => !existingIds.has(n.id))
                return [...fresh, ...prev]
            })
            setHasNewNotifications(false)
            hasNewNotificationsRef.current = false
        } catch (error) {
            console.error("Error fetching notifications:", error)
        } finally {
            setNotifLoading(false)
        }
    }

    return (
        <GlassCard className="w-full h-16 px-5 rounded-2xl text-text-muted flex items-center justify-between">

            {/* Brand */}
            <div className="flex items-center gap-2">
                <img src={logo} alt="NutriSphere logo" className="h-6 w-6 object-cover rounded-md" />
                <img src={nutriSphereSvg} alt="NutriSphere" className="h-2 w-auto" />
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">

                {!user && (
                    <button
                        onClick={() => navigate("/auth")}
                        className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200
                            hover:bg-primary/10 active:scale-95"
                        style={{ color: "var(--primary)", border: "1px solid rgba(127,250,136,0.35)" }}
                    >
                        Sign in
                    </button>
                )}

                {user && <>
                    {/* Admin dashboard */}
                    {user.role === "admin" && (
                        <button
                            onClick={() => navigate("/admin")}
                            className="p-2 rounded-xl text-text-muted
                                hover:text-primary hover:bg-primary/10 transition-all duration-200 active:scale-95"
                            title="Admin Dashboard"
                        >
                            <DashboardRoundedIcon sx={{ fontSize: 20 }} />
                        </button>
                    )}

                    {/* Notification bell */}
                    <div ref={notifRef} className="relative">
                        <button
                            onClick={handleBellClick}
                            className="relative p-2 rounded-xl text-text-muted
                                hover:text-primary hover:bg-primary/10 transition-all duration-200"
                        >
                            <NotificationsNoneRoundedIcon sx={{ fontSize: 20 }} />
                            {hasNewNotifications && (
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary
                                    shadow-[0_0_6px_rgba(127,250,136,0.8)]" />
                            )}
                        </button>

                        {/* Notification panel */}
                        <div
                            className="fixed left-2 right-2 top-[4.5rem] sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-3 sm:w-80 rounded-2xl shadow-xl z-50 bg-surface overflow-hidden"
                            style={{
                                border: "1px solid var(--glass-border)",
                                backdropFilter: "blur(20px)",
                                transition: "opacity 250ms ease, transform 250ms ease",
                                opacity: notifOpen ? 1 : 0,
                                transform: notifOpen ? "translateY(0)" : "translateY(-8px)",
                                pointerEvents: notifOpen ? "auto" : "none",
                            }}
                        >
                            <div className="px-4 py-3 border-b border-white/8">
                                <p className="text-sm font-semibold text-text">Notifications</p>
                            </div>

                            <div className="max-h-80 overflow-y-auto">
                                {notifLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <span className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                                    </div>
                                ) : notifications.length === 0 ? (
                                    <p className="text-center text-xs text-text-muted py-8">No new notifications</p>
                                ) : (
                                    <div className="p-2 flex flex-col gap-0.5">
                                        {notifications.map(n => (
                                            <div
                                                key={n.id}
                                                onClick={() => { navigate(notifTarget(n)); setNotifOpen(false) }}
                                                className="flex items-start gap-3 px-3 py-2.5 rounded-xl
                                                    hover:bg-primary/5 transition-colors duration-150 cursor-pointer"
                                                style={n.type === "coach_application_approved"
                                                    ? { background: "rgba(0,219,88,0.06)", borderRadius: 12 }
                                                    : n.type === "coach_application_rejected"
                                                        ? { background: "rgba(248,113,113,0.05)", borderRadius: 12 }
                                                        : undefined}
                                            >
                                                <Avatar
                                                    src={n.actor.avatar}
                                                    name={`${n.actor.first_name} ${n.actor.last_name}`}
                                                    size={32}
                                                    onClick={e => { e.stopPropagation(); navigate(`/profile/${n.actor.id}`); setNotifOpen(false) }}
                                                    className="mt-0.5 shrink-0 hover:opacity-80 transition-opacity"
                                                />
                                                <div className="min-w-0">
                                                    <p className="text-xs text-text leading-snug">
                                                        <span className="inline-flex items-center gap-1 align-middle">
                                                            <span
                                                                onClick={e => { e.stopPropagation(); navigate(`/profile/${n.actor.id}`); setNotifOpen(false) }}
                                                                className="font-semibold hover:text-primary transition-colors cursor-pointer"
                                                            >
                                                                {n.actor.first_name} {n.actor.last_name}
                                                            </span>
                                                            {n.actor.role === "coach" && <CoachBadge size={12} />}
                                                        </span>
                                                        {" "}
                                                        <span className={
                                                            n.type === "coach_application_approved" ? "text-primary font-medium" :
                                                                n.type === "coach_application_rejected" ? "text-red-400" : ""
                                                        }>
                                                            {notifMessage(n)}
                                                        </span>
                                                    </p>
                                                    {(n.type === "comment" || n.type === "reply") && (
                                                        <p className="text-xs text-text-muted mt-0.5 truncate">
                                                            "{n.data.comment_body}"
                                                        </p>
                                                    )}
                                                    {n.type === "coach_application_rejected" && n.data.reason && (
                                                        <p className="text-xs text-text-muted/70 mt-0.5 line-clamp-2">
                                                            {n.data.reason}
                                                        </p>
                                                    )}
                                                    <p className="text-[10px] text-text-muted mt-1">{relativeTime(n.created_at)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Settings */}
                    <button
                        onClick={() => navigate("/settings")}
                        className="p-2 rounded-xl text-text-muted
                            hover:text-primary hover:bg-primary/10 transition-all duration-200 active:scale-95"
                        title="Settings"
                    >
                        <SettingsRoundedIcon sx={{ fontSize: 20 }} />
                    </button>
                </>}

            </div>
        </GlassCard>
    )
}

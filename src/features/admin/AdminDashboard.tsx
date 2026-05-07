import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import Avatar from "../../components/ui/Avatar"
import Logo from "../../components/ui/Logo"
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded"
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded"
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded"
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded"
import CloseRoundedIcon from "@mui/icons-material/CloseRounded"
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded"
import ImageRoundedIcon from "@mui/icons-material/ImageRounded"
import SearchRoundedIcon from "@mui/icons-material/SearchRounded"
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded"
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded"
import HourglassEmptyRoundedIcon from "@mui/icons-material/HourglassEmptyRounded"
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded"
import ScienceRoundedIcon from "@mui/icons-material/ScienceRounded"
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded"
import {
    getUnverifiedIngredientsApi,
    approveIngredientApi,
    deleteIngredientApi,
    type UnverifiedIngredient,
} from "../../services/admin/ingredientsApi"
import {
    getAdminApplicationsApi,
    approveApplicationApi,
    rejectApplicationApi,
    type AdminApplication,
    type AppStatus,
} from "../../services/admin/coachApplicationsApi"
import {
    getAdminUsersApi,
    type AdminUser,
    type AdminUserRole,
} from "../../services/admin/usersApi"

// ─── Types ────────────────────────────────────────────────────────────────────

type AdminSection = "overview" | "applications" | "ingredients" | "users"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeDate(iso: string) {
    const d = new Date(iso)
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function relativeTime(iso: string) {
    const diff = Date.now() - new Date(iso).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    return `${Math.floor(h / 24)}d ago`
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

const glassCard: React.CSSProperties = {
    border: "1px solid var(--glass-border)",
    background: "var(--glass-bg)",
    backdropFilter: "blur(20px)",
}

function StatusBadge({ status }: { status: AppStatus }) {
    const map = {
        pending:  { cls: "text-amber-400 bg-amber-400/10 border-amber-400/20",  label: "Pending",  icon: <HourglassEmptyRoundedIcon sx={{ fontSize: 10 }} /> },
        approved: { cls: "text-primary bg-primary/10 border-primary/20",        label: "Approved", icon: <CheckCircleRoundedIcon sx={{ fontSize: 10 }} /> },
        rejected: { cls: "text-red-400 bg-red-400/10 border-red-400/20",        label: "Rejected", icon: <ErrorRoundedIcon sx={{ fontSize: 10 }} /> },
    }
    const { cls, label, icon } = map[status]
    return (
        <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 sm:px-2 rounded-full text-[10px] sm:text-xs font-medium border ${cls}`}>
            {icon}<span className="hidden sm:inline">{label}</span>
        </span>
    )
}

function RoleBadge({ role }: { role: string }) {
    const map: Record<string, string> = {
        admin:  "text-purple-400 bg-purple-400/10 border-purple-400/20",
        coach:  "text-primary bg-primary/10 border-primary/20",
        client: "text-text-muted bg-[var(--muted-bg)] border-[var(--glass-border)]",
    }
    const cls = map[role] ?? map.client
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
            {role}
        </span>
    )
}

// ─── Overview Section ─────────────────────────────────────────────────────────

const STATS = [
    { label: "Total Users",        value: "12,847", sub: "+124 today",        color: "text-primary",    dot: "bg-primary" },
    { label: "Coach Applications", value: "18",     sub: "3 pending review",  color: "text-amber-400",  dot: "bg-amber-400" },
    { label: "Meals Logged",       value: "48,291", sub: "+892 today",        color: "text-blue-400",   dot: "bg-blue-400" },
    { label: "Active Today",       value: "1,203",  sub: "9.4% of users",     color: "text-pink-400",   dot: "bg-pink-400" },
]

function OverviewSection({ onGoToApps }: { onGoToApps: () => void }) {
    const [recentApps, setRecentApps] = useState<AdminApplication[]>([])

    useEffect(() => {
        getAdminApplicationsApi("pending").then(page => setRecentApps(page.data.slice(0, 3))).catch(() => {})
    }, [])

    return (
        <div className="flex flex-col gap-6 p-4 sm:p-8">
            <div>
                <h2 className="text-lg font-semibold text-text">Overview</h2>
                <p className="text-xs text-text-muted mt-0.5">Platform snapshot for today.</p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {STATS.map(s => (
                    <div key={s.label} className="flex flex-col gap-2 p-4 rounded-2xl" style={glassCard}>
                        <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                            <p className="text-xs text-text-muted">{s.label}</p>
                        </div>
                        <p className={`text-xl sm:text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
                        <p className="text-xs text-text-muted/50">{s.sub}</p>
                    </div>
                ))}
            </div>

            {/* Pending applications preview */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-text">Pending Applications</p>
                    <button onClick={onGoToApps}
                        className="text-xs text-primary hover:text-primary/80 transition-colors">
                        View all →
                    </button>
                </div>
                <div className="flex flex-col gap-2">
                    {recentApps.length === 0 && (
                        <p className="text-xs text-text-muted/40 py-3 text-center">No pending applications.</p>
                    )}
                    {recentApps.map(app => (
                        <div key={app.id} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={glassCard}>
                            <Avatar name={`${app.applicant.first_name} ${app.applicant.last_name}`} size={32} />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-text truncate">
                                    {app.applicant.first_name} {app.applicant.last_name}
                                </p>
                                <p className="text-xs text-text-muted truncate">{app.applicant.email}</p>
                            </div>
                            <p className="text-xs text-text-muted/50 flex-shrink-0">{relativeTime(app.submitted_at)}</p>
                            <StatusBadge status={app.status} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Mock bar chart */}
            <div className="flex flex-col gap-3 p-5 rounded-2xl" style={glassCard}>
                <p className="text-sm font-semibold text-text">New Signups — Last 7 Days</p>
                <div className="flex items-end gap-2 h-24">
                    {[28, 45, 32, 61, 48, 74, 124].map((v, i) => {
                        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
                        const isToday = i === 6
                        return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                                <div className="w-full rounded-t-md transition-all duration-300 relative group"
                                    style={{
                                        height: `${(v / 124) * 80}px`,
                                        background: isToday
                                            ? "linear-gradient(to top, rgba(127,250,136,0.7), rgba(127,250,136,0.3))"
                                            : "rgba(255,255,255,0.06)",
                                        border: isToday ? "1px solid rgba(127,250,136,0.3)" : "1px solid rgba(255,255,255,0.08)",
                                    }}>
                                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-medium opacity-0
                                        group-hover:opacity-100 transition-opacity text-text whitespace-nowrap">{v}</span>
                                </div>
                                <span className={`text-xs ${isToday ? "text-primary" : "text-text-muted/40"}`}>{days[i]}</span>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

// ─── Coach Applications Section ───────────────────────────────────────────────

type AppFilter = "all" | AppStatus

function ApplicationCard({
    app,
    onUpdated,
}: {
    app: AdminApplication
    onUpdated: (updated: AdminApplication) => void
}) {
    const [expanded, setExpanded] = useState(false)
    const [rejecting, setRejecting] = useState(false)
    const [reason, setReason] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleApprove() {
        setLoading(true)
        setError(null)
        try {
            const updated = await approveApplicationApi(app.id)
            onUpdated(updated)
        } catch (e: unknown) {
            const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
            setError(msg ?? "Failed to approve.")
        } finally {
            setLoading(false)
        }
    }

    async function handleReject() {
        if (reason.trim().length < 10) return
        setLoading(true)
        setError(null)
        try {
            const updated = await rejectApplicationApi(app.id, reason.trim())
            onUpdated(updated)
            setRejecting(false)
            setReason("")
        } catch (e: unknown) {
            const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
            setError(msg ?? "Failed to reject.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col rounded-2xl overflow-hidden" style={glassCard}>
            {/* Header row */}
            <div className="flex items-center gap-3 px-4 py-3.5">
                <Avatar name={`${app.applicant.first_name} ${app.applicant.last_name}`} size={36} className="flex-shrink-0" />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-text">
                            {app.applicant.first_name} {app.applicant.last_name}
                        </p>
                        <StatusBadge status={app.status} />
                    </div>
                    <p className="text-xs text-text-muted truncate">{app.applicant.email} · {relativeDate(app.submitted_at)}</p>
                </div>
                <button onClick={() => setExpanded(o => !o)}
                    className="flex-shrink-0 p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-white/5 transition-all">
                    {expanded
                        ? <KeyboardArrowUpRoundedIcon sx={{ fontSize: 18 }} />
                        : <KeyboardArrowDownRoundedIcon sx={{ fontSize: 18 }} />}
                </button>
            </div>

            {/* Expanded body */}
            {expanded && (
                <div className="flex flex-col gap-4 px-4 pb-4 pt-1 border-t" style={{ borderColor: "var(--glass-border)" }}>

                    {/* Description */}
                    <div className="flex flex-col gap-1.5">
                        <p className="text-xs font-medium text-text-muted">Description</p>
                        <p className="text-sm text-text leading-relaxed break-words">{app.description}</p>
                    </div>

                    {/* Documents — clickable links, open in new tab */}
                    {app.documents.length > 0 && (
                        <div className="flex flex-col gap-2">
                            <p className="text-xs font-medium text-text-muted">Documents</p>
                            <div className="flex flex-wrap gap-2">
                                {app.documents.map(doc => (
                                    <a key={doc.id} href={doc.url} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs
                                        hover:border-primary/30 hover:text-text transition-colors"
                                        style={{ border: "1px solid var(--glass-border)", background: "rgba(255,255,255,0.03)" }}>
                                        {doc.type === "certificate"
                                            ? <PictureAsPdfRoundedIcon sx={{ fontSize: 13 }} className="text-red-400" />
                                            : <ImageRoundedIcon sx={{ fontSize: 13 }} className="text-blue-400" />}
                                        <span className="text-text-muted max-w-[140px] truncate">
                                            {doc.original_name ?? (doc.type === "certificate" ? "Certificate" : "Image")}
                                        </span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Rejection reason */}
                    {app.status === "rejected" && app.rejection_reason && (
                        <div className="px-3 py-2.5 rounded-xl text-xs text-red-400/80 leading-relaxed"
                            style={{ background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.15)" }}>
                            <span className="font-medium text-red-400">Rejection reason: </span>
                            {app.rejection_reason}
                        </div>
                    )}

                    {/* Inline error */}
                    {error && (
                        <p className="text-xs text-red-400">{error}</p>
                    )}

                    {/* Actions */}
                    {app.status === "pending" && (
                        <div className="flex flex-col gap-2">
                            {rejecting ? (
                                <div className="flex flex-col gap-2">
                                    <textarea
                                        autoFocus
                                        rows={2}
                                        value={reason}
                                        onChange={e => setReason(e.target.value)}
                                        placeholder="Reason for rejection (min 10 chars)…"
                                        className="w-full text-xs text-text bg-[var(--input-bg)] border border-[var(--input-border)]
                                        rounded-xl px-3 py-2 outline-none focus:border-red-400/40 focus:bg-red-400/5
                                        resize-none transition-all duration-200 placeholder:text-text-muted/30"
                                    />
                                    <div className="flex gap-2">
                                        <button onClick={handleReject}
                                            disabled={reason.trim().length < 10 || loading}
                                            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold
                                            bg-red-500/90 text-white hover:bg-red-500 disabled:opacity-40 transition-all">
                                            {loading
                                                ? <span className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" />
                                                : <CloseRoundedIcon sx={{ fontSize: 13 }} />}
                                            Confirm Reject
                                        </button>
                                        <button onClick={() => { setRejecting(false); setReason(""); setError(null) }}
                                            disabled={loading}
                                            className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-text-muted
                                            border border-[var(--glass-border)] hover:border-primary/20 hover:text-text transition-all">
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <button onClick={handleApprove} disabled={loading}
                                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold
                                        hover:opacity-90 disabled:opacity-50 transition-all"
                                        style={{ background: "var(--btn-bg)", color: "var(--btn-text)" }}>
                                        {loading
                                            ? <span className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" />
                                            : <CheckCircleRoundedIcon sx={{ fontSize: 13 }} />}
                                        Approve
                                    </button>
                                    <button onClick={() => { setRejecting(true); setError(null) }} disabled={loading}
                                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold
                                        text-red-400 border border-red-400/20 hover:bg-red-400/10
                                        disabled:opacity-50 transition-all">
                                        <CloseRoundedIcon sx={{ fontSize: 13 }} />
                                        Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

function ApplicationsSection() {
    const [applications, setApplications] = useState<AdminApplication[]>([])
    const [filter, setFilter] = useState<AppFilter>("all")
    const [nextCursor, setNextCursor] = useState<string | null>(null)
    const [hasMore, setHasMore] = useState(false)
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const load = useCallback(async (f: AppFilter, cursor?: string) => {
        try {
            const page = await getAdminApplicationsApi(f, cursor)
            setApplications(prev => cursor ? [...prev, ...page.data] : page.data)
            setNextCursor(page.next_cursor)
            setHasMore(page.has_more)
        } catch {
            setError("Failed to load applications.")
        }
    }, [])

    useEffect(() => {
        setLoading(true)
        setError(null)
        setApplications([])
        load(filter).finally(() => setLoading(false))
    }, [filter, load])

    async function loadMore() {
        if (!nextCursor || loadingMore) return
        setLoadingMore(true)
        await load(filter, nextCursor)
        setLoadingMore(false)
    }

    function handleUpdated(updated: AdminApplication) {
        setApplications(prev => prev.map(a => a.id === updated.id ? updated : a))
    }

    const FILTERS: { key: AppFilter; label: string }[] = [
        { key: "all",      label: "All" },
        { key: "pending",  label: "Pending" },
        { key: "approved", label: "Approved" },
        { key: "rejected", label: "Rejected" },
    ]

    return (
        <div className="flex flex-col gap-5 p-4 sm:p-8">
            <div>
                <h2 className="text-lg font-semibold text-text">Coach Applications</h2>
                <p className="text-xs text-text-muted mt-0.5">Review and action incoming coach applications.</p>
            </div>

            {/* Filter tabs */}
            <div className="overflow-x-auto no-scrollbar">
                <div className="flex gap-1 p-1 rounded-xl w-fit min-w-full sm:min-w-0" style={{ background: "var(--input-bg)", border: "1px solid var(--glass-border)" }}>
                    {FILTERS.map(f => (
                        <button key={f.key} onClick={() => setFilter(f.key)}
                            className={`flex-shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
                            ${filter === f.key
                                ? "bg-primary text-black shadow-sm"
                                : "text-text-muted hover:text-text"}`}>
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* States */}
            {loading && (
                <div className="flex justify-center py-12">
                    <span className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
            )}
            {!loading && error && <p className="text-xs text-red-400 py-6 text-center">{error}</p>}

            {/* Application list */}
            {!loading && !error && (
                <div className="flex flex-col gap-3">
                    {applications.length === 0 ? (
                        <p className="text-xs text-text-muted/50 py-6 text-center">No applications in this category.</p>
                    ) : (
                        applications.map(app => (
                            <ApplicationCard key={app.id} app={app} onUpdated={handleUpdated} />
                        ))
                    )}

                    {hasMore && (
                        <button onClick={loadMore} disabled={loadingMore}
                            className="mt-1 self-center flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-medium
                            text-text-muted border border-[var(--glass-border)] hover:border-primary/30 hover:text-text
                            disabled:opacity-50 transition-all">
                            {loadingMore && <span className="w-3.5 h-3.5 rounded-full border border-current border-t-transparent animate-spin" />}
                            Load more
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}

// ─── Users Section ────────────────────────────────────────────────────────────

function UsersSection() {
    const [users, setUsers]           = useState<AdminUser[]>([])
    const [query, setQuery]           = useState("")
    const [debouncedQuery, setDebouncedQuery] = useState("")
    const [roleFilter, setRoleFilter] = useState<AdminUserRole | "all">("all")
    const [nextCursor, setNextCursor] = useState<string | null>(null)
    const [hasMore, setHasMore]       = useState(false)
    const [loading, setLoading]       = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [error, setError]           = useState<string | null>(null)

    // Debounce search so we don't fire on every keystroke
    useEffect(() => {
        const t = setTimeout(() => setDebouncedQuery(query), 350)
        return () => clearTimeout(t)
    }, [query])

    const load = useCallback(async (q: string, role: AdminUserRole | "all", cursor?: string) => {
        try {
            const page = await getAdminUsersApi({ search: q || undefined, role, cursor })
            setUsers(prev => cursor ? [...prev, ...page.data] : page.data)
            setNextCursor(page.next_cursor)
            setHasMore(page.has_more)
        } catch {
            setError("Failed to load users.")
        }
    }, [])

    useEffect(() => {
        setLoading(true)
        setError(null)
        setUsers([])
        load(debouncedQuery, roleFilter).finally(() => setLoading(false))
    }, [debouncedQuery, roleFilter, load])

    async function loadMore() {
        if (!nextCursor || loadingMore) return
        setLoadingMore(true)
        await load(debouncedQuery, roleFilter, nextCursor)
        setLoadingMore(false)
    }

    const ROLE_FILTERS: { key: AdminUserRole | "all"; label: string }[] = [
        { key: "all",    label: "All" },
        { key: "client", label: "Clients" },
        { key: "coach",  label: "Coaches" },
        { key: "admin",  label: "Admins" },
    ]

    return (
        <div className="flex flex-col gap-5 p-4 sm:p-8">
            <div>
                <h2 className="text-lg font-semibold text-text">Users</h2>
                <p className="text-xs text-text-muted mt-0.5">Platform members.</p>
            </div>

            {/* Controls */}
            <div className="flex flex-col gap-3">
                {/* Search */}
                <div className="relative">
                    <SearchRoundedIcon sx={{ fontSize: 16 }}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted/40 pointer-events-none" />
                    <input
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Search by name or email…"
                        className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl pl-9 pr-4 py-2.5 text-sm text-text
                        outline-none focus:border-primary/50 focus:bg-primary/5 transition-all duration-200
                        placeholder:text-text-muted/30"
                    />
                </div>

                {/* Role filter tabs — scrollable on mobile */}
                <div className="overflow-x-auto no-scrollbar">
                    <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: "var(--input-bg)", border: "1px solid var(--glass-border)" }}>
                        {ROLE_FILTERS.map(f => (
                            <button key={f.key} onClick={() => setRoleFilter(f.key)}
                                className={`flex-shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
                                ${roleFilter === f.key ? "bg-primary text-black shadow-sm" : "text-text-muted hover:text-text"}`}>
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* States */}
            {loading && (
                <div className="flex justify-center py-12">
                    <span className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
            )}
            {!loading && error && <p className="text-xs text-red-400 py-6 text-center">{error}</p>}

            {/* Card grid */}
            {!loading && !error && (
                <div className="flex flex-col gap-4">
                    {users.length === 0 ? (
                        <p className="text-xs text-text-muted/50 py-8 text-center">No users match your filters.</p>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            {users.map(u => {
                                const isActive = u.onboarding_step === "complete"
                                return (
                                    <div key={u.id}
                                        className="flex flex-col items-center gap-2.5 p-4 rounded-2xl text-center"
                                        style={{ border: "1px solid var(--glass-border)", background: "var(--glass-bg)" }}>
                                        <Avatar
                                            src={u.image.avatar}
                                            name={`${u.first_name} ${u.last_name}`}
                                            size={44}
                                        />
                                        <div className="w-full min-w-0">
                                            <p className="text-sm font-medium text-text truncate">
                                                {u.first_name} {u.last_name}
                                            </p>
                                            {u.country.name && (
                                                <p className="text-[10px] text-text-muted/40 truncate mt-0.5">{u.country.name}</p>
                                            )}
                                        </div>
                                        <RoleBadge role={u.role} />
                                        <div className="flex items-center gap-1.5 flex-wrap justify-center">
                                            <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border
                                                ${isActive
                                                    ? "text-primary/70 bg-primary/8 border-primary/15"
                                                    : "text-amber-400/70 bg-amber-400/8 border-amber-400/15"}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-primary" : "bg-amber-400"}`} />
                                                {isActive ? "Active" : "Onboarding"}
                                            </span>
                                            {!u.verified && (
                                                <span className="text-[10px] text-text-muted/40">unverified</span>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-text-muted/40 truncate w-full">{u.email}</p>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {hasMore && (
                        <button onClick={loadMore} disabled={loadingMore}
                            className="mt-1 self-center flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-medium
                            text-text-muted border border-[var(--glass-border)] hover:border-primary/30 hover:text-text
                            disabled:opacity-50 transition-all">
                            {loadingMore && <span className="w-3.5 h-3.5 rounded-full border border-current border-t-transparent animate-spin" />}
                            Load more
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}

// ─── Ingredients Section ──────────────────────────────────────────────────────

function IngredientsSection() {
    const [items, setItems] = useState<UnverifiedIngredient[]>([])
    const [nextCursor, setNextCursor] = useState<string | null>(null)
    const [hasMore, setHasMore] = useState(true)
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [actioningId, setActioningId] = useState<number | null>(null)

    const load = useCallback(async (cursor?: string) => {
        try {
            const page = await getUnverifiedIngredientsApi(cursor)
            setItems(prev => cursor ? [...prev, ...page.data] : page.data)
            setNextCursor(page.next_cursor)
            setHasMore(page.has_more)
        } catch {
            setError("Failed to load ingredients.")
        }
    }, [])

    useEffect(() => {
        load().finally(() => setLoading(false))
    }, [load])

    async function loadMore() {
        if (!nextCursor || loadingMore) return
        setLoadingMore(true)
        await load(nextCursor)
        setLoadingMore(false)
    }

    async function handleApprove(id: number) {
        setActioningId(id)
        try {
            await approveIngredientApi(id)
            setItems(prev => prev.filter(i => i.id !== id))
        } catch {
            // already verified or error — silently ignore, item stays
        } finally {
            setActioningId(null)
        }
    }

    async function handleDelete(id: number) {
        setActioningId(id)
        try {
            await deleteIngredientApi(id)
            setItems(prev => prev.filter(i => i.id !== id))
        } catch {
            // not found — remove anyway
            setItems(prev => prev.filter(i => i.id !== id))
        } finally {
            setActioningId(null)
        }
    }

    return (
        <div className="flex flex-col gap-5 p-4 sm:p-8">
            <div>
                <h2 className="text-lg font-semibold text-text">Verify Ingredients</h2>
                <p className="text-xs text-text-muted mt-0.5">User-submitted ingredients awaiting review.</p>
            </div>

            {loading && (
                <div className="flex justify-center py-12">
                    <span className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
            )}

            {!loading && error && (
                <p className="text-xs text-red-400 py-6 text-center">{error}</p>
            )}

            {!loading && !error && items.length === 0 && (
                <div className="flex flex-col items-center gap-2 py-12 text-center">
                    <CheckCircleRoundedIcon sx={{ fontSize: 32 }} className="text-primary/40" />
                    <p className="text-sm text-text-muted">All caught up — no unverified ingredients.</p>
                </div>
            )}

            {!loading && items.length > 0 && (
                <div className="flex flex-col gap-2">
                    {/* Header */}
                    <div className="hidden sm:grid grid-cols-[1fr_1fr_80px_100px] gap-4 px-4 py-2">
                        {["English Name", "Arabic Name", "Source", "Submitted"].map(h => (
                            <p key={h} className="text-xs font-medium text-text-muted/50 uppercase tracking-wider">{h}</p>
                        ))}
                    </div>

                    {items.map(item => {
                        const actioning = actioningId === item.id
                        return (
                            <div key={item.id}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                                style={{ border: "1px solid var(--glass-border)", background: "var(--glass-bg)" }}>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-text truncate">{item.name_en}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-xs px-1.5 py-px rounded-full border text-blue-400 bg-blue-400/8 border-blue-400/20">
                                            {item.source}
                                        </span>
                                        {item.name_ar && (
                                            <p className="text-xs text-text-muted truncate">{item.name_ar}</p>
                                        )}
                                        <p className="text-xs text-text-muted/40 flex-shrink-0 hidden sm:block">
                                            {relativeDate(item.submitted_at)}
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                    <button
                                        onClick={() => handleApprove(item.id)}
                                        disabled={actioning}
                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold
                                        hover:opacity-90 disabled:opacity-40 transition-all"
                                        style={{ background: "var(--btn-bg)", color: "var(--btn-text)" }}>
                                        {actioning
                                            ? <span className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" />
                                            : <CheckCircleRoundedIcon sx={{ fontSize: 13 }} />}
                                        <span className="hidden sm:inline ml-0.5">Approve</span>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        disabled={actioning}
                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold
                                        text-red-400 border border-red-400/20 hover:bg-red-400/10
                                        disabled:opacity-40 transition-all">
                                        {actioning
                                            ? <span className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" />
                                            : <DeleteRoundedIcon sx={{ fontSize: 13 }} />}
                                        <span className="hidden sm:inline ml-0.5">Delete</span>
                                    </button>
                                </div>
                            </div>
                        )
                    })}

                    {hasMore && (
                        <button
                            onClick={loadMore}
                            disabled={loadingMore}
                            className="mt-2 self-center flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-medium
                            text-text-muted border border-[var(--glass-border)] hover:border-primary/30 hover:text-text
                            disabled:opacity-50 transition-all">
                            {loadingMore
                                ? <span className="w-3.5 h-3.5 rounded-full border border-current border-t-transparent animate-spin" />
                                : null}
                            Load more
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}

// ─── Sidebar Nav ──────────────────────────────────────────────────────────────

const NAV: { key: AdminSection; label: string; mobileLabel: string; icon: React.ReactNode }[] = [
    { key: "overview",     label: "Overview",     mobileLabel: "Overview",  icon: <DashboardRoundedIcon sx={{ fontSize: 17 }} /> },
    { key: "applications", label: "Applications", mobileLabel: "Apps",      icon: <WorkspacePremiumRoundedIcon sx={{ fontSize: 17 }} /> },
    { key: "ingredients",  label: "Ingredients",  mobileLabel: "Verify",    icon: <ScienceRoundedIcon sx={{ fontSize: 17 }} /> },
    { key: "users",        label: "Users",        mobileLabel: "Users",     icon: <PeopleAltRoundedIcon sx={{ fontSize: 17 }} /> },
]

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

export default function AdminDashboard() {
    const navigate = useNavigate()
    const [section, setSection] = useState<AdminSection>("overview")

    return (
        <div className="fixed inset-0 overflow-hidden flex flex-col" style={{ background: "var(--background)", zIndex: 50 }}>

            {/* Top bar */}
            <header className="flex-shrink-0 h-14 px-4 sm:px-5 flex items-center justify-between border-b"
                style={{ borderColor: "var(--glass-border)", background: "var(--glass-bg)", backdropFilter: "blur(20px)" }}>
                <div className="flex items-center gap-2.5">
                    <Logo />
                    <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-sm tracking-tight">
                            <span className="text-primary">Nutri</span>
                            <span className="text-text">Sphere</span>
                        </span>
                        <span className="text-text-muted/30 text-sm hidden sm:inline">·</span>
                        <span className="text-xs font-medium text-text-muted/60 tracking-wider uppercase hidden sm:inline">Admin</span>
                    </div>
                </div>
                <button onClick={() => navigate("/stats")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-text-muted
                    border border-[var(--glass-border)] hover:border-primary/30 hover:text-text transition-all duration-200">
                    <ArrowBackRoundedIcon sx={{ fontSize: 13 }} />
                    <span className="hidden sm:inline">Back to app</span>
                </button>
            </header>

            <div className="flex flex-1 min-h-0 overflow-hidden">

                {/* Sidebar — desktop */}
                <aside className="hidden sm:flex flex-col w-52 flex-shrink-0 border-r p-3 gap-1 overflow-y-auto"
                    style={{ borderColor: "var(--glass-border)", background: "rgba(255,255,255,0.01)" }}>
                    {NAV.map(({ key, label, icon }) => (
                    <button key={key} onClick={() => setSection(key)}
                            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium
                            transition-all duration-200 text-left w-full
                            ${section === key
                                ? "bg-primary/15 text-primary"
                                : "text-text-muted hover:text-text hover:bg-white/5"}`}>
                            {icon}{label}
                        </button>
                    ))}
                </aside>

                {/* Main content */}
                <main className="flex-1 overflow-y-auto">
                    {section === "overview"     && <OverviewSection onGoToApps={() => setSection("applications")} />}
                    {section === "applications" && <ApplicationsSection />}
                    {section === "ingredients"  && <IngredientsSection />}
                    {section === "users"        && <UsersSection />}
                </main>
            </div>

            {/* Mobile tab bar */}
            <div className="sm:hidden flex-shrink-0 flex border-t"
                style={{ borderColor: "var(--glass-border)", background: "var(--glass-bg)", backdropFilter: "blur(20px)" }}>
                {NAV.map(({ key, icon, mobileLabel }) => (
                    <button key={key} onClick={() => setSection(key)}
                        className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors
                        ${section === key ? "text-primary" : "text-text-muted"}`}>
                        {icon}
                        <span className="text-[10px]">{mobileLabel}</span>
                    </button>
                ))}
            </div>
        </div>
    )
}

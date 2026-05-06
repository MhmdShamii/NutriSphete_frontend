import { useState } from "react"
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
import PersonRoundedIcon from "@mui/icons-material/PersonRounded"

// ─── Types ────────────────────────────────────────────────────────────────────

type AppStatus = "pending" | "approved" | "rejected"

type MockDoc = { id: number; type: "certificate" | "image"; original_name: string }

type MockApplication = {
    id: number
    user: { id: number; first_name: string; last_name: string; email: string }
    description: string
    status: AppStatus
    rejection_reason: string | null
    documents: MockDoc[]
    submitted_at: string
}

type MockUser = {
    id: number
    first_name: string
    last_name: string
    email: string
    role: "user" | "coach" | "admin"
    onboarding_step: string
    created_at: string
}

type AdminSection = "overview" | "applications" | "users"

// ─── Mock Data ────────────────────────────────────────────────────────────────

const INITIAL_APPLICATIONS: MockApplication[] = [
    {
        id: 1,
        user: { id: 10, first_name: "Sarah", last_name: "Mitchell", email: "sarah.m@example.com" },
        description: "I am a certified nutritionist with 8 years of experience working with athletes and fitness enthusiasts. I hold certifications from the Academy of Nutrition and Dietetics and have helped over 200 clients achieve their health goals. My approach combines evidence-based nutrition science with practical, sustainable meal planning.",
        status: "pending",
        rejection_reason: null,
        documents: [
            { id: 1, type: "certificate", original_name: "nutritionist-cert.pdf" },
            { id: 2, type: "image", original_name: "client-results.jpg" },
        ],
        submitted_at: "2026-05-06T09:30:00Z",
    },
    {
        id: 2,
        user: { id: 11, first_name: "James", last_name: "Okonkwo", email: "james.o@example.com" },
        description: "Personal trainer and sports nutritionist with 5 years of experience. BSc in Sports Science from UCL. Specialized in muscle gain and body recomposition for intermediate to advanced lifters. I have coached over 100 clients both in-person and online.",
        status: "pending",
        rejection_reason: null,
        documents: [
            { id: 3, type: "certificate", original_name: "pt-license.pdf" },
        ],
        submitted_at: "2026-05-05T16:45:00Z",
    },
    {
        id: 3,
        user: { id: 12, first_name: "Amira", last_name: "Hassan", email: "amira.h@example.com" },
        description: "Registered dietitian with a focus on gut health and plant-based nutrition. 6 years of clinical experience. Published researcher in dietary interventions for metabolic syndrome. Fluent in Arabic and English.",
        status: "approved",
        rejection_reason: null,
        documents: [
            { id: 4, type: "certificate", original_name: "dietitian-reg.pdf" },
            { id: 5, type: "certificate", original_name: "research-paper.pdf" },
            { id: 6, type: "image", original_name: "clinic-photo.jpg" },
        ],
        submitted_at: "2026-05-03T11:00:00Z",
    },
    {
        id: 4,
        user: { id: 13, first_name: "Tyler", last_name: "Brooks", email: "tyler.b@example.com" },
        description: "Fitness coach and meal prep enthusiast. I help people lose weight fast with my proven 30-day system.",
        status: "rejected",
        rejection_reason: "Application lacks sufficient credentials or professional qualifications. Please reapply with relevant certifications.",
        documents: [],
        submitted_at: "2026-05-01T08:00:00Z",
    },
    {
        id: 5,
        user: { id: 14, first_name: "Priya", last_name: "Nair", email: "priya.n@example.com" },
        description: "Certified holistic health coach and yoga instructor with 10 years of experience. I specialise in stress-related weight gain, hormonal imbalance, and mindful eating. My clients have seen remarkable transformations through a whole-body approach.",
        status: "pending",
        rejection_reason: null,
        documents: [
            { id: 7, type: "certificate", original_name: "health-coach-cert.pdf" },
            { id: 8, type: "certificate", original_name: "yoga-cert.pdf" },
            { id: 9, type: "image", original_name: "testimonials.jpg" },
        ],
        submitted_at: "2026-05-06T07:15:00Z",
    },
]

const MOCK_USERS: MockUser[] = [
    { id: 1,  first_name: "Alex",   last_name: "Chen",     email: "alex@example.com",   role: "user",  onboarding_step: "complete",  created_at: "2026-01-15T00:00:00Z" },
    { id: 2,  first_name: "Maria",  last_name: "Santos",   email: "maria@example.com",  role: "coach", onboarding_step: "complete",  created_at: "2026-01-20T00:00:00Z" },
    { id: 3,  first_name: "David",  last_name: "Kim",      email: "david@example.com",  role: "user",  onboarding_step: "complete",  created_at: "2026-02-01T00:00:00Z" },
    { id: 4,  first_name: "Emma",   last_name: "Wilson",   email: "emma@example.com",   role: "user",  onboarding_step: "targets",   created_at: "2026-02-10T00:00:00Z" },
    { id: 5,  first_name: "Noah",   last_name: "Patel",    email: "noah@example.com",   role: "user",  onboarding_step: "complete",  created_at: "2026-02-15T00:00:00Z" },
    { id: 6,  first_name: "Sofia",  last_name: "Rossi",    email: "sofia@example.com",  role: "coach", onboarding_step: "complete",  created_at: "2026-03-01T00:00:00Z" },
    { id: 7,  first_name: "Lucas",  last_name: "Martin",   email: "lucas@example.com",  role: "user",  onboarding_step: "complete",  created_at: "2026-03-10T00:00:00Z" },
    { id: 8,  first_name: "Yuki",   last_name: "Tanaka",   email: "yuki@example.com",   role: "user",  onboarding_step: "basic_info",created_at: "2026-04-01T00:00:00Z" },
    { id: 9,  first_name: "Omar",   last_name: "Farouq",   email: "omar@example.com",   role: "user",  onboarding_step: "complete",  created_at: "2026-04-05T00:00:00Z" },
    { id: 10, first_name: "Sarah",  last_name: "Mitchell", email: "sarah.m@example.com",role: "user",  onboarding_step: "complete",  created_at: "2026-04-10T00:00:00Z" },
    { id: 11, first_name: "James",  last_name: "Okonkwo",  email: "james.o@example.com",role: "user",  onboarding_step: "complete",  created_at: "2026-04-12T00:00:00Z" },
    { id: 12, first_name: "Amira",  last_name: "Hassan",   email: "amira.h@example.com",role: "coach", onboarding_step: "complete",  created_at: "2026-04-15T00:00:00Z" },
]

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

function RoleBadge({ role }: { role: MockUser["role"] }) {
    const map = {
        admin: "text-purple-400 bg-purple-400/10 border-purple-400/20",
        coach: "text-primary bg-primary/10 border-primary/20",
        user:  "text-text-muted bg-white/5 border-white/10",
    }
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${map[role]}`}>
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
    const recentApps = INITIAL_APPLICATIONS.filter(a => a.status === "pending").slice(0, 3)

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
                        <p className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
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
                    {recentApps.map(app => (
                        <div key={app.id} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={glassCard}>
                            <Avatar name={`${app.user.first_name} ${app.user.last_name}`} size={32} />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-text truncate">
                                    {app.user.first_name} {app.user.last_name}
                                </p>
                                <p className="text-xs text-text-muted truncate">{app.user.email}</p>
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
    onApprove,
    onReject,
}: {
    app: MockApplication
    onApprove: (id: number) => void
    onReject:  (id: number, reason: string) => void
}) {
    const [expanded, setExpanded] = useState(false)
    const [rejecting, setRejecting] = useState(false)
    const [reason, setReason] = useState("")

    function submitReject() {
        if (!reason.trim()) return
        onReject(app.id, reason.trim())
        setRejecting(false)
        setReason("")
    }

    return (
        <div className="flex flex-col rounded-2xl overflow-hidden" style={glassCard}>
            {/* Header row */}
            <div className="flex items-center gap-3 px-4 py-3.5">
                <Avatar name={`${app.user.first_name} ${app.user.last_name}`} size={36} className="flex-shrink-0" />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-text">
                            {app.user.first_name} {app.user.last_name}
                        </p>
                        <StatusBadge status={app.status} />
                    </div>
                    <p className="text-xs text-text-muted truncate">{app.user.email} · {relativeDate(app.submitted_at)}</p>
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

                    {/* Documents */}
                    {app.documents.length > 0 && (
                        <div className="flex flex-col gap-2">
                            <p className="text-xs font-medium text-text-muted">Documents</p>
                            <div className="flex flex-wrap gap-2">
                                {app.documents.map(doc => (
                                    <div key={doc.id}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs"
                                        style={{ border: "1px solid var(--glass-border)", background: "rgba(255,255,255,0.03)" }}>
                                        {doc.type === "certificate"
                                            ? <PictureAsPdfRoundedIcon sx={{ fontSize: 13 }} className="text-red-400" />
                                            : <ImageRoundedIcon sx={{ fontSize: 13 }} className="text-blue-400" />}
                                        <span className="text-text-muted max-w-[140px] truncate">{doc.original_name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Rejection reason (if already rejected) */}
                    {app.status === "rejected" && app.rejection_reason && (
                        <div className="px-3 py-2.5 rounded-xl text-xs text-red-400/80 leading-relaxed"
                            style={{ background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.15)" }}>
                            <span className="font-medium text-red-400">Rejection reason: </span>
                            {app.rejection_reason}
                        </div>
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
                                        placeholder="Reason for rejection…"
                                        className="w-full text-xs text-text bg-white/5 border border-white/10 rounded-xl px-3 py-2
                                        outline-none focus:border-red-400/40 focus:bg-red-400/5 resize-none
                                        transition-all duration-200 placeholder:text-text-muted/30"
                                    />
                                    <div className="flex gap-2">
                                        <button onClick={submitReject} disabled={!reason.trim()}
                                            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold
                                            bg-red-500/90 text-white hover:bg-red-500 disabled:opacity-40 transition-all">
                                            <CloseRoundedIcon sx={{ fontSize: 13 }} />
                                            Confirm Reject
                                        </button>
                                        <button onClick={() => { setRejecting(false); setReason("") }}
                                            className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-text-muted
                                            border border-white/10 hover:border-white/20 hover:text-text transition-all">
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <button onClick={() => onApprove(app.id)}
                                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold
                                        hover:opacity-90 transition-all"
                                        style={{ background: "var(--btn-bg)", color: "var(--btn-text)" }}>
                                        <CheckCircleRoundedIcon sx={{ fontSize: 13 }} />
                                        Approve
                                    </button>
                                    <button onClick={() => setRejecting(true)}
                                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold
                                        text-red-400 border border-red-400/20 hover:bg-red-400/10 transition-all">
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
    const [applications, setApplications] = useState(INITIAL_APPLICATIONS)
    const [filter, setFilter] = useState<AppFilter>("all")

    const counts = {
        all:      applications.length,
        pending:  applications.filter(a => a.status === "pending").length,
        approved: applications.filter(a => a.status === "approved").length,
        rejected: applications.filter(a => a.status === "rejected").length,
    }

    const visible = filter === "all" ? applications : applications.filter(a => a.status === filter)

    function handleApprove(id: number) {
        setApplications(prev => prev.map(a => a.id === id ? { ...a, status: "approved" } : a))
    }

    function handleReject(id: number, reason: string) {
        setApplications(prev => prev.map(a => a.id === id ? { ...a, status: "rejected", rejection_reason: reason } : a))
    }

    const FILTERS: { key: AppFilter; label: string }[] = [
        { key: "all",      label: `All (${counts.all})` },
        { key: "pending",  label: `Pending (${counts.pending})` },
        { key: "approved", label: `Approved (${counts.approved})` },
        { key: "rejected", label: `Rejected (${counts.rejected})` },
    ]

    return (
        <div className="flex flex-col gap-5 p-4 sm:p-8">
            <div>
                <h2 className="text-lg font-semibold text-text">Coach Applications</h2>
                <p className="text-xs text-text-muted mt-0.5">Review and action incoming coach applications.</p>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--glass-border)" }}>
                {FILTERS.map(f => (
                    <button key={f.key} onClick={() => setFilter(f.key)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
                        ${filter === f.key
                            ? "bg-primary text-black shadow-sm"
                            : "text-text-muted hover:text-text"}`}>
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Application list */}
            <div className="flex flex-col gap-3">
                {visible.length === 0 ? (
                    <p className="text-xs text-text-muted/50 py-6 text-center">No applications in this category.</p>
                ) : (
                    visible.map(app => (
                        <ApplicationCard key={app.id} app={app} onApprove={handleApprove} onReject={handleReject} />
                    ))
                )}
            </div>
        </div>
    )
}

// ─── Users Section ────────────────────────────────────────────────────────────

function UsersSection() {
    const [query, setQuery] = useState("")

    const filtered = MOCK_USERS.filter(u =>
        `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase().includes(query.toLowerCase())
    )

    return (
        <div className="flex flex-col gap-5 p-4 sm:p-8">
            <div>
                <h2 className="text-lg font-semibold text-text">Users</h2>
                <p className="text-xs text-text-muted mt-0.5">{MOCK_USERS.length} total members on the platform.</p>
            </div>

            {/* Search */}
            <div className="relative">
                <SearchRoundedIcon sx={{ fontSize: 16 }}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted/40 pointer-events-none" />
                <input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search by name or email…"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-text
                    outline-none focus:border-primary/50 focus:bg-primary/5 transition-all duration-200
                    placeholder:text-text-muted/30"
                />
            </div>

            {/* Table */}
            <div className="flex flex-col gap-1.5">
                {/* Header */}
                <div className="hidden sm:grid grid-cols-[1fr_1.5fr_80px_100px_90px] gap-4 px-4 py-2">
                    {["User", "Email", "Role", "Status", "Joined"].map(h => (
                        <p key={h} className="text-xs font-medium text-text-muted/50 uppercase tracking-wider">{h}</p>
                    ))}
                </div>

                {filtered.map(u => (
                    <div key={u.id}
                        className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_1.5fr_80px_100px_90px] gap-4 items-center
                        px-4 py-3 rounded-xl transition-colors hover:bg-white/3"
                        style={{ border: "1px solid var(--glass-border)", background: "var(--glass-bg)" }}>

                        <div className="flex items-center gap-2.5 min-w-0">
                            <Avatar name={`${u.first_name} ${u.last_name}`} size={28} className="flex-shrink-0" />
                            <p className="text-sm font-medium text-text truncate">{u.first_name} {u.last_name}</p>
                        </div>

                        <p className="hidden sm:block text-xs text-text-muted truncate">{u.email}</p>

                        <div className="hidden sm:block">
                            <RoleBadge role={u.role} />
                        </div>

                        <div className="hidden sm:block">
                            <span className={`text-xs px-2 py-0.5 rounded-full border
                                ${u.onboarding_step === "complete"
                                    ? "text-primary/70 bg-primary/8 border-primary/15"
                                    : "text-amber-400/70 bg-amber-400/8 border-amber-400/15"}`}>
                                {u.onboarding_step === "complete" ? "Active" : "Onboarding"}
                            </span>
                        </div>

                        <p className="text-xs text-text-muted/50">
                            {new Date(u.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                    </div>
                ))}

                {filtered.length === 0 && (
                    <p className="text-xs text-text-muted/50 py-8 text-center">No users match your search.</p>
                )}
            </div>
        </div>
    )
}

// ─── Sidebar Nav ──────────────────────────────────────────────────────────────

const NAV: { key: AdminSection; label: string; icon: React.ReactNode }[] = [
    { key: "overview",      label: "Overview",     icon: <DashboardRoundedIcon sx={{ fontSize: 17 }} /> },
    { key: "applications",  label: "Applications", icon: <WorkspacePremiumRoundedIcon sx={{ fontSize: 17 }} /> },
    { key: "users",         label: "Users",        icon: <PeopleAltRoundedIcon sx={{ fontSize: 17 }} /> },
]

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

export default function AdminDashboard() {
    const navigate = useNavigate()
    const [section, setSection] = useState<AdminSection>("overview")

    return (
        <div className="fixed inset-0 overflow-hidden flex flex-col" style={{ background: "var(--background)", zIndex: 50 }}>

            {/* Top bar */}
            <header className="flex-shrink-0 h-14 px-5 flex items-center justify-between border-b"
                style={{ borderColor: "var(--glass-border)", background: "var(--glass-bg)", backdropFilter: "blur(20px)" }}>
                <div className="flex items-center gap-3">
                    <Logo />
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm tracking-tight">
                            <span className="text-primary">Nutri</span>
                            <span className="text-text">Sphere</span>
                        </span>
                        <span className="text-text-muted/30 text-sm">·</span>
                        <span className="text-xs font-medium text-text-muted/60 tracking-wider uppercase">Admin</span>
                    </div>
                </div>
                <button onClick={() => navigate("/stats")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-text-muted
                    border border-white/10 hover:border-white/20 hover:text-text transition-all duration-200">
                    <ArrowBackRoundedIcon sx={{ fontSize: 13 }} />
                    Back to app
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
                    {section === "users"        && <UsersSection />}
                </main>
            </div>

            {/* Mobile tab bar */}
            <div className="sm:hidden flex-shrink-0 flex border-t"
                style={{ borderColor: "var(--glass-border)", background: "var(--glass-bg)", backdropFilter: "blur(20px)" }}>
                {NAV.map(({ key, icon, label }) => (
                    <button key={key} onClick={() => setSection(key)}
                        className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors
                        ${section === key ? "text-primary" : "text-text-muted"}`}>
                        {icon}
                        <span className="text-[10px]">{label}</span>
                    </button>
                ))}
            </div>
        </div>
    )
}

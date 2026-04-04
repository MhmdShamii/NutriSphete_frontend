import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { logout } from "../../features/auth/authSlice"
import type { AppDispatch } from "../../app/store"
import type { AuthUser } from "../../features/auth/types"
import GlassCard from "../ui/GlassCard"
import Logo from "../ui/Logo"
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded"
import PersonRoundedIcon from "@mui/icons-material/PersonRounded"
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded"
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded"
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"

const menuItems = [
    { label: "Profile", icon: <PersonRoundedIcon sx={{ fontSize: 16 }} />, path: "/profile" },
    { label: "Settings", icon: <SettingsRoundedIcon sx={{ fontSize: 16 }} />, path: "/settings" },
]

export default function TopBar({ user }: { user: AuthUser }) {
    const [menuOpen, setMenuOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)
    const navigate = useNavigate()
    const dispatch = useDispatch<AppDispatch>()

    useEffect(() => {
        function handleOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
        }
        document.addEventListener("mousedown", handleOutside)
        return () => document.removeEventListener("mousedown", handleOutside)
    }, [])

    function handleLogout() {
        dispatch(logout())
        navigate("/auth")
    }

    return (
        <GlassCard className="w-full h-16 px-5 rounded-2xl text-text-muted flex items-center justify-between">

            {/* Brand */}
            <div className="flex items-center gap-2">
                <Logo />
                <span className="font-semibold text-base tracking-tight">
                    <span className="text-primary">Nutri</span>
                    <span className="text-text">Sphere</span>
                </span>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">

                {/* Notification bell */}
                <button className="relative p-2 rounded-xl text-text-muted
                    hover:text-primary hover:bg-primary/10 transition-all duration-200">
                    <NotificationsNoneRoundedIcon sx={{ fontSize: 20 }} />
                    {/* Unread dot */}
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary
                        shadow-[0_0_6px_rgba(127,250,136,0.8)]" />
                </button>

                {/* Profile dropdown */}
                <div ref={menuRef} className="relative">
                    <button
                        onClick={() => setMenuOpen(o => !o)}
                        className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-xl
                            hover:bg-primary/10 transition-all duration-200 active:scale-95"
                    >
                        <div className="relative">
                            <img src={user.image.avatar} alt="avatar"
                                className="h-8 w-8 rounded-full object-cover ring-2 ring-primary/30" />
                            <span className="absolute bottom-0 right-0 w-2 h-2 bg-primary rounded-full ring-2 ring-background" />
                        </div>
                        <span className="text-sm font-medium text-text hidden sm:block">{user.first_name}</span>
                        <KeyboardArrowDownRoundedIcon
                            sx={{ fontSize: 16 }}
                            className={`text-text-muted transition-transform duration-200 hidden sm:block ${menuOpen ? "rotate-180" : ""}`}
                        />
                    </button>

                    {/* Dropdown menu */}
                    <div
                        className="absolute right-0 top-full w-48 rounded-2xl shadow-xl z-50"
                        style={{
                            background: "var(--glass-bg)",
                            border: "1px solid var(--glass-border)",
                            backdropFilter: "blur(20px)",
                            transition: "opacity 250ms ease, transform 250ms ease",
                            opacity: menuOpen ? 1 : 0,
                            transform: menuOpen ? "translateY(12px)" : "translateY(-8px)",
                            pointerEvents: menuOpen ? "auto" : "none",
                        }}
                    >
                        {/* User info header */}
                        <div className="px-4 py-3 border-b border-white/8">
                            <p className="text-sm font-semibold text-text">{user.first_name} {user.last_name}</p>
                            <p className="text-xs text-text-muted truncate">{user.email}</p>
                        </div>

                        {/* Menu items */}
                        <div className="p-1.5 flex flex-col gap-0.5">
                            {menuItems.map(item => (
                                <button
                                    key={item.path}
                                    onClick={() => { navigate(item.path); setMenuOpen(false) }}
                                    className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-text-muted
                                        hover:text-primary hover:bg-primary/10 transition-all duration-150 text-left"
                                >
                                    <span className="text-text-muted group-hover:text-primary">{item.icon}</span>
                                    {item.label}
                                </button>
                            ))}

                            {/* Divider */}
                            <div className="h-px bg-white/8 my-1" />

                            {/* Logout */}
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm
                                    text-red-400 hover:bg-red-400/10 transition-all duration-150 text-left"
                            >
                                <LogoutRoundedIcon sx={{ fontSize: 16 }} />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </GlassCard>
    )
}

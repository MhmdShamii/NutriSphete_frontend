import { NavLink, Link } from "react-router-dom";
import TimelineIcon from '@mui/icons-material/Timeline';
import FoodBankRoundedIcon from '@mui/icons-material/FoodBankRounded';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import GlassCard from "../ui/GlassCard";

function NavItem({ to, icon }: { to: string; icon: React.ReactNode }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) => `
                flex items-center justify-center p-2.5 rounded-xl transition-all duration-200
                active:scale-95
                ${isActive
                    ? "text-primary bg-primary/15 shadow-[0_0_10px_rgba(127,250,136,0.2)]"
                    : "text-text-muted hover:text-primary hover:bg-primary/10"
                }
            `}
        >
            {icon}
        </NavLink>
    )
}

export default function NavBar() {
    return (
        <div className="relative flex flex-col w-fit justify-center items-center h-full gap-4">

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-40 bg-primary/30 blur-3xl rounded-full pointer-events-none z-0" />

            <GlassCard className="relative z-10 p-3 rounded-2xl flex flex-col gap-2">
                <NavItem to="/dashboard" icon={<TimelineIcon fontSize="small" />} />
                <NavItem to="/profile" icon={<PersonRoundedIcon fontSize="small" />} />
            </GlassCard>

            <Link
                to="/create-meal"
                className="
                    relative z-10
                    flex items-center justify-center w-16 h-16 rounded-full
                    bg-primary text-black/80
                    shadow-[0_0_22px_rgba(127,250,136,0.65)]
                    hover:bg-primary-hover
                    hover:shadow-[0_0_36px_rgba(127,250,136,1)]
                    hover:scale-105
                    active:scale-95
                    transition-all duration-200
                "
            >
                <AddCircleRoundedIcon fontSize="large" />
            </Link>

            <GlassCard className="relative z-10 p-3 rounded-2xl flex flex-col gap-2">
                <NavItem to="/nutrition" icon={<FoodBankRoundedIcon fontSize="small" />} />
                <NavItem to="/settings" icon={<SettingsRoundedIcon fontSize="small" />} />
            </GlassCard>

        </div>
    )
}
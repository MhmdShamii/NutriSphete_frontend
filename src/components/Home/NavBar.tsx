import { NavLink, Link } from "react-router-dom";
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import FoodBankRoundedIcon from '@mui/icons-material/FoodBankRounded';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import SportsRoundedIcon from '@mui/icons-material/SportsRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import GlassCard from "../ui/GlassCard";

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
    return (
        <NavLink
            to={to}
            title={label}
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
        // Mobile: full-width horizontal row | Desktop: vertical column full height
        <div className="relative flex items-center justify-between gap-2 sm:gap-4
            flex-row w-full
            sm:flex-col sm:w-fit sm:h-full sm:justify-center
        ">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                w-40 h-24 sm:w-24 sm:h-40
                bg-primary/30 blur-3xl rounded-full pointer-events-none z-0"
            />

            <GlassCard className="relative z-10 p-2 sm:p-3 rounded-2xl flex gap-1 sm:gap-2
                flex-row flex-1 justify-around
                sm:flex-col sm:flex-none sm:w-full sm:justify-start
            ">
                <NavItem to="/stats" icon={<BarChartRoundedIcon fontSize="medium" />} label="My Stats" />
                <NavItem to="/feed" icon={<FoodBankRoundedIcon fontSize="medium" />} label="Feed" />
            </GlassCard>

            {/* Add Meal CTA */}
            <Link
                to="/create-meal"
                className="
                    relative z-10
                    flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full
                    bg-primary text-black/80
                    shadow-[0_0_22px_rgba(127,250,136,0.65)]
                    hover:bg-primary-hover
                    hover:shadow-[0_0_36px_rgba(127,250,136,1)]
                    hover:scale-105 active:scale-95
                    transition-all duration-200
                "
            >
                <AddCircleRoundedIcon fontSize="large" />
            </Link>

            {/* Bottom/Right glass card */}
            <GlassCard className="relative z-10 p-2 sm:p-3 rounded-2xl flex gap-1 sm:gap-2
                flex-row flex-1 justify-around
                sm:flex-col sm:flex-none sm:w-full sm:justify-between
            ">
                <NavItem to="/coaches" icon={<SportsRoundedIcon fontSize="medium" />} label="Coaches" />
                <NavItem to="/personal-trainer" icon={<FitnessCenterRoundedIcon fontSize="medium" />} label="Personal Trainer" />
            </GlassCard>

        </div>
    )
}

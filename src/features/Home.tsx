import { useSelector } from "react-redux"
import type { RootState } from "../app/store"

export default function Home() {

    const user = useSelector((state: RootState) => state.auth.user)

    if (!user) {
        return (
            <div className="flex items-center justify-center w-full h-full">
                <p className="text-2xl text-primary">
                    Not logged in
                </p>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-center w-full h-full">

            <div className="bg-surface border border-border/30 rounded-xl p-6 w-80 flex flex-col items-center gap-4 shadow-lg">

                {/* Avatar */}
                <img

                    src={user.image.avatar}
                    alt="avatar"
                    className="w-24 h-24 rounded-full object-cover border border-border"
                />

                {/* Name */}
                <h2 className="text-xl font-bold text-white">
                    {user.first_name} {user.last_name}
                </h2>

                {/* Email */}
                <p className="text-sm text-text-muted">
                    {user.email}
                </p>

                {/* Phone */}
                <p className="text-sm text-text-muted">
                    📞 {user.phone}
                </p>

                {/* Verified */}
                <span className={`text-xs px-3 py-1 rounded-full
                        ${user.verified
                        ? "bg-green-500/20 text-green-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}>
                    {user.verified ? "Verified" : "Not Verified"}
                </span>

            </div>

        </div>
    )
}
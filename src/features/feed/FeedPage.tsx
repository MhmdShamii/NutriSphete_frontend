import { useSelector } from "react-redux"
import type { RootState } from "../../app/store"
import TopBar from "../../components/Home/TopBar"
import NavBar from "../../components/Home/NavBar"
import Feed from "./Feed"

export default function FeedPage() {
    const { user, initialized } = useSelector((s: RootState) => s.auth)

    if (!initialized) {
        return (
            <div className="h-[100dvh] w-screen flex items-center justify-center bg-background">
                <span className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
        )
    }

    return (
        <div className="flex flex-col w-full h-[100dvh] bg-background text-text gap-5 relative p-2 sm:p-4 overflow-hidden safe-area-top safe-area-bottom safe-area-x">
            <div className="absolute top-[-150px] sm:top-[-250px] left-[30%] w-[400px] h-[200px] sm:w-[700px] sm:h-[400px] bg-primary/15 blur-[120px] sm:blur-[180px] rounded-full animate-energy pointer-events-none" />
            <div className="absolute top-[-150px] sm:top-[-250px] right-[30%] w-[400px] h-[200px] sm:w-[700px] sm:h-[400px] bg-primary/15 blur-[120px] sm:blur-[180px] rounded-full animate-energy pointer-events-none" />

            <div className="relative z-20 flex-shrink-0">
                <TopBar user={user} />
            </div>

            <div className="flex w-full flex-1 min-h-0 flex-col-reverse gap-3 sm:flex-row sm:gap-5">
                <NavBar />
                <div className="flex-1 min-h-0 overflow-auto no-scrollbar">
                    <Feed isGuest={!user} />
                </div>
            </div>
        </div>
    )
}

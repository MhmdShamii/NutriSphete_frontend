import { Outlet } from "react-router-dom"
import { useSelector } from "react-redux"
import type { RootState } from "../app/store"
import TopBar from "../components/Home/TopBar"
import NavBar from "../components/Home/NavBar"

export default function Home() {

    const user = useSelector((state: RootState) => state.auth.user)

    if (!user) {
        return (
            <div className="flex items-center justify-center w-full h-full">
                <p className="text-2xl text-primary">Not logged in</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col w-full h-full gap-5 relative p-2 sm:p-0 overflow-hidden safe-area-top safe-area-bottom safe-area-x">
            <div className="absolute top-[-150px] sm:top-[-250px] left-[30%] w-[400px] h-[200px] sm:w-[700px] sm:h-[400px] bg-primary/15 blur-[120px] sm:blur-[180px] rounded-full animate-energy pointer-events-none" />
            <div className="absolute top-[-150px] sm:top-[-250px] right-[30%] w-[400px] h-[200px] sm:w-[700px] sm:h-[400px] bg-primary/15 blur-[120px] sm:blur-[180px] rounded-full animate-energy pointer-events-none" />

            <div className="relative z-20 flex-shrink-0">
                <TopBar user={user} />
            </div>

            <div className="flex w-full flex-1 min-h-0 flex-col-reverse gap-3 sm:flex-row sm:gap-5">
                <NavBar user={user} />
                <div className="flex-1 min-h-0 overflow-hidden">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}
import { useSelector } from "react-redux"
import type { RootState } from "../app/store"
import TopBar from "../components/Home/TopBar"
import NavBar from "../components/Home/NavBar"

export default function Home({ children }: { children?: React.ReactNode }) {

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
        <div className="flex flex-col w-full h-screen gap-5 relative
            p-3 sm:p-5
        ">
            <div className="absolute top-[-250px] left-[30%] w-[700px] h-[400px] bg-primary/15 blur-[180px] rounded-full animate-energy"></div>
            <div className="absolute top-[-250px] right-[30%] w-[700px] h-[400px] bg-primary/15 blur-[180px] rounded-full animate-energy"></div>

            <TopBar user={user} />

            {/* Mobile: col-reverse puts NavBar at bottom | Desktop: row puts NavBar on left */}
            <div className="flex w-full flex-1 min-h-0
                flex-col-reverse gap-3
                sm:flex-row sm:gap-5
            ">
                <NavBar />
                <div className="flex-1 flex items-center justify-center min-h-0 overflow-auto">
                    {children ? children : (
                        <p className="text-2xl text-primary">
                            Welcome, {user.first_name}!
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}
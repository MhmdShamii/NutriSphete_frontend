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
        <div className="flex flex-col w-full h-screen p-5 gap-5 relative">
            <div className="absolute top-[-250px] left-[30%] w-[700px] h-[400px] bg-primary/15 blur-[180px] rounded-full animate-energy"></div>
            <div className="absolute top-[-250px] right-[30%] w-[700px] h-[400px] bg-primary/15 blur-[180px] rounded-full animate-energy"></div>

            <TopBar user={user} />
            <div className="flex w-full flex-1 gap-5 min-h-0">
                <NavBar />
                <div className="flex-1 flex items-center justify-center">
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
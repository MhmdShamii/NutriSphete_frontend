import { useSelector } from "react-redux"
import type { RootState } from "../app/store"

export default function Home() {
    const user = useSelector((state: RootState) => state.auth.user)

    return (
        <div className="flex items-center justify-center w-full h-full">
            <p className=" text-2xl text-primary">

                {user ? `Hello ${user.first_name}` : "Not logged in"}
            </p>
        </div>
    )
}
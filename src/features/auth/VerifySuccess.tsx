import { useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { fetchMe } from "./authSlice"
import { getPostLoginRoute } from "./types"
import type { AppDispatch } from "../../app/store"

export default function VerifySuccess() {
    const [params] = useSearchParams()
    const navigate = useNavigate()
    const dispatch = useDispatch<AppDispatch>()

    useEffect(() => {
        const token = params.get("token")

        if (!token) {
            navigate("/auth")
            return
        }

        localStorage.setItem("token", token)

        dispatch(fetchMe()).unwrap()
            .then((user) => navigate(getPostLoginRoute(user.onboarding_step), { replace: true }))
            .catch(() => navigate("/auth"))
    }, [])

    return (
        <div className="h-screen w-screen flex items-center justify-center bg-background">
            <span className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
    )
}

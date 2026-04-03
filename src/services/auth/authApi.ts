import type { LoginPayload, RegisterPayload } from "../../features/auth/types"
import apiClient from "../../services/apiClient"
import axios from "axios"

export const checkEmail = async (
    email: string,
    signal?: AbortSignal
) => {
    try {
        const response = await apiClient.post(
            "/auth/check-email",
            { email },
            { signal }
        )
        return response.data
    } catch (error) {
        if (axios.isCancel(error)) return null
        throw error
    }
}

export const registerUser = async (data: RegisterPayload) => {
    const response = await apiClient.post("/auth/register", data)
    return response.data
}

export const resendVerificationEmail = async (email: string) => {
    const response = await apiClient.post("/auth/email/resend", { email })
    return response.data
}

export const googleAuth = async (token: string) => {
    const response = await apiClient.post("/auth/google", { id_token: token })
    return response.data
}

export const loginUser = async (data: LoginPayload) => {
    const response = await apiClient.post("/auth/login", data)
    return response.data
}

export const getMe = async () => {
    const response = await apiClient.get("/me")
    return response.data.user
}

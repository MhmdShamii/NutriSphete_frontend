import type { LoginPayload, RegisterPayload, MainInfoPayload, BasicInfoPayload, TargetsPayload } from "../../features/auth/types"
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

export const uploadAvatarApi = async (file: File) => {
    const form = new FormData()
    form.append("avatar", file)
    const response = await apiClient.post("/me/avatar", form, {
        headers: { "Content-Type": "multipart/form-data" }
    })
    return response.data
}

export const completeMainInfoApi = async (data: MainInfoPayload) => {
    const response = await apiClient.post("/me/complete-main-info", data)
    return response.data
}

export const completeBasicInfoApi = async (data: BasicInfoPayload) => {
    const response = await apiClient.post("/me/complete-basic-info", data)
    return response.data
}

export const completeTargetsApi = async (data: TargetsPayload) => {
    const response = await apiClient.post("/me/complete-targets", data)
    return response.data
}

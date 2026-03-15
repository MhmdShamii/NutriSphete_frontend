import type { LoginPayload, RegisterPayload } from "../../features/auth/types"
import apiClient from "../../services/apiClient"
import { AxiosError } from "axios"

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
        if ((error as AxiosError).name === "CanceledError") {
            return null
        }

        throw error
    }
}

export const uploadAvatar = async (file: File) => {

    const formData = new FormData()
    formData.append("avatar", file)

    const response = await apiClient.post(
        "/me/avatar",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }
    )

    return response.data
}

export const registerUser = async (data: RegisterPayload) => {

    const response = await apiClient.post(
        "/auth/register",
        data
    )

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
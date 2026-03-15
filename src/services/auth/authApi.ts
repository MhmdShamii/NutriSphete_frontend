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
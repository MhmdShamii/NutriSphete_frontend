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
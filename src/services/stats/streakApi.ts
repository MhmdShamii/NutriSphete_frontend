import apiClient from "../apiClient"

export const getStreak = async (): Promise<number> => {
    const response = await apiClient.get("/users/me/analytics/streak")
    return response.data.data.current_streak
}

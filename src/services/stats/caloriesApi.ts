import apiClient from "../apiClient"

export interface CalorieDay {
    date: string                   // "YYYY-MM-DD"
    calories_consumed: number | null
    calories_target: number | null
}

export const getCalories = async (params: {
    start: string   // "YYYY-MM-DD"
    end: string     // "YYYY-MM-DD"
}): Promise<CalorieDay[]> => {
    const response = await apiClient.get("/users/me/analytics/calories", { params })
    return response.data.data
}

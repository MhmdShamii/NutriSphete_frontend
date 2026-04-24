import apiClient from "../apiClient"

export interface TodayLogEntry {
    id: number
    type: "meal" | "custom" | "estimate"
    log_name?: string | null
    description?: string | null
    calories: string
    protein: string
    carbs: string
    fats: string
    fiber: string | null
    logged_at: string
    confirmed_at: string | null
    meal_post: { id: number; image_url: string } | null
}

export interface TodayAnalytics {
    date: string
    calories_consumed: number
    calories_target: number | null
    protein_consumed: number
    protein_target: number | null
    carbs_consumed: number
    carbs_target: number | null
    fats_consumed: number
    fats_target: number | null
    fiber_consumed: number
    fiber_target: number | null
    logs_count: number
    logs: TodayLogEntry[]
}

export const getTodayAnalytics = async (): Promise<TodayAnalytics> => {
    const response = await apiClient.get("/users/me/analytics/today")
    return response.data.data
}

export const getDayAnalytics = async (date: string): Promise<TodayAnalytics> => {
    const response = await apiClient.get("/users/me/analytics/day", { params: { date } })
    return response.data.data
}

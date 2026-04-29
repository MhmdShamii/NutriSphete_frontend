import apiClient from "../apiClient"

export interface TodayMacros {
    source: "summary" | "profile"
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
    fiber_target: null
}

export const getTodayMacros = async (): Promise<TodayMacros> => {
    const response = await apiClient.get("/users/me/analytics/today/macros")
    return response.data.data
}

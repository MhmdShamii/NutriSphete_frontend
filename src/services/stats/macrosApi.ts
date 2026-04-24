import apiClient from "../apiClient"

export interface MacroDay {
    date: string
    protein_consumed: number | null
    protein_target:   number | null
    carbs_consumed:   number | null
    carbs_target:     number | null
    fats_consumed:    number | null
    fats_target:      number | null
}

export const getMacros = async (params: {
    start: string  // "YYYY-MM-DD"
    end:   string  // "YYYY-MM-DD"
}): Promise<MacroDay[]> => {
    const response = await apiClient.get("/users/me/analytics/macros", { params })
    return response.data.data
}

import apiClient from "../apiClient"

export interface WeightEntry {
    id: number
    weight_kg: string // MySQL decimal — always parse with parseFloat()
    note: string | null
    logged_at: string  // "YYYY-MM-DD"
}

export interface LogWeightPayload {
    weight_kg: number
    note?: string
}

export const getWeightHistory = async (params?: {
    from?: string
    to?: string
}): Promise<WeightEntry[]> => {
    const response = await apiClient.get("/users/me/analytics/weight", { params })
    return response.data.data
}

export const logWeight = async (payload: LogWeightPayload): Promise<WeightEntry> => {
    const body: Record<string, unknown> = { weight_kg: payload.weight_kg }
    if (payload.note?.trim()) body.note = payload.note.trim()
    const response = await apiClient.post("/users/me/analytics/weight", body)
    return response.data.data
}

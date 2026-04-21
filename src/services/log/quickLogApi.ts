import apiClient from "../apiClient"
import type { QuickLogFormData, QuickLogEntry } from "../../features/mealCreation/types/meal.types"

interface CreateQuickLogResponse {
    logged_meal: QuickLogEntry
    message: string
}

export const createQuickLog = async (data: QuickLogFormData): Promise<CreateQuickLogResponse> => {
    const response = await apiClient.post("/users/me/log", {
        name: data.name,
        description: data.description || undefined,
        ingredients: data.ingredients.map(i => ({
            name: i.name,
            portion: Number(i.portion),
            unit: i.unit,
        })),
    })
    return response.data
}

export const confirmQuickLog = async (id: number): Promise<void> => {
    await apiClient.post(`/users/me/log/${id}/confirm`)
}

export const deleteQuickLog = async (id: number): Promise<void> => {
    await apiClient.delete(`/users/me/log/${id}`)
}

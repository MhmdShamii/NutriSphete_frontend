import apiClient from "../apiClient"
import type { QuickLogFormData, QuickLogEntry, HealthWarning } from "../../features/mealCreation/types/meal.types"

interface CreateQuickLogResponse {
    logged_meal: QuickLogEntry
    health_warning: HealthWarning
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
    return {
        logged_meal: response.data.data.logged_meal,
        health_warning: response.data.data.health_warning,
        message: response.data.message,
    }
}

export const confirmQuickLog = async (id: number): Promise<void> => {
    await apiClient.post(`/users/me/log/${id}/confirm`)
}

export const deleteQuickLog = async (id: number): Promise<void> => {
    await apiClient.delete(`/users/me/log/${id}`)
}

export const estimateMeal = async (name: string, description?: string): Promise<CreateQuickLogResponse> => {
    const response = await apiClient.post("/users/me/log/estimate", {
        name,
        description: description || undefined,
    })
    return {
        logged_meal: response.data.data.logged_meal,
        health_warning: response.data.data.health_warning,
        message: response.data.message,
    }
}

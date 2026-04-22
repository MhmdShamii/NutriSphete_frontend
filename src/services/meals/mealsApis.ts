import apiClient from "../apiClient"
import type { CreateMealResponse, MealDraft, MealFormData, QuickLogEntry, HealthWarning } from "../../features/mealCreation/types/meal.types"

interface LogMealResponse {
    logged_meal: QuickLogEntry
    health_warning: HealthWarning
    message: string
}

export const createMeal = async (data: MealFormData): Promise<CreateMealResponse> => {
    const response = await apiClient.post("/meals", {
        name: data.name,
        description: data.description || undefined,
        visibility: data.visibility,
        servings: data.servings,
        ingredients: data.ingredients.map(ing => ({
            name: ing.name,
            portion: Number(ing.portion),
            unit: ing.unit,
        })),
        preparation_steps: data.preparation_steps
            .filter(s => s.description.trim())
            .map(s => ({ description: s.description })),
    })
    return response.data
}

export const confirmMeal = async (mealId: number, image: File): Promise<{ meal: MealDraft }> => {
    const formData = new FormData()
    formData.append("image", image)
    const response = await apiClient.post(`/meals/${mealId}/confirm`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    })
    return response.data
}

export const discardMeal = async (mealId: number): Promise<void> => {
    await apiClient.post(`/meals/${mealId}/discard`)
}

export const logMeal = async (mealId: number): Promise<LogMealResponse> => {
    const response = await apiClient.post(`/users/me/log/${mealId}`)
    return {
        logged_meal: response.data.data.logged_meal,
        health_warning: response.data.data.health_warning,
        message: response.data.message,
    }
}


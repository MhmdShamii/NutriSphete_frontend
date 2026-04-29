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
    return {
        meal: response.data.data.meal,
        health_warning: response.data.data.health_warning,
        message: response.data.message,
    }
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

export type ProfileMeal = {
    id: number
    name: string
    image_url: string | null
    macros: {
        calories: number
        protein: number
        carbs: number
        fats: number
    }
    engagement: {
        likes_count: number
        relogs_count: number
        comments_count: number
        is_liked: boolean
    }
}

export type ProfileMealsMeta = {
    next_cursor: string | null
    prev_cursor: string | null
    per_page: number
}

export const likeMealApi = async (mealId: number) => apiClient.post(`/meals/${mealId}/like`)
export const unlikeMealApi = async (mealId: number) => apiClient.delete(`/meals/${mealId}/like`)

export const getMealApi = async (mealId: number): Promise<import("../../features/mealCreation/types/meal.types").MealDetail> => {
    const response = await apiClient.get(`/meals/${mealId}`)
    return response.data.meal
}

export const getUserMealsApi = async (
    userId: number,
    cursor?: string
): Promise<{ data: ProfileMeal[]; meta: ProfileMealsMeta }> => {
    const response = await apiClient.get(`/users/${userId}/meals`, {
        params: cursor ? { cursor } : {},
    })
    return response.data
}

export const getUserPrivateMealsApi = async (
    userId: number,
    cursor?: string
): Promise<{ data: ProfileMeal[]; meta: ProfileMealsMeta }> => {
    const response = await apiClient.get(`/users/${userId}/meals/private`, {
        params: cursor ? { cursor } : {},
    })
    return response.data
}


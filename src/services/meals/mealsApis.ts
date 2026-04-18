import apiClient from "../apiClient"
import type { CreateMealResponse, MealDraft, MealFormData } from "../../features/mealCreation/types/meal.types"

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


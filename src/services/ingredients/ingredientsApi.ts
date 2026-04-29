import apiClient from "../apiClient"

export interface IngredientResult {
    id: number
    name_en: string
    name_ar: string
    verified: boolean
}

export const searchIngredients = async (query: string): Promise<IngredientResult[]> => {
    const response = await apiClient.post("/ingredients/search", { query })
    return response.data.ingredients
}

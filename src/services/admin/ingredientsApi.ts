import apiClient from "../apiClient"

export type UnverifiedIngredient = {
    id: number
    name_en: string
    name_ar: string | null
    source: string
    verified: boolean
    submitted_at: string
}

export type IngredientsPage = {
    data: UnverifiedIngredient[]
    next_cursor: string | null
    has_more: boolean
}

export const getUnverifiedIngredientsApi = async (cursor?: string): Promise<IngredientsPage> => {
    const params = cursor ? { cursor } : {}
    const res = await apiClient.get("/admin/ingredients", { params })
    return {
        data: res.data.data,
        next_cursor: res.data.meta.next_cursor,
        has_more: res.data.meta.has_more,
    }
}

export const approveIngredientApi = async (id: number): Promise<void> => {
    await apiClient.post(`/admin/ingredients/${id}/approve`)
}

export const deleteIngredientApi = async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/ingredients/${id}`)
}

export interface Ingredient {
    localId: string
    name: string
    portion: string
    unit: string
}

export interface PrepStep {
    localId: string
    description: string
}

export interface MealFormData {
    name: string
    description: string
    visibility: "public" | "private"
    servings: number
    ingredients: Ingredient[]
    preparation_steps: PrepStep[]
}

export interface MealMacros {
    calories: number
    protein: number
    carbs: number
    fats: number
    fiber: number
}

export interface MealIngredientResponse {
    id: number
    name_en: string
    name_ar: string
    portion: number
    unit: string
}

export interface MealPrepStepResponse {
    step_number: number
    description: string
}

export interface MealDraft {
    id: number
    name: string
    description: string
    image_url: string
    confirmed: boolean
    servings: number
    ingredients: MealIngredientResponse[]
    macros: MealMacros
    preparation_steps: MealPrepStepResponse[]
    visibility: "public" | "private"
}

export interface CreateMealResponse {
    meal: MealDraft
    message: string
}

export interface QuickLogFormData {
    name: string
    description: string
    ingredients: Ingredient[]
}

export interface QuickLogEntry {
    id: number
    type: "custom" | "estimate"
    log_name: string
    description?: string
    calories: string
    protein: string
    carbs: string
    fats: string
    fiber: string
    logged_at: string
    confirmed_at: string | null
}

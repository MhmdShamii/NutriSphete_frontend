
export type LoginPayload = {
    email: string
    password: string
}

export type MainInfoPayload = {
    first_name: string
    last_name: string
    country_code: string  // ISO alpha-3 code e.g. "USA"
}

export type BasicInfoPayload = {
    date_of_birth: string
    gender: "male" | "female"
    weight_kg: number
    height_cm: number
    activity_level: "sedentary" | "light" | "moderate" | "active" | "very_active"
    goal: "lose_weight" | "gain_muscle" | "maintain"
    dietary_preferences: "vegetarian" | "vegan" | "pescatarian" | "none"
    body_fat_pct?: number | null
}

export type TargetsPayload = {
    daily_calorie_target: number
    daily_protein_g: number
    daily_carbs_g: number
    daily_fat_g: number
}

export type UpdateMePayload = {
    first_name?: string
    last_name?: string
    country_code?: string
}

export type HealthCondition = {
    id: number
    name: string
    slug: string
    type: string
    severity: string
}


export type RegisterPayload = {
    email: string
    password: string
    password_confirmation: string
}

export type OnboardingStep = "main_info" | "basic_info" | "targets" | "health_conditions" | "complete"

export type UserProfile = {
    date_of_birth: string
    gender: string
    weight_kg: string
    height_cm: string
    activity_level: string
    goal: string
    dietary_preferences: string
    daily_calorie_target: number
    daily_protein_g: number
    daily_carbs_g: number
    daily_fat_g: number
}

export type AuthUser = {
    id: number
    first_name: string | null
    last_name: string | null
    email: string
    verified: boolean
    role: string
    onboarding_step: OnboardingStep
    country: {
        code: string | null
        name: string | null
    }
    image: {
        avatar: string
        cover_image: string
    }
    profile: UserProfile | null
}

export type AuthState = {
    user: AuthUser | null
    token: string | null
    loading: boolean
    error: string | null
    initialized: boolean
}

const ONBOARDING_ROUTES: Record<OnboardingStep, string> = {
    main_info: "/onboarding/main-info",
    basic_info: "/onboarding/basic-info",
    targets: "/onboarding/targets",
    health_conditions: "/onboarding/health-conditions",
    complete: "/",
}

export function getPostLoginRoute(step: OnboardingStep): string {
    return ONBOARDING_ROUTES[step]
}

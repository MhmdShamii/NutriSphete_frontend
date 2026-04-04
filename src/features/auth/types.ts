
export type LoginPayload = {
    email: string
    password: string
}

export type RegisterPayload = {
    email: string
    password: string
    password_confirmation: string
}

export type OnboardingStep = "main_info" | "basic_info" | "targets" | "complete"

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
    targets:    "/onboarding/targets",
    complete:   "/",
}

export function getPostLoginRoute(step: OnboardingStep): string {
    return ONBOARDING_ROUTES[step]
}

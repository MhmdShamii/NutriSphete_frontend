export type RegisterPayload = {
    first_name: string
    last_name: string
    email: string
    phone: string
    country_code: string
    password: string
    password_confirmation: string
}

export type AuthUser = {
    id: number
    first_name: string
    last_name: string
    email: string
    phone: string
    verified: boolean
}

export type AuthState = {
    user: AuthUser | null
    token: string | null
    loading: boolean
    error: string | null
}
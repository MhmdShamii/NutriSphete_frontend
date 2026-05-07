import apiClient from "../apiClient"

export type AdminUserRole = "client" | "coach" | "admin"
export type AdminOnboardingStep = "main_info" | "basic_info" | "targets" | "health_conditions" | "complete"

export type AdminUser = {
    id: number
    first_name: string
    last_name: string
    email: string
    role: AdminUserRole
    verified: boolean
    country: { code: string | null; name: string | null }
    image: { avatar: string; cover_image: string }
    onboarding_step?: AdminOnboardingStep
}

export type UsersPage = {
    data: AdminUser[]
    next_cursor: string | null
    has_more: boolean
}

export type UsersFilters = {
    search?: string
    role?: AdminUserRole | "all"
    onboarding_step?: AdminOnboardingStep | "all"
    cursor?: string
}

export const patchAdminUserRoleApi = async (id: number, role: AdminUserRole): Promise<AdminUser> => {
    const res = await apiClient.patch(`/admin/users/${id}/role`, { role })
    return res.data.data ?? res.data.user ?? res.data
}

export const getAdminUsersApi = async (filters: UsersFilters = {}): Promise<UsersPage> => {
    const params: Record<string, string> = {}
    if (filters.search)                                    params.search = filters.search
    if (filters.role && filters.role !== "all")            params.role = filters.role
    if (filters.onboarding_step && filters.onboarding_step !== "all") params.onboarding_step = filters.onboarding_step
    if (filters.cursor)                                    params.cursor = filters.cursor
    const res = await apiClient.get("/admin/users", { params })
    return {
        data: res.data.data,
        next_cursor: res.data.meta.next_cursor,
        has_more: res.data.meta.has_more,
    }
}

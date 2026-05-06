import apiClient from "../apiClient"

export type AppStatus = "pending" | "approved" | "rejected"

export type AdminAppDoc = {
    id: number
    type: "certificate" | "image"
    original_name?: string
    url: string
}

export type AdminApplication = {
    id: number
    status: AppStatus
    description: string
    rejection_reason: string | null
    reviewed_at: string | null
    applicant: { id: number; first_name: string; last_name: string; email: string }
    documents: AdminAppDoc[]
    submitted_at: string
}

export type ApplicationsPage = {
    data: AdminApplication[]
    next_cursor: string | null
    has_more: boolean
}

export const getAdminApplicationsApi = async (
    status?: AppStatus | "all",
    cursor?: string,
): Promise<ApplicationsPage> => {
    const params: Record<string, string> = {}
    if (status && status !== "all") params.status = status
    if (cursor) params.cursor = cursor
    const res = await apiClient.get("/admin/coach-applications", { params })
    return {
        data: res.data.data,
        next_cursor: res.data.meta.next_cursor,
        has_more: res.data.meta.has_more,
    }
}

export const approveApplicationApi = async (id: number): Promise<AdminApplication> => {
    const res = await apiClient.post(`/admin/coach-applications/${id}/approve`)
    return res.data.application
}

export const rejectApplicationApi = async (id: number, reason: string): Promise<AdminApplication> => {
    const res = await apiClient.post(`/admin/coach-applications/${id}/reject`, { reason })
    return res.data.application
}

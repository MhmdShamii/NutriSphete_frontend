import apiClient from "../apiClient"

export type HistoryPoint = { date: string; count: number }

export type PlatformAnalytics = {
    users: {
        total: number
        new_today: number
        new_yesterday: number
        change_percent: number | null
        history: HistoryPoint[]
    }
    coach_applications: {
        pending: number
        approved: number
        rejected: number
        total: number
    }
    meals_logged: {
        today: number
        yesterday: number
        change_percent: number | null
        history: HistoryPoint[]
    }
    active_users: {
        yesterday: number
        change_percent: number | null
        history: HistoryPoint[]
    }
    logged_in_users: {
        count: number
    }
}

export const getAdminAnalyticsApi = async (): Promise<PlatformAnalytics> => {
    const res = await apiClient.get("/admin/analytics")
    return res.data.analytics
}

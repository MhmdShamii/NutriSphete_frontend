import apiClient from "../apiClient"
import type { AxiosError } from "axios"

export type CoachDocument = {
    id: number
    type: "certificate" | "image"
    original_name: string
    url: string
}

export type CoachApplicationStatus = "pending" | "approved" | "rejected"

export type CoachApplication = {
    id: number
    status: CoachApplicationStatus
    description: string
    rejection_reason: string | null
    reviewed_at: string | null
    documents: CoachDocument[]
    submitted_at: string
}

export const getCoachApplicationApi = async (): Promise<CoachApplication | null> => {
    try {
        const response = await apiClient.get("/coach-application")
        return response.data.application
    } catch (error) {
        if ((error as AxiosError)?.response?.status === 404) return null
        throw error
    }
}

export const submitCoachApplicationApi = async (form: FormData): Promise<CoachApplication> => {
    const response = await apiClient.post("/coach-application", form, {
        headers: { "Content-Type": "multipart/form-data" },
    })
    return response.data.application
}

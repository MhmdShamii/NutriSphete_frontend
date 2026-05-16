import apiClient from "../apiClient"

export interface ChatHistoryMessage {
    id: number
    role: "user" | "assistant"
    content: string
    created_at: string
}

export interface ChatHistoryResponse {
    data: ChatHistoryMessage[]
    meta: {
        next_cursor: string | null
        has_more: boolean
    }
}

export const sendChatMessageApi = async (message: string): Promise<Record<string, unknown>> => {
    const response = await apiClient.post("/chat", { message })
    return response.data
}

export const getChatHistoryApi = async (
    cursor?: string,
    perPage = 20
): Promise<ChatHistoryResponse> => {
    const params: Record<string, string | number> = { per_page: perPage }
    if (cursor) params.cursor = cursor
    const response = await apiClient.get("/chat/history", { params })
    return response.data
}

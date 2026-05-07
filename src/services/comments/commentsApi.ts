import apiClient from "../apiClient"

export interface CommentAuthor {
    id: number
    first_name: string
    last_name: string
    avatar: string
    role: string
}

export interface Comment {
    id: number
    body: string
    created_at: string
    author: CommentAuthor
    replies_count: number | null
    reply_preview: Comment[] | null
}

interface CommentPage {
    data: Comment[]
    next_cursor: string | null
}

export const getComments = async (mealId: number, cursor?: string): Promise<CommentPage> => {
    const response = await apiClient.get(`/meals/${mealId}/comments`, {
        params: cursor ? { cursor } : {},
    })
    return { data: response.data.data, next_cursor: response.data.next_cursor }
}

export const getReplies = async (mealId: number, commentId: number, cursor?: string): Promise<CommentPage> => {
    const response = await apiClient.get(`/meals/${mealId}/comments/${commentId}/replies`, {
        params: cursor ? { cursor } : {},
    })
    return { data: response.data.data, next_cursor: response.data.next_cursor }
}

export const postComment = async (mealId: number, body: string): Promise<Comment> => {
    const response = await apiClient.post(`/meals/${mealId}/comments`, { body })
    return response.data.data
}

export const postReply = async (mealId: number, commentId: number, body: string): Promise<Comment> => {
    const response = await apiClient.post(`/meals/${mealId}/comments/${commentId}/replies`, { body })
    return response.data.data
}

export const deleteComment = async (mealId: number, commentId: number): Promise<void> => {
    await apiClient.delete(`/meals/${mealId}/comments/${commentId}`)
}

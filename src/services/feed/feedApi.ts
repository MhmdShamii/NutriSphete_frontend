import apiClient from "../apiClient"

export interface FeedAuthor {
    id: number
    first_name: string
    last_name: string
    avatar: string
    is_following: boolean
}

export interface FeedEngagement {
    likes_count: number
    comments_count: number
    relogs_count: number
    is_liked: boolean
}

export interface FeedFirstComment {
    id: number
    body: string
    created_at: string
    author: {
        id: number
        first_name: string
        last_name: string
        avatar: string
    }
}

export interface FeedIngredient {
    id: number
    name_en: string
    name_ar: string
    portion: number
    unit: string
}

export interface FeedStep {
    step_number: number
    description: string
}

export interface FeedPost {
    id: number
    name: string
    description: string | null
    image_url: string | null
    servings: number
    posted_at: string
    author: FeedAuthor
    macros: {
        calories: number
        protein: number
        carbs: number
        fats: number
        fiber: number
    }
    ingredients: FeedIngredient[]
    preparation_steps: FeedStep[]
    engagement: FeedEngagement
    first_comment: FeedFirstComment | null
}

export const getFeed = async (cursor?: string): Promise<{ data: FeedPost[]; next_cursor: string | null }> => {
    const response = await apiClient.get("/feed", {
        params: cursor ? { cursor } : {},
    })
    return { data: response.data.data, next_cursor: response.data.next_cursor }
}

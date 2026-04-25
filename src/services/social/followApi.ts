import apiClient from "../apiClient"

export type PublicUserProfile = {
    id: number
    first_name: string | null
    last_name: string | null
    country: { code: string | null; name: string | null }
    image: { avatar: string; cover_image: string }
    followers_count: number
    following_count: number
    is_following: boolean
    follows_you: boolean
}

export const getUserPublicProfileApi = async (userId: number): Promise<PublicUserProfile> => {
    const res = await apiClient.get(`/users/${userId}`)
    return res.data.user
}

export type FollowUser = {
    id: number
    first_name: string
    last_name: string
    avatar: string
    is_following: boolean
}

export type FollowMeta = {
    current_page: number
    last_page: number
    per_page: number
    total: number
}

export type FollowListResponse = {
    data: FollowUser[]
    meta: FollowMeta
}

export const getFollowersApi = async (userId: number, page = 1): Promise<FollowListResponse> => {
    const res = await apiClient.get(`/users/${userId}/followers`, { params: { page } })
    return res.data
}

export const getFollowingApi = async (userId: number, page = 1): Promise<FollowListResponse> => {
    const res = await apiClient.get(`/users/${userId}/following`, { params: { page } })
    return res.data
}

export const followUserApi = async (userId: number): Promise<void> => {
    await apiClient.post(`/users/${userId}/follow`)
}

export const unfollowUserApi = async (userId: number): Promise<void> => {
    await apiClient.delete(`/users/${userId}/follow`)
}

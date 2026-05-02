import axios from "axios"

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_BASE_URL,
    headers: {
        "Content-Type": "application/json"
    }
})

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("token")
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

apiClient.interceptors.response.use(
    res => res,
    err => {
        if (err?.response?.status === 401) {
            localStorage.removeItem("token")
            window.location.href = "/auth"
        }
        return Promise.reject(err)
    }
)

export default apiClient
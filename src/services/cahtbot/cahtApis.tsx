import apiClient from "../apiClient"
import type { AxiosError } from "axios"

type chatMessage = {
    message: string
}

export const sendMessageToChatbot = async (message: string): Promise<string> => {
    try {
        const response = await apiClient.post("/chat", { message } as chatMessage)
        return response.data.reply
    } catch (error) {
        const err = error as AxiosError
        console.error("Error sending message to chatbot:", err.response?.data || err.message)
        throw new Error("Failed to send message to chatbot")
    }
}
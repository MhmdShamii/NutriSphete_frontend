import type { AxiosError } from "axios"

interface ApiErrorBody {
    message?: string
    errors?: Record<string, string[]> | null
}

/**
 * Extracts a user-facing message from an Axios error following the API envelope:
 *   { data, message, errors }
 *
 * Rules (mirrors backend contract):
 *   403  → fixed "permission" message
 *   422  → first field-level error from `errors`, fallback to `message`
 *   503  → AI service message (already user-friendly from backend)
 *   rest → `message` field, with a generic fallback
 */
export function extractApiError(
    err: unknown,
    fallback = "Something went wrong. Please try again."
): string {
    const axiosErr = err as AxiosError<ApiErrorBody>
    const status = axiosErr.response?.status
    const body   = axiosErr.response?.data

    if (status === 403) {
        return "You don't have permission to perform this action."
    }

    if (status === 422) {
        const errors = body?.errors
        if (errors) {
            for (const msgs of Object.values(errors)) {
                if (msgs?.[0]) return msgs[0]
            }
        }
        return body?.message ?? fallback
    }

    return body?.message ?? fallback
}

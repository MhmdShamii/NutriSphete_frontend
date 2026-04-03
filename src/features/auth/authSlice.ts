import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { getMe, googleAuth, loginUser, registerUser } from "../../services/auth/authApi"
import type { AuthState, LoginPayload, RegisterPayload } from "./types"
import type { AxiosError } from "axios"

const token = localStorage.getItem("token")

const initialState: AuthState = {
    user: null,
    token,
    loading: false,
    error: null,
    initialized: !token  // no token = no session to restore, already known
}

function extractError(error: unknown, fallback: string): string {
    const err = error as AxiosError<{ message?: string }>
    return err.response?.data?.message || fallback
}

export const register = createAsyncThunk(
    "auth/register",
    async (data: RegisterPayload, { rejectWithValue }) => {
        try {
            const response = await registerUser(data)
            return response.data
        } catch (error: unknown) {
            return rejectWithValue(extractError(error, "Registration failed"))
        }
    }
)

export const login = createAsyncThunk(
    "auth/login",
    async (data: LoginPayload, { rejectWithValue }) => {
        try {
            const response = await loginUser(data)
            return response.data
        } catch (error: unknown) {
            return rejectWithValue(extractError(error, "Login failed"))
        }
    }
)

export const googleLogin = createAsyncThunk(
    "auth/googleLogin",
    async (token: string, { rejectWithValue }) => {
        try {
            const response = await googleAuth(token)
            return response.data
        } catch (error: unknown) {
            return rejectWithValue(extractError(error, "Google login failed"))
        }
    }
)

export const fetchMe = createAsyncThunk(
    "auth/me",
    async (_, { rejectWithValue }) => {
        try {
            const user = await getMe()
            return user
        } catch {
            return rejectWithValue("Unauthorized")
        }
    }
)

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logout(state) {
            state.user = null
            state.token = null
            localStorage.removeItem("token")
        }
    },

    extraReducers: (builder) => {

        builder.addCase(fetchMe.fulfilled, (state, action) => {
            state.user = action.payload
            state.initialized = true
        })

        builder.addCase(fetchMe.rejected, (state) => {
            state.user = null
            state.token = null
            state.initialized = true
            localStorage.removeItem("token")
        })

        builder.addCase(register.pending, (state) => {
            state.loading = true
            state.error = null
        })

        builder.addCase(register.fulfilled, (state) => {
            state.loading = false
            state.error = null
        })

        builder.addCase(register.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload as string
        })

        builder.addCase(googleLogin.pending, (state) => {
            state.loading = true
            state.error = null
        })

        builder.addCase(googleLogin.fulfilled, (state, action) => {
            state.loading = false
            state.error = null
            state.initialized = true
            state.user = action.payload.user
            state.token = action.payload.token
            localStorage.setItem("token", action.payload.token)
        })

        builder.addCase(googleLogin.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload as string
        })

        builder.addCase(login.pending, (state) => {
            state.loading = true
            state.error = null
        })

        builder.addCase(login.fulfilled, (state, action) => {
            state.loading = false
            state.error = null
            state.initialized = true
            state.user = action.payload.user
            state.token = action.payload.token
            localStorage.setItem("token", action.payload.token)
        })

        builder.addCase(login.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload as string
        })
    }
})

export const { logout } = authSlice.actions
export default authSlice.reducer

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { registerUser } from "../../services/auth/authApi"
import type { AuthState, RegisterPayload } from "./types"

export const register = createAsyncThunk(
    "auth/register",
    async (data: RegisterPayload, { rejectWithValue }) => {

        try {

            const response = await registerUser(data)

            return response.data

        } catch (error: any) {

            return rejectWithValue(error.response?.data || "Registration failed")

        }

    }
)

const initialState: AuthState = {
    user: null,
    token: localStorage.getItem("token"),
    loading: false,
    error: null
}

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

        builder.addCase(register.pending, (state) => {
            state.loading = true
            state.error = null
        })

        builder.addCase(register.fulfilled, (state, action) => {

            state.loading = false

            state.user = action.payload.user
            state.token = action.payload.token

            localStorage.setItem("token", action.payload.token)

        })

        builder.addCase(register.rejected, (state, action) => {

            state.loading = false
            state.error = action.payload as string

        })

    }
})

export const { logout } = authSlice.actions
export default authSlice.reducer
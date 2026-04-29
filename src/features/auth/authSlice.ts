import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { getMe, googleAuth, loginUser, registerUser, updateMeApi, completeMainInfoApi, completeBasicInfoApi, completeTargetsApi, completeHealthConditionsApi, updateTargetsApi } from "../../services/auth/authApi"
import type { AuthState, LoginPayload, RegisterPayload, MainInfoPayload, BasicInfoPayload, TargetsPayload, UpdateMePayload } from "./types"
import type { AxiosError } from "axios"

const token = localStorage.getItem("token")

const initialState: AuthState = {
    user: null,
    token,
    loading: false,
    error: null,
    initialized: !token,
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

export const updateMe = createAsyncThunk(
    "auth/updateMe",
    async (data: UpdateMePayload, { rejectWithValue }) => {
        try {
            return await updateMeApi(data)
        } catch (error: unknown) {
            return rejectWithValue(extractError(error, "Failed to update profile"))
        }
    }
)

export const completeMainInfo = createAsyncThunk(
    "auth/completeMainInfo",
    async (data: MainInfoPayload, { rejectWithValue }) => {
        try {
            await completeMainInfoApi(data)
        } catch (error: unknown) {
            return rejectWithValue(extractError(error, "Failed to save info"))
        }
    }
)

export const completeBasicInfo = createAsyncThunk(
    "auth/completeBasicInfo",
    async (data: BasicInfoPayload, { rejectWithValue }) => {
        try {
            await completeBasicInfoApi(data)
        } catch (error: unknown) {
            return rejectWithValue(extractError(error, "Failed to save info"))
        }
    }
)

export const completeTargets = createAsyncThunk(
    "auth/completeTargets",
    async (data: TargetsPayload, { rejectWithValue }) => {
        try {
            await completeTargetsApi(data)
        } catch (error: unknown) {
            return rejectWithValue(extractError(error, "Failed to save targets"))
        }
    }
)

export const updateTargets = createAsyncThunk(
    "auth/updateTargets",
    async (data: Partial<TargetsPayload>, { rejectWithValue }) => {
        try {
            await updateTargetsApi(data)
            return data
        } catch (error: unknown) {
            return rejectWithValue(extractError(error, "Failed to update targets"))
        }
    }
)

export const completeHealthConditions = createAsyncThunk(
    "auth/completeHealthConditions",
    async (_, { rejectWithValue }) => {
        try {
            await completeHealthConditionsApi()
        } catch (error: unknown) {
            return rejectWithValue(extractError(error, "Failed to complete health conditions step"))
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

        builder.addCase(updateMe.pending,  (state) => { state.loading = true;  state.error = null })
        builder.addCase(updateMe.fulfilled, (state, action) => { state.loading = false; state.user = action.payload })
        builder.addCase(updateMe.rejected, (state, action) => { state.loading = false; state.error = action.payload as string })

        // Onboarding steps — user refresh is handled by fetchMe in the component
        builder.addCase(completeMainInfo.pending,  (state) => { state.loading = true;  state.error = null })
        builder.addCase(completeMainInfo.fulfilled, (state) => { state.loading = false })
        builder.addCase(completeMainInfo.rejected, (state, action) => { state.loading = false; state.error = action.payload as string })

        builder.addCase(completeBasicInfo.pending,  (state) => { state.loading = true;  state.error = null })
        builder.addCase(completeBasicInfo.fulfilled, (state) => { state.loading = false })
        builder.addCase(completeBasicInfo.rejected, (state, action) => { state.loading = false; state.error = action.payload as string })

        builder.addCase(completeTargets.pending,  (state) => { state.loading = true;  state.error = null })
        builder.addCase(completeTargets.fulfilled, (state) => { state.loading = false })
        builder.addCase(completeTargets.rejected, (state, action) => { state.loading = false; state.error = action.payload as string })

        builder.addCase(updateTargets.pending,  (state) => { state.loading = true;  state.error = null })
        builder.addCase(updateTargets.fulfilled, (state, action) => {
            state.loading = false
            if (state.user?.profile) Object.assign(state.user.profile, action.payload)
        })
        builder.addCase(updateTargets.rejected, (state, action) => { state.loading = false; state.error = action.payload as string })

        builder.addCase(completeHealthConditions.pending,  (state) => { state.loading = true;  state.error = null })
        builder.addCase(completeHealthConditions.fulfilled, (state) => { state.loading = false })
        builder.addCase(completeHealthConditions.rejected, (state, action) => { state.loading = false; state.error = action.payload as string })
    }
})

export const { logout } = authSlice.actions
export default authSlice.reducer

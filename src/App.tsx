import { BrowserRouter, Routes, Route } from "react-router-dom"
import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { fetchMe } from "./features/auth/authSlice"
import type { AppDispatch } from "./app/store"

import AuthPage from "./features/auth/AuthPage"
import VerifySuccess from "./features/auth/VerifySuccess"
import Home from "./features/Home"
import Profile from "./features/Profile"
import ProtectedRoute from "./routes/ProtectedRoute"
import OnboardedRoute from "./routes/OnboardedRoute"
import OnboardingPage from "./features/onboarding/OnboardingPage"
import MainInfoStep from "./features/onboarding/steps/MainInfoStep"
import BasicInfoStep from "./features/onboarding/steps/BasicInfoStep"
import TargetsStep from "./features/onboarding/steps/TargetsStep"
import HealthConditionsStep from "./features/onboarding/steps/HealthConditionsStep"

function App() {
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) dispatch(fetchMe())
  }, [])

  return (
    <BrowserRouter>
      <Routes>

        {/* Public */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/verify-success" element={<VerifySuccess />} />

        {/* Onboarding — logged in but not yet complete */}
        <Route element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>}>
          <Route path="/onboarding/main-info" element={<MainInfoStep />} />
          <Route path="/onboarding/basic-info" element={<BasicInfoStep />} />
          <Route path="/onboarding/targets" element={<TargetsStep />} />
          <Route path="/onboarding/health-conditions" element={<HealthConditionsStep />} />
        </Route>

        {/* App — logged in + onboarding complete */}
        <Route element={<ProtectedRoute><OnboardedRoute><Home /></OnboardedRoute></ProtectedRoute>}>
          <Route index element={<p className="text-2xl text-primary">Dashboard</p>} />
          <Route path="/stats" element={<p className="text-2xl text-primary">My Stats</p>} />
          <Route path="/feed" element={<p className="text-2xl text-primary">Feed</p>} />
          <Route path="/coaches" element={<p className="text-2xl text-primary">Coaches</p>} />
          <Route path="/personal-trainer" element={<p className="text-2xl text-primary">Personal Trainer</p>} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<p className="text-2xl text-primary">Settings</p>} />
          <Route path="/create-meal" element={<p className="text-2xl text-primary">Create Meal</p>} />
        </Route>

      </Routes>
    </BrowserRouter>
  )
}

export default App

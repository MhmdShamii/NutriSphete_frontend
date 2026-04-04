import { BrowserRouter, Routes, Route } from "react-router-dom"
import AuthPage from "./features/auth/AuthPage"
import Home from "./features/Home"
import ProtectedRoute from "./routes/ProtectedRoute"
import Profile from "./features/Profile"
import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { fetchMe } from "./features/auth/authSlice"
import type { AppDispatch } from "./app/store"

function App() {
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) dispatch(fetchMe())
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth — standalone, no layout */}
        <Route path="/auth" element={<AuthPage />} />

        {/* Protected layout — all app routes render inside Home via <Outlet /> */}
        <Route element={<ProtectedRoute><Home /></ProtectedRoute>}>
          <Route index element={<p className="text-2xl text-primary">Dashboard</p>} />
          <Route path="/stats"            element={<p className="text-2xl text-primary">My Stats</p>} />
          <Route path="/feed"             element={<p className="text-2xl text-primary">Feed</p>} />
          <Route path="/coaches"          element={<p className="text-2xl text-primary">Coaches</p>} />
          <Route path="/personal-trainer" element={<p className="text-2xl text-primary">Personal Trainer</p>} />
          <Route path="/profile"          element={<Profile />} />
          <Route path="/create-meal"      element={<p className="text-2xl text-primary">Create Meal</p>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

import { BrowserRouter, Routes, Route } from "react-router-dom"
import AuthPage from "./features/auth/AuthPage"
import Home from "./features/Home"
import ProtectedRoute from "./routes/ProtectedRoute"
import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { fetchMe } from "./features/auth/authSlice"
import type { AppDispatch } from "./app/store"

function App() {
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {

    const token = localStorage.getItem("token")

    if (token) {
      dispatch(fetchMe())
    }

  }, [])
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/auth" element={<AuthPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

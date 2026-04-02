import { BrowserRouter, Routes, Route } from "react-router-dom"
import AuthPage from "./features/auth/AuthPage"
import Home from "./features/Home"
import ProtectedRoute from "./routes/ProtectedRoute"
import { useEffect, type JSX } from "react"
import { useDispatch } from "react-redux"
import { fetchMe } from "./features/auth/authSlice"
import type { AppDispatch } from "./app/store"
import Profile from "./features/Profile"

function App() {
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {

    const token = localStorage.getItem("token")

    if (token) {
      dispatch(fetchMe())
    }

  }, [])

  function protectedRoute(element: JSX.Element) {
    return (
      <ProtectedRoute>
        {element}
      </ProtectedRoute>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={protectedRoute(<Home children={undefined} />)} />
        <Route path="/profile" element={protectedRoute(<Profile />)} />
        <Route path="/auth" element={<AuthPage />} />
      </Routes>
    </BrowserRouter >
  )
}

export default App

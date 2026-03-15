import { BrowserRouter, Routes, Route } from "react-router-dom"
import AuthPage from "./features/auth/AuthPage"
import Home from "./features/Home"
import ProtectedRoute from "./routes/ProtectedRoute"


function App() {
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

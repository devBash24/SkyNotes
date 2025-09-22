import { Navigate, Route, Routes } from "react-router-dom"
import { AuthPage } from "./Pages/auth"
import { MainPage } from "./Pages/main"
import { NewEntryPage } from "./Pages/new-entry"
import { SignUpPage } from "./Pages/signup"

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/entries/new" element={<NewEntryPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App

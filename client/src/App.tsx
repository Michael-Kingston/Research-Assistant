import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Layout from "./components/Layout"
import { SettingsProvider } from "./contexts/SettingsContext"
import ChatPage from "./pages/ChatPage"
import UploadPage from "./pages/UploadPage"
import StatisticsPage from "./pages/StatisticsPage"
import HistoryPage from "./pages/HistoryPage"
import ErrorBoundary from "./components/ErrorBoundary"

function App() {
  return (
    <Router>
      <SettingsProvider>
        <ErrorBoundary>
          <Layout>
            <Routes>
              <Route path="/" element={<ChatPage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/statistics" element={<StatisticsPage />} />
              <Route path="/history" element={<HistoryPage />} />
            </Routes>
          </Layout>
        </ErrorBoundary>
      </SettingsProvider>
    </Router>
  )
}

export default App

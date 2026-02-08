import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Layout from "./components/Layout"
import ChatPage from "./pages/ChatPage"
import UploadPage from "./pages/UploadPage"
import StatisticsPage from "./pages/StatisticsPage"
import ErrorBoundary from "./components/ErrorBoundary"

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <Layout>
          <Routes>
            <Route path="/" element={<ChatPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/statistics" element={<StatisticsPage />} />
          </Routes>
        </Layout>
      </ErrorBoundary>
    </Router>
  )
}

export default App

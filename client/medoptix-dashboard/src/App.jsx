import { Routes, Route } from 'react-router-dom'

// Import pages
import Overview from './pages/Overview'
import ABTesting from './pages/ABTesting'
import DepartmentStats from './pages/DepartmentStats'
import OperationalInsights from './pages/OperationalInsights'
import Recommendations from './pages/Recommendations'
import NoShowPrediction from './pages/NoShowPrediction'
import RealTimeAlerts from './pages/RealTimeAlerts'
import RescheduleRecommendations from './pages/RescheduleRecommendations'
import FeedbackLoop from './pages/FeedbackLoop'
import ModelMonitoring from './pages/ModelMonitoring'

// Import components
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import { ThemeProvider } from './components/ThemeProvider'

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="medoptix-theme">
      <div className="flex min-h-screen bg-background">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:ml-64">
          {/* Header */}
          <Header />

          {/* Page Content */}
          <main className="flex-1 overflow-auto p-6">
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/ab-testing" element={<ABTesting />} />
              <Route path="/department-stats" element={<DepartmentStats />} />
              <Route path="/operational-insights" element={<OperationalInsights />} />
              <Route path="/recommendations" element={<Recommendations />} />
              <Route path="/no-show-prediction" element={<NoShowPrediction />} />
              <Route path="/real-time-alerts" element={<RealTimeAlerts />} />
              <Route path="/reschedule-recommendations" element={<RescheduleRecommendations />} />
              <Route path="/feedback-loop" element={<FeedbackLoop />} />
              <Route path="/model-monitoring" element={<ModelMonitoring />} />
            </Routes>
          </main>
        </div>
      </div>
    </ThemeProvider>
  )
}

export default App

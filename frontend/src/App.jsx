import { useState } from 'react'
import Dashboard from './pages/Dashboard'
import CalendarView from './pages/CalendarView'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')

  const renderPage = () => {
    switch (currentPage) {
      case 'calendar':
        return <CalendarView />
      case 'dashboard':
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="dark min-h-screen">
      {renderPage()}
    </div>
  )
}

export default App

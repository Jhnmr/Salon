/**
 * BottomNavigation Component
 *
 * Bottom navigation bar with 4 items
 */
import { useState } from 'react'

export default function BottomNavigation({ activeTab: initialTab = 'home', onTabChange }) {
  const [activeTab, setActiveTab] = useState(initialTab)

  const tabs = [
    { id: 'home', label: 'Home', icon: HomeIcon },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
    { id: 'bookings', label: 'Bookings', icon: BookingsIcon },
    { id: 'customers', label: 'Customers', icon: CustomersIcon },
  ]

  const handleTabClick = (tabId) => {
    setActiveTab(tabId)
    if (onTabChange) onTabChange(tabId)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-salon-black-light border-t border-salon-gray-dark">
      <div className="flex items-center justify-around px-4 py-3">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex flex-col items-center gap-1 min-w-[60px] transition-all ${
                isActive ? 'text-salon-yellow' : 'text-salon-gray-text'
              }`}
            >
              <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-salon-yellow/10' : ''}`}>
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

// Icon Components
function HomeIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )
}

function CalendarIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}

function BookingsIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  )
}

function CustomersIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  )
}

/**
 * Calendar Component
 *
 * Monthly calendar selector with highlighted active day
 */
import { useState } from 'react'

export default function Calendar({ selectedDate: initialDate, onDateSelect }) {
  const [selectedDate, setSelectedDate] = useState(initialDate || new Date())

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  // Generate sample days for current week (simplified)
  const currentWeekDays = [
    { day: 'Mon', date: 18 },
    { day: 'Tue', date: 19 },
    { day: 'Wed', date: 20 },
    { day: 'Thu', date: 21 },
    { day: 'Fri', date: 22 },
    { day: 'Sat', date: 23 },
    { day: 'Sun', date: 24 },
  ]

  const currentMonth = selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const currentDayOfWeek = selectedDate.getDay()

  const handleDateClick = (dayData) => {
    const newDate = new Date(selectedDate)
    newDate.setDate(dayData.date)
    setSelectedDate(newDate)
    if (onDateSelect) onDateSelect(newDate)
  }

  return (
    <div className="bg-salon-gray-dark rounded-2xl p-4">
      {/* Month/Year Header */}
      <div className="flex items-center justify-between mb-4">
        <button className="p-2 hover:bg-salon-gray-light rounded-xl transition-colors">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="text-white font-semibold">{currentMonth}</h3>
        <button className="p-2 hover:bg-salon-gray-light rounded-xl transition-colors">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Days of Week */}
      <div className="grid grid-cols-7 gap-2 mb-3">
        {currentWeekDays.map((dayData, index) => {
          const isToday = index === 2 // Simplified: Wednesday is "today"
          const isSelected = isToday

          return (
            <button
              key={index}
              onClick={() => handleDateClick(dayData)}
              className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl transition-all ${
                isSelected
                  ? 'bg-salon-yellow text-salon-black font-bold shadow-float'
                  : 'text-salon-gray-text hover:bg-salon-gray-light hover:text-white'
              }`}
            >
              <span className="text-xs uppercase">{dayData.day}</span>
              <span className="text-lg font-semibold">{dayData.date}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

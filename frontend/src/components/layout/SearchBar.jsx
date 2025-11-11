/**
 * SearchBar Component
 *
 * Search input with rounded corners and icon
 */
import { useState } from 'react'

export default function SearchBar({ placeholder = 'Search...', onSearch }) {
  const [value, setValue] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (onSearch) onSearch(value)
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-salon-gray-dark text-white placeholder-salon-gray-text rounded-2xl px-5 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-salon-yellow transition-all"
      />
      <button
        type="submit"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-salon-gray-text hover:text-salon-yellow transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    </form>
  )
}

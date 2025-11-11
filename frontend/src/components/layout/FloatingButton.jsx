/**
 * FloatingButton Component
 *
 * Floating action button (FAB) in bottom right corner
 */
export default function FloatingButton({ onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-6 w-14 h-14 bg-salon-yellow text-salon-black rounded-full shadow-float hover:shadow-glow hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center z-40"
      aria-label={label || 'Add'}
    >
      {icon || (
        <svg className="w-7 h-7 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
        </svg>
      )}
    </button>
  )
}

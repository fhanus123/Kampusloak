export default function Badge({ children, className = 'bg-mint text-ink' }) {
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${className}`}>
      {children}
    </span>
  )
}
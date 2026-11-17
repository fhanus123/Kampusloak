import { Star } from 'lucide-react'

export default function StarRating({ value = 0, onChange, size = 'h-6 w-6' }) {
  const readOnly = !onChange

  return (
    <div className="flex gap-1" role={readOnly ? 'img' : 'radiogroup'} aria-label={`${value} dari 5 bintang`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= value
        const star = <Star className={`${size} ${filled ? 'fill-gold text-gold' : 'text-ink/30'}`} />
        return readOnly ? (
          <span key={n}>{star}</span>
        ) : (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={n === value}
            aria-label={`${n} bintang`}
            onClick={() => onChange(n)}
            className="rounded transition hover:scale-110"
          >
            {star}
          </button>
        )
      })}
    </div>
  )
}
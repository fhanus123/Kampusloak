import { useState } from 'react'
import { ImageOff } from 'lucide-react'

export default function ImageGallery({ images = [], title }) {
  const [active, setActive] = useState(0)

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-xl bg-white text-ink/30">
        <ImageOff className="h-16 w-16" />
      </div>
    )
  }

  return (
    <div className="flex flex-col-reverse gap-3 md:flex-row">
      {images.length > 1 && (
        <div className="flex gap-2 md:flex-col">
          {images.map((src, index) => (
            <button
              key={src}
              onClick={() => setActive(index)}
              aria-label={`Lihat foto ${index + 1}`}
              className={`h-14 w-14 overflow-hidden rounded-lg border-2 ${
                index === active ? 'border-brand' : 'border-transparent'
              }`}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
      <div className="aspect-square flex-1 overflow-hidden rounded-xl bg-white">
        <img src={images[active]} alt={title} className="h-full w-full object-cover" />
      </div>
    </div>
  )
}
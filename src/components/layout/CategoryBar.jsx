import { NavLink } from 'react-router-dom'

export default function CategoryBar({ categories }) {
  return (
    <div className="bg-nav-sub text-white">
      <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 text-sm">
        <NavLink to="/search" end className="whitespace-nowrap px-3 py-2 font-semibold hover:bg-brand">
          Semua
        </NavLink>
        {categories.map((c) => (
          <NavLink
            key={c.id}
            to={`/search?category=${c.slug}`}
            className="whitespace-nowrap px-3 py-2 hover:bg-brand"
          >
            {c.name}
          </NavLink>
        ))}
      </div>
    </div>
  )
}
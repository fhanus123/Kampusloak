export default function EmptyState({ title, description }) {
  return (
    <div className="rounded-xl bg-white p-10 text-center shadow-sm">
      <p className="font-bold">{title}</p>
      {description && <p className="mt-1 text-sm text-ink/70">{description}</p>}
    </div>
  )
}
import Button from './Button'

export default function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded-xl bg-white p-8 text-center shadow-sm">
      <p className="mb-4 text-sm">{message}</p>
      {onRetry && <Button variant="outline" onClick={onRetry}>Coba Lagi</Button>}
    </div>
  )
}
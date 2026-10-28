export default function FormField({ label, error, id, ...inputProps }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-semibold">
        {label}
      </label>
      <input
        id={id}
        className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand ${
          error ? 'border-red-500' : 'border-ink/20'
        }`}
        {...inputProps}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
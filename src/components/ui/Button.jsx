const variants = {
  cta: 'bg-cta text-ink hover:brightness-95',
  primary: 'bg-nav-sub text-white hover:bg-brand',
  outline: 'border border-ink/20 bg-white text-ink hover:bg-mint/30',
}

export default function Button({
  variant = 'primary',
  loading = false,
  className = '',
  children,
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {children}
    </button>
  )
}
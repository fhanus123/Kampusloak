import { Loader2 } from 'lucide-react'

export default function Spinner({ fullPage = false }) {
  const icon = <Loader2 className="h-8 w-8 animate-spin text-brand" aria-label="Memuat" />
  if (!fullPage) return icon
  return <div className="flex min-h-screen items-center justify-center">{icon}</div>
}
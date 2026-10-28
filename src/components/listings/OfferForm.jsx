import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { offerSchema } from '../../schemas/offer'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../hooks/useAuth'
import Button from '../ui/Button'
import FormField from '../ui/FormField'

export default function OfferForm({ listing }) {
  const { user } = useAuth()
  const [serverError, setServerError] = useState('')
  const [sent, setSent] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(offerSchema),
    defaultValues: { amount: listing.price, message: '' },
  })

  const onSubmit = async ({ amount, message }) => {
    setServerError('')
    const { error } = await supabase
      .from('offers')
      .insert({
        listing_id: listing.id,
        buyer_id: user.id,
        amount,
        message: message || null,
      })
      .select()
      .single()

    if (error) {
      setServerError(
        error.message.includes('row-level security')
          ? 'Barang ini tidak lagi tersedia untuk ditawar.'
          : 'Gagal mengirim penawaran. Coba lagi.'
      )
      return
    }

    reset()
    setSent(true)
  }

  if (sent) {
    return (
      <div className="rounded-lg bg-mint/40 p-3 text-sm">
        Penawaran terkirim. Pantau statusnya di{' '}
        <Link to="/offers" className="font-semibold underline">halaman Penawaran</Link>.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
      <FormField id="amount" label="Tawaran Anda (Rp)" type="number" inputMode="numeric" error={errors.amount?.message} {...register('amount')} />
      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-semibold">Pesan (opsional)</label>
        <textarea
          id="message"
          rows={3}
          placeholder="Contoh: Bisa COD di Fakultas Ilmu Komputer?"
          className="w-full rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand"
          {...register('message')}
        />
        {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message.message}</p>}
      </div>

      {serverError && <p role="alert" className="rounded-lg bg-gold/40 p-3 text-sm">{serverError}</p>}

      <Button type="submit" variant="cta" className="w-full" loading={isSubmitting}>
        {isSubmitting ? 'Mengirim...' : 'Kirim penawaran'}
      </Button>
    </form>
  )
}
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { reviewSchema } from '../../schemas/review'
import { supabase } from '../../lib/supabaseClient'
import { formatDateTime } from '../../lib/format'
import { useAuth } from '../../hooks/useAuth'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import StarRating from './StarRating'

const EDIT_WINDOW_MS = 7 * 24 * 60 * 60 * 1000

const ROLE_BADGE = {
  seller: { label: 'Dari penjual', className: 'bg-gold text-ink' },
  buyer: { label: 'Dari pembeli', className: 'bg-mint text-ink' },
}

export default function ReviewItem({ review, onChanged }) {
  const { user, isAdmin } = useAuth()
  const [editing, setEditing] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const isOwner = user?.id === review.reviewer_id
  const withinWindow = Date.now() - new Date(review.created_at).getTime() < EDIT_WINDOW_MS
  const canEdit = isOwner && withinWindow
  const canDelete = canEdit || isAdmin
  const badge = ROLE_BADGE[review.reviewer_role]
  const edited = review.updated_at !== review.created_at

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: review.rating, comment: review.comment ?? '' },
  })

  const save = async ({ rating, comment }) => {
    setError('')
    const { error: updateError } = await supabase
      .from('reviews')
      .update({ rating, comment: comment || null })
      .eq('id', review.id)
    if (updateError) {
      setError('Gagal menyimpan. Batas waktu edit 7 hari mungkin sudah lewat.')
      return
    }
    setEditing(false)
    onChanged()
  }

  const remove = async () => {
    if (!window.confirm('Hapus ulasan ini?')) return
    setBusy(true)
    setError('')
    const { error: deleteError } = await supabase.from('reviews').delete().eq('id', review.id)
    setBusy(false)
    if (deleteError) {
      setError('Gagal menghapus ulasan.')
      return
    }
    onChanged()
  }

  return (
    <li className="space-y-2 rounded-xl bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold">{review.reviewerName}</span>
          <Badge className={badge.className}>{badge.label}</Badge>
        </div>
        <span className="text-xs text-ink/60">
          {formatDateTime(review.created_at)}{edited && ' (diedit)'}
        </span>
      </div>

      <p className="rounded-md bg-page px-3 py-2 text-sm text-ink">
        <span className="font-semibold">Produk:</span>{' '}
        {review.listing_title?.trim() || 'Informasi produk tidak tersedia'}
      </p>

      {editing ? (
        <form onSubmit={handleSubmit(save)} className="space-y-2" noValidate>
          <Controller
            name="rating"
            control={control}
            render={({ field }) => <StarRating value={field.value} onChange={field.onChange} />}
          />
          {errors.rating && <p className="text-xs text-red-600">{errors.rating.message}</p>}
          <textarea
            rows={3}
            aria-label="Komentar"
            className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand"
            {...register('comment')}
          />
          {errors.comment && <p className="text-xs text-red-600">{errors.comment.message}</p>}
          <div className="flex gap-2">
            <Button type="submit" loading={isSubmitting}>Simpan</Button>
            <Button type="button" variant="outline" onClick={() => setEditing(false)}>Batal</Button>
          </div>
        </form>
      ) : (
        <>
          <StarRating value={review.rating} size="h-4 w-4" />
          {review.comment && <p className="whitespace-pre-line text-sm">{review.comment}</p>}
        </>
      )}

      {error && <p role="alert" className="text-xs text-red-600">{error}</p>}

      {!editing && canDelete && (
        <div className="flex gap-3 text-xs font-semibold">
          {canEdit && (
            <button onClick={() => setEditing(true)} className="text-nav-sub hover:underline">Edit</button>
          )}
          <button onClick={remove} disabled={busy} className="text-red-700 hover:underline disabled:opacity-60">
            Hapus
          </button>
        </div>
      )}
    </li>
  )
}
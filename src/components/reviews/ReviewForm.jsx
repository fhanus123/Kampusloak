import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { reviewSchema } from '../../schemas/review'
import { supabase } from '../../lib/supabaseClient'
import Button from '../ui/Button'
import StarRating from './StarRating'

export default function ReviewForm({ transactionId, targetLabel, onDone }) {
  const [serverError, setServerError] = useState('')

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, comment: '' },
  })

  const onSubmit = async ({ rating, comment }) => {
    setServerError('')
    const { error } = await supabase.rpc('submit_review', {
      p_transaction_id: transactionId,
      p_rating: rating,
      p_comment: comment || null,
    })
    if (error) {
      setServerError(error.message)
      return
    }
    onDone()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
      <p className="text-sm font-semibold">Beri ulasan untuk {targetLabel}</p>

      <div>
        <Controller
          name="rating"
          control={control}
          render={({ field }) => <StarRating value={field.value} onChange={field.onChange} />}
        />
        {errors.rating && <p className="mt-1 text-xs text-red-600">{errors.rating.message}</p>}
      </div>

      <div>
        <label htmlFor="review-comment" className="mb-1 block text-sm font-semibold">Komentar (opsional)</label>
        <textarea
          id="review-comment"
          rows={3}
          placeholder="Ceritakan pengalaman transaksi Anda"
          className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand"
          {...register('comment')}
        />
        {errors.comment && <p className="mt-1 text-xs text-red-600">{errors.comment.message}</p>}
      </div>

      {serverError && <p role="alert" className="rounded-lg bg-gold/40 p-3 text-sm">{serverError}</p>}

      <Button type="submit" variant="cta" loading={isSubmitting}>
        {isSubmitting ? 'Mengirim...' : 'Kirim ulasan'}
      </Button>
    </form>
  )
}
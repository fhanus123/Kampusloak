import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { dealPriceSchema } from '../../schemas/review'
import { supabase } from '../../lib/supabaseClient'
import Button from '../ui/Button'
import FormField from '../ui/FormField'

export default function SellForm({ listing, buyerId, otherName, onDone, onCancel }) {
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(dealPriceSchema), defaultValues: { price: listing.price } })

  const onSubmit = async ({ price }) => {
    setServerError('')
    const { error } = await supabase.rpc('sell_to_buyer', {
      p_listing_id: listing.id,
      p_buyer_id: buyerId,
      p_price: price,
    })
    if (error) {
      setServerError(error.message)
      return
    }
    onDone()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2 border-t border-ink/10 bg-mint/20 p-3" noValidate>
      <p className="text-sm font-semibold">Catat kesepakatan dengan {otherName} (1 unit)</p>
      <FormField
        id="deal-price"
        label="Harga kesepakatan (Rp)"
        type="number"
        inputMode="numeric"
        error={errors.price?.message}
        {...register('price')}
      />
      {serverError && <p role="alert" className="text-xs text-red-600">{serverError}</p>}
      <div className="flex gap-2">
        <Button type="submit" variant="cta" loading={isSubmitting}>Catat penjualan</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Batal</Button>
      </div>
    </form>
  )
}
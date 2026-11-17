import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { BadgeCheck, Clock } from 'lucide-react'
import { dealPriceSchema } from '../../schemas/review'
import { supabase } from '../../lib/supabaseClient'
import { formatRupiah } from '../../lib/format'
import { useAuth } from '../../hooks/useAuth'
import { useChatTransaction } from '../../hooks/useChatTransaction'
import Button from '../ui/Button'
import FormField from '../ui/FormField'
import ReviewForm from '../reviews/ReviewForm'
import StarRating from '../reviews/StarRating'

export default function TransactionPanel({ listing, buyerId, sellerId, otherName }) {
  const { user } = useAuth()
  const isSeller = user.id === sellerId
  const { transaction: tx, myReview, loading, error, refetch } = useChatTransaction(listing.id, buyerId)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState('')
  const [selling, setSelling] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(dealPriceSchema), defaultValues: { price: listing.price } })

  const runRpc = async (name, args) => {
    setBusy(true)
    setActionError('')
    const { error: rpcError } = await supabase.rpc(name, args)
    setBusy(false)
    if (rpcError) {
      setActionError(rpcError.message)
      return false
    }
    refetch(true)
    return true
  }

  const sell = async ({ price }) => {
    const ok = await runRpc('sell_to_buyer', {
      p_listing_id: listing.id,
      p_buyer_id: buyerId,
      p_price: price,
    })
    if (ok) setSelling(false)
  }

  const cancel = () => {
    if (window.confirm('Batalkan transaksi ini? Stok barang dikembalikan.')) {
      runRpc('cancel_transaction', { p_transaction_id: tx.id })
    }
  }

  if (loading) return null
  if (error) {
    return (
      <div className="border-b border-ink/10 bg-gold/30 p-3 text-center text-sm">
        {error}{' '}
        <button onClick={() => refetch()} className="font-semibold underline">Coba Lagi</button>
      </div>
    )
  }

  // Belum ada transaksi: hanya penjual yang bisa memulai, dan hanya kalau barang masih tayang
  if (!tx) {
    if (!isSeller || listing.status !== 'approved') return null
    return (
      <div className="border-b border-ink/10 bg-mint/20 p-3">
        {!selling ? (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm">Sudah sepakat dengan {otherName}?</p>
            <Button onClick={() => setSelling(true)}>Jual ke pembeli ini</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(sell)} className="space-y-2" noValidate>
            <FormField
              id="deal-price"
              label="Harga kesepakatan (Rp)"
              type="number"
              inputMode="numeric"
              error={errors.price?.message}
              {...register('price')}
            />
            <div className="flex gap-2">
              <Button type="submit" variant="cta" loading={isSubmitting || busy}>Catat penjualan</Button>
              <Button type="button" variant="outline" onClick={() => setSelling(false)}>Batal</Button>
            </div>
          </form>
        )}
        {actionError && <p role="alert" className="mt-2 text-xs text-red-600">{actionError}</p>}
      </div>
    )
  }

  if (tx.status === 'pending') {
    return (
      <div className="space-y-2 border-b border-ink/10 bg-gold/30 p-3 text-sm">
        <p className="flex items-start gap-2">
          <Clock className="mt-0.5 h-4 w-4 shrink-0" />
          {isSeller
            ? `Menunggu ${otherName} mengonfirmasi barang diterima (${formatRupiah(tx.price)}).`
            : `Penjual mencatat barang ini terjual kepada Anda seharga ${formatRupiah(tx.price)}. Konfirmasi setelah barang Anda terima.`}
        </p>
        <div className="flex flex-wrap gap-2">
          {!isSeller && (
            <Button loading={busy} onClick={() => runRpc('confirm_receipt', { p_transaction_id: tx.id })}>
              Ya, saya sudah menerima barang
            </Button>
          )}
          <Button variant="outline" loading={busy} onClick={cancel}>Batalkan transaksi</Button>
        </div>
        {actionError && <p role="alert" className="text-xs text-red-600">{actionError}</p>}
      </div>
    )
  }

  // completed
  return (
    <div className="space-y-3 border-b border-ink/10 bg-mint/20 p-3 text-sm">
      <p className="flex items-start gap-2">
        <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-nav-sub" />
        Transaksi selesai ({formatRupiah(tx.price)}).
      </p>
      {myReview ? (
        <div>
          <p className="font-semibold">Ulasan Anda untuk {otherName}</p>
          <StarRating value={myReview.rating} size="h-4 w-4" />
          {myReview.comment && <p className="mt-1 text-xs">{myReview.comment}</p>}
          <Link
            to={`/users/${isSeller ? buyerId : sellerId}`}
            className="mt-1 inline-block text-xs font-semibold text-nav-sub underline"
          >
            Lihat profil {otherName}
          </Link>
        </div>
      ) : (
        <ReviewForm transactionId={tx.id} targetLabel={otherName} onDone={() => refetch(true)} />
      )}
    </div>
  )
}
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BadgeCheck, Clock, X } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { formatRupiah } from '../../lib/format'
import { useAuth } from '../../hooks/useAuth'
import Button from '../ui/Button'
import ReviewForm from '../reviews/ReviewForm'
import StarRating from '../reviews/StarRating'

export default function TransactionCard({ tx, review, otherName, onChanged }) {
  const { user } = useAuth()
  const isSeller = user.id === tx.seller_id
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState('')

  const runRpc = async (name) => {
    setBusy(true)
    setActionError('')
    const { error } = await supabase.rpc(name, { p_transaction_id: tx.id })
    setBusy(false)
    if (error) {
      setActionError(error.message)
      return
    }
    onChanged(true)
  }

  const cancel = () => {
    if (window.confirm('Batalkan transaksi ini? Stok barang dikembalikan.')) runRpc('cancel_transaction')
  }

  if (tx.status === 'pending') {
    return (
      <div className="space-y-2 rounded-lg bg-gold/30 p-3 text-sm">
        <p className="flex items-start gap-2">
          <Clock className="mt-0.5 h-4 w-4 shrink-0" />
          {isSeller
            ? `Menunggu ${otherName} mengonfirmasi barang diterima (${formatRupiah(tx.price)}).`
            : `Penjual mencatat barang ini terjual kepada Anda seharga ${formatRupiah(tx.price)}. Konfirmasi setelah barang Anda terima.`}
        </p>
        <div className="flex flex-wrap gap-2">
          {!isSeller && (
            <Button loading={busy} onClick={() => runRpc('confirm_receipt')}>
              Ya, saya sudah menerima barang
            </Button>
          )}
          <Button variant="outline" loading={busy} onClick={cancel}>Batalkan transaksi</Button>
        </div>
        {actionError && <p role="alert" className="text-xs text-red-600">{actionError}</p>}
      </div>
    )
  }

  const hidden = isSeller ? tx.seller_banner_hidden : tx.buyer_banner_hidden
  if (review && hidden) return null

  const otherId = isSeller ? tx.buyer_id : tx.seller_id

  return (
    <div className="relative space-y-3 rounded-lg bg-mint/20 p-3 pr-10 text-sm">
      {review && (
        <button
          type="button"
          onClick={() => runRpc('dismiss_transaction_banner')}
          disabled={busy}
          aria-label="Tutup info transaksi"
          className="absolute right-2 top-2 rounded-full p-1.5 text-ink/60 hover:bg-white hover:text-ink disabled:opacity-60"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      <p className="flex items-start gap-2">
        <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-nav-sub" />
        Transaksi selesai ({formatRupiah(tx.price)}).
      </p>

      {review ? (
        <div>
          <p className="font-semibold">Ulasan Anda untuk {otherName}</p>
          <StarRating value={review.rating} size="h-4 w-4" />
          {review.comment && <p className="mt-1 text-xs">{review.comment}</p>}
          <Link
            to={`/users/${otherId}`}
            className="link-action mt-1 inline-block text-xs"
          >
            Lihat profil {otherName}
          </Link>
        </div>
      ) : (
        <ReviewForm transactionId={tx.id} targetLabel={otherName} onDone={() => onChanged(true)} />
      )}
      {actionError && <p role="alert" className="text-xs text-red-600">{actionError}</p>}
    </div>
  )
}
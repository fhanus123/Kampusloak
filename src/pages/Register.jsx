import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema } from '../schemas/auth'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/ui/Button'
import FormField from '../components/ui/FormField'

export default function Register() {
  const { signUp } = useAuth()
  const [serverError, setServerError] = useState('')
  const [needsConfirm, setNeedsConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(registerSchema) })

  const onSubmit = async (values) => {
    setServerError('')
    const { data, error } = await signUp(values)

    if (error) {
      const msg = error.message.toLowerCase()
      if (msg.includes('database error')) {
        setServerError('NIM sudah terdaftar. Gunakan NIM milik Anda sendiri.')
      } else if (msg.includes('already registered')) {
        setServerError('Email sudah terdaftar. Silakan masuk.')
      } else {
        setServerError(error.message)
      }
      return
    }

    reset()
    // Tanpa sesi berarti konfirmasi email aktif
    if (!data.session) setNeedsConfirm(true)
  }

  if (needsConfirm) {
    return (
      <div className="mx-auto mt-16 max-w-md rounded-xl bg-white p-8 text-center shadow">
        <h1 className="text-xl font-bold">Cek email Anda</h1>
        <p className="mt-2 text-sm">
          Kami mengirim tautan konfirmasi. Klik tautan itu, lalu masuk.
        </p>
        <Link to="/login" className="mt-4 inline-block font-semibold text-nav-sub underline">
          Ke halaman masuk
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto my-10 max-w-md rounded-xl bg-white p-8 shadow">
      <h1 className="mb-1 text-2xl font-bold">Buat akun</h1>
      <p className="mb-6 text-sm text-ink/70">
        Khusus mahasiswa dan alumni UNSRI.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField id="fullName" label="Nama lengkap" error={errors.fullName?.message} {...register('fullName')} />
        <FormField id="nim" label="NIM" inputMode="numeric" error={errors.nim?.message} {...register('nim')} />
        <FormField id="email" label="Email" type="email" error={errors.email?.message} {...register('email')} />
        <FormField id="password" label="Password" type="password" error={errors.password?.message} {...register('password')} />
        <FormField id="confirmPassword" label="Ulangi password" type="password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />

        {serverError && (
          <p role="alert" className="rounded-lg bg-gold/40 p-3 text-sm">{serverError}</p>
        )}

        <Button type="submit" variant="cta" className="w-full" loading={isSubmitting}>
          {isSubmitting ? 'Mendaftar...' : 'Daftar'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm">
        Sudah punya akun?{' '}
        <Link to="/login" className="font-semibold text-nav-sub underline">Masuk</Link>
      </p>
    </div>
  )
}
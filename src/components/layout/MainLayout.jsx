import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import { useCategories } from '../../hooks/useCategories'

export default function MainLayout() {
  const categories = useCategories()

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar categories={categories} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
        <Outlet context={{ categories }} />
      </main>
      <Footer />
    </div>
  )
}
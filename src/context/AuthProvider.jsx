import { createContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setProfile(error ? null : data)
  }, [])

  useEffect(() => {
    // Pulihkan sesi saat refresh
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session)
      if (data.session) await fetchProfile(data.session.user.id)
      setLoading(false)
    })

    // Pantau perubahan sesi (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession)
        if (newSession) {
          // setTimeout menghindari deadlock pemanggilan Supabase di dalam callback
          setTimeout(() => fetchProfile(newSession.user.id), 0)
        } else {
          setProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  const signUp = ({ email, password, fullName, nim }) =>
    supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, nim } },
    })

  const signIn = ({ email, password }) =>
    supabase.auth.signInWithPassword({ email, password })

  const signOut = () => supabase.auth.signOut()

  const refreshProfile = () => session && fetchProfile(session.user.id)

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    loading,
    isAdmin: profile?.role === 'admin',
    isVerified: profile?.verification_status === 'verified',
    signUp,
    signIn,
    signOut,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
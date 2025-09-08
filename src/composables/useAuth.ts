import { ref, reactive } from 'vue'
import { supabase } from '../config/supabase'
import type { User } from '@supabase/supabase-js'

const user = ref<User | null>(null)
const loading = ref(false)
const error = ref<string>('')

export function useAuth() {
  const signUp = async (email: string, password: string, fullName: string, phone?: string) => {
    loading.value = true
    error.value = ''
    
    try {
      console.log('Iniciando registro para:', email)
      
      // 1. First create the user in auth.users
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          data: {
            full_name: fullName.trim(),
            ...(phone?.trim() ? { phone: phone.trim() } : {})
          }
        }
      })
      
      if (signUpError) {
        console.error('Error en signUp:', signUpError)
        throw new Error('Error al crear el usuario: ' + signUpError.message)
      }
      
      if (!data.user) {
        throw new Error('No se pudo crear el usuario: respuesta inválida del servidor')
      }
      
      console.log('Usuario creado en auth.users:', data.user.id)
      
      // Check if email confirmation is required
      if (!data.session) {
        // Email confirmation is required
        return { success: true, emailConfirmationRequired: true }
      }
      
      // If we have a session, the user is automatically signed in
      user.value = data.user
      return { success: true, user: data.user }
    } catch (err: any) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const signIn = async (email: string, password: string) => {
    loading.value = true
    error.value = ''
    
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (signInError) throw signInError
      
      user.value = data.user
      return { success: true }
    } catch (err: any) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const signOut = async () => {
    loading.value = true
    
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      user.value = null
      return { success: true }
    } catch (err: any) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const getCurrentUser = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      user.value = currentUser
      return currentUser
    } catch (err) {
      console.error('Error getting current user:', err)
      return null
    }
  }

  const isAdmin = async (): Promise<boolean> => {
    if (!user.value) return false
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.value.id)
        .single()
      
      if (error) throw error
      
      return data?.is_admin || false
    } catch (err) {
      console.error('Error checking admin status:', err)
      return false
    }
  }

  // Escuchar cambios de autenticación
  supabase.auth.onAuthStateChange((event, session) => {
    user.value = session?.user || null
    
    // Handle email confirmation
    if (event === 'SIGNED_IN' && session?.user) {
      // User has been confirmed and signed in
      console.log('Usuario confirmado y autenticado:', session.user.email)
    }
  })

  return {
    user: user.value,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    getCurrentUser,
    isAdmin
  }
}
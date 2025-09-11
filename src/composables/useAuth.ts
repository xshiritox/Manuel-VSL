import { ref } from 'vue'
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
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('La conexión está tardando demasiado. Por favor, intenta de nuevo.')), 15000)
      })
      
      // 1. First create the user in auth.users
      const authPromise = supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          data: {
            full_name: fullName.trim(),
            ...(phone?.trim() ? { phone: phone.trim() } : {})
          }
        }
      })
      
      const { data, error: signUpError } = await Promise.race([authPromise, timeoutPromise]) as any
      
      if (signUpError) {
        console.error('Error en signUp:', signUpError)
        
        // Handle specific error messages
        if (signUpError.message.includes('User already registered')) {
          throw new Error('Este correo electrónico ya está registrado. Por favor, inicia sesión o usa otro correo.')
        } else if (signUpError.message.includes('password')) {
          throw new Error('La contraseña debe tener al menos 6 caracteres')
        } else if (signUpError.message.includes('invalid email')) {
          throw new Error('Por favor, ingresa un correo electrónico válido')
        } else {
          throw new Error('Error al crear el usuario: ' + signUpError.message)
        }
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
      console.error('Error en signUp:', err)
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
      console.log('Iniciando signIn para:', email)
      
      // Create AbortController for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        controller.abort()
        console.log('Timeout alcanzado, abortando petición')
      }, 15000)
      
      try {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim()
        })
        
        clearTimeout(timeoutId)
        
        if (signInError) {
          console.error('Error en signIn:', signInError)
          
          // Handle specific error messages
          if (signInError.message.includes('Invalid login credentials')) {
            throw new Error('Correo electrónico o contraseña incorrectos')
          } else if (signInError.message.includes('Email not confirmed')) {
            throw new Error('Por favor, confirma tu correo electrónico antes de iniciar sesión')
          } else if (signInError.message.includes('Too many requests')) {
            throw new Error('Demasiados intentos. Por favor, espera unos minutos e intenta de nuevo')
          } else if (signInError.message.includes('Invalid Refresh Token') || 
                     signInError.message.includes('Refresh Token Not Found')) {
            // Limpiar la sesión local
            await supabase.auth.signOut()
            throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.')
          } else {
            throw new Error(signInError.message || 'Error al iniciar sesión')
          }
        }
        
        if (!data.user) {
          throw new Error('No se pudo iniciar sesión. Por favor, intenta de nuevo.')
        }
        
        user.value = data.user
        console.log('Login exitoso para:', data.user.email)
        return { success: true }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          throw new Error('La conexión está tardando demasiado. Por favor, intenta de nuevo.')
        }
        throw err
      }
    } catch (err: any) {
      console.error('Error en signIn:', err)
      error.value = err.message || 'Ocurrió un error al iniciar sesión'
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
      const { data: { user: currentUser }, error } = await supabase.auth.getUser()
      
      if (error) {
        if (error.message.includes('Invalid Refresh Token') || 
            error.message.includes('Refresh Token Not Found')) {
          console.error('Error de token de actualización:', error)
          // Limpiar la sesión local
          await supabase.auth.signOut()
          user.value = null
          throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.')
        } else {
          throw error
        }
      }
      
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
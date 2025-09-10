import { ref } from 'vue'
import { supabase } from '../config/supabase'
import type { Appointment } from '../config/supabase'

const appointments = ref<Appointment[]>([])
const loading = ref(false)
const error = ref<string>('')

export function useAppointments() {
  const createAppointment = async (date: string, time: string = '', notes?: string) => {
    loading.value = true
    error.value = ''
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) throw new Error('Usuario no autenticado')
      
      const { data, error: createError } = await supabase
        .from('appointments')
        .insert([
          {
            user_id: user.id,
            date,
            time: time || null,
            status: 'pending',
            notes
          }
        ])
        .select()
      
      if (createError) throw createError
      
      return { success: true, data }
    } catch (err: any) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const getUserAppointments = async () => {
    loading.value = true
    error.value = ''
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) throw new Error('Usuario no autenticado')
      
      const { data, error: fetchError } = await supabase
        .from('appointments')
        .select(`
          *,
          profile:profiles(*)
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: true })
      
      if (fetchError) throw fetchError
      
      appointments.value = data || []
      return { success: true, data }
    } catch (err: any) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const getAllAppointments = async () => {
    loading.value = true
    error.value = ''
    
    try {
      const { data, error: fetchError } = await supabase
        .from('appointments')
        .select(`
          *,
          profile:profiles(*)
        `)
        .order('date', { ascending: true })
      
      if (fetchError) throw fetchError
      
      appointments.value = data || []
      return { success: true, data }
    } catch (err: any) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const updateAppointmentStatus = async (appointmentId: string, status: 'confirmed' | 'cancelled') => {
    loading.value = true
    error.value = ''
    
    try {
      const { data, error: updateError } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', appointmentId)
        .select()
      
      if (updateError) throw updateError
      
      return { success: true, data }
    } catch (err: any) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  return {
    appointments,
    loading,
    error,
    createAppointment,
    getUserAppointments,
    getAllAppointments,
    updateAppointmentStatus
  }
}
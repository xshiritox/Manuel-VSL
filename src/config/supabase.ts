import { createClient } from '@supabase/supabase-js'

// Configuración directa de Supabase (sin variables de entorno)
const SUPABASE_URL = 'https://hzsdqqmbsnvhgauaecvb.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6c2RxcW1ic252aGdhdWFlY3ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyOTYxNTcsImV4cCI6MjA3Mjg3MjE1N30.mj-s9yE-kqK9s7EMTXG3F1pwPZ_6shTWVpcrzxg_X3o'

// Configuración mejorada del cliente Supabase
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Verificar conexión
const checkConnection = async () => {
  try {
    const { error } = await supabase.from('profiles').select('*').limit(1)
    if (error) console.error('Error de conexión a Supabase:', error)
    else console.log('Conexión a Supabase exitosa')
  } catch (err) {
    console.error('Error inesperado al conectar con Supabase:', err)
  }
}

// Ejecutar verificación de conexión al cargar el módulo
checkConnection()

// Tipos de la base de datos
export interface Profile {
  id: string
  email: string
  full_name: string
  phone: string
  created_at: string
  is_admin: boolean
}

export interface Appointment {
  id: string
  user_id: string
  date: string
  time: string
  status: 'pending' | 'confirmed' | 'cancelled'
  notes?: string
  created_at: string
  profile?: Profile
}
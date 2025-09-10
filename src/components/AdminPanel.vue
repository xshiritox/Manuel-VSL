<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold" style="color: var(--color-black);">Panel Administrativo</h1>
            <p class="mt-2" style="color: var(--color-gray-600);">Gestiona citas y usuarios del sistema</p>
          </div>
          <button
            @click="$emit('signOut')"
            class="btn btn-outline"
          >
            <LogOut style="width: 16px; height: 16px; margin-right: 8px;" />
            Cerrar Sesión
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="card p-6">
          <div class="flex items-center">
            <div class="p-3 bg-blue-100" style="border-radius: var(--border-radius-lg);">
              <Users style="width: 24px; height: 24px; color: var(--color-blue);" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium" style="color: var(--color-gray-600);">Total Usuarios</p>
              <p class="text-2xl font-bold" style="color: var(--color-gray-900);">{{ stats.totalUsers }}</p>
            </div>
          </div>
        </div>

        <div class="card p-6">
          <div class="flex items-center">
            <div class="p-3 bg-green-100" style="border-radius: var(--border-radius-lg);">
              <Calendar style="width: 24px; height: 24px; color: var(--color-green-600);" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium" style="color: var(--color-gray-600);">Total Citas</p>
              <p class="text-2xl font-bold" style="color: var(--color-gray-900);">{{ stats.totalAppointments }}</p>
            </div>
          </div>
        </div>

        <div class="card p-6">
          <div class="flex items-center">
            <div class="p-3 bg-yellow-100" style="border-radius: var(--border-radius-lg);">
              <Clock style="width: 24px; height: 24px; color: var(--color-yellow-600);" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium" style="color: var(--color-gray-600);">Citas Pendientes</p>
              <p class="text-2xl font-bold" style="color: var(--color-gray-900);">{{ stats.pendingAppointments }}</p>
            </div>
          </div>
        </div>

        <div class="card p-6">
          <div class="flex items-center">
            <div class="p-3 bg-purple-100" style="border-radius: var(--border-radius-lg);">
              <CheckCircle style="width: 24px; height: 24px; color: var(--color-purple-600);" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium" style="color: var(--color-gray-600);">Citas Confirmadas</p>
              <p class="text-2xl font-bold" style="color: var(--color-gray-900);">{{ stats.confirmedAppointments }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Appointments Table -->
      <div class="card mb-8">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-xl font-semibold" style="color: var(--color-gray-900);">Citas Programadas</h2>
        </div>
        
        <div class="overflow-x-auto">
          <table class="table">
            <thead>
              <tr>
                <th>
                  Usuario
                </th>
                <th>
                  Fecha
                </th>
                <th>
                  Estado
                </th>
                <th>
                  Notas
                </th>
                <th>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody class="divide-y">
              <tr v-for="appointment in appointments" :key="appointment.id">
                <td class="whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0">
                      <div class="avatar">
                        <span>
                          {{ getInitials(appointment.profile?.full_name || 'Usuario') }}
                        </span>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium" style="color: var(--color-gray-900);">
                        {{ appointment.profile?.full_name || 'Usuario' }}
                      </div>
                      <div class="text-sm" style="color: var(--color-gray-500);">
                        {{ appointment.profile?.email }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="whitespace-nowrap text-sm" style="color: var(--color-gray-900);">
                  {{ formatDate(appointment.date) }}
                </td>
                <td class="whitespace-nowrap">
                  <span
                    class="badge"
                    :class="'badge-' + appointment.status"
                  >
                    {{ getStatusText(appointment.status) }}
                  </span>
                </td>
                <td class="text-sm max-w-xs truncate" style="color: var(--color-gray-900);">
                  {{ appointment.notes || 'Sin notas' }}
                </td>
                <td class="whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    v-if="appointment.status === 'pending'"
                    @click="updateStatus(appointment.id, 'confirmed')"
                    class="transition-colors"
                    style="color: var(--color-green-600); background: none; border: none; cursor: pointer;"
                    @mouseover="(e: MouseEvent) => (e.target as HTMLElement).style.color = 'var(--color-green-700)'"
                    @mouseout="(e: MouseEvent) => (e.target as HTMLElement).style.color = 'var(--color-green-600)'"
                    :disabled="loading"
                  >
                    Confirmar
                  </button>
                  <button
                    v-if="appointment.status !== 'cancelled'"
                    @click="updateStatus(appointment.id, 'cancelled')"
                    class="transition-colors"
                    style="color: var(--color-red-600); background: none; border: none; cursor: pointer;"
                    @mouseover="(e: MouseEvent) => (e.target as HTMLElement).style.color = 'var(--color-red-700)'"
                    @mouseout="(e: MouseEvent) => (e.target as HTMLElement).style.color = 'var(--color-red-600)'"
                    :disabled="loading"
                  >
                    Cancelar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          
          <!-- Empty state -->
          <div v-if="appointments.length === 0" class="text-center py-12">
            <Calendar style="width: 48px; height: 48px; color: var(--color-gray-400); margin: 0 auto 16px;" />
            <h3 class="text-lg font-medium mb-2" style="color: var(--color-gray-900);">No hay citas programadas</h3>
            <p style="color: var(--color-gray-500);">Las citas aparecerán aquí cuando los usuarios las agenden.</p>
          </div>
        </div>
      </div>

      <!-- Users Table -->
      <div class="card">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-xl font-semibold" style="color: var(--color-gray-900);">Usuarios Registrados</h2>
        </div>
        
        <div class="overflow-x-auto">
          <table class="table">
            <thead>
              <tr>
                <th>
                  Usuario
                </th>
                <th>
                  Correo Electrónico
                </th>
                <th>
                  Teléfono
                </th>
                <th>
                  Fecha de Registro
                </th>
                <th>
                  Tipo
                </th>
              </tr>
            </thead>
            <tbody class="divide-y">
              <tr v-for="user in users" :key="user.id">
                <td class="whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0">
                      <div class="avatar">
                        <span>
                          {{ getInitials(user.full_name || 'Usuario') }}
                        </span>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium" style="color: var(--color-gray-900);">
                        {{ user.full_name || 'Sin nombre' }}
                      </div>
                      <div class="text-sm" style="color: var(--color-gray-500);">
                        ID: {{ user.id.substring(0, 8) }}...
                      </div>
                    </div>
                  </div>
                </td>
                <td class="whitespace-nowrap text-sm" style="color: var(--color-gray-900);">
                  {{ user.email }}
                </td>
                <td class="whitespace-nowrap text-sm" style="color: var(--color-gray-900);">
                  {{ user.phone || 'No proporcionado' }}
                </td>
                <td class="whitespace-nowrap text-sm" style="color: var(--color-gray-900);">
                  {{ formatDate(user.created_at) }}
                </td>
                <td class="whitespace-nowrap">
                  <span
                    class="badge"
                    :class="user.is_admin ? 'badge-confirmed' : 'badge-pending'"
                  >
                    {{ user.is_admin ? 'Administrador' : 'Usuario' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
          
          <!-- Empty state -->
          <div v-if="users.length === 0" class="text-center py-12">
            <Users style="width: 48px; height: 48px; color: var(--color-gray-400); margin: 0 auto 16px;" />
            <h3 class="text-lg font-medium mb-2" style="color: var(--color-gray-900);">No hay usuarios registrados</h3>
            <p style="color: var(--color-gray-500);">Los usuarios aparecerán aquí cuando se registren en el sistema.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Users, Calendar, Clock, CheckCircle, LogOut } from 'lucide-vue-next'
import { useAppointments } from '../composables/useAppointments'
import { supabase } from '../config/supabase'
import type { Appointment } from '../config/supabase'

const emit = defineEmits(['signOut'])

const { updateAppointmentStatus, loading } = useAppointments()

const appointments = ref<Appointment[]>([])
const users = ref<any[]>([])

const stats = computed(() => {
  const totalUsers = users.value.length
  const totalAppointments = appointments.value.length
  const pendingAppointments = appointments.value.filter(a => a.status === 'pending').length
  const confirmedAppointments = appointments.value.filter(a => a.status === 'confirmed').length

  return {
    totalUsers,
    totalAppointments,
    pendingAppointments,
    confirmedAppointments
  }
})

const loadAppointments = async () => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        profile:profiles (
          id,
          email,
          full_name,
          phone,
          created_at,
          is_admin
        )
      `)
      .order('date', { ascending: true })
    
    if (error) throw error
    appointments.value = data || []
  } catch (error) {
    console.error('Error loading appointments:', error)
  }
}

const loadUsers = async () => {
  try {
    const { data: usersData, error: usersError } = await supabase
      .from('profiles')
      .select('id, email, full_name, created_at')
      .order('created_at', { ascending: false })
    
    if (usersError) throw usersError
    
    users.value = usersData || []
    stats.value.totalUsers = usersData?.length || 0
  } catch (error) {
    console.error('Error loading users:', error)
  }
}

const updateStatus = async (appointmentId: string, status: 'confirmed' | 'cancelled') => {
  const result = await updateAppointmentStatus(appointmentId, status)
  if (result.success) {
    await loadAppointments()
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'confirmed':
      return 'Confirmada'
    case 'cancelled':
      return 'Cancelada'
    default:
      return 'Pendiente'
  }
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

onMounted(() => {
  loadAppointments()
  loadUsers()
})
</script>
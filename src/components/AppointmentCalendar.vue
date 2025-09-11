<template>
  <div class="card p-8 max-w-2xl mx-auto animate-slide-up" style="overflow: visible;">
    <!-- Header -->
    <div class="text-center mb-8">
      <h2 class="text-3xl font-bold mb-2" style="color: var(--color-black);">
        Agendar Cita
      </h2>
      <p style="color: var(--color-gray-600);">
        Selecciona la fecha que mejor se adapte a tu agenda
      </p>
    </div>

    <!-- Calendar Form -->
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Date Selection -->
      <div>
        <label for="date" class="form-label">
          Fecha
        </label>
        <input
          id="date"
          v-model="form.date"
          type="date"
          required
          :min="minDate"
          class="input-field"
        />
      </div>

      <!-- Notes -->
      <div>
        <label for="notes" class="form-label">
          Notas adicionales (opcional)
        </label>
        <textarea
          id="notes"
          v-model="form.notes"
          rows="4"
          class="input-field resize-none"
          placeholder="Describe brevemente el motivo de tu cita o cualquier información relevante..."
        ></textarea>
      </div>

      <!-- Error message -->
      <div v-if="error" class="alert alert-error">
        <div class="flex items-center">
          <AlertCircle class="alert-icon" style="color: var(--color-red-500);" />
          <span class="text-sm">{{ error }}</span>
        </div>
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        :disabled="loading"
        class="w-full btn btn-primary"
        :style="{ opacity: loading ? '0.5' : '1', cursor: loading ? 'not-allowed' : 'pointer' }"
      >
        <div v-if="loading" class="flex items-center justify-center">
          <div class="spinner-sm mr-2" style="border-color: rgba(255,255,255,0.3); border-top-color: white;"></div>
          Agendando...
        </div>
        <span v-else class="flex items-center justify-center">
          <Calendar style="width: 20px; height: 20px; margin-right: 8px;" />
          Agendar Cita
        </span>
      </button>
    </form>

    <!-- Success message -->
    <div v-if="successMessage" class="mt-6 alert alert-success">
      <div class="flex items-center">
        <CheckCircle class="alert-icon" style="color: var(--color-green-500);" />
        <span class="text-sm">{{ successMessage }}</span>
      </div>
    </div>

    <!-- User's Appointments -->
    <div class="mt-8">
      <h3 class="text-xl font-semibold mb-4" style="color: var(--color-black);">Mis Citas</h3>
      <div v-if="userAppointments.length > 0" class="space-y-3">
        <div
          v-for="appointment in userAppointments"
          :key="appointment.id"
          class="flex items-center justify-between p-4 bg-gray-50"
          style="border-radius: var(--border-radius-lg);"
        >
          <div>
            <div class="font-semibold" style="color: var(--color-gray-900);">
              {{ formatDate(appointment.date) }}
            </div>
            <div v-if="appointment.notes" class="text-sm mt-1" style="color: var(--color-gray-600);">
              {{ appointment.notes }}
            </div>
          </div>
          <div class="flex items-center">
            <span
              class="badge"
              :class="'badge-' + appointment.status"
            >
              {{ getStatusText(appointment.status) }}
            </span>
          </div>
        </div>
      </div>
      <!-- Empty state for appointments -->
      <div v-else class="text-center py-6 bg-gray-50" style="border-radius: var(--border-radius-lg);">
        <Calendar style="width: 32px; height: 32px; color: var(--color-gray-400); margin: 0 auto 12px;" />
        <p class="text-sm" style="color: var(--color-gray-500);">No tienes citas programadas</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { Calendar, AlertCircle, CheckCircle } from 'lucide-vue-next'
import { useAppointments } from '../composables/useAppointments'
import type { Appointment } from '../config/supabase'

const { createAppointment, getUserAppointments, loading, error } = useAppointments()

const successMessage = ref('')
const userAppointments = ref<Appointment[]>([])

const form = reactive({
  date: '',
  notes: ''
})

// Minimum date (today)
const minDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

const resetForm = () => {
  form.date = ''
  form.notes = ''
}

const handleSubmit = async () => {
  successMessage.value = ''
  
  const result = await createAppointment(form.date, form.notes)
  
  if (result.success) {
    successMessage.value = '¡Cita agendada exitosamente! Te contactaremos pronto para confirmar los detalles.'
    resetForm()
    loadUserAppointments()
  }
}

const loadUserAppointments = async () => {
  const result = await getUserAppointments()
  if (result.success) {
    userAppointments.value = result.data || []
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
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

onMounted(async () => {
  console.log('Componente montado, cargando citas...')
  await loadUserAppointments()
  console.log('Citas cargadas:', userAppointments.value)
})
</script>
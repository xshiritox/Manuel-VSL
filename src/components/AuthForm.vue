<template>
  <div class="card p-8 max-w-md mx-auto animate-slide-up">
    <!-- Header -->
    <div class="text-center mb-8">
      <h2 class="text-3xl font-bold mb-2" style="color: var(--color-black);">
        {{ isLogin ? 'Iniciar Sesión' : 'Crear Cuenta' }}
      </h2>
      <p style="color: var(--color-gray-600);">
        {{ isLogin ? 'Accede a tu cuenta para agendar citas' : 'Regístrate para acceder al calendario' }}
      </p>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Full Name (only for register) -->
      <div v-if="!isLogin">
        <label for="fullName" class="form-label">
          Nombre Completo
        </label>
        <input
          id="fullName"
          v-model="form.fullName"
          type="text"
          required
          class="input-field"
          placeholder="Tu nombre completo"
        />
      </div>

      <!-- Email -->
      <div>
        <label for="email" class="form-label">
          Correo Electrónico
        </label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          required
          class="input-field"
          placeholder="tu@email.com"
        />
      </div>

      <!-- Phone (only for register) -->
      <div v-if="!isLogin">
        <label for="phone" class="form-label">
          Teléfono <span class="text-gray-500">(Opcional)</span>
        </label>
        <input
          id="phone"
          v-model="form.phone"
          type="tel"
          class="input-field"
          placeholder="Número de teléfono (opcional)"
        />
      </div>

      <!-- Password -->
      <div>
        <label for="password" class="form-label">
          Contraseña
        </label>
        <div class="relative">
          <input
            id="password"
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            required
            minlength="6"
            class="input-field pr-8"
            placeholder="Mínimo 6 caracteres"
          />
          <button
            type="button"
            @click="showPassword = !showPassword"
            class="password-toggle-btn"
          >
            <Eye v-if="!showPassword" class="h-5 w-5" />
            <EyeOff v-else class="h-5 w-5" />
          </button>
        </div>
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
          Procesando...
        </div>
        <span v-else>
          {{ isLogin ? 'Iniciar Sesión' : 'Crear Cuenta' }}
        </span>
      </button>
    </form>

    <!-- Toggle between login/register -->
    <div class="mt-6 text-center">
      <button
        ref="toggleButton"
        @click="isLogin = !isLogin"
        class="font-semibold transition-colors"
        :style="{ color: toggleHover ? 'var(--color-blue-hover)' : 'var(--color-blue)', background: 'none', border: 'none', cursor: 'pointer' }"
        @mouseover="toggleHover = true"
        @mouseout="toggleHover = false"
      >
        {{ isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión' }}
      </button>
    </div>

    <!-- Success message -->
    <div v-if="successMessage" class="mt-4 alert alert-success">
      <div class="flex items-center">
        <CheckCircle class="alert-icon" style="color: var(--color-green-500);" />
        <span class="text-sm">{{ successMessage }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const toggleHover = ref(false)
const showPassword = ref(false)
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-vue-next'
import { useAuth } from '../composables/useAuth'

const emit = defineEmits(['authSuccess'])

const { signUp, signIn, loading, error } = useAuth()

const isLogin = ref(true)
const successMessage = ref('')

const form = reactive({
  email: '',
  password: '',
  fullName: '',
  phone: ''
})

const resetForm = () => {
  form.email = ''
  form.password = ''
  form.fullName = ''
  form.phone = ''
}

const handleSubmit = async () => {
  successMessage.value = ''
  error.value = ''
  
  try {
    // Validación básica del formulario
    if (!form.email?.trim()) {
      throw new Error('Por favor ingresa tu correo electrónico')
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.email.trim())) {
      throw new Error('Por favor ingresa un correo electrónico válido')
    }
    
    if (!form.password) {
      throw new Error('Por favor ingresa una contraseña')
    }
    
    if (form.password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres')
    }
    
    if (isLogin.value) {
      const result = await signIn(form.email, form.password)
      
      if (result.success) {
        successMessage.value = '¡Bienvenido de vuelta!'
        emit('authSuccess')
        resetForm()
      }
    } else {
      // Validación adicional para registro
      if (!form.fullName?.trim()) {
        throw new Error('Por favor ingresa tu nombre completo')
      }
      
      if (form.fullName.trim().length < 2) {
        throw new Error('El nombre completo debe tener al menos 2 caracteres')
      }
      
      // El teléfono es opcional, así que no necesita validación
      const phoneNumber = form.phone?.trim() || undefined
      
      const result = await signUp(
        form.email.trim(),
        form.password,
        form.fullName.trim(),
        phoneNumber
      )
      
      if (result.success) {
        if (result.emailConfirmationRequired) {
          successMessage.value = '¡Cuenta creada exitosamente! Por favor revisa tu correo electrónico y haz clic en el enlace de confirmación para activar tu cuenta.'
        } else {
          successMessage.value = '¡Cuenta creada exitosamente!'
          emit('authSuccess')
        }
        resetForm()
      } else if (result.error) {
        throw new Error(result.error)
      }
    }
  } catch (err: any) {
    error.value = err.message || 'Ocurrió un error al procesar la solicitud'
    console.error('Error en el formulario:', err)
  }
}
</script>
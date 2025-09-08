<template>
  <div class="min-h-screen bg-gradient">
    <!-- Admin Panel -->
    <AdminPanel 
      v-if="currentUser && isUserAdmin" 
      @signOut="handleSignOut" 
    />

    <!-- Main VSL Page -->
    <div v-else class="container mx-auto px-4 py-8 lg:py-16">
      
      <!-- Header Section -->
      <header class="text-center mb-12 lg:mb-16 animate-fade-in">
        <h1 class="text-4xl lg:text-6xl font-bold mb-6 leading-tight" style="color: var(--color-black);">
          Descubre el <span style="color: var(--color-blue);">Secreto</span> que
          <br class="lg:block hidden">
          Está <span style="color: var(--color-blue);">Transformando</span> Negocios
        </h1>
        <p class="text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed" style="color: var(--color-gray-600);">
          Una estrategia que ha ayudado a muchisimos empresarios 
          a multiplicar sus ingresos
        </p>
      </header>

      <!-- Video Section -->
      <section class="mb-12 lg:mb-20 animate-slide-up">
        <VideoPlayer 
          :autoplay="true"
          :muted="true"
          :loop="true"
          :showCustomControls="true"
        />
      </section>

      <!-- Auth & Calendar Section -->
      <section class="max-w-4xl mx-auto">
        <div v-if="!currentUser" class="animate-slide-up">
          <!-- CTA Before Auth -->
          <div class="text-center mb-12">
            <h2 class="text-3xl lg:text-4xl font-bold mb-4" style="color: var(--color-black);">
              ¿Listo para <span style="color: var(--color-blue);">Transformar</span> tu Negocio?
            </h2>
            <p class="text-lg mb-8" style="color: var(--color-gray-600);">
              Agenda una consulta y descubre cómo aplicar 
              esta estrategia a tu negocio
            </p>
          </div>

          <AuthForm @authSuccess="handleAuthSuccess" />
        </div>

        <div v-else class="animate-slide-up">
          <!-- Welcome Back Message -->
          <div class="text-center mb-12">
            <h2 class="text-3xl lg:text-4xl font-bold mb-4" style="color: var(--color-black);">
              ¡Bienvenido de vuelta, <span style="color: var(--color-gold);">{{ getUserName() }}</span>!
            </h2>
            <p class="text-lg mb-4" style="color: var(--color-gray-600);">
              Agenda tu consulta estratégica personalizada
            </p>
            <div class="flex justify-center space-x-4">
              <button @click="handleSignOut" class="btn btn-outline">
                <LogOut style="width: 16px; height: 16px; margin-right: 8px;" />
                Cerrar Sesión
              </button>
              <button 
                v-if="isUserAdmin" 
                @click="loadAdminPanel"
                class="btn btn-secondary"
              >
                <Shield style="width: 16px; height: 16px; margin-right: 8px;" />
                Panel Admin
              </button>
            </div>
          </div>

          <AppointmentCalendar />
        </div>
      </section>

      <!-- Trust Indicators -->
      <section class="mt-16 lg:mt-24 animate-fade-in">
        <div class="text-center mb-12">
          <h3 class="text-2xl lg:text-3xl font-bold mb-8" style="color: var(--color-black);">
            Únete a Miles de Empresarios Exitosos
          </h3>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div class="text-center p-6 card-glass">
            <div class="text-4xl font-bold mb-2" style="color: var(--color-gold);">10,000+</div>
            <p style="color: var(--color-gray-600);">Empresarios Transformados</p>
          </div>
          <div class="text-center p-6 card-glass">
            <div class="text-4xl font-bold mb-2" style="color: var(--color-blue);">250%</div>
            <p style="color: var(--color-gray-600);">Aumento Promedio en Ventas</p>
          </div>
          <div class="text-center p-6 card-glass">
            <div class="text-4xl font-bold mb-2" style="color: var(--color-green-500);">90</div>
            <p style="color: var(--color-gray-600);">Días para Ver Resultados</p>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="mt-16 text-center" style="color: var(--color-gray-500);">
        <p>&copy; 2025 VSL Professional. Todos los derechos reservados.</p>
      </footer>
    </div>

    <!-- Loading Overlay -->
    <div v-if="isLoading" class="overlay">
      <div class="overlay-content">
        <div class="spinner mx-auto mb-4"></div>
        <p class="text-lg font-semibold" style="color: var(--color-gray-700);">Cargando...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { LogOut, Shield } from 'lucide-vue-next'
import VideoPlayer from './components/VideoPlayer.vue'
import AuthForm from './components/AuthForm.vue'
import AppointmentCalendar from './components/AppointmentCalendar.vue'
import AdminPanel from './components/AdminPanel.vue'
import { useAuth } from './composables/useAuth'

const { getCurrentUser, signOut, isAdmin } = useAuth()

const currentUser = ref(null)
const isUserAdmin = ref(false)
const isLoading = ref(true)
const showAdminPanel = ref(false)

const handleAuthSuccess = async () => {
  await loadCurrentUser()
}

const handleSignOut = async () => {
  await signOut()
  currentUser.value = null
  isUserAdmin.value = false
  showAdminPanel.value = false
}

const loadCurrentUser = async () => {
  isLoading.value = true
  
  try {
    const user = await getCurrentUser()
    currentUser.value = user
    
    if (user) {
      isUserAdmin.value = await isAdmin()
    }
  } catch (error) {
    console.error('Error loading user:', error)
  } finally {
    isLoading.value = false
  }
}

const loadAdminPanel = () => {
  showAdminPanel.value = true
}

const getUserName = () => {
  if (!currentUser.value) return 'Usuario'
  
  const metadata = currentUser.value.user_metadata
  return metadata?.full_name || currentUser.value.email?.split('@')[0] || 'Usuario'
}

onMounted(() => {
  loadCurrentUser()
})
</script>
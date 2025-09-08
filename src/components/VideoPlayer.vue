<template>
  <div class="video-container animate-fade-in">
    <video
      ref="videoElement"
      :src="videoSrc"
      :autoplay="autoplay"
      :muted="muted"
      :controls="showControls"
      :loop="loop"
      style="width: 100%; height: auto; border-radius: 1rem; box-shadow: var(--shadow-2xl);"
      @loadstart="handleLoadStart"
      @loadeddata="handleLoadedData"
      @error="handleError"
    >
      Tu navegador no soporta el elemento de video.
    </video>
    
    <!-- Controles personalizados -->
    <div v-if="showCustomControls" class="video-controls">
      <button
        @click="togglePlay"
        class="control-btn"
        :title="isPlaying ? 'Pausar' : 'Reproducir'"
      >
        <Play v-if="!isPlaying" style="width: 16px; height: 16px;" />
        <Pause v-else style="width: 16px; height: 16px;" />
      </button>
      
      <button
        @click="toggleMute"
        class="control-btn"
        :title="muted ? 'Activar sonido' : 'Silenciar'"
      >
        <Volume2 v-if="!muted" style="width: 16px; height: 16px;" />
        <VolumeX v-else style="width: 16px; height: 16px;" />
      </button>
      
      <button
        @click="toggleFullscreen"
        class="control-btn"
        title="Pantalla completa"
      >
        <Maximize style="width: 16px; height: 16px;" />
      </button>
    </div>
    
    <!-- Loading overlay -->
    <div v-if="isLoading" class="video-loading-overlay">
      <div class="spinner"></div>
    </div>
    
    <!-- Error overlay -->
    <div v-if="hasError" class="video-error-overlay">
      <div class="text-center">
        <AlertCircle style="width: 48px; height: 48px; margin: 0 auto 16px; color: #f87171;" />
        <p class="text-lg font-semibold mb-2">Error al cargar el video</p>
        <p class="text-sm" style="opacity: 0.8;">Por favor, verifica tu conexión e intenta nuevamente</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Play, Pause, Volume2, VolumeX, Maximize, AlertCircle } from 'lucide-vue-next'

interface Props {
  videoSrc?: string
  autoplay?: boolean
  muted?: boolean
  loop?: boolean
  showControls?: boolean
  showCustomControls?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  videoSrc: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  autoplay: true,
  muted: true,
  loop: true,
  showControls: false,
  showCustomControls: true
})

const videoElement = ref<HTMLVideoElement | null>(null)
const isPlaying = ref(false)
const isLoading = ref(true)
const hasError = ref(false)
const muted = ref(props.muted)

const handleLoadStart = () => {
  isLoading.value = true
  hasError.value = false
}

const handleLoadedData = () => {
  isLoading.value = false
  if (props.autoplay) {
    isPlaying.value = true
  }
}

const handleError = () => {
  isLoading.value = false
  hasError.value = true
}

const togglePlay = () => {
  if (!videoElement.value) return
  
  if (videoElement.value.paused) {
    videoElement.value.play()
    isPlaying.value = true
  } else {
    videoElement.value.pause()
    isPlaying.value = false
  }
}

const toggleMute = () => {
  if (!videoElement.value) return
  
  videoElement.value.muted = !videoElement.value.muted
  muted.value = videoElement.value.muted
}

const toggleFullscreen = () => {
  if (!videoElement.value) return
  
  if (videoElement.value.requestFullscreen) {
    videoElement.value.requestFullscreen()
  }
}

onMounted(() => {
  if (videoElement.value) {
    videoElement.value.addEventListener('play', () => isPlaying.value = true)
    videoElement.value.addEventListener('pause', () => isPlaying.value = false)
  }
})
</script>
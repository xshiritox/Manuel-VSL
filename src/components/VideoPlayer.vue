<template>
  <div class="video-container animate-fade-in">
    <div class="placeholder-content">
      <XCircle class="no-video-icon" />
      <p class="placeholder-text">El reproductor de video no está disponible actualmente.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { XCircle } from 'lucide-vue-next';
</script>

<style scoped>
.video-container {
  width: 100%;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f3f4f6;
  border-radius: 1rem;
  padding: 2rem;
  text-align: center;
}

.placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.no-video-icon {
  width: 48px;
  height: 48px;
  color: #9ca3af;
}

.placeholder-text {
  color: #6b7280;
  font-size: 1.125rem;
  line-height: 1.75rem;
  margin: 0;
}
</style>
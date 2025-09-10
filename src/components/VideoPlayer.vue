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
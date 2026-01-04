<script setup>
import { computed } from 'vue';

const currentYear = computed(() => new Date().getFullYear());
</script>

<template>
  <footer class="w-full text-center p-8 border-t border-gray-200 dark:border-white/10 mt-8">
    <p class="text-xs text-gray-500 dark:text-gray-400">
      版权信息 © {{ currentYear }} 
      <a 
        href="https://test.45090135.xyz" 
        target="_blank" 
        class="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
      >
        澳门银河网络工作室
      </a>.
      Cloud
    </p>
  </footer>
</template>

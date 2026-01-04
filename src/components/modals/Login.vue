<script setup>
import { ref } from 'vue';

const password = ref('');
const isLoading = ref(false);
const error = ref('');

const props = defineProps({
  login: Function,
});

const submitLogin = async () => {
  if (!password.value) {
    error.value = '请输入管理员密码';
    return;
  }
  isLoading.value = true;
  error.value = '';
  try {
    await props.login(password.value);
  } catch (err) {
    error.value = err.message || '发生未知错误';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-indigo-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-500">
    
    <!-- 顶部标题 -->
    <header class="w-full py-12 text-center">
      <h1 class="text-5xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-lg">
        澳门银河网络
      </h1>
      <p class="text-gray-600 dark:text-gray-400 mt-2 text-lg">现代化管理平台</p>
    </header>

    <!-- 主体登录卡片 -->
    <main class="flex-1 flex justify-center items-center px-4">
      <div class="w-full max-w-md">
        <div class="bg-white/90 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-12 shadow-lg hover:shadow-xl transition-all duration-300">
          <form @submit.prevent="submitLogin" class="space-y-8">
            <!-- 密码输入框 -->
            <div class="relative">
              <input 
                v-model="password"
                type="password" 
                placeholder="请输入管理员密码" 
                class="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-100/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
              <svg class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>

            <!-- 错误提示 -->
            <div v-if="error" class="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-center text-sm">
              {{ error }}
            </div>

            <!-- 登录按钮 -->
            <button 
              type="submit"
              :disabled="isLoading"
              class="w-full py-4 rounded-xl text-white font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-70 flex justify-center items-center transition-all duration-200"
            >
              <svg v-if="isLoading" class="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{{ isLoading ? '登录中...' : '授权访问' }}</span>
            </button>
          </form>
        </div>
      </div>
    </main>

    <!-- 底部 Footer -->
    <footer class="w-full py-6 bg-gray-100 dark:bg-gray-900 text-center text-gray-500 dark:text-gray-400 text-sm transition-colors duration-300">
      © 2026 澳门银河网络
    </footer>

  </div>
</template>

<style>
/* 全局暗/亮模式过渡 */
html, body {
  margin: 0;
  padding: 0;
  font-family: 'Inter', sans-serif;
}
</style>

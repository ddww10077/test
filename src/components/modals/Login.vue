<script setup>
import { ref, watch } from 'vue';

const emit = defineEmits(['success']);
const password = ref('');
const isLoading = ref(false);
const error = ref('');
const shakeCard = ref(false); // 卡片抖动 + 弹跳
const shakeInput = ref(false); // 输入框闪红
const flashBg = ref(false); // 背景闪烁

const props = defineProps({
  login: Function,
});

// 监听错误信息变化触发抖动和弹跳
watch(error, (newVal) => {
  if (newVal) {
    shakeCard.value = true;
    shakeInput.value = true;
    flashBg.value = true;
    setTimeout(() => {
      shakeCard.value = false;
      shakeInput.value = false;
      flashBg.value = false;
    }, 600); // 动画持续 600ms
  }
});

const submitLogin = async () => {
  if (!password.value) {
    error.value = '请输入密码';
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
  <div class="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600 p-6">
    <div 
      :class="[
        'bg-white/90 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full p-10 transition-all duration-500 hover:scale-105',
        shakeCard ? 'shake-bounce' : '',
        flashBg ? 'flash-bg' : ''
      ]"
    >
      
      <!-- Logo & 标题 -->
      <div class="flex flex-col items-center mb-8">
        <div class="w-24 h-24 mb-4 text-indigo-600 dark:text-indigo-400 transform hover:scale-110 transition-transform duration-300">
          <svg width="96" height="96" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
            <path d="M64 128a64 64 0 1 1 64-64a64.07 64.07 0 0 1-64 64Zm0-122a58 58 0 1 0 58 58A58.07 58.07 0 0 0 64 6Z"/>
            <path d="M64 100a36 36 0 1 1 36-36a36 36 0 0 1-36 36Zm0-66a30 30 0 1 0 30 30a30 30 0 0 0-30-30Z"/>
            <path d="M64 78a14 14 0 1 1 14-14a14 14 0 0 1-14 14Zm0-22a8 8 0 1 0 8 8a8 8 0 0 0-8-8Z"/>
          </svg>
        </div>
        <h1 class="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">现代化管理平台</h1>
        <p class="text-gray-600 dark:text-gray-300 text-center">Hello world</p>
      </div>

      <!-- 登录表单 -->
      <form @submit.prevent="submitLogin" class="space-y-6">
        
        <!-- 密码输入框 -->
        <div class="relative">
          <input 
            v-model="password"
            type="password"
            placeholder="请输入密码"
            :class="[
              'w-full pl-12 pr-4 py-4 bg-gray-100/90 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-gray-500',
              shakeInput ? 'shake-input' : 'focus:ring-indigo-500 dark:focus:ring-indigo-400'
            ]"
          >
          <span class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
          </span>
        </div>

        <!-- 错误信息 -->
        <div v-if="error" class="bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm rounded-lg p-3 text-sm text-red-600 dark:text-red-400 text-center animate-pulse">
          {{ error }}
        </div>

        <!-- 提交按钮 -->
        <button 
          type="submit"
          :disabled="isLoading"
          class="w-full py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center transition-all duration-200"
        >
          <svg v-if="isLoading" class="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{{ isLoading ? '登录中' : '授权访问' }}</span>
        </button>

      </form>
    </div>
  </div>
</template>

<style scoped>
/* 卡片悬浮阴影 */
.card-shadow {
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}
.card-shadow-hover:hover {
  box-shadow: 0 15px 35px rgba(0,0,0,0.15);
}

/* 卡片抖动 + 弹跳动画 */
@keyframes shake-bounce {
  0%, 100% { transform: translateX(0) translateY(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-6px) translateY(-2px); }
  20%, 40%, 60%, 80% { transform: translateX(6px) translateY(-2px); }
}
.shake-bounce {
  animation: shake-bounce 0.6s ease-in-out;
}

/* 输入框闪红动画 */
@keyframes shake-border {
  0%, 100% { border-color: #f87171; }
  50% { border-color: #b91c1c; }
}
.shake-input {
  animation: shake-border 0.6s ease-in-out;
  border-width: 2px;
  border-style: solid;
  border-color: #f87171 !important;
  box-shadow: 0 0 5px rgba(248,113,113,0.5);
}

/* 背景闪烁动画 */
@keyframes flash-bg {
  0% { background-color: rgba(248, 113, 113, 0.1); }
  50% { background-color: rgba(248, 113, 113, 0.2); }
  100% { background-color: rgba(248, 113, 113, 0.1); }
}
.flash-bg {
  animation: flash-bg 0.6s ease-in-out;
}

/* 输入框过渡 */
input:focus {
  outline: none;
}
</style>

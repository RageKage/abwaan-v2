import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { MotionPlugin } from '@vueuse/motion'

import App from './App.vue'
import router from './app/router'
import './assets/style.css'
import { toastError } from '@/shared/utils/alerts'

const app = createApp(App)

app.config.errorHandler = (err) => {
  console.error('[Vue Error]', err)
  const message = err instanceof Error ? err.message : 'An unexpected error occurred'
  toastError(message)
}

app.use(createPinia())
app.use(router)
app.use(MotionPlugin)

app.mount('#app')

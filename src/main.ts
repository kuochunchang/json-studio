import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './styles/base.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Global error handler (Guideline 9.3)
app.config.errorHandler = (err, _instance, info) => {
    console.error('[Global Error]', err, info)
    // In production, consider sending to error tracking service (e.g., Sentry)
}

app.mount('#app')

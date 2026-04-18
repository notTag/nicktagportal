import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'

window.__APP_VERSION__ = __APP_VERSION__

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

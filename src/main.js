import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'
import './assets/styles/main.css'

import App from './App.vue'
import router from './router'
import i18n from './shared/application/services/i18n.service'
import { useAppStore } from './shared/application/stores/app.store'

const app = createApp(App)

const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(i18n)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: '.app-dark'
    }
  }
})

useAppStore().initializeTheme()

app.mount('#app')

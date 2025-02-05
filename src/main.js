import './assets/main.css'

import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import App from './App.vue'
import router from './router'
import { GlobalWorkerOptions } from 'pdfjs-dist'

GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs'
const app = createApp(App)

app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
  },
})

app.mount('#app')

import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import App from '@/App.vue'
import router from '@/router'
import { VueFire } from 'vuefire'
import { GlobalWorkerOptions } from 'pdfjs-dist'
import { firebaseApp } from './firebase'
import '@/assets/styles.scss';
import '@/assets/tailwind.css';
import { ToastService } from 'primevue'
import { TimetableDB, TimetableType } from './service/TimetableDB'
GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs'

export const timetableDB = new TimetableDB(TimetableType.Firestore)

const app = createApp(App)

app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
        darkModeSelector: '.app-dark'
    }
}
})
app.use(VueFire, {
  firebaseApp,
})
app.use(ToastService);
app.mount('#app')


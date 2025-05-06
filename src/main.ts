// src/main.ts
import { createApp } from 'vue'
import router from './router'
import './style/base/main.scss' // Import der SCSS-Hauptdatei mit Sass-Modulen
import App from './App.vue'

createApp(App)
  .use(router)
  .mount('#app')
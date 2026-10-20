import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import router from './router'
import App from './App.vue'
import '@/styles/index.scss'
import { QrStream } from 'vue3-qrcode-reader'

const app = createApp(App)
const pinia = createPinia()

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 全局注册 QrStream 组件
app.component('QrStream', QrStream)

app.use(pinia)
app.use(ElementPlus)
app.use(router)

app.mount('#app')

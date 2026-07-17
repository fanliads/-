import { createApp } from 'vue'

import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'

import './styles/index.scss'
import permission from './directives/permission'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)
app.use(router)

// 注册自定义权限指令
app.directive('permission', permission)

app.mount('#app')

import {createApp} from 'vue'
import './style.scss'
import App from './App.vue'
import 'element-plus/dist/index.css'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import VideoCard from "./components/video-card.vue";

// import 'element-plus/lib/theme-chalk/index.css'
import router from './router'


const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
app.component('VideoCard', VideoCard);
app.use(ElementPlus).use(router).mount('#app')

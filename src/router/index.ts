import { createWebHashHistory, createRouter } from 'vue-router'

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/',
            component: () => import('../components/pic-job.vue'),
        },
        {
            path: '/pic-job',
            component: () => import('../components/pic-job.vue'),
        },
        {
            path: '/video-job',
            component: () => import('../components/video-job.vue'),
        },
        {
            path: '/copyright',
            component: () => import('../components/copyright.vue'),
        },
    ],
})

export default router

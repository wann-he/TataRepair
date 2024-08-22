import {createWebHashHistory, createRouter} from 'vue-router'

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/',
            component: () => import('../components/pic-job.vue'),
            beforeEnter: async (to, from, next) => {
                next(vm => {
                    vm.$forceUpdate(); // 强制更新组件
                });
            }
        },
        {
            path: '/pic-job',
            component: () => import('../components/pic-job.vue'),
            beforeEnter: async (to, from, next) => {
                next(vm => {
                    vm.$forceUpdate(); // 强制更新组件
                });
            }
        },
        {
            path: '/video-job',
            component: () => import('../components/video-job.vue'),
            beforeEnter: async (to, from, next) => {
                next(vm => {
                    vm.$forceUpdate(); // 强制更新组件
                });
            }
        },
        {
            path: '/file-job',
            component: () => import('../components/file-job.vue'),
            beforeEnter: async (to, from, next) => {
                next(vm => {
                    vm.$forceUpdate(); // 强制更新组件
                });
            }
        },
        {
            path: '/copyright',
            component: () => import('../components/copyright.vue'),
        },
        {
            path: '/media',
            component: () => import('../components/media.vue'),
            beforeEnter: async (to, from, next) => {
                next(vm => {
                    vm.$forceUpdate(); // 强制更新组件
                });
            }
        },
        {
            path: '/setting',
            component: () => import('../components/setting.vue'),
            beforeEnter: async (to, from, next) => {
                next(vm => {
                    vm.$forceUpdate(); // 强制更新组件
                });
            }
        },
    ],
})

export default router

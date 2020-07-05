import Vue from 'vue'
import VueRouter from 'vue-router'

import Login from '@/views/Login'
import Panel from '@/views/Panel'
import BaseConfiguration from '@/views/panel/global/BaseConfiguration'
import TagConfiguration from '@/views/panel/basic/TagConfiguration'
import ReaderConfiguration from '@/views/panel/basic/ReaderConfiguration'
import TriggerConfiguration from '@/views/panel/global/TriggerConfiguration'
import CallbackConfiguration from '@/views/panel/global/CallbackConfiguration'
import Monitor from '@/views/panel/control/Monitor'
import Track from '@/views/panel/control/Track'
import WarningRecord from '@/views/panel/control/WarningRecord'
import Dashboard from '@/views/panel/Dashboard'


Vue.use(VueRouter)

const router = new VueRouter({
    mode: 'history',
    routes: [
        {
            path: '/',
            component: Panel,
        },
        {
            path: '/login',
            component: Login,
        },
        {
            path: '/panel',
            component: Panel,
            children: [
                {
                    path: 'dashboard',
                    component: Dashboard
                },
                {
                    path: 'monitor',
                    component: Monitor
                },
                {
                    path: 'base-configuration',
                    component: BaseConfiguration
                },
                {
                    path: 'tag-configuration',
                    component: TagConfiguration
                },
                {
                    path: 'reader-configuration',
                    component: ReaderConfiguration
                },
                {
                    path: 'trigger-configuration',
                    component: TriggerConfiguration
                },
                {
                    path: 'callback-configuration',
                    component: CallbackConfiguration
                },
                {
                    path: 'track',
                    component: Track
                },
                {
                    path: 'warningrecord',
                    component: WarningRecord
                }

            ]
        }
    ]
})

// router.beforeEach((to, from, next) => {
//     if (to.path === '/login') {
//         next()
//     } else {
//         let token = localStorage.getItem('Authorization')
//
//         if (token === null || token === '') {
//             next('/login')
//         } else {
//             next()
//         }
//     }
// })

export default router

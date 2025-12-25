import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'; // We will create this next

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router

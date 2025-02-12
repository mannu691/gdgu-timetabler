import AppLayout from '@/layout/AppLayout.vue';
import { createRouter, createWebHistory } from 'vue-router'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: '/',
      component: AppLayout,
      children: [
        {
          path: '/',
          name: 'availablerooms-timetable',
          component: () => import('@/views/AvailableRoomsTimetable.vue')
        },
        {
          path: '/professor-timetable',
          name: 'professor-timetable',
          component: () => import('@/views/ProfessorTimetable.vue')
        },
        {
          path: '/search-timetable',
          name: 'search-timetable',
          component: () => import('@/views/SearchTimetable.vue')
        },
        {
          path: '/database',
          name: 'database',
          component: () => import('@/views/Database.vue')
        },

      ]
    },
  ]
});

export default router;

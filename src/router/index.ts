import AppLayout from '@/layout/AppLayout.vue';
import { createRouter, createWebHistory } from 'vue-router'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: '/',
      component: AppLayout,
      strict: false,
      children: [
        {
          path: '/',
          name: 'home',
          component: () => import('@/views/Home.vue')
        },
        {
          path: '/available-rooms',
          name: 'available-rooms-timetable',
          component: () => import('@/views/AvailableRoomsTimetable.vue')
        },
        {
          path: '/professor',
          name: 'professor-timetable',
          component: () => import('@/views/ProfessorTimetable.vue')
        },
        {
          path: '/courses',
          name: 'courses-timetable',
          component: () => import('@/views/CourseTimetable.vue')
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

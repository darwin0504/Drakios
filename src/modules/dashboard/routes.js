import DashboardView from '@/modules/dashboard/views/DashboardView.vue'

export default [
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: {
      requiresAuth: true,
    },
  },
]

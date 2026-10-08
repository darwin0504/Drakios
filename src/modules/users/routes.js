import UsersView from "./views/UsersView.vue";
import CreateUserView from '@/modules/users/views/CreateUserView.vue'

export default [
  {
    path: "/users",
    name: "users",
    component: UsersView,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/users/create',
    name: 'users-create',
    component: CreateUserView,
    meta: {
      requiresAuth: true,
    },
  },
];

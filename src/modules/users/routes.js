import UsersView from "./views/UsersView.vue";
import CreateUserView from '@/modules/users/views/CreateUserView.vue'
import EditUserView from '@/modules/users/views/EditUserView.vue'
import UserDetailView from '@/modules/users/views/UserDetailView.vue'

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
  {
    path: '/users/edit/:id',
    name: 'users-edit',
    component: EditUserView,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/users/:id',
    name: 'users-detail',
    component: UserDetailView,
    meta: {
      requiresAuth: true,
    },
  },
];

import LoginView from "./views/LoginView.vue";
import RegisterView from "./views/RegisterView.vue";
import ForgotPasswordView from "./views/ForgotPasswordView.vue";
import ResetPasswordView from "./views/ResetPasswordView.vue";
import ChangePasswordView from './views/ChangePasswordView.vue'

export default [
  {
    path: "/login",
    name: "login",
    component: LoginView,
  },
  {
    path: "/register",
    name: "register",
    component: RegisterView,
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: ForgotPasswordView,
  },
  {
    path: '/reset-password',
    name: 'reset-password',
    component: ResetPasswordView,
  },
  {
    path: '/change-password',
    name: 'change-password',
    component: ChangePasswordView,
    meta: {
      requiresAuth: true,
    },
  },
];

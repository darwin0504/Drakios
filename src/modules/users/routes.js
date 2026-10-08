import UsersView from "./views/UsersView.vue";

export default [
  {
    path: "/users",
    name: "users",
    component: UsersView,
    meta: {
      requiresAuth: true,
    },
  },
];

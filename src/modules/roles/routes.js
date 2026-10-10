import RolesView from "./views/RolesView.vue";

export default [
  {
    path: "/roles",
    name: "roles",
    component: RolesView,
    meta: {
      requiresAuth: true,
    },
  },
];

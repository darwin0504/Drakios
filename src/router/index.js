import { createRouter, createWebHistory } from "vue-router";

import authRoutes from "@/modules/auth/routes";
import productRoutes from "@/modules/products/routes";
import userRoutes from "@/modules/users/routes";
import rolesRoutes from "@/modules/roles/routes";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: "/login",
    },
  
    ...authRoutes,
    ...userRoutes,
    ...rolesRoutes,
    ...productRoutes,
  ],
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("access_token");

  if (to.meta.requiresAuth && !token) {
    next("/login");
    return;
  }

  if ((to.path === "/login" || to.path === "/register") && token) {
    next("/products");
    return;
  }

  next();
});

export default router;

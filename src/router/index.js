import { createRouter, createWebHistory } from "vue-router";

import authRoutes from "@/modules/auth/routes";
import productRoutes from "@/modules/products/routes";
import userRoutes from "@/modules/users/routes";
import rolesRoutes from "@/modules/roles/routes";
import dashboardRoutes from "@/modules/dashboard/routes";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: "/dashboard",
    },
  
    ...authRoutes,
    ...dashboardRoutes,
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
    next("/dashboard");
    return;
  }

  next();
});

export default router;

import { createRouter, createWebHistory } from "vue-router";
import LoginView from "@/views/LoginView.vue";
import RegisterView from "@/views/RegisterView.vue";
import ProductsView from "@/views/ProductsView.vue";
import CreateProductView from "@/views/CreateProductView.vue";
import EditProductView from "@/views/EditProductView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: "/login",
    },
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
      path: "/products",
      name: "products",
      component: ProductsView,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/products/create",
      name: "products-create",
      component: CreateProductView,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/products/edit/:id",
      name: "products-edit",
      component: EditProductView,
      meta: {
        requiresAuth: true,
      },
    },
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

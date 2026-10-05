import ProductsView from "./views/ProductsView.vue";
import CreateProductView from "./views/CreateProductView.vue";
import EditProductView from "./views/EditProductView.vue";

export default [
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
];

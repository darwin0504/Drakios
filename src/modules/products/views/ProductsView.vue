<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import Swal from 'sweetalert2'
import $ from 'jquery'
import 'datatables.net-bs5'
import 'datatables.net-responsive-bs5'
import AppNavbar from '@/components/AppNavbar.vue'
import { productService } from '@/modules/products/services/productService'
import { getErrorMessage } from '@/helpers/errorHelper'

const appName = 'Drakios'
const viewName = 'Gestión de productos'

const products = ref([])
const loading = ref(false)

let dataTable = null

const totalProducts = computed(() => products.value.length)

const totalStock = computed(() => {
  return products.value.reduce((total, product) => {
    return total + Number(product.quantity || 0)
  }, 0)
})

const totalInventoryValue = computed(() => {
  return products.value.reduce((total, product) => {
    const price = Number(product.price || 0)
    const quantity = Number(product.quantity || 0)

    return total + price * quantity
  }, 0)
})

const lowStockProducts = computed(() => {
  return products.value.filter((product) => Number(product.quantity || 0) <= 5).length
})

const formatCurrency = (value) => {
  const numberValue = Number(value)

  if (Number.isNaN(numberValue)) {
    return 'COP/ 0.00'
  }

  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numberValue)
}

const destroyDataTable = () => {
  if ($.fn.DataTable.isDataTable('#productsTable')) {
    $('#productsTable').DataTable().destroy()
  }

  dataTable = null
}

const initDataTable = async () => {
  await nextTick()

  destroyDataTable()

  dataTable = $('#productsTable').DataTable({
    responsive: true,
    pageLength: 10,
    ordering: true,
    language: {
      search: 'Buscar:',
      lengthMenu: 'Mostrar _MENU_ registros',
      info: 'Mostrando _START_ a _END_ de _TOTAL_ productos',
      infoEmpty: 'No hay productos disponibles',
      infoFiltered: '(filtrado de _MAX_ registros en total)',
      zeroRecords: 'No se encontraron productos',
      emptyTable: 'No hay productos registrados',
      loadingRecords: 'Cargando...',
      processing: 'Procesando...',
      paginate: {
        first: 'Primero',
        last: 'Último',
        next: 'Siguiente',
        previous: 'Anterior',
      },
    },
  })
}

const loadProducts = async () => {
  loading.value = true

  try {
    destroyDataTable()

    const response = await productService.getAll()

    products.value = Array.isArray(response.data) ? response.data : []

    await initDataTable()
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error al listar productos',
      text: getErrorMessage(error),
    })
  } finally {
    loading.value = false
  }
}

const confirmDelete = async (product) => {
  const result = await Swal.fire({
    icon: 'warning',
    title: 'Eliminar producto',
    text: `¿Seguro que deseas eliminar el producto "${product.name}"?`,
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#dc3545',
  })

  if (!result.isConfirmed) return

  try {
    await productService.delete(product.id)

    await Swal.fire({
      icon: 'success',
      title: 'Producto eliminado',
      text: 'El producto se eliminó correctamente.',
      timer: 1400,
      showConfirmButton: false,
    })

    await loadProducts()
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error al eliminar producto',
      text: getErrorMessage(error),
    })
  }
}

onMounted(() => {
  loadProducts()
})

onBeforeUnmount(() => {
  destroyDataTable()
})
</script>

<template>
  <AppNavbar />

  <main class="app-page">
    <div class="container page-shell">
      <section class="page-hero mb-4">
        <div class="row align-items-center position-relative">
          <div class="col-lg-8">
            <span class="page-kicker">
              {{ appName }} · {{ viewName }}
            </span>

            <h1 class="fw-bold mb-2">
              Panel de productos
            </h1>

            <p class="text-white-50 mb-0">
              Administra el inventario de tu aplicación: consulta productos, registra nuevos artículos,
              actualiza información y elimina registros cuando sea necesario.
            </p>
          </div>

          <div class="col-lg-4 text-lg-end mt-4 mt-lg-0">
            <RouterLink to="/products/create" class="btn btn-hero-action btn-lg fw-semibold action-btn">
              + Nuevo producto
            </RouterLink>
          </div>
        </div>
      </section>

      <section class="row g-3 mb-4">
        <div class="col-md-6 col-xl-3">
          <div class="stat-card">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <p class="text-muted mb-1">Productos</p>
                <h3 class="fw-bold mb-0">{{ totalProducts }}</h3>
              </div>

              <div class="stat-icon">
                P
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-6 col-xl-3">
          <div class="stat-card">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <p class="text-muted mb-1">Stock total</p>
                <h3 class="fw-bold mb-0">{{ totalStock }}</h3>
              </div>

              <div class="stat-icon">
                S
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-6 col-xl-3">
          <div class="stat-card">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <p class="text-muted mb-1">Valor inventario</p>
                <h3 class="fw-bold mb-0">{{ formatCurrency(totalInventoryValue) }}</h3>
              </div>

              <div class="stat-icon">
                V
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-6 col-xl-3">
          <div class="stat-card">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <p class="text-muted mb-1">Stock bajo</p>
                <h3 class="fw-bold mb-0">{{ lowStockProducts }}</h3>
              </div>

              <div class="stat-icon">
                !
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="premium-card">
        <div class="premium-card-header">
          <div class="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
            <div>
              <span class="badge text-bg-primary mb-2">
                Listado principal
              </span>

              <h4 class="fw-bold mb-1">
                Productos registrados
              </h4>

              <p class="text-muted mb-0">
                Información obtenida desde la API protegida con JWT.
              </p>
            </div>

            <div class="d-flex gap-2">
              <button type="button" class="btn btn-soft-primary action-btn" :disabled="loading" @click="loadProducts">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"
                  aria-hidden="true"></span>

                {{ loading ? 'Actualizando...' : 'Recargar' }}
              </button>

            </div>
          </div>
        </div>

        <div class="card-body p-4">
          <div v-if="loading" class="alert alert-info border-0 rounded-4">
            Cargando productos desde la API...
          </div>

          <div class="table-responsive">
            <table id="productsTable" class="table table-hover align-middle nowrap premium-table" style="width: 100%;">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Producto</th>
                  <th>Precio</th>
                  <th>Descripción</th>
                  <th>Stock</th>
                  <th width="190">Acciones</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="product in products" :key="product.id">
                  <td>
                    <span class="badge text-bg-light">
                      #{{ product.id }}
                    </span>
                  </td>

                  <td class="product-name-cell">
                    {{ product.name }}
                  </td>

                  <td class="fw-semibold">
                    {{ formatCurrency(product.price) }}
                  </td>

                  <td class="product-description-cell">
                    {{ product.description || 'Sin descripción' }}
                  </td>

                  <td>
                    <span class="stock-badge" :class="Number(product.quantity) <= 5 ? 'stock-low' : 'stock-ok'">
                      {{ product.quantity }}
                    </span>
                  </td>

                  <td>
                    <div class="d-flex gap-2">
                      <RouterLink :to="`/products/edit/${product.id}`" class="btn btn-soft-primary btn-sm action-btn">
                        Editar
                      </RouterLink>

                      <button type="button" class="btn btn-soft-danger btn-sm action-btn"
                        @click="confirmDelete(product)">
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>

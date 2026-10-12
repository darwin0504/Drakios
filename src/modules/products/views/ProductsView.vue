<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import Swal from 'sweetalert2'
import $ from 'jquery'
import 'datatables.net-bs5'
import 'datatables.net-responsive-bs5'
import AppNavbar from '@/components/AppNavbar.vue'
import AppFooter from '@/components/AppFooter.vue'
import { useAuthStore } from '@/modules/auth/stores/authStore'
import { productService } from '@/modules/products/services/productService'
import { getErrorMessage } from '@/helpers/errorHelper'

const authStore = useAuthStore()
const appName = 'Drakios'
const viewName = 'Gestión de productos'

const products = ref([])
const loading = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')
const availabilityFilter = ref('all')
const stockLevelFilter = ref('all')

let dataTable = null

const productStockFilter = (settings, _data, dataIndex) => {
  if (settings.nTable.id !== 'productsTable') return true

  const quantityText = settings.aoData[dataIndex].nTr.querySelector('.stock-badge')?.textContent
  const quantity = Number(quantityText?.trim())

  if (!Number.isFinite(quantity)) {
    return availabilityFilter.value === 'all' && stockLevelFilter.value === 'all'
  }

  if (availabilityFilter.value === 'available' && quantity <= 0) return false
  if (availabilityFilter.value === 'out' && quantity > 0) return false
  if (stockLevelFilter.value === 'low' && quantity > 5) return false
  if (stockLevelFilter.value === 'sufficient' && quantity <= 5) return false

  return true
}

const applyProductFilters = () => {
  if (!dataTable) return

  dataTable.search(searchQuery.value.trim())
  dataTable.column(5)
    .search(statusFilter.value ? `^${statusFilter.value}$` : '', true, false)
    .draw()
}

const clearProductFilters = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  availabilityFilter.value = 'all'
  stockLevelFilter.value = 'all'
  applyProductFilters()
}

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
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(0)
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

  if (!$.fn.dataTable.ext.search.includes(productStockFilter)) {
    $.fn.dataTable.ext.search.push(productStockFilter)
  }

  dataTable = $('#productsTable').DataTable({
    responsive: true,
    pageLength: 10,
    ordering: true,
    layout: {
      topEnd: null,
    },
    columnDefs: [
      {
        targets: [0, 6],
        searchable: false,
      },
      {
        targets: 6,
        orderable: false,
        searchable: false,
      },
    ],
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

  applyProductFilters()
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
      title: 'No fue posible cargar los productos',
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
    text: `Se eliminará "${product.name}" del catálogo. ¿Deseas continuar?`,
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
      title: 'No fue posible eliminar el producto',
      text: getErrorMessage(error),
    })
  }
}

onMounted(() => {
  loadProducts()
})

onBeforeUnmount(() => {
  destroyDataTable()

  const filterIndex = $.fn.dataTable.ext.search.indexOf(productStockFilter)
  if (filterIndex !== -1) {
    $.fn.dataTable.ext.search.splice(filterIndex, 1)
  }
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
              Productos e inventario
            </h1>

            <p class="text-white-50 mb-0">
              Consulta tu catálogo, revisa las existencias y mantén actualizada la información de tus productos.
            </p>
          </div>

          <div class="col-lg-4 text-lg-end mt-4 mt-lg-0">
            <RouterLink v-if="authStore.permissionsLoaded && authStore.hasPermission('products.create')"
              to="/products/create" class="btn btn-hero-action btn-lg fw-semibold action-btn">
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

              <div class="stat-icon" aria-hidden="true">
                <i class="bi bi-box-seam"></i>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-6 col-xl-3">
          <div class="stat-card">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <p class="text-muted mb-1">Unidades en inventario</p>
                <h3 class="fw-bold mb-0">{{ totalStock }}</h3>
              </div>

              <div class="stat-icon" aria-hidden="true">
                <i class="bi bi-stack"></i>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-6 col-xl-3">
          <div class="stat-card">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <p class="text-muted mb-1">Valor potencial de venta</p>
                <h3 class="fw-bold mb-0">{{ formatCurrency(totalInventoryValue) }}</h3>
              </div>

              <div class="stat-icon" aria-hidden="true">
                <i class="bi bi-currency-dollar"></i>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-6 col-xl-3">
          <div class="stat-card">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <p class="text-muted mb-1">Productos con pocas existencias</p>
                <h3 class="fw-bold mb-0">{{ lowStockProducts }}</h3>
              </div>

              <div class="stat-icon" aria-hidden="true">
                <i class="bi bi-exclamation-triangle"></i>
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
                Catálogo
              </span>

              <h4 class="fw-bold mb-1">
                Productos registrados
              </h4>

              <p class="text-muted mb-0">
                Revisa los artículos registrados, sus precios y las existencias disponibles.
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
          <div class="user-search-filters mb-4">
            <div class="user-search-field">
              <label for="product-search" class="form-label fw-semibold mb-2">
                Buscar productos
              </label>
              <div class="input-group">
                <span class="input-group-text" aria-hidden="true">
                  <i class="bi bi-search"></i>
                </span>
                <input id="product-search" v-model="searchQuery" type="search" class="form-control premium-input"
                  placeholder="Producto, precio, descripción, estado o existencias" autocomplete="off"
                  aria-describedby="product-search-help" @input="applyProductFilters" />
              </div>
              <div id="product-search-help" class="form-text">
                Busca por producto, precio, descripción, estado o cantidad de existencias.
              </div>
            </div>

            <div class="user-status-filter">
              <label for="product-status-filter" class="form-label fw-semibold mb-2">
                Estado
              </label>
              <select id="product-status-filter" v-model="statusFilter" class="form-select premium-input"
                @change="applyProductFilters">
                <option value="">Todos los estados</option>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>

            <div class="user-status-filter">
              <label for="availabilityFilter" class="form-label fw-semibold mb-2">
                Disponibilidad
              </label>
              <select id="availabilityFilter" v-model="availabilityFilter" class="form-select premium-input"
                @change="applyProductFilters">
                <option value="all">Todos</option>
                <option value="available">Disponibles</option>
                <option value="out">Agotados</option>
              </select>
            </div>

            <div class="user-status-filter">
              <label for="stockLevelFilter" class="form-label fw-semibold mb-2">
                Nivel de existencias
              </label>
              <select id="stockLevelFilter" v-model="stockLevelFilter" class="form-select premium-input"
                @change="applyProductFilters">
                <option value="all">Todos</option>
                <option value="low">Pocas existencias (5 o menos)</option>
                <option value="sufficient">Existencias suficientes (más de 5)</option>
              </select>
            </div>

            <button type="button" class="btn btn-outline-secondary action-btn user-filter-reset"
              :disabled="!searchQuery && !statusFilter && availabilityFilter === 'all' && stockLevelFilter === 'all'"
              @click="clearProductFilters">
              <i class="bi bi-x-circle me-1" aria-hidden="true"></i>
              Limpiar filtros
            </button>
          </div>

          <div v-if="loading" class="alert alert-info border-0 rounded-4" role="status" aria-live="polite">
            Consultando el catálogo de productos...
          </div>

          <div class="table-responsive">
            <table id="productsTable" class="table table-hover align-middle nowrap premium-table" style="width: 100%;"
              aria-label="Productos registrados">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Producto</th>
                  <th>Precio</th>
                  <th>Descripción</th>
                  <th>Existencias</th>
                  <th>Estado</th>
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
                    <span :title="product.name">
                      {{ product.name }}
                    </span>
                  </td>

                  <td class="fw-semibold">
                    {{ formatCurrency(product.price) }}
                  </td>

                  <td class="product-description-cell">
                    <span :title="product.description || 'Sin descripción'">
                      {{ product.description || 'Sin descripción' }}
                    </span>
                  </td>

                  <td>
                    <span class="stock-badge" :class="Number(product.quantity) <= 5 ? 'stock-low' : 'stock-ok'">
                      {{ product.quantity }}
                    </span>
                  </td>

                  <td>
                    <span class="badge" :class="product.status === 'INACTIVE'
                      ? 'text-bg-danger'
                      : 'text-bg-success'
                      ">
                      {{ product.status === 'INACTIVE' ? 'Inactivo' : 'Activo' }}
                    </span>
                  </td>

                  <td>
                    <div class="table-actions">
                      <RouterLink :to="{ name: 'products-detail', params: { id: product.id } }"
                        class="btn btn-sm action-btn table-action-btn table-action-view"
                        :aria-label="`Ver detalle de ${product.name}`" :title="`Ver detalle de ${product.name}`">
                        <i class="bi bi-eye" aria-hidden="true"></i>
                      </RouterLink>
                      <RouterLink v-if="authStore.hasPermission('products.update')" :to="`/products/edit/${product.id}`"
                        class="btn btn-sm action-btn table-action-btn table-action-edit"
                        :aria-label="`Editar ${product.name}`" :title="`Editar ${product.name}`">
                        <i class="bi bi-pencil-square" aria-hidden="true"></i>
                      </RouterLink>

                      <button v-if="authStore.hasPermission('products.delete')" type="button"
                        class="btn btn-sm action-btn table-action-btn table-action-delete"
                        :aria-label="`Eliminar ${product.name}`" :title="`Eliminar ${product.name}`"
                        @click="confirmDelete(product)">
                        <i class="bi bi-trash3" aria-hidden="true"></i>
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
  <AppFooter />
</template>

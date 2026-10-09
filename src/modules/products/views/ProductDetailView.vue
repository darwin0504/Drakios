<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppNavbar from '@/components/AppNavbar.vue'
import AppFooter from '@/components/AppFooter.vue'
import { productService } from '@/modules/products/services/productService'
import { getErrorMessage } from '@/helpers/errorHelper'

const route = useRoute()
const product = ref(null)
const loading = ref(true)
const errorMessage = ref('')

const productId = computed(() => Number(route.params.id))
const quantity = computed(() => Number(product.value?.quantity))
const stockStatus = computed(() => {
  if (!Number.isFinite(quantity.value)) return 'No disponible'
  if (quantity.value === 0) return 'Agotado'
  if (quantity.value <= 5) return 'Pocas existencias'

  return 'Disponible'
})
const stockStatusClass = computed(() => {
  if (!Number.isFinite(quantity.value)) return 'is-inactive'
  if (quantity.value === 0) return 'is-inactive'
  if (quantity.value <= 5) return 'is-warning'

  return 'is-active'
})
const inventoryValue = computed(() => Number(product.value?.price) * quantity.value)

const formatCurrency = (value) => {
  const amount = Number(value)

  if (!Number.isFinite(amount)) return 'No disponible'

  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

const formatQuantity = (value) => {
  const amount = Number(value)

  if (!Number.isFinite(amount)) return 'No disponible'

  return new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(amount)
}

const formatDate = (value) => {
  if (!value) return 'No disponible'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return 'No disponible'

  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'long',
    timeZone: 'America/Bogota',
  }).format(date)
}

const loadProduct = async () => {
  if (!Number.isInteger(productId.value) || productId.value < 1) {
    errorMessage.value = 'El identificador del producto no es válido.'
    loading.value = false
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const response = await productService.getById(productId.value)
    product.value = response.data?.product ?? response.data

    if (!product.value || typeof product.value !== 'object') {
      errorMessage.value = 'No se encontró información para este producto.'
    }
  } catch (error) {
    errorMessage.value = getErrorMessage(error)
  } finally {
    loading.value = false
  }
}

watch(() => route.params.id, loadProduct, { immediate: true })
</script>

<template>
  <AppNavbar />

  <main class="app-page entity-detail-page">
    <div class="container page-shell">
      <nav class="page-breadcrumb" aria-label="Ruta de navegación">
        <RouterLink to="/products" class="page-breadcrumb-link">
          <i class="bi bi-arrow-left" aria-hidden="true"></i>
          <span>Productos</span>
        </RouterLink>
        <i class="bi bi-chevron-right page-breadcrumb-separator" aria-hidden="true"></i>
        <span aria-current="page">Detalle del producto</span>
      </nav>

      <section v-if="loading" class="entity-detail-state" role="status" aria-live="polite">
        <span class="spinner-border text-primary" aria-hidden="true"></span>
        <h1 class="h5 mt-3 mb-1">Cargando producto</h1>
        <p class="text-muted mb-0">Estamos consultando la información del artículo.</p>
      </section>

      <section v-else-if="errorMessage" class="entity-detail-state entity-detail-error" role="alert">
        <div class="entity-detail-state-icon">
          <i class="bi bi-exclamation-triangle" aria-hidden="true"></i>
        </div>
        <h1 class="h5 mt-3 mb-2">No fue posible cargar el producto</h1>
        <p class="text-muted mb-4">{{ errorMessage }}</p>
        <div class="d-flex flex-wrap justify-content-center gap-2">
          <button type="button" class="btn btn-soft-primary action-btn" @click="loadProduct">
            <i class="bi bi-arrow-clockwise me-1" aria-hidden="true"></i>
            Intentar de nuevo
          </button>
          <RouterLink to="/products" class="btn btn-outline-secondary action-btn">
            Volver al catálogo
          </RouterLink>
        </div>
      </section>

      <template v-else-if="product">
        <section class="entity-detail-hero">
          <div class="entity-detail-identity">
            <div class="entity-detail-avatar" aria-hidden="true">
              <i class="bi bi-box-seam"></i>
            </div>
            <div class="entity-detail-heading">
              <div class="entity-detail-eyebrow">DETALLE DEL PRODUCTO · #{{ product.id ?? productId }}</div>
              <h1>{{ product.name || 'Producto sin nombre' }}</h1>
              <span class="entity-detail-email">
                {{ formatCurrency(product.price) }} <span aria-hidden="true">·</span>
                {{ formatQuantity(product.quantity) }} unidades
              </span>
            </div>
          </div>

          <div class="entity-detail-actions">
            <span class="entity-detail-status" :class="stockStatusClass">
              <span class="entity-detail-status-dot" aria-hidden="true"></span>
              {{ stockStatus }}
            </span>
            <RouterLink
              :to="{ name: 'products-edit', params: { id: product.id ?? productId } }"
              class="btn btn-hero-action fw-semibold action-btn"
            >
              <i class="bi bi-pencil-square me-1" aria-hidden="true"></i>
              Editar producto
            </RouterLink>
          </div>
        </section>

        <section class="entity-detail-content" aria-label="Información del producto">
          <article class="entity-detail-card">
            <div class="entity-detail-card-heading">
              <div class="entity-detail-section-icon">
                <i class="bi bi-card-text" aria-hidden="true"></i>
              </div>
              <div>
                <h2>Información del producto</h2>
                <p>Descripción y datos principales del artículo.</p>
              </div>
            </div>

            <dl class="entity-detail-fields">
              <div class="entity-detail-field entity-detail-field-wide">
                <dt>Nombre</dt>
                <dd>{{ product.name || 'No disponible' }}</dd>
              </div>
              <div class="entity-detail-field entity-detail-field-wide">
                <dt>Descripción</dt>
                <dd>{{ product.description || 'No se ha agregado una descripción.' }}</dd>
              </div>
              <div v-if="product.createdAt" class="entity-detail-field">
                <dt>Fecha de registro</dt>
                <dd>{{ formatDate(product.createdAt) }}</dd>
              </div>
              <div v-if="product.updatedAt" class="entity-detail-field">
                <dt>Última actualización</dt>
                <dd>{{ formatDate(product.updatedAt) }}</dd>
              </div>
            </dl>
          </article>

          <article class="entity-detail-card">
            <div class="entity-detail-card-heading">
              <div class="entity-detail-section-icon entity-detail-section-icon-access">
                <i class="bi bi-graph-up-arrow" aria-hidden="true"></i>
              </div>
              <div>
                <h2>Precio e inventario</h2>
                <p>Resumen de valor y disponibilidad actual.</p>
              </div>
            </div>

            <dl class="entity-detail-fields">
              <div class="entity-detail-field">
                <dt>Precio unitario</dt>
                <dd>{{ formatCurrency(product.price) }}</dd>
              </div>
              <div class="entity-detail-field">
                <dt>Existencias</dt>
                <dd>{{ formatQuantity(product.quantity) }} unidades</dd>
              </div>
              <div class="entity-detail-field">
                <dt>Disponibilidad</dt>
                <dd>
                  <span class="entity-detail-status" :class="stockStatusClass">
                    <span class="entity-detail-status-dot" aria-hidden="true"></span>
                    {{ stockStatus }}
                  </span>
                </dd>
              </div>
              <div class="entity-detail-field">
                <dt>Valor potencial del inventario</dt>
                <dd>{{ formatCurrency(inventoryValue) }}</dd>
              </div>
            </dl>
          </article>
        </section>
      </template>
    </div>
  </main>

  <AppFooter />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Swal from 'sweetalert2'
import AppNavbar from '@/components/AppNavbar.vue'
import AppFooter from '@/components/AppFooter.vue'
import { useAuthStore } from '@/modules/auth/stores/authStore'
import { productService } from '@/modules/products/services/productService'
import { getErrorMessage } from '@/helpers/errorHelper'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const appName = 'Drakios'
const viewName = 'Editar producto'

const productId = route.params.id

const name = ref('')
const price = ref('')
const description = ref('')
const quantity = ref('')

const loading = ref(false)
const loadingProduct = ref(false)
const errors = ref({})

const previewName = computed(() => {
  return name.value.trim() || 'Producto seleccionado'
})

const previewPrice = computed(() => {
  const value = Number(price.value)

  if (Number.isNaN(value)) {
    return 0
  }

  return value
})

const previewQuantity = computed(() => {
  const value = Number(quantity.value)

  if (Number.isNaN(value)) {
    return 0
  }

  return value
})

const previewTotal = computed(() => {
  return previewPrice.value * previewQuantity.value
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

const validateForm = () => {
  const newErrors = {}
  const productName = name.value.trim()

  if (!productName) {
    newErrors.name = 'El nombre del producto es obligatorio.'
  } else if (productName.length < 2) {
    newErrors.name = 'El nombre debe tener mínimo 2 caracteres.'
  }

  const productPrice = Number(price.value)
  if (price.value === '' || !Number.isFinite(productPrice) || productPrice < 0) {
    newErrors.price = 'Ingresa un precio válido mayor o igual a 0.'
  }

  const productQuantity = Number(quantity.value)
  if (quantity.value === '' || !Number.isFinite(productQuantity) || productQuantity < 0) {
    newErrors.quantity = 'Ingresa una cantidad válida mayor o igual a 0.'
  } else if (!Number.isInteger(productQuantity)) {
    newErrors.quantity = 'La cantidad debe ser un número entero.'
  }

  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

const clearFieldError = (field) => {
  if (errors.value[field]) {
    delete errors.value[field]
  }
}

const loadProduct = async () => {
  if (!productId || Number.isNaN(Number(productId))) {
    await Swal.fire({
      icon: 'error',
      title: 'ID inválido',
      text: 'El ID del producto no es válido.',
    })

    router.push('/products')
    return
  }

  loadingProduct.value = true

  try {
    const response = await productService.getById(productId)
    const product = response.data

    name.value = product.name
    price.value = product.price
    description.value = product.description || ''
    quantity.value = product.quantity
  } catch (error) {
    await Swal.fire({
      icon: 'error',
      title: 'No fue posible cargar el producto',
      text: getErrorMessage(error),
    })

    router.push('/products')
  } finally {
    loadingProduct.value = false
  }
}

const updateProduct = async () => {
  if (!validateForm()) {
    Swal.fire({
      icon: 'warning',
      title: 'Revisa el formulario',
      text: 'Corrige los campos indicados antes de guardar.',
    })
    return
  }

  loading.value = true

  try {
    const data = {
      name: name.value.trim(),
      price: Number(price.value),
      description: description.value.trim() || null,
      quantity: Number(quantity.value),
    }

    await productService.update(productId, data)

    await Swal.fire({
      icon: 'success',
      title: 'Producto actualizado',
      text: 'El producto se actualizó correctamente.',
      timer: 1400,
      showConfirmButton: false,
    })

    router.push('/products')
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'No fue posible actualizar el producto',
      text: getErrorMessage(error),
    })
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/products')
}

onMounted(() => {
  loadProduct()
})
</script>

<template>
  <AppNavbar />

  <main class="app-page">
    <div v-if="!authStore.permissionsLoaded" class="container page-shell">
      <div class="alert alert-info border-0 rounded-4" role="status" aria-live="polite">
        Verificando permisos...
      </div>
    </div>
    <div v-else-if="!authStore.hasPermission('products.update')" class="container page-shell">
      <div class="alert alert-warning border-0 rounded-4" role="alert">
        No tienes permiso para editar productos.
        <RouterLink to="/products" class="alert-link">Volver a productos</RouterLink>
      </div>
    </div>
    <div v-else class="container page-shell">
      <nav class="page-breadcrumb" aria-label="Ruta de navegación">
        <RouterLink to="/products" class="page-breadcrumb-link">
          <i class="bi bi-arrow-left" aria-hidden="true"></i>
          <span>Productos</span>
        </RouterLink>
        <i class="bi bi-chevron-right page-breadcrumb-separator" aria-hidden="true"></i>
        <span aria-current="page">Editar producto</span>
      </nav>

      <section class="page-hero mb-4">
        <div class="row align-items-center position-relative">
          <div class="col-12">
            <span class="page-kicker">
              {{ appName }} · {{ viewName }}
            </span>

            <h1 class="fw-bold mb-2">
              Actualizar producto #{{ productId }}
            </h1>

            <p class="text-white-50 mb-0">
              Actualiza los datos comerciales y las existencias del artículo seleccionado.
            </p>
          </div>
        </div>
      </section>

      <section class="row g-4">
        <div class="col-lg-8">
          <div class="product-form-card">
            <div class="product-form-header edit-form-header">
              <span class="badge text-bg-primary mb-2">
                Edición del artículo
              </span>

              <h4 class="form-section-title mb-1">
                Información del producto
              </h4>

              <p class="form-section-subtitle mb-0">
                Los campos marcados con <span class="required-mark" aria-hidden="true">*</span> son obligatorios.
              </p>
            </div>

            <div class="p-4">
              <div v-if="loadingProduct" class="loading-premium-box" role="status" aria-live="polite">
                <div class="d-flex align-items-center gap-3">
                  <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>

                  <div>
                    <strong>Cargando información del producto...</strong>
                    <div class="small">
                      En breve podrás revisar y actualizar sus datos.
                    </div>
                  </div>
                </div>
              </div>

              <form v-else @submit.prevent="updateProduct" novalidate>
                <div class="row g-4">
                  <div class="col-md-6">
                    <label for="name" class="form-label fw-semibold">
                      Nombre del producto <span class="required-mark" aria-hidden="true">*</span>
                    </label>

                    <div class="input-group has-validation">
                      <span class="input-group-text" :class="{ 'is-invalid': errors.name }">
                        <i class="bi bi-box-seam"></i>
                      </span>
                      <input type="text" id="name" v-model="name" class="form-control premium-input"
                        :class="{ 'is-invalid': errors.name }" :aria-invalid="!!errors.name"
                        :aria-describedby="errors.name ? 'product-name-error' : undefined"
                        placeholder="Mouse inalámbrico" maxlength="180" aria-required="true"
                        @input="clearFieldError('name')" />
                    </div>
                    <div v-if="errors.name" id="product-name-error" class="invalid-feedback d-block">
                      {{ errors.name }}
                    </div>
                  </div>

                  <div class="col-md-3">
                    <label for="price" class="form-label fw-semibold">
                      Precio <span class="required-mark" aria-hidden="true">*</span>
                    </label>

                    <div class="input-group has-validation">
                      <span class="input-group-text" :class="{ 'is-invalid': errors.price }">
                        <i class="bi bi-currency-dollar"></i>
                      </span>
                      <input type="number" id="price" v-model="price" class="form-control premium-input"
                        :class="{ 'is-invalid': errors.price }" :aria-invalid="!!errors.price"
                        :aria-describedby="errors.price ? 'product-price-error' : undefined" min="0" step="0.01"
                        placeholder="59.90" aria-required="true" @input="clearFieldError('price')" />
                    </div>
                    <div v-if="errors.price" id="product-price-error" class="invalid-feedback d-block">
                      {{ errors.price }}
                    </div>
                  </div>

                  <div class="col-md-3">
                    <label for="quantity" class="form-label fw-semibold">
                      Existencias <span class="required-mark" aria-hidden="true">*</span>
                    </label>

                    <div class="input-group has-validation">
                      <span class="input-group-text" :class="{ 'is-invalid': errors.quantity }">
                        <i class="bi bi-stack"></i>
                      </span>
                      <input type="number" id="quantity" v-model="quantity" class="form-control premium-input"
                        :class="{ 'is-invalid': errors.quantity }" :aria-invalid="!!errors.quantity"
                        :aria-describedby="errors.quantity ? 'product-quantity-error' : undefined" min="0" step="1"
                        placeholder="20" aria-required="true" @input="clearFieldError('quantity')" />
                    </div>
                    <div v-if="errors.quantity" id="product-quantity-error" class="invalid-feedback d-block">
                      {{ errors.quantity }}
                    </div>
                  </div>

                  <div class="col-md-12">
                    <label for="description" class="form-label fw-semibold">
                      Descripción
                      <small class="text-muted fw-normal">(opcional)</small>
                    </label>

                    <div class="input-group align-items-stretch">
                      <span class="input-group-text align-items-start pt-3">
                        <i class="bi bi-card-text"></i>
                      </span>
                      <textarea id="description" v-model="description" class="form-control premium-input" rows="5"
                        maxlength="2000"
                        placeholder="Describe las características principales del producto"></textarea>
                    </div>
                  </div>
                </div>

                <div class="form-help-box mt-4 mb-4">
                  Revisa el precio de venta y registra las existencias en unidades enteras antes de guardar los cambios.
                </div>

                <div class="d-flex flex-column flex-md-row justify-content-end gap-2">
                  <button type="button" class="btn btn-outline-secondary btn-form-cancel" @click="goBack">
                    <i class="bi bi-x-lg me-1"></i>
                    Cancelar
                  </button>

                  <button type="submit" class="btn btn-form-update" :disabled="loading" :aria-busy="loading">
                    <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"
                      aria-hidden="true"></span>

                    <i v-else class="bi bi-check2 me-1"></i>
                    {{ loading ? 'Actualizando producto...' : 'Actualizar producto' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <aside class="product-preview-card product-preview-card-edit">
            <div class="d-flex align-items-center gap-3 mb-4">
              <div class="preview-icon">
                #
              </div>

              <div>
                <h5 class="fw-bold mb-1">
                  Resumen actualizado
                </h5>

                <small class="text-white-50">
                  Producto ID: {{ productId }}
                </small>
              </div>
            </div>

            <div class="preview-row">
              <span class="preview-label">Producto</span>
              <span class="preview-value">{{ previewName }}</span>
            </div>

            <div class="preview-row">
              <span class="preview-label">Precio unitario</span>
              <span class="preview-value">{{ formatCurrency(previewPrice) }}</span>
            </div>

            <div class="preview-row">
              <span class="preview-label">Existencias</span>
              <span class="preview-value">{{ previewQuantity }}</span>
            </div>

            <div class="preview-row">
              <span class="preview-label">Valor potencial de venta</span>
              <span class="preview-value">{{ formatCurrency(previewTotal) }}</span>
            </div>

            <div class="mt-4">
              <p class="text-white-50 mb-0">
                Esta vista previa refleja los cambios que realices en el formulario.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  </main>
  <AppFooter />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Swal from 'sweetalert2'
import AppNavbar from '@/components/AppNavbar.vue'
import { productService } from '@/modules/products/services/productService'
import { getErrorMessage } from '@/helpers/errorHelper'

const router = useRouter()
const route = useRoute()

const appName = 'Drakios'
const viewName = 'Editar producto'

const productId = route.params.id

const name = ref('')
const price = ref('')
const description = ref('')
const quantity = ref('')

const loading = ref(false)
const loadingProduct = ref(false)

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
    return 'COP/ 0.00'
  }

  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numberValue)
}

const validateForm = () => {
  if (!name.value.trim()) {
    Swal.fire({
      icon: 'warning',
      title: 'Campo requerido',
      text: 'Ingresa el nombre del producto.',
    })
    return false
  }

  if (name.value.trim().length < 2) {
    Swal.fire({
      icon: 'warning',
      title: 'Nombre inválido',
      text: 'El nombre debe tener mínimo 2 caracteres.',
    })
    return false
  }

  if (price.value === '' || Number(price.value) < 0) {
    Swal.fire({
      icon: 'warning',
      title: 'Precio inválido',
      text: 'Ingresa un precio mayor o igual a 0.',
    })
    return false
  }

  if (quantity.value === '' || Number(quantity.value) < 0) {
    Swal.fire({
      icon: 'warning',
      title: 'Cantidad inválida',
      text: 'Ingresa una cantidad mayor o igual a 0.',
    })
    return false
  }

  if (!Number.isInteger(Number(quantity.value))) {
    Swal.fire({
      icon: 'warning',
      title: 'Cantidad inválida',
      text: 'La cantidad debe ser un número entero.',
    })
    return false
  }

  return true
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
      title: 'Error al obtener producto',
      text: getErrorMessage(error),
    })

    router.push('/products')
  } finally {
    loadingProduct.value = false
  }
}

const updateProduct = async () => {
  if (!validateForm()) return

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
      title: 'Error al actualizar producto',
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
    <div class="container page-shell">
      <section class="page-hero mb-4">
        <div class="row align-items-center position-relative">
          <div class="col-lg-8">
            <span class="page-kicker">
              {{ appName }} · {{ viewName }}
            </span>

            <h1 class="fw-bold mb-2">
              Actualizar producto #{{ productId }}
            </h1>

            <p class="text-white-50 mb-0">
              Modifica la información del producto seleccionado. Los cambios se enviarán
              a la API y luego volverás al listado principal.
            </p>
          </div>

          <div class="col-lg-4 text-lg-end mt-4 mt-lg-0">
            <button type="button" class="btn btn-hero-action btn-lg fw-semibold action-btn" @click="goBack">
              Volver al listado
            </button>
          </div>
        </div>
      </section>

      <section class="row g-4">
        <div class="col-lg-8">
          <div class="product-form-card">
            <div class="product-form-header edit-form-header">
              <span class="badge text-bg-primary mb-2">
                Formulario de edición
              </span>

              <h4 class="form-section-title mb-1">
                Datos actuales del producto
              </h4>

              <p class="form-section-subtitle mb-0">
                Revisa la información cargada desde la API antes de actualizar el registro.
              </p>
            </div>

            <div class="p-4">
              <div v-if="loadingProduct" class="loading-premium-box">
                <div class="d-flex align-items-center gap-3">
                  <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>

                  <div>
                    <strong>Cargando información del producto...</strong>
                    <div class="small">
                      Estamos consultando los datos desde el backend.
                    </div>
                  </div>
                </div>
              </div>

              <form v-else @submit.prevent="updateProduct">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="name" class="form-label fw-semibold">
                      Nombre del producto
                    </label>

                    <input type="text" id="name" v-model="name" class="form-control premium-input"
                      placeholder="Mouse inalámbrico" />
                  </div>

                  <div class="col-md-3 mb-3">
                    <label for="price" class="form-label fw-semibold">
                      Precio
                    </label>

                    <input type="number" id="price" v-model="price" class="form-control premium-input" min="0"
                      step="0.01" placeholder="59.90" />
                  </div>

                  <div class="col-md-3 mb-3">
                    <label for="quantity" class="form-label fw-semibold">
                      Cantidad
                    </label>

                    <input type="number" id="quantity" v-model="quantity" class="form-control premium-input" min="0"
                      step="1" placeholder="20" />
                  </div>

                  <div class="col-md-12 mb-3">
                    <label for="description" class="form-label fw-semibold">
                      Descripción
                      <small class="text-muted fw-normal">(opcional)</small>
                    </label>

                    <textarea id="description" v-model="description" class="form-control premium-input" rows="5"
                      placeholder="Descripción opcional del producto"></textarea>
                  </div>
                </div>

                <div class="form-help-box mb-4">
                  <strong>Importante:</strong>
                  al actualizar se enviarán los nuevos valores al endpoint de edición.
                  El precio será convertido a número y la cantidad a entero.
                </div>

                <div class="d-flex flex-column flex-md-row justify-content-end gap-2">
                  <button type="button" class="btn btn-outline-secondary btn-form-cancel" @click="goBack">
                    Cancelar
                  </button>

                  <button type="submit" class="btn btn-form-update" :disabled="loading">
                    <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"
                      aria-hidden="true"></span>

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
                  Vista de edición
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
              <span class="preview-label">Cantidad</span>
              <span class="preview-value">{{ previewQuantity }}</span>
            </div>

            <div class="preview-row">
              <span class="preview-label">Valor estimado</span>
              <span class="preview-value">{{ formatCurrency(previewTotal) }}</span>
            </div>

            <div class="mt-4">
              <p class="text-white-50 mb-0">
                Los datos mostrados aquí se actualizan mientras editas el formulario.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  </main>
</template>

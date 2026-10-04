<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import AppNavbar from '@/components/AppNavbar.vue'
import { productService } from '@/services/productService'
import { getErrorMessage } from '@/helpers/errorHelper'

const router = useRouter()

const appName = 'Drakios'
const viewName = 'Crear producto'

const nombre = ref('')
const precio = ref('')
const descripcion = ref('')
const cantidad = ref('')

const loading = ref(false)

const previewName = computed(() => {
  return nombre.value.trim() || 'Nuevo producto'
})

const previewPrice = computed(() => {
  const value = Number(precio.value)

  if (Number.isNaN(value)) {
    return 0
  }

  return value
})

const previewQuantity = computed(() => {
  const value = Number(cantidad.value)

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
    return 'S/ 0.00'
  }

  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
  }).format(numberValue)
}

const validateForm = () => {
  if (!nombre.value.trim()) {
    Swal.fire({
      icon: 'warning',
      title: 'Campo requerido',
      text: 'Ingresa el nombre del producto.',
    })
    return false
  }

  if (nombre.value.trim().length < 2) {
    Swal.fire({
      icon: 'warning',
      title: 'Nombre inválido',
      text: 'El nombre debe tener mínimo 2 caracteres.',
    })
    return false
  }

  if (precio.value === '' || Number(precio.value) < 0) {
    Swal.fire({
      icon: 'warning',
      title: 'Precio inválido',
      text: 'Ingresa un precio mayor o igual a 0.',
    })
    return false
  }

  if (cantidad.value === '' || Number(cantidad.value) < 0) {
    Swal.fire({
      icon: 'warning',
      title: 'Cantidad inválida',
      text: 'Ingresa una cantidad mayor o igual a 0.',
    })
    return false
  }

  if (!Number.isInteger(Number(cantidad.value))) {
    Swal.fire({
      icon: 'warning',
      title: 'Cantidad inválida',
      text: 'La cantidad debe ser un número entero.',
    })
    return false
  }

  return true
}

const saveProduct = async () => {
  if (!validateForm()) return

  loading.value = true

  try {
    const data = {
      nombre: nombre.value.trim(),
      precio: Number(precio.value),
      descripcion: descripcion.value.trim() || null,
      cantidad: Number(cantidad.value),
    }

    await productService.create(data)

    await Swal.fire({
      icon: 'success',
      title: 'Producto creado',
      text: 'El producto se registró correctamente.',
      timer: 1400,
      showConfirmButton: false,
    })

    router.push('/products')
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error al crear producto',
      text: getErrorMessage(error),
    })
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/products')
}
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
              Registrar nuevo producto
            </h1>

            <p class="text-white-50 mb-0">
              Completa la información del producto para guardarlo en tu inventario.
              El precio se enviará como número y la cantidad como entero.
            </p>
          </div>

          <div class="col-lg-4 text-lg-end mt-4 mt-lg-0">
            <button type="button" class="btn btn-light btn-lg fw-semibold action-btn" @click="goBack">
              Volver al listado
            </button>
          </div>
        </div>
      </section>

      <section class="row g-4">
        <div class="col-lg-8">
          <div class="product-form-card">
            <div class="product-form-header">
              <span class="badge text-bg-success mb-2">
                Formulario de creación
              </span>

              <h4 class="form-section-title mb-1">
                Datos del producto
              </h4>

              <p class="form-section-subtitle mb-0">
                Ingresa los campos requeridos para crear un nuevo registro.
              </p>
            </div>

            <div class="p-4">
              <form @submit.prevent="saveProduct">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="nombre" class="form-label fw-semibold">
                      Nombre del producto
                    </label>

                    <input type="text" id="nombre" v-model="nombre" class="form-control premium-input"
                      placeholder="Mouse inalámbrico" />
                  </div>

                  <div class="col-md-3 mb-3">
                    <label for="precio" class="form-label fw-semibold">
                      Precio
                    </label>

                    <input type="number" id="precio" v-model="precio" class="form-control premium-input" min="0"
                      step="0.01" placeholder="59.90" />
                  </div>

                  <div class="col-md-3 mb-3">
                    <label for="cantidad" class="form-label fw-semibold">
                      Cantidad
                    </label>

                    <input type="number" id="cantidad" v-model="cantidad" class="form-control premium-input" min="0"
                      step="1" placeholder="20" />
                  </div>

                  <div class="col-md-12 mb-3">
                    <label for="descripcion" class="form-label fw-semibold">
                      Descripción
                      <small class="text-muted fw-normal">(opcional)</small>
                    </label>

                    <textarea id="descripcion" v-model="descripcion" class="form-control premium-input" rows="5"
                      placeholder="Descripción opcional del producto"></textarea>
                  </div>
                </div>

                <div class="form-help-box mb-4">
                  <strong>Validación:</strong>
                  el nombre debe tener mínimo 2 caracteres, el precio debe ser mayor o igual a 0
                  y la cantidad debe ser un número entero.
                </div>

                <div class="d-flex flex-column flex-md-row justify-content-end gap-2">
                  <button type="button" class="btn btn-outline-secondary btn-form-cancel" @click="goBack">
                    Cancelar
                  </button>

                  <button type="submit" class="btn btn-success btn-form-save" :disabled="loading">
                    <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"
                      aria-hidden="true"></span>

                    {{ loading ? 'Guardando producto...' : 'Guardar producto' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <aside class="product-preview-card">
            <div class="d-flex align-items-center gap-3 mb-4">
              <div class="preview-icon">
                +
              </div>

              <div>
                <h5 class="fw-bold mb-1">
                  Vista rápida
                </h5>

                <small class="text-white-50">
                  Resumen antes de guardar
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
                Este producto será enviado a la API y luego aparecerá en el listado principal.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import { authService } from '@/modules/auth/services/authService'
import { getErrorMessage } from '@/helpers/errorHelper'

const router = useRouter()

const appName = 'Drakios'
const viewName = 'Crear cuenta'

const name = ref('')
const email = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const address = ref('')

const loading = ref(false)

const validateForm = () => {
  if (!name.value.trim()) {
    Swal.fire({
      icon: 'warning',
      title: 'Campo requerido',
      text: 'Ingresa tu nombre.',
    })
    return false
  }

  if (name.value.trim().length < 3) {
    Swal.fire({
      icon: 'warning',
      title: 'Nombre inválido',
      text: 'El nombre debe tener mínimo 3 caracteres.',
    })
    return false
  }

  if (!email.value.trim()) {
    Swal.fire({
      icon: 'warning',
      title: 'Campo requerido',
      text: 'Ingresa tu correo electrónico.',
    })
    return false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailRegex.test(email.value.trim())) {
    Swal.fire({
      icon: 'warning',
      title: 'Correo inválido',
      text: 'Ingresa un correo electrónico válido.',
    })
    return false
  }

  if (!password.value.trim()) {
    Swal.fire({
      icon: 'warning',
      title: 'Campo requerido',
      text: 'Ingresa una contraseña.',
    })
    return false
  }

  if (password.value.trim().length < 8) {
    Swal.fire({
      icon: 'warning',
      title: 'Contraseña inválida',
      text: 'La contraseña debe tener mínimo 8 caracteres.',
    })
    return false
  }

  if (!/[0-9]/.test(password.value)) {
    Swal.fire({
      icon: 'warning',
      title: 'Contraseña inválida',
      text: 'La contraseña debe contener al menos un número.',
    })
    return false
  }

  if (!passwordConfirmation.value) {
    Swal.fire({
      icon: 'warning',
      title: 'Campo requerido',
      text: 'Confirma tu contraseña.',
    })
    return false
  }

  if (password.value !== passwordConfirmation.value) {
    Swal.fire({
      icon: 'warning',
      title: 'Contraseñas no coinciden',
      text: 'Las contraseñas ingresadas no coinciden.',
    })
    return false
  }

  return true
}

const registerUser = async () => {
  if (!validateForm()) return

  loading.value = true

  try {
    const data = {
      name: name.value.trim(),
      email: email.value.trim(),
      password: password.value,
      passwordConfirmation: passwordConfirmation.value,
    }

    if (address.value.trim()) {
      data.address = address.value.trim()
    }

    const response = await authService.register(data)

    await Swal.fire({
      icon: 'success',
      title: 'Cuenta creada',
      text: response.data?.message || 'Tu cuenta fue creada correctamente.',
      timer: 1600,
      showConfirmButton: false,
    })

    router.push('/login')
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error al crear la cuenta',
      text: getErrorMessage(error),
    })
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<template>
  <main class="auth-page auth-page-register d-flex align-items-center justify-content-center">
    <div class="auth-wrapper">
      <div class="auth-card">
        <div class="row g-0">
          <div class="col-md-6 d-none d-md-block">
            <section class="auth-brand-panel register-brand-panel h-100">
              <div class="d-flex align-items-center gap-3 mb-5">
                <div class="app-logo">DK</div>

                <div>
                  <h3 class="mb-0 fw-bold">{{ appName }}</h3>
                  <small class="text-white-50">Gestión de tu negocio</small>
                </div>
              </div>

              <span class="auth-badge mb-4">
                Comienza con Drakios
              </span>

              <h1 class="display-6 fw-bold mb-3">
                Da el primer paso para organizar tu negocio.
              </h1>

              <p class="text-white-50 mb-5">
                Crea tu cuenta y prepárate para gestionar productos, inventario, ventas y clientes desde un solo lugar.
              </p>

              <div class="row g-3 mb-5">
                <div class="col-6">
                  <div class="auth-mini-stat">
                    <h4 class="fw-bold mb-1">Productos</h4>
                    <small class="text-white-50">Catálogo organizado</small>
                  </div>
                </div>

                <div class="col-6">
                  <div class="auth-mini-stat">
                    <h4 class="fw-bold mb-1">Inventario</h4>
                    <small class="text-white-50">Existencias al día</small>
                  </div>
                </div>
              </div>

              <div class="d-grid gap-4">
                <div class="auth-feature">
                  <span class="auth-feature-dot"></span>
                  <div>
                    <h6 class="mb-1 fw-semibold">Tu espacio de trabajo</h6>
                    <small class="text-white-50">
                      Reúne en un solo lugar la información de tu negocio.
                    </small>
                  </div>
                </div>

                <div class="auth-feature">
                  <span class="auth-feature-dot"></span>
                  <div>
                    <h6 class="mb-1 fw-semibold">Gestión más simple</h6>
                    <small class="text-white-50">
                      Organiza tus productos y lleva el control de tus operaciones.
                    </small>
                  </div>
                </div>

                <div class="auth-feature">
                  <span class="auth-feature-dot"></span>
                  <div>
                    <h6 class="mb-1 fw-semibold">Acceso rápido</h6>
                    <small class="text-white-50">
                      Al crear tu cuenta, podrás iniciar sesión y comenzar a organizar tu negocio.
                    </small>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div class="col-md-6">
            <section class="auth-form-panel">
              <div class="mb-4">
                <span class="badge text-bg-primary mb-3">{{ viewName }}</span>

                <h2 class="auth-title mb-2">
                  Crear nueva cuenta
                </h2>

                <p class="auth-subtitle mb-0">
                  Completa tus datos para crear tu cuenta y comenzar.
                </p>
              </div>

              <form @submit.prevent="registerUser">
                <div class="mb-3">
                  <label for="name" class="form-label fw-semibold">
                    Nombre completo
                  </label>

                  <input type="text" id="name" v-model.trim="name" class="form-control premium-input"
                    placeholder="Nombre y apellido" autocomplete="name" required />
                </div>

                <div class="mb-3">
                  <label for="email" class="form-label fw-semibold">
                    Correo electrónico
                  </label>

                  <input type="email" id="email" v-model.trim="email" class="form-control premium-input"
                    placeholder="nombre@empresa.com" autocomplete="email" required />
                </div>

                <div class="mb-3">
                  <label for="password" class="form-label fw-semibold">
                    Contraseña
                  </label>

                  <input type="password" id="password" v-model.trim="password" class="form-control premium-input"
                    placeholder="Mínimo 8 caracteres" autocomplete="new-password" required />
                </div>

                <div class="mb-3">
                  <label for="passwordConfirmation" class="form-label fw-semibold">
                    Confirmar contraseña
                  </label>

                  <input type="password" id="passwordConfirmation" v-model="passwordConfirmation"
                    class="form-control premium-input" placeholder="Repite tu contraseña" autocomplete="new-password"
                    required />
                </div>

                <div class="mb-3">
                  <label for="address" class="form-label fw-semibold">
                    Dirección
                    <small class="text-muted fw-normal">(opcional)</small>
                  </label>

                  <input type="text" id="address" v-model.trim="address" class="form-control premium-input"
                    placeholder="Bogota, Colombia" />
                </div>

                <div class="auth-register-box mb-4">
                  <strong>¡Ya casi!</strong>
                  Al crear tu cuenta podrás iniciar sesión y acceder a Drakios.
                </div>

                <button type="submit" class="btn btn-premium w-100" :disabled="loading">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"
                    aria-hidden="true"></span>

                  {{ loading ? 'Creando cuenta...' : 'Crear cuenta' }}
                </button>
              </form>

              <div class="text-center mt-4">
                <span class="text-muted">¿Ya tienes una cuenta?</span>

                <button type="button" class="btn btn-link fw-semibold text-decoration-none p-0 ms-1" @click="goToLogin">
                  Iniciar sesión
                </button>
              </div>

              <div class="border-top mt-4 pt-3 text-center">
                <small class="text-muted">
                  {{ appName }} © Gestión comercial e inventario
                </small>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import Swal from 'sweetalert2'
import AppFooter from '@/components/AppFooter.vue'
import { authService } from '@/modules/auth/services/authService'
import { useAuthStore } from '@/modules/auth/stores/authStore'
import { getErrorMessage } from '@/helpers/errorHelper'

const router = useRouter()
const authStore = useAuthStore()

const appName = 'Drakios'
const viewName = 'Inicio de sesión'

const email = ref('')
const password = ref('')
const loading = ref(false)

const validateForm = () => {
  if (!email.value) {
    Swal.fire({
      icon: 'warning',
      title: 'Correo requerido',
      text: 'Ingresa tu correo electrónico.',
    })

    return false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailRegex.test(email.value)) {
    Swal.fire({
      icon: 'warning',
      title: 'Correo inválido',
      text: 'Ingresa un correo electrónico válido.',
    })

    return false
  }

  if (!password.value) {
    Swal.fire({
      icon: 'warning',
      title: 'Contraseña requerida',
      text: 'Ingresa tu contraseña.',
    })

    return false
  }

  if (password.value.length < 8) {
    Swal.fire({
      icon: 'warning',
      title: 'Contraseña inválida',
      text: 'La contraseña debe tener al menos 8 caracteres.',
    })

    return false
  }

  return true
}

const login = async () => {
  if (!validateForm()) {
    return
  }

  loading.value = true

  try {
    const response = await authService.login({
      email: email.value,
      password: password.value,
    })

    const { access_token, user, message } = response.data

    authStore.setSession(access_token, user)

    await Swal.fire({
      icon: 'success',
      title: 'Bienvenido',
      text: message || 'Login correcto.',
      timer: 1200,
      showConfirmButton: false,
    })

    router.push('/products')
  } catch (error) {
    await Swal.fire({
      icon: 'error',
      title: 'Error al iniciar sesión',
      text: getErrorMessage(error),
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-layout">
    <main class="auth-page d-flex align-items-center justify-content-center">
      <div class="auth-wrapper">
        <div class="auth-card">
          <div class="row g-0">
            <div class="col-md-6 d-none d-md-block">
              <section class="auth-brand-panel h-100">
                <div class="d-flex align-items-center gap-3 mb-5">
                  <div class="app-logo">DK</div>

                  <div>
                    <h3 class="mb-0 fw-bold">{{ appName }}</h3>
                    <small class="text-white-50">Gestión de tu negocio</small>
                  </div>
                </div>

                <span class="auth-badge mb-4">
                  Controla tu negocio en un solo lugar
                </span>

                <h1 class="display-6 fw-bold mb-3">
                  Todo lo que necesitas para hacer crecer tu negocio.
                </h1>

                <p class="text-white-50 mb-5">
                  Organiza tus productos, controla tu inventario y mantén tus operaciones al día.
                </p>

                <div class="d-grid gap-4">
                  <div class="auth-feature">
                    <span class="auth-feature-dot"></span>
                    <div>
                      <h6 class="mb-1 fw-semibold">Inventario bajo control</h6>
                      <small class="text-white-50">
                        Consulta tus productos y mantén un seguimiento de tus existencias.
                      </small>
                    </div>
                  </div>

                  <div class="auth-feature">
                    <span class="auth-feature-dot"></span>
                    <div>
                      <h6 class="mb-1 fw-semibold">Operaciones organizadas</h6>
                      <small class="text-white-50">
                        Gestiona ventas, compras y la información de tus clientes.
                      </small>
                    </div>
                  </div>

                  <div class="auth-feature">
                    <span class="auth-feature-dot"></span>
                    <div>
                      <h6 class="mb-1 fw-semibold">Información para decidir</h6>
                      <small class="text-white-50">
                        Accede a los datos de tu negocio desde un espacio centralizado.
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
                    Bienvenido nuevamente
                  </h2>

                  <p class="auth-subtitle mb-0">
                    Inicia sesión para continuar con la gestión de tu negocio.
                  </p>
                </div>

                <form @submit.prevent="login">
                  <div class="mb-3">
                    <label for="email" class="form-label fw-semibold">
                      Correo electrónico
                    </label>

                    <input type="email" id="email" v-model.trim="email" class="form-control premium-input"
                      placeholder="correo@empresa.com" autocomplete="email" />
                  </div>

                  <div class="mb-3">
                    <label for="password" class="form-label fw-semibold">
                      Contraseña
                    </label>

                    <input type="password" id="password" v-model="password" class="form-control premium-input"
                      placeholder="Ingresa tu contraseña" autocomplete="current-password" />
                  </div>

                  <div class="auth-demo-box mb-4">
                    Ingresa con el correo y la contraseña asociados a tu cuenta.
                  </div>

                  <button type="submit" class="btn btn-primary btn-premium w-100" :disabled="loading">
                    <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"
                      aria-hidden="true"></span>

                    {{ loading ? 'Validando acceso...' : 'Iniciar sesión' }}
                  </button>
                </form>

                <div class="text-center mt-3">
                  <RouterLink to="/forgot-password" class="fw-semibold text-decoration-none">
                    ¿Olvidaste tu contraseña?
                  </RouterLink>
                </div>

                <div class="text-center mt-4">
                  <span class="text-muted">¿No tienes una cuenta?</span>

                  <RouterLink to="/register" class="fw-semibold text-decoration-none ms-1">
                    Crear cuenta
                  </RouterLink>
                </div>

              </section>
            </div>
          </div>
        </div>
      </div>
    </main>
    <AppFooter compact />
  </div>
</template>

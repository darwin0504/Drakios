<script setup>
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import Swal from 'sweetalert2'
import { authService } from '@/modules/auth/services/authService'
import { useAuthStore } from '@/modules/auth/stores/authStore'
import { getErrorMessage } from '@/helpers/errorHelper'

const router = useRouter()
const authStore = useAuthStore()

const appName = 'Drakios'
const viewName = 'Inicio de sesión'

const correo = ref('')
const password = ref('')
const loading = ref(false)

const validateForm = () => {
  if (!correo.value) {
    Swal.fire({
      icon: 'warning',
      title: 'Correo requerido',
      text: 'Ingresa tu correo electrónico.',
    })

    return false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailRegex.test(correo.value)) {
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
      correo: correo.value,
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
                  <small class="text-white-50">Panel de gestión de productos</small>
                </div>
              </div>

              <span class="auth-badge mb-4">
                Sistema CRUD con Vue.js + JWT
              </span>

              <h1 class="display-6 fw-bold mb-3">
                Administra tus productos de forma rápida y segura.
              </h1>

              <p class="text-white-50 mb-5">
                Accede al panel para listar, crear, editar y eliminar productos.
              </p>

              <div class="d-grid gap-4">
                <div class="auth-feature">
                  <span class="auth-feature-dot"></span>
                  <div>
                    <h6 class="mb-1 fw-semibold">Autenticación protegida</h6>
                    <small class="text-white-50">
                      Manejo de sesión mediante token JWT.
                    </small>
                  </div>
                </div>

                <div class="auth-feature">
                  <span class="auth-feature-dot"></span>
                  <div>
                    <h6 class="mb-1 fw-semibold">Gestión de productos</h6>
                    <small class="text-white-50">
                      Interfaz sencilla para operaciones CRUD.
                    </small>
                  </div>
                </div>

                <div class="auth-feature">
                  <span class="auth-feature-dot"></span>
                  <div>
                    <h6 class="mb-1 fw-semibold">Interfaz premium</h6>
                    <small class="text-white-50">
                      Diseño limpio con Bootstrap y SweetAlert2.
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
                  Ingresa tus credenciales para acceder al panel administrativo.
                </p>
              </div>

              <form @submit.prevent="login">
                <div class="mb-3">
                  <label for="correo" class="form-label fw-semibold">
                    Correo electrónico
                  </label>

                  <input type="email" id="correo" v-model.trim="correo" class="form-control premium-input"
                    placeholder="admin@drakios.com" autocomplete="email" />
                </div>

                <div class="mb-3">
                  <label for="password" class="form-label fw-semibold">
                    Contraseña
                  </label>

                  <input type="password" id="password" v-model="password" class="form-control premium-input"
                    placeholder="Ingresa tu contraseña" autocomplete="current-password" />
                </div>

                <div class="auth-demo-box mb-4">
                  <strong>Demo:</strong>
                  puedes usar el usuario de prueba configurado en tu backend o el usuario que ya registraste.
                </div>

                <button type="submit" class="btn btn-primary btn-premium w-100" :disabled="loading">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"
                    aria-hidden="true"></span>

                  {{ loading ? 'Validando acceso...' : 'Ingresar al panel' }}
                </button>
              </form>

              <div class="text-center mt-4">
                <span class="text-muted">¿No tienes una cuenta?</span>

                <RouterLink to="/register" class="fw-semibold text-decoration-none ms-1">
                  Crear cuenta
                </RouterLink>
              </div>

              <div class="border-top mt-4 pt-3 text-center">
                <small class="text-muted">
                  {{ appName }} © Panel frontend con Vue.js
                </small>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

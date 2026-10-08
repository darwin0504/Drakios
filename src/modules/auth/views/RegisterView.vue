<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import AppFooter from '@/components/AppFooter.vue'
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
const errors = ref({})
const showPassword = ref(false)
const showPasswordConfirmation = ref(false)

const validateForm = () => {
  const newErrors = {}
  const userName = name.value.trim()
  const userEmail = email.value.trim()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!userName) {
    newErrors.name = 'Ingresa tu nombre.'
  } else if (userName.length < 3) {
    newErrors.name = 'El nombre debe tener mínimo 3 caracteres.'
  }

  if (!userEmail) {
    newErrors.email = 'Ingresa tu correo electrónico.'
  } else if (!emailRegex.test(userEmail)) {
    newErrors.email = 'Ingresa un correo electrónico válido.'
  }

  if (!password.value.trim()) {
    newErrors.password = 'Ingresa una contraseña.'
  } else if (password.value.length < 8) {
    newErrors.password = 'La contraseña debe tener mínimo 8 caracteres.'
  } else if (!/[0-9]/.test(password.value)) {
    newErrors.password = 'La contraseña debe contener al menos un número.'
  }

  if (!passwordConfirmation.value) {
    newErrors.passwordConfirmation = 'Confirma tu contraseña.'
  } else if (password.value !== passwordConfirmation.value) {
    newErrors.passwordConfirmation = 'Las contraseñas no coinciden.'
  }

  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

const clearFieldError = (field) => {
  if (errors.value[field]) {
    delete errors.value[field]
  }
}

const handlePasswordInput = () => {
  clearFieldError('password')
  clearFieldError('passwordConfirmation')
}

const registerUser = async () => {
  if (!validateForm()) {
    await Swal.fire({
      icon: 'warning',
      title: 'Revisa el formulario',
      text: 'Corrige los campos indicados para crear tu cuenta.',
    })
    return
  }

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
  <div class="auth-layout">
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
                  Crea tu cuenta y prepárate para gestionar productos, inventario, ventas y clientes desde un solo
                  lugar.
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

                <form @submit.prevent="registerUser" novalidate>
                  <div class="mb-3">
                    <label for="name" class="form-label fw-semibold">
                      Nombre completo
                    </label>

                    <div class="input-group has-validation">
                      <span class="input-group-text" :class="{ 'is-invalid': errors.name }">
                        <i class="bi bi-person"></i>
                      </span>
                      <input type="text" id="name" v-model.trim="name" class="form-control premium-input"
                        :class="{ 'is-invalid': errors.name }" :aria-invalid="!!errors.name"
                        :aria-describedby="errors.name ? 'register-name-error' : undefined"
                        placeholder="Nombre y apellido" autocomplete="name" maxlength="150" required
                        @input="clearFieldError('name')" />
                    </div>
                    <div v-if="errors.name" id="register-name-error" class="invalid-feedback d-block">
                      {{ errors.name }}
                    </div>
                  </div>

                  <div class="mb-3">
                    <label for="email" class="form-label fw-semibold">
                      Correo electrónico
                    </label>

                    <div class="input-group has-validation">
                      <span class="input-group-text" :class="{ 'is-invalid': errors.email }">
                        <i class="bi bi-envelope"></i>
                      </span>
                      <input type="email" id="email" v-model.trim="email" class="form-control premium-input"
                        :class="{ 'is-invalid': errors.email }" :aria-invalid="!!errors.email"
                        :aria-describedby="errors.email ? 'register-email-error' : undefined"
                        placeholder="nombre@empresa.com" autocomplete="email" maxlength="180" required
                        @input="clearFieldError('email')" />
                    </div>
                    <div v-if="errors.email" id="register-email-error" class="invalid-feedback d-block">
                      {{ errors.email }}
                    </div>
                  </div>

                  <div class="mb-3">
                    <label for="password" class="form-label fw-semibold">
                      Contraseña
                    </label>

                    <div class="input-group has-validation password-input-group">
                      <span class="input-group-text" :class="{ 'is-invalid': errors.password }">
                        <i class="bi bi-lock"></i>
                      </span>
                      <input :type="showPassword ? 'text' : 'password'" id="password" v-model="password"
                        class="form-control premium-input" :class="{ 'is-invalid': errors.password }"
                        :aria-invalid="!!errors.password"
                        :aria-describedby="errors.password ? 'register-password-error' : 'register-password-help'"
                        placeholder="Mínimo 8 caracteres" autocomplete="new-password" required
                        @input="handlePasswordInput" />
                      <button type="button" class="btn btn-outline-secondary password-toggle"
                        :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                        :aria-pressed="showPassword" @click="showPassword = !showPassword">
                        <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'" aria-hidden="true"></i>
                      </button>
                    </div>
                    <div v-if="errors.password" id="register-password-error" class="invalid-feedback d-block">
                      {{ errors.password }}
                    </div>
                    <div v-else id="register-password-help" class="form-text">
                      Mínimo 8 caracteres y un número.
                    </div>
                  </div>

                  <div class="mb-3">
                    <label for="passwordConfirmation" class="form-label fw-semibold">
                      Confirmar contraseña
                    </label>

                    <div class="input-group has-validation password-input-group">
                      <span class="input-group-text" :class="{ 'is-invalid': errors.passwordConfirmation }">
                        <i class="bi bi-shield-lock"></i>
                      </span>
                      <input :type="showPasswordConfirmation ? 'text' : 'password'" id="passwordConfirmation"
                        v-model="passwordConfirmation" class="form-control premium-input"
                        :class="{ 'is-invalid': errors.passwordConfirmation }"
                        :aria-invalid="!!errors.passwordConfirmation"
                        :aria-describedby="errors.passwordConfirmation ? 'register-confirmation-error' : undefined"
                        placeholder="Repite tu contraseña" autocomplete="new-password" required
                        @input="clearFieldError('passwordConfirmation')" />
                      <button type="button" class="btn btn-outline-secondary password-toggle"
                        :aria-label="showPasswordConfirmation ? 'Ocultar confirmación de contraseña' : 'Mostrar confirmación de contraseña'"
                        :aria-pressed="showPasswordConfirmation"
                        @click="showPasswordConfirmation = !showPasswordConfirmation">
                        <i :class="showPasswordConfirmation ? 'bi bi-eye-slash' : 'bi bi-eye'"
                          aria-hidden="true"></i>
                      </button>
                    </div>
                    <div v-if="errors.passwordConfirmation" id="register-confirmation-error"
                      class="invalid-feedback d-block">
                      {{ errors.passwordConfirmation }}
                    </div>
                  </div>

                  <div class="mb-3">
                    <label for="address" class="form-label fw-semibold">
                      Dirección
                      <small class="text-muted fw-normal">(opcional)</small>
                    </label>

                    <div class="input-group">
                      <span class="input-group-text">
                        <i class="bi bi-geo-alt"></i>
                      </span>
                      <input type="text" id="address" v-model.trim="address" class="form-control premium-input"
                        placeholder="Bogota, Colombia" autocomplete="street-address" maxlength="255" />
                    </div>
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

                  <button type="button" class="btn btn-link fw-semibold text-decoration-none p-0 ms-1"
                    @click="goToLogin">
                    Iniciar sesión
                  </button>
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

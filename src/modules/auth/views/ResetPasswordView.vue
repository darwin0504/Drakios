<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import AppFooter from '@/components/AppFooter.vue'

import { authService } from '@/modules/auth/services/authService'
import { getErrorMessage } from '@/helpers/errorHelper'

const route = useRoute()
const router = useRouter()

const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const errors = ref({})
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const token = computed(() => {
    const value = route.query.token

    if (Array.isArray(value)) {
        return value[0] || ''
    }

    return value || ''
})

const validateForm = () => {
    const newErrors = {}

    if (!token.value) {
        Swal.fire({
            icon: 'error',
            title: 'Enlace inválido',
            text: 'El enlace para restablecer la contraseña no es válido o ha expirado.',
        })

        return false
    }

    if (!password.value) {
        newErrors.password = 'Ingresa tu nueva contraseña.'
    } else if (password.value.length < 8) {
        newErrors.password = 'La contraseña debe tener al menos 8 caracteres.'
    }

    if (!confirmPassword.value) {
        newErrors.confirmPassword = 'Confirma tu nueva contraseña.'
    } else if (password.value !== confirmPassword.value) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden.'
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
    clearFieldError('confirmPassword')
}

const resetPassword = async () => {
    if (!validateForm()) {
        if (Object.keys(errors.value).length) {
            await Swal.fire({
                icon: 'warning',
                title: 'Revisa el formulario',
                text: 'Corrige los campos indicados para continuar.',
            })
        }
        return
    }

    loading.value = true

    try {
        const response = await authService.resetPassword({
            token: token.value,
            password: password.value,
        })

        await Swal.fire({
            icon: 'success',
            title: 'Contraseña actualizada',
            text:
                response.data?.message ||
                'Tu contraseña fue actualizada correctamente.',
            confirmButtonText: 'Volver al inicio de sesión',
        })

        router.push('/login')
    } catch (error) {
        await Swal.fire({
            icon: 'error',
            title: 'No se pudo actualizar la contraseña',
            text: getErrorMessage(error),
        })
    } finally {
        loading.value = false
    }
}

const goToLogin = () => {
    router.push('/login')
}

const requestNewLink = () => {
    router.push('/forgot-password')
}
</script>

<template>
    <div class="auth-layout">
        <main class="auth-page d-flex align-items-center justify-content-center">
            <div class="card-dialog">
                <div class="reset-password-header">
                    <div class="app-logo">DK</div>

                    <h2 class="auth-title mb-2">Restablecer contraseña</h2>

                    <p class="auth-subtitle mb-0">Ingresa una nueva contraseña para tu cuenta.</p>
                </div>

                <div v-if="!token" class="alert alert-info" role="alert">
                    <strong>Enlace no válido o vencido.</strong>

                    <div class="mt-2">
                        Solicita un nuevo enlace para restablecer tu contraseña.
                    </div>
                </div>

                <form v-else @submit.prevent="resetPassword" novalidate>
                    <div class="mb-3">
                        <label for="password" class="form-label fw-semibold">
                            Nueva contraseña
                        </label>

                        <div class="input-group has-validation password-input-group">
                            <span class="input-group-text" :class="{ 'is-invalid': errors.password }">
                                <i class="bi bi-lock"></i>
                            </span>
                            <input id="password" v-model="password"
                                :type="showPassword ? 'text' : 'password'" class="form-control premium-input"
                                :class="{ 'is-invalid': errors.password }" :aria-invalid="!!errors.password"
                                :aria-describedby="errors.password ? 'reset-password-error' : 'reset-password-help'"
                                placeholder="Ingresa tu nueva contraseña" autocomplete="new-password"
                                :disabled="loading" required @input="handlePasswordInput" />
                            <button type="button" class="btn btn-outline-secondary password-toggle"
                                :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                                :aria-pressed="showPassword" @click="showPassword = !showPassword">
                                <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'" aria-hidden="true"></i>
                            </button>
                        </div>
                        <div v-if="errors.password" id="reset-password-error" class="invalid-feedback d-block">
                            {{ errors.password }}
                        </div>

                        <small v-else id="reset-password-help" class="form-text">
                            La contraseña debe tener al menos 8 caracteres.
                        </small>
                    </div>

                    <div class="mb-4">
                        <label for="confirmPassword" class="form-label fw-semibold">
                            Confirmar contraseña
                        </label>

                        <div class="input-group has-validation password-input-group">
                            <span class="input-group-text" :class="{ 'is-invalid': errors.confirmPassword }">
                                <i class="bi bi-shield-lock"></i>
                            </span>
                            <input id="confirmPassword" v-model="confirmPassword"
                                :type="showConfirmPassword ? 'text' : 'password'"
                                class="form-control premium-input" :class="{ 'is-invalid': errors.confirmPassword }"
                                :aria-invalid="!!errors.confirmPassword"
                                :aria-describedby="errors.confirmPassword ? 'reset-confirm-error' : undefined"
                                placeholder="Repite tu nueva contraseña" autocomplete="new-password"
                                :disabled="loading" required @input="clearFieldError('confirmPassword')" />
                            <button type="button" class="btn btn-outline-secondary password-toggle"
                                :aria-label="showConfirmPassword ? 'Ocultar confirmación' : 'Mostrar confirmación'"
                                :aria-pressed="showConfirmPassword"
                                @click="showConfirmPassword = !showConfirmPassword">
                                <i :class="showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"
                                    aria-hidden="true"></i>
                            </button>
                        </div>
                        <div v-if="errors.confirmPassword" id="reset-confirm-error"
                            class="invalid-feedback d-block">
                            {{ errors.confirmPassword }}
                        </div>
                    </div>

                    <button type="submit" class="btn btn-primary btn-premium w-100" :disabled="loading">
                        <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"
                            aria-hidden="true"></span>

                        {{ loading ? 'Actualizando...' : 'Actualizar contraseña' }}
                    </button>
                </form>

                <div class="text-center mt-3">
                    <button v-if="!token" type="button" class="btn btn-link fw-semibold text-decoration-none p-0"
                        @click="requestNewLink">
                        Solicitar un nuevo enlace
                    </button>
                </div>
            </div>
        </main>
        <AppFooter compact />
    </div>
</template>

<style scoped>
.reset-password-header {
    margin-bottom: 24px;
    text-align: center;
}

.reset-password-header .app-logo {
    margin: 0 auto 20px;
    background: linear-gradient(135deg, var(--app-primary), var(--app-primary-dark));
    color: #ffffff;
}

@media (max-width: 480px) {
    .card-dialog {
        padding: 24px 20px;
    }
}
</style>
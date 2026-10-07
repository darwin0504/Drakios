<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Swal from 'sweetalert2'

import { authService } from '@/modules/auth/services/authService'
import { getErrorMessage } from '@/helpers/errorHelper'

const route = useRoute()
const router = useRouter()

const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)

const token = computed(() => {
    const value = route.query.token

    if (Array.isArray(value)) {
        return value[0] || ''
    }

    return value || ''
})

const validateForm = () => {
    if (!token.value) {
        Swal.fire({
            icon: 'error',
            title: 'Enlace inválido',
            text: 'El enlace para restablecer la contraseña no es válido o ha expirado.',
        })

        return false
    }

    if (!password.value) {
        Swal.fire({
            icon: 'warning',
            title: 'Contraseña requerida',
            text: 'Ingresa tu nueva contraseña.',
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

    if (!confirmPassword.value) {
        Swal.fire({
            icon: 'warning',
            title: 'Confirma tu contraseña',
            text: 'Vuelve a ingresar tu nueva contraseña.',
        })

        return false
    }

    if (password.value !== confirmPassword.value) {
        Swal.fire({
            icon: 'warning',
            title: 'Las contraseñas no coinciden',
            text: 'Verifica que ambas contraseñas sean iguales.',
        })

        return false
    }

    return true
}

const resetPassword = async () => {
    if (!validateForm()) {
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

            <form v-else @submit.prevent="resetPassword">
                <div class="mb-3">
                    <label for="password" class="form-label fw-semibold">
                        Nueva contraseña
                    </label>

                    <input id="password" v-model="password" type="password" class="form-control premium-input"
                        placeholder="Ingresa tu nueva contraseña" autocomplete="new-password" :disabled="loading" />

                    <small class="text-muted">
                        La contraseña debe tener al menos 8 caracteres.
                    </small>
                </div>

                <div class="mb-4">
                    <label for="confirmPassword" class="form-label fw-semibold">
                        Confirmar contraseña
                    </label>

                    <input id="confirmPassword" v-model="confirmPassword" type="password"
                        class="form-control premium-input" placeholder="Repite tu nueva contraseña"
                        autocomplete="new-password" :disabled="loading" />
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
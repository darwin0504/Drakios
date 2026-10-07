<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'

import { authService } from '@/modules/auth/services/authService'
import { useAuthStore } from '@/modules/auth/stores/authStore'
import { getErrorMessage } from '@/helpers/errorHelper'

const router = useRouter()
const authStore = useAuthStore()

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)

const validateForm = () => {
    if (!currentPassword.value) {
        Swal.fire({
            icon: 'warning',
            title: 'Contraseña actual requerida',
            text: 'Ingresa tu contraseña actual.',
        })

        return false
    }

    if (currentPassword.value.length < 8) {
        Swal.fire({
            icon: 'warning',
            title: 'Contraseña actual inválida',
            text: 'La contraseña actual debe tener al menos 8 caracteres.',
        })

        return false
    }

    if (!newPassword.value) {
        Swal.fire({
            icon: 'warning',
            title: 'Nueva contraseña requerida',
            text: 'Ingresa tu nueva contraseña.',
        })

        return false
    }

    if (newPassword.value.length < 8) {
        Swal.fire({
            icon: 'warning',
            title: 'Nueva contraseña inválida',
            text: 'La nueva contraseña debe tener al menos 8 caracteres.',
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

    if (newPassword.value !== confirmPassword.value) {
        Swal.fire({
            icon: 'warning',
            title: 'Las contraseñas no coinciden',
            text: 'Verifica que ambas contraseñas nuevas sean iguales.',
        })

        return false
    }

    if (currentPassword.value === newPassword.value) {
        Swal.fire({
            icon: 'warning',
            title: 'Contraseña no permitida',
            text: 'La nueva contraseña debe ser diferente a la contraseña actual.',
        })

        return false
    }

    return true
}

const changePassword = async () => {
    if (!validateForm()) {
        return
    }

    loading.value = true

    try {
        const response = await authService.changePassword({
            currentPassword: currentPassword.value,
            newPassword: newPassword.value,
        })

        await Swal.fire({
            icon: 'success',
            title: 'Contraseña actualizada',
            text:
                response.data?.message ||
                'Tu contraseña fue actualizada correctamente.',
            confirmButtonText: 'Ir al inicio de sesión',
        })

        authStore.clearSession()

        router.push('/login')
    } catch (error) {
        await Swal.fire({
            icon: 'error',
            title: 'No se pudo cambiar la contraseña',
            text: getErrorMessage(error),
        })
    } finally {
        loading.value = false
    }
}

const cancel = () => {
    router.push('/products')
}
</script>

<template>
    <main class="change-password-page d-flex align-items-center justify-content-center">
        <div class="card-dialog">

            <div class="change-password-header">
                <div class="app-logo">DK</div>

                <h2 class="auth-title mb-2">Cambiar contraseña</h2>

                <p class="auth-subtitle mb-0">
                    Actualiza la contraseña de tu cuenta de forma segura.
                </p>
            </div>

            <div class="security-notice">
                <div class="security-notice-icon">
                    <i class="bi bi-shield-lock"></i>
                </div>

                <div>
                    <strong>Protege tu cuenta</strong>

                    <p>
                        Utiliza una contraseña diferente a la actual y de al menos 8 caracteres.
                    </p>
                </div>
            </div>

            <form @submit.prevent="changePassword">
                <div class="mb-3">
                    <label for="currentPassword" class="form-label fw-semibold">
                        Contraseña actual
                    </label>

                    <input id="currentPassword" v-model="currentPassword" type="password"
                        class="form-control premium-input" placeholder="Ingresa tu contraseña actual"
                        autocomplete="current-password" :disabled="loading" />
                </div>

                <div class="mb-3">
                    <label for="newPassword" class="form-label fw-semibold">
                        Nueva contraseña
                    </label>

                    <input id="newPassword" v-model="newPassword" type="password" class="form-control premium-input"
                        placeholder="Ingresa tu nueva contraseña" autocomplete="new-password" :disabled="loading" />

                    <small class="text-muted">
                        La contraseña debe tener al menos 8 caracteres.
                    </small>
                </div>

                <div class="mb-4">
                    <label for="confirmPassword" class="form-label fw-semibold">
                        Confirmar nueva contraseña
                    </label>

                    <input id="confirmPassword" v-model="confirmPassword" type="password"
                        class="form-control premium-input" placeholder="Repite tu nueva contraseña"
                        autocomplete="new-password" :disabled="loading" />
                </div>

                <button type="submit" class="btn btn-primary btn-premium w-100" :disabled="loading">
                    <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"
                        aria-hidden="true"></span>

                    {{ loading ? 'Actualizando...' : 'Cambiar contraseña' }}
                </button>
            </form>

            <div class="text-center mt-3">
                <button type="button" class="btn btn-link text-decoration-none" :disabled="loading" @click="cancel">
                    Cancelar
                </button>
            </div>
        </div>
    </main>
</template>

<style scoped>
.change-password-page {
    min-height: 100vh;
    padding: 24px;
}

.change-password-header {
    margin-bottom: 24px;
    text-align: center;
}

.change-password-header .app-logo {
    margin: 0 auto 20px;
    background: linear-gradient(135deg, var(--app-primary), var(--app-primary-dark));
    color: #ffffff;
}

.security-notice {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 24px;
    padding: 14px;
    border: 1px solid rgba(139, 182, 232, 0.18);
    border-radius: 12px;
    background: rgba(139, 182, 232, 0.06);
}

.security-notice-icon {
    width: 38px;
    height: 38px;
    flex: 0 0 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    background: rgba(139, 182, 232, 0.1);
    color: var(--app-primary);
    font-size: 17px;
}

.security-notice strong {
    display: block;
    color: var(--app-dark);
    font-size: 13px;
    font-weight: 800;
}

.security-notice p {
    margin: 3px 0 0;
    color: var(--app-muted);
    font-size: 12px;
    line-height: 1.45;
}

@media (max-width: 575.98px) {
    .change-password-card {
        padding: 24px 20px;
    }
}
</style>

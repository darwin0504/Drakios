<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import AppNavbar from '@/components/AppNavbar.vue'
import AppFooter from '@/components/AppFooter.vue'
import { authService } from '@/modules/auth/services/authService'
import { useAuthStore } from '@/modules/auth/stores/authStore'
import { getErrorMessage } from '@/helpers/errorHelper'

const router = useRouter()
const authStore = useAuthStore()

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const errors = ref({})
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const validateForm = () => {
    const newErrors = {}

    if (!currentPassword.value) {
        newErrors.currentPassword = 'Ingresa tu contraseña actual.'
    } else if (currentPassword.value.length < 8) {
        newErrors.currentPassword = 'La contraseña actual debe tener al menos 8 caracteres.'
    }

    if (!newPassword.value) {
        newErrors.newPassword = 'Ingresa tu nueva contraseña.'
    } else if (newPassword.value.length < 8) {
        newErrors.newPassword = 'La nueva contraseña debe tener al menos 8 caracteres.'
    }

    if (!confirmPassword.value) {
        newErrors.confirmPassword = 'Confirma tu nueva contraseña.'
    } else if (newPassword.value !== confirmPassword.value) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden.'
    }

    if (currentPassword.value && newPassword.value && currentPassword.value === newPassword.value) {
        newErrors.newPassword = 'La nueva contraseña debe ser diferente a la contraseña actual.'
    }

    errors.value = newErrors
    return Object.keys(newErrors).length === 0
}

const clearFieldError = (field) => {
    if (errors.value[field]) {
        delete errors.value[field]
    }
}

const handleNewPasswordInput = () => {
    clearFieldError('newPassword')
    clearFieldError('confirmPassword')
}

const changePassword = async () => {
    if (!validateForm()) {
        await Swal.fire({
            icon: 'warning',
            title: 'Revisa el formulario',
            text: 'Corrige los campos indicados para continuar.',
        })
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
    router.push('/dashboard')
}
</script>

<template>
    <div class="change-password-layout">
        <AppNavbar />
        <main class="app-page change-password-page d-flex align-items-center justify-content-center">
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

                <form @submit.prevent="changePassword" novalidate>
                    <div class="mb-3">
                        <label for="currentPassword" class="form-label fw-semibold">
                            Contraseña actual
                        </label>

                        <div class="input-group has-validation password-input-group">
                            <span class="input-group-text" :class="{ 'is-invalid': errors.currentPassword }">
                                <i class="bi bi-lock"></i>
                            </span>
                            <input id="currentPassword" v-model="currentPassword"
                                :type="showCurrentPassword ? 'text' : 'password'"
                                class="form-control premium-input"
                                :class="{ 'is-invalid': errors.currentPassword }"
                                :aria-invalid="!!errors.currentPassword"
                                :aria-describedby="errors.currentPassword ? 'current-password-error' : undefined"
                                placeholder="Ingresa tu contraseña actual" autocomplete="current-password"
                                :disabled="loading" required @input="clearFieldError('currentPassword')" />
                            <button type="button" class="btn btn-outline-secondary password-toggle"
                                :aria-label="showCurrentPassword ? 'Ocultar contraseña actual' : 'Mostrar contraseña actual'"
                                :aria-pressed="showCurrentPassword"
                                @click="showCurrentPassword = !showCurrentPassword">
                                <i :class="showCurrentPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"
                                    aria-hidden="true"></i>
                            </button>
                        </div>
                        <div v-if="errors.currentPassword" id="current-password-error"
                            class="invalid-feedback d-block">
                            {{ errors.currentPassword }}
                        </div>
                    </div>

                    <div class="mb-3">
                        <label for="newPassword" class="form-label fw-semibold">
                            Nueva contraseña
                        </label>

                        <div class="input-group has-validation password-input-group">
                            <span class="input-group-text" :class="{ 'is-invalid': errors.newPassword }">
                                <i class="bi bi-shield-lock"></i>
                            </span>
                            <input id="newPassword" v-model="newPassword"
                                :type="showNewPassword ? 'text' : 'password'"
                                class="form-control premium-input" :class="{ 'is-invalid': errors.newPassword }"
                                :aria-invalid="!!errors.newPassword"
                                :aria-describedby="errors.newPassword ? 'new-password-error' : 'new-password-help'"
                                placeholder="Ingresa tu nueva contraseña" autocomplete="new-password"
                                :disabled="loading" required @input="handleNewPasswordInput" />
                            <button type="button" class="btn btn-outline-secondary password-toggle"
                                :aria-label="showNewPassword ? 'Ocultar nueva contraseña' : 'Mostrar nueva contraseña'"
                                :aria-pressed="showNewPassword" @click="showNewPassword = !showNewPassword">
                                <i :class="showNewPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"
                                    aria-hidden="true"></i>
                            </button>
                        </div>

                        <div v-if="errors.newPassword" id="new-password-error" class="invalid-feedback d-block">
                            {{ errors.newPassword }}
                        </div>
                        <small v-else id="new-password-help" class="form-text">
                            La contraseña debe tener al menos 8 caracteres.
                        </small>
                    </div>

                    <div class="mb-4">
                        <label for="confirmPassword" class="form-label fw-semibold">
                            Confirmar nueva contraseña
                        </label>

                        <div class="input-group has-validation password-input-group">
                            <span class="input-group-text" :class="{ 'is-invalid': errors.confirmPassword }">
                                <i class="bi bi-shield-check"></i>
                            </span>
                            <input id="confirmPassword" v-model="confirmPassword"
                                :type="showConfirmPassword ? 'text' : 'password'"
                                class="form-control premium-input"
                                :class="{ 'is-invalid': errors.confirmPassword }"
                                :aria-invalid="!!errors.confirmPassword"
                                :aria-describedby="errors.confirmPassword ? 'confirm-password-error' : undefined"
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
                        <div v-if="errors.confirmPassword" id="confirm-password-error"
                            class="invalid-feedback d-block">
                            {{ errors.confirmPassword }}
                        </div>
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
        <AppFooter />
    </div>
</template>

<style scoped>
.change-password-layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

.change-password-page {
    flex: 1 0 auto;
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

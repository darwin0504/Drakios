<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import AppFooter from '@/components/AppFooter.vue'

import { authService } from '@/modules/auth/services/authService'
import { getErrorMessage } from '@/helpers/errorHelper'

const router = useRouter()

const email = ref('')
const loading = ref(false)
const emailError = ref('')

const validateForm = () => {
    const emailValue = email.value.trim()

    if (!emailValue) {
        emailError.value = 'Ingresa tu correo electrónico.'
        return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(emailValue)) {
        emailError.value = 'Ingresa un correo electrónico válido.'
        return false
    }

    emailError.value = ''
    return true
}

const submitRequest = async () => {
    if (!validateForm()) {
        await Swal.fire({
            icon: 'warning',
            title: 'Revisa el correo',
            text: emailError.value,
        })
        return
    }

    loading.value = true

    try {
        const response = await authService.forgotPassword({
            email: email.value.trim(),
        })

        await Swal.fire({
            icon: 'success',
            title: 'Revisa tu correo',
            text:
                response.data?.message ||
                'Si el correo está registrado, recibirás instrucciones para recuperar tu contraseña.',
            confirmButtonText: 'Volver al inicio de sesión',
        })

        router.push('/login')
    } catch (error) {
        await Swal.fire({
            icon: 'error',
            title: 'No fue posible procesar la solicitud',
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
        <main class="auth-page d-flex align-items-center justify-content-center">
            <div class="card-dialog">
                <div class="forgot-password-header">
                    <div class="app-logo">DK</div>

                    <h2 class="auth-title mb-2">Recuperar contraseña</h2>

                    <p class="auth-subtitle mb-0">
                        Indica el correo asociado a tu cuenta. Si está registrado, recibirás instrucciones para
                        restablecer tu contraseña.
                    </p>
                </div>

                <form @submit.prevent="submitRequest" novalidate>
                    <div class="mb-3">
                        <label for="email" class="form-label fw-semibold">Correo electrónico</label>

                        <div class="input-group has-validation">
                            <span class="input-group-text" :class="{ 'is-invalid': emailError }">
                                <i class="bi bi-envelope"></i>
                            </span>
                            <input id="email" v-model.trim="email" type="email"
                                class="form-control premium-input" :class="{ 'is-invalid': emailError }"
                                :aria-invalid="!!emailError" :aria-describedby="emailError ? 'forgot-email-error' : undefined"
                                placeholder="correo@ejemplo.com" autocomplete="email" :disabled="loading" required
                                @input="emailError = ''" />
                        </div>
                        <div v-if="emailError" id="forgot-email-error" class="invalid-feedback d-block">
                            {{ emailError }}
                        </div>
                    </div>

                    <button type="submit" class="btn btn-primary btn-premium w-100" :disabled="loading">
                        <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"
                            aria-hidden="true"></span>

                        {{ loading ? 'Enviando instrucciones...' : 'Enviar instrucciones' }}
                    </button>
                </form>

                <div class="text-center mt-3">
                    <button type="button" class="btn btn-link fw-semibold text-decoration-none p-0" :disabled="loading"
                        @click="goToLogin">
                        Volver al inicio de sesión
                    </button>
                </div>
            </div>
        </main>
        <AppFooter compact />
    </div>
</template>

<style scoped>
.forgot-password-header {
    margin-bottom: 24px;
    text-align: center;
}

.forgot-password-header .app-logo {
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

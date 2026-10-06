<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'

import { authService } from '@/modules/auth/services/authService'
import { getErrorMessage } from '@/helpers/errorHelper'

const router = useRouter()

const email = ref('')
const loading = ref(false)

const validateForm = () => {
    const emailValue = email.value.trim()

    if (!emailValue) {
        Swal.fire({
            icon: 'warning',
            title: 'Correo requerido',
            text: 'Ingresa tu correo electrónico.',
        })

        return false
    }

    const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(emailValue)) {
        Swal.fire({
            icon: 'warning',
            title: 'Correo inválido',
            text: 'Ingresa un correo electrónico válido.',
        })

        return false
    }

    return true
}

const submitRequest = async () => {
    if (!validateForm()) {
        return
    }

    loading.value = true

    try {
        const response = await authService.forgotPassword({
            email: email.value.trim(),
        })

        await Swal.fire({
            icon: 'success',
            title: 'Solicitud enviada',
            text:
                response.data?.message ||
                'Si el correo está registrado, recibirás instrucciones para recuperar tu contraseña.',
            confirmButtonText: 'Ir al login',
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
    <main class="auth-page d-flex align-items-center justify-content-center">
        <div class="card-dialog">
            <div class="forgot-password-header">
                <div class="app-logo">DK</div>

                <h2 class="auth-title mb-2">Recuperar contraseña</h2>

                <p class="auth-subtitle mb-0">
                    Ingresa el correo electrónico asociado a tu cuenta
                    y te enviaremos un enlace para restablecer tu contraseña.
                </p>
            </div>

            <form @submit.prevent="submitRequest">
                <div class="mb-3">
                    <label for="email" class="form-label fw-semibold">Correo electrónico</label>

                    <input id="email" v-model.trim="email" type="email" class="form-control premium-input"
                        placeholder="correo@ejemplo.com" autocomplete="email" :disabled="loading" />
                </div>

                <button type="submit" class="btn btn-primary btn-premium w-100" :disabled="loading">
                    <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"
                        aria-hidden="true"></span>

                    {{ loading ? 'Enviando...' : 'Enviar enlace' }}
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
</template>

<style scoped>
.forgot-password-header {
    margin-bottom: 24px;
    text-align: center;
}

.forgot-password-header .app-logo {
    margin: 0 auto 20px;
    background: #0d6efd;
    color: #ffffff;
}

@media (max-width: 480px) {
    .card-dialog {
        padding: 24px 20px;
    }
}
</style>

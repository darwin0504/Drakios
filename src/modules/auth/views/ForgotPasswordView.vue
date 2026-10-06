<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'

import { authService } from '../services/authService'
import { getErrorMessage } from '@/helpers/errorHelper'

const router = useRouter()

const email = ref('')
const loading = ref(false)

const SubmitRequest = async () => {
    if (!email.value.trim()) {
        await Swal.fire({
            icon: 'warning',
            title: 'Correo requerido',
            text: 'Ingresa tu correo electrónico.',
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
    <div class="auth-page d-flex align-items-center justify-content-center">
        <div class="card-dialog">
            <div class="forgot-password-header">
                <h2 class="auth-title mb-2">Recuperar contraseña</h2>

                <p class="auth-subtitle mb-0">
                    Ingresa el correo electrónico asociado a tu cuenta
                    y te enviaremos un enlace para restablecer tu contraseña.
                </p>
            </div>

            <form @submit.prevent="SubmitRequest">
                <div class="mb-3">
                    <label for="correo" class="form-label fw-semibold">Correo electrónico</label>

                    <input id="correo" v-model.trim="email" type="email" class="form-control premium-input"
                        autocomplete="email" placeholder="correo@ejemplo.com" :disabled="loading" required />
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
    </div>
</template>

<style scoped>
.forgot-password-header {
    margin-bottom: 24px;
    text-align: center;
}

@media (max-width: 480px) {
    .card-dialog {
        padding: 24px 20px;
    }
}
</style>

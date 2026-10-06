<script setup>
import { onMounted, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { authService } from "../services/authService";

const router = useRouter();
const route = useRoute();

const loading = ref(true);
const success = ref(false);
const errorMessage = ref(
    "No fue posible verificar tu correo electrónico.",
);

const verifyEmail = async () => {
    const token = route.query.token;

    if (!token || typeof token !== "string") {
        errorMessage.value =
            "El enlace de verificación no es válido o está incompleto.";

        loading.value = false;
        return;
    }

    try {
        await authService.verifyEmail({
            token,
        });

        success.value = true;
    } catch (error) {
        const message =
            error?.response?.data?.message;

        if (Array.isArray(message)) {
            errorMessage.value = message.join(", ");
        } else if (typeof message === "string") {
            errorMessage.value = message;
        } else {
            errorMessage.value =
                "No fue posible verificar tu correo electrónico. Inténtalo nuevamente.";
        }
    } finally {
        loading.value = false;
    }
};

const goToLogin = () => {
    router.push("/login");
};

onMounted(() => {
    verifyEmail();
});
</script>

<template>
    <div class="container py-5">
        <div class="row justify-content-center">
            <div class="col-12 col-md-8 col-lg-6">
                <div class="card shadow-sm border-0">
                    <div class="card-body p-4 text-center">

                        <div v-if="loading">
                            <div class="spinner-border text-primary mb-3" role="status">
                                <span class="visually-hidden">
                                    Verificando...
                                </span>
                            </div>

                            <h2 class="h4 mb-2">
                                Verificando tu correo
                            </h2>

                            <p class="text-muted mb-0">
                                Estamos validando tu enlace de verificación.
                            </p>
                        </div>

                        <div v-else-if="success">
                            <div class="text-success mb-3" style="font-size: 3rem;">
                                <i class="bi bi-check-circle-fill"></i>
                            </div>

                            <h2 class="h4 mb-2">
                                Correo verificado
                            </h2>

                            <p class="text-muted mb-4">
                                Tu correo electrónico fue verificado correctamente.
                            </p>

                            <button type="button" class="btn btn-primary" @click="goToLogin">
                                Ir a iniciar sesión
                            </button>
                        </div>

                        <div v-else>
                            <div class="text-danger mb-3" style="font-size: 3rem;">
                                <i class="bi bi-x-circle-fill"></i>
                            </div>

                            <h2 class="h4 mb-2">
                                No se pudo verificar el correo
                            </h2>

                            <p class="text-danger mb-4">
                                {{ errorMessage }}
                            </p>

                            <button type="button" class="btn btn-primary" @click="goToLogin">
                                Ir a iniciar sesión
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

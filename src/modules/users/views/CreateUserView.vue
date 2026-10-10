<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import AppNavbar from '@/components/AppNavbar.vue'
import AppFooter from '@/components/AppFooter.vue'
import { useAuthStore } from '@/modules/auth/stores/authStore'
import userService from '@/modules/users/services/userService'
import { getErrorMessage } from '@/helpers/errorHelper'

const router = useRouter()
const authStore = useAuthStore()

const appName = 'Drakios'
const viewName = 'Crear usuario'

const loading = ref(false)
const showPassword = ref(false)
const showPasswordConfirmation = ref(false)

const form = ref({
    name: '',
    email: '',
    password: '',
    passwordConfirmation: '',
    address: '',
    role: 'USER',
    status: 'ACTIVE',
})

const errors = ref({})

const validateForm = () => {
    const newErrors = {}

    const name = form.value.name.trim()
    const email = form.value.email.trim()
    const password = form.value.password

    if (!name) {
        newErrors.name = 'El nombre es obligatorio.'
    } else if (name.length < 3) {
        newErrors.name = 'El nombre debe tener al menos 3 caracteres.'
    }

    if (!email) {
        newErrors.email = 'El correo es obligatorio.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newErrors.email = 'Ingresa un correo electrónico válido.'
    }

    if (!password.trim()) {
        newErrors.password = 'La contraseña es obligatoria.'
    } else if (password.length < 8) {
        newErrors.password = 'La contraseña debe tener al menos 8 caracteres.'
    }

    if (!form.value.passwordConfirmation) {
        newErrors.passwordConfirmation = 'Confirma la contraseña.'
    } else if (password !== form.value.passwordConfirmation) {
        newErrors.passwordConfirmation = 'Las contraseñas no coinciden.'
    }

    if (!form.value.role) {
        newErrors.role = 'Selecciona un rol.'
    }

    if (!form.value.status) {
        newErrors.status = 'Selecciona un estado.'
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

const cancel = () => {
    router.push('/users')
}

const createUser = async () => {
    if (!validateForm()) {
        Swal.fire({
            icon: 'warning',
            title: 'Revisa el formulario',
            text: 'Completa correctamente los campos obligatorios.',
        })

        return
    }

    loading.value = true

    try {
        const payload = {
            name: form.value.name.trim(),
            email: form.value.email.trim().toLowerCase(),
            password: form.value.password,
            address: form.value.address.trim() || undefined,
            role: form.value.role,
            status: form.value.status,
        }

        await userService.create(payload)

        await Swal.fire({
            icon: 'success',
            title: 'Usuario creado',
            text: 'El usuario se creó correctamente.',
            timer: 1600,
            showConfirmButton: false,
        })

        router.push('/users')
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'No fue posible crear el usuario',
            text: getErrorMessage(error),
        })
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <AppNavbar />
    <main class="app-page">
        <div v-if="!authStore.permissionsLoaded" class="container page-shell">
            <div class="alert alert-info border-0 rounded-4" role="status" aria-live="polite">
                Verificando permisos...
            </div>
        </div>
        <div v-else-if="!authStore.hasPermission('users.create')" class="container page-shell">
            <div class="alert alert-warning border-0 rounded-4" role="alert">
                No tienes permiso para crear usuarios.
                <RouterLink to="/users" class="alert-link">Volver a usuarios</RouterLink>
            </div>
        </div>
        <div v-else class="container page-shell">
            <nav class="page-breadcrumb" aria-label="Ruta de navegación">
                <RouterLink to="/users" class="page-breadcrumb-link">
                    <i class="bi bi-arrow-left" aria-hidden="true"></i>
                    <span>Usuarios</span>
                </RouterLink>
                <i class="bi bi-chevron-right page-breadcrumb-separator" aria-hidden="true"></i>
                <span aria-current="page">Crear usuario</span>
            </nav>

            <section class="page-hero mb-4">
                <div class="row align-items-center position-relative">
                    <div class="col-12">
                        <span class="page-kicker">
                            {{ appName }} · {{ viewName }}
                        </span>

                        <h1 class="fw-bold mb-2">
                            Crear usuario
                        </h1>

                        <p class="text-white-50 mb-0">
                            Registra un nuevo usuario y asigna sus permisos dentro del sistema.
                        </p>
                    </div>
                </div>
            </section>

            <section class="row g-4">
                <div class="col-lg-8">
                    <div class="product-form-card">
                        <div class="product-form-header">
                            <span class="badge text-bg-primary mb-2">
                                Nuevo usuario
                            </span>

                            <h4 class="form-section-title mb-1">
                                Información del usuario
                            </h4>

                            <p class="form-section-subtitle mb-0">
                                Los campos marcados con <span class="required-mark" aria-hidden="true">*</span> son
                                obligatorios.
                            </p>
                        </div>

                        <div class="p-4">
                            <form @submit.prevent="createUser" novalidate>
                                <div class="row g-4">

                                    <!-- Nombre -->
                                    <div class="col-md-6">
                                        <label for="name" class="form-label fw-semibold">
                                            Nombre completo <span class="required-mark" aria-hidden="true">*</span>
                                        </label>

                                        <div class="input-group has-validation">
                                            <span class="input-group-text" :class="{ 'is-invalid': errors.name }">
                                                <i class="bi bi-person"></i>
                                            </span>

                                            <input id="name" v-model="form.name" type="text"
                                                class="form-control premium-input"
                                                :class="{ 'is-invalid': errors.name }" :aria-invalid="!!errors.name"
                                                :aria-describedby="errors.name ? 'name-error' : undefined"
                                                placeholder="Ej. Juan Pérez" autocomplete="name" maxlength="150"
                                                aria-required="true" @input="clearFieldError('name')" />
                                        </div>
                                        <div v-if="errors.name" id="name-error" class="invalid-feedback d-block">
                                            {{ errors.name }}
                                        </div>
                                    </div>

                                    <!-- Correo -->
                                    <div class="col-md-6">
                                        <label for="email" class="form-label fw-semibold">
                                            Correo electrónico <span class="required-mark" aria-hidden="true">*</span>
                                        </label>

                                        <div class="input-group has-validation">
                                            <span class="input-group-text" :class="{ 'is-invalid': errors.email }">
                                                <i class="bi bi-envelope"></i>
                                            </span>

                                            <input id="email" v-model="form.email" type="email"
                                                class="form-control premium-input"
                                                :class="{ 'is-invalid': errors.email }" :aria-invalid="!!errors.email"
                                                :aria-describedby="errors.email ? 'email-error' : undefined"
                                                placeholder="usuario@ejemplo.com" autocomplete="email" maxlength="180"
                                                aria-required="true" @input="clearFieldError('email')" />
                                        </div>
                                        <div v-if="errors.email" id="email-error" class="invalid-feedback d-block">
                                            {{ errors.email }}
                                        </div>
                                    </div>

                                    <!-- Contraseña -->
                                    <div class="col-md-6">
                                        <label for="password" class="form-label fw-semibold">
                                            Contraseña <span class="required-mark" aria-hidden="true">*</span>
                                        </label>

                                        <div class="input-group has-validation password-input-group">
                                            <span class="input-group-text" :class="{ 'is-invalid': errors.password }">
                                                <i class="bi bi-lock"></i>
                                            </span>

                                            <input id="password" v-model="form.password"
                                                :type="showPassword ? 'text' : 'password'"
                                                class="form-control premium-input"
                                                :class="{ 'is-invalid': errors.password }"
                                                :aria-invalid="!!errors.password"
                                                :aria-describedby="errors.password ? 'password-error' : 'password-help'"
                                                placeholder="Mínimo 8 caracteres" autocomplete="new-password"
                                                aria-required="true" @input="handlePasswordInput" />

                                            <button type="button" class="btn btn-outline-secondary password-toggle"
                                                :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                                                :aria-pressed="showPassword" @click="showPassword = !showPassword">
                                                <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"
                                                    aria-hidden="true"></i>
                                            </button>
                                        </div>

                                        <div v-if="errors.password" id="password-error"
                                            class="invalid-feedback d-block">
                                            {{ errors.password }}
                                        </div>
                                        <div v-else id="password-help" class="form-text">
                                            Usa al menos 8 caracteres.
                                        </div>
                                    </div>

                                    <!-- Confirmación de contraseña -->
                                    <div class="col-md-6">
                                        <label for="passwordConfirmation" class="form-label fw-semibold">
                                            Confirmar contraseña <span class="required-mark" aria-hidden="true">*</span>
                                        </label>

                                        <div class="input-group has-validation password-input-group">
                                            <span class="input-group-text"
                                                :class="{ 'is-invalid': errors.passwordConfirmation }">
                                                <i class="bi bi-shield-lock"></i>
                                            </span>

                                            <input id="passwordConfirmation" v-model="form.passwordConfirmation"
                                                :type="showPasswordConfirmation ? 'text' : 'password'"
                                                class="form-control premium-input"
                                                :class="{ 'is-invalid': errors.passwordConfirmation }"
                                                :aria-invalid="!!errors.passwordConfirmation"
                                                :aria-describedby="errors.passwordConfirmation ? 'password-confirmation-error' : undefined"
                                                placeholder="Repite la contraseña" autocomplete="new-password"
                                                aria-required="true" @input="clearFieldError('passwordConfirmation')" />

                                            <button type="button" class="btn btn-outline-secondary password-toggle"
                                                :aria-label="showPasswordConfirmation ? 'Ocultar confirmación de contraseña' : 'Mostrar confirmación de contraseña'"
                                                :aria-pressed="showPasswordConfirmation"
                                                @click="showPasswordConfirmation = !showPasswordConfirmation">
                                                <i :class="showPasswordConfirmation ? 'bi bi-eye-slash' : 'bi bi-eye'"
                                                    aria-hidden="true"></i>
                                            </button>
                                        </div>

                                        <div v-if="errors.passwordConfirmation" id="password-confirmation-error"
                                            class="invalid-feedback d-block">
                                            {{ errors.passwordConfirmation }}
                                        </div>
                                    </div>

                                    <!-- Dirección -->
                                    <div class="col-md-6">
                                        <label for="address" class="form-label fw-semibold">
                                            Dirección
                                            <span class="text-muted fw-normal">
                                                (opcional)
                                            </span>
                                        </label>

                                        <div class="input-group">
                                            <span class="input-group-text">
                                                <i class="bi bi-geo-alt"></i>
                                            </span>

                                            <input id="address" v-model="form.address" type="text"
                                                class="form-control premium-input" placeholder="Ej. Calle 123 #45-67"
                                                autocomplete="street-address" maxlength="255" />
                                        </div>
                                    </div>

                                    <!-- Rol -->
                                    <div class="col-md-6">
                                        <label for="role" class="form-label fw-semibold">
                                            Rol <span class="required-mark" aria-hidden="true">*</span>
                                        </label>

                                        <div class="input-group has-validation">
                                            <span class="input-group-text" :class="{ 'is-invalid': errors.role }">
                                                <i class="bi bi-shield-check"></i>
                                            </span>

                                            <select id="role" v-model="form.role" class="form-select premium-input"
                                                :class="{ 'is-invalid': errors.role }" :aria-invalid="!!errors.role"
                                                :aria-describedby="errors.role ? 'role-error' : 'role-help'"
                                                aria-required="true" @change="clearFieldError('role')">
                                                <option value="USER">
                                                    Usuario
                                                </option>

                                                <option value="ADMIN">
                                                    Administrador
                                                </option>
                                            </select>
                                        </div>

                                        <div v-if="errors.role" id="role-error" class="invalid-feedback d-block">
                                            {{ errors.role }}
                                        </div>
                                        <div v-else id="role-help" class="form-text">
                                            Los administradores tienen acceso a funciones administrativas.
                                        </div>
                                    </div>

                                    <!-- Estado -->
                                    <div class="col-md-6">
                                        <label for="status" class="form-label fw-semibold">
                                            Estado <span class="required-mark" aria-hidden="true">*</span>
                                        </label>

                                        <div class="input-group has-validation">
                                            <span class="input-group-text" :class="{ 'is-invalid': errors.status }">
                                                <i class="bi bi-toggle-on"></i>
                                            </span>

                                            <select id="status" v-model="form.status" class="form-select premium-input"
                                                :class="{ 'is-invalid': errors.status }" :aria-invalid="!!errors.status"
                                                :aria-describedby="errors.status ? 'status-error' : undefined"
                                                aria-required="true" @change="clearFieldError('status')">
                                                <option value="ACTIVE">
                                                    Activo
                                                </option>

                                                <option value="INACTIVE">
                                                    Inactivo
                                                </option>
                                            </select>
                                        </div>
                                        <div v-if="errors.status" id="status-error" class="invalid-feedback d-block">
                                            {{ errors.status }}
                                        </div>
                                    </div>

                                </div>

                                <hr class="my-4" />

                                <div class="d-flex flex-column flex-md-row justify-content-end gap-2">
                                    <button type="button" class="btn btn-outline-secondary btn-form-cancel"
                                        :disabled="loading" @click="cancel">
                                        <i class="bi bi-x-lg me-1"></i>
                                        Cancelar
                                    </button>

                                    <button type="submit" class="btn btn-form-save" :disabled="loading"
                                        :aria-busy="loading">
                                        <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"
                                            aria-hidden="true"></span>

                                        <i v-else class="bi bi-person-plus me-1"></i>

                                        {{ loading ? 'Creando usuario...' : 'Crear usuario' }}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <div class="col-lg-4">
                    <aside class="product-preview-card">
                        <div class="d-flex align-items-center gap-3 mb-4">
                            <div class="preview-icon">
                                <i class="bi bi-person-plus"></i>
                            </div>

                            <div>
                                <h5 class="fw-bold mb-1">Acceso del usuario</h5>
                                <small class="text-white-50">Resumen de la cuenta</small>
                            </div>
                        </div>

                        <div class="preview-row">
                            <span class="preview-label">Nombre</span>
                            <span class="preview-value">{{ form.name.trim() || 'Sin indicar' }}</span>
                        </div>

                        <div class="preview-row">
                            <span class="preview-label">Correo</span>
                            <span class="preview-value">{{ form.email.trim() || 'Sin indicar' }}</span>
                        </div>

                        <div class="preview-row">
                            <span class="preview-label">Rol</span>
                            <span class="preview-value">{{ form.role === 'ADMIN' ? 'Administrador' : 'Usuario' }}</span>
                        </div>

                        <div class="preview-row">
                            <span class="preview-label">Estado</span>
                            <span class="preview-value">{{ form.status === 'ACTIVE' ? 'Activo' : 'Inactivo' }}</span>
                        </div>

                        <div class="mt-4">
                            <p class="text-white-50 mb-0">
                                Define un rol y un estado adecuados. El correo será el identificador de acceso del
                                usuario.
                            </p>
                        </div>
                    </aside>
                </div>
            </section>
        </div>
    </main>
    <AppFooter />
</template>

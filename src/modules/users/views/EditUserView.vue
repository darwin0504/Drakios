<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import AppNavbar from '@/components/AppNavbar.vue'
import AppFooter from '@/components/AppFooter.vue'
import userService from '@/modules/users/services/userService'
import { getErrorMessage } from '@/helpers/errorHelper'
import { useAuthStore } from '@/modules/auth/stores/authStore'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const appName = 'Drakios'
const viewName = 'Editar usuario'

const loading = ref(false)
const loadingUser = ref(true)
const email = ref('')

const userId = Number(route.params.id)
const isEditingCurrentUser = computed(() => {
    const currentUserId = authStore.user?.id

    return currentUserId != null && String(currentUserId) === String(userId)
})

const form = ref({
    name: '',
    address: '',
    role: 'USER',
    status: 'ACTIVE',
})

const errors = ref({})

const previewName = computed(() => form.value.name.trim() || 'Usuario seleccionado')
const roleLabel = computed(() => form.value.role === 'ADMIN' ? 'Administrador' : 'Usuario')
const statusLabel = computed(() => form.value.status === 'ACTIVE' ? 'Activo' : 'Inactivo')

const validateForm = () => {
    const newErrors = {}

    const name = form.value.name.trim()

    if (!name) {
        newErrors.name = 'El nombre es obligatorio.'
    } else if (name.length < 3) {
        newErrors.name = 'El nombre debe tener al menos 3 caracteres.'
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

const loadUser = async () => {
    loadingUser.value = true

    try {
        const response = await userService.getById(userId)

        const user = response.user ?? response

        form.value = {
            name: user.name ?? '',
            address: user.address ?? '',
            role: user.role?.name ?? user.role ?? 'USER',
            status: user.status ?? 'ACTIVE',
        }
        email.value = user.email ?? ''
    } catch (error) {
        await Swal.fire({
            icon: 'error',
            title: 'No fue posible cargar el usuario',
            text: getErrorMessage(error),
        })

        router.push('/users')
    } finally {
        loadingUser.value = false
    }
}

const cancel = () => {
    router.push('/users')
}

const updateUser = async () => {
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
            address: form.value.address.trim(),
            role: form.value.role,
            ...(!isEditingCurrentUser.value && { status: form.value.status }),
        }

        await userService.update(userId, payload)

        await Swal.fire({
            icon: 'success',
            title: 'Usuario actualizado',
            text: 'La información del usuario se actualizó correctamente.',
            timer: 1600,
            showConfirmButton: false,
        })

        router.push('/users')
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'No fue posible actualizar el usuario',
            text: getErrorMessage(error),
        })
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    if (!userId || Number.isNaN(userId)) {
        router.push('/users')
        return
    }

    loadUser()
})
</script>

<template>
    <AppNavbar />

    <main class="app-page">
        <div class="container page-shell">
            <nav class="page-breadcrumb" aria-label="Ruta de navegación">
                <RouterLink to="/users" class="page-breadcrumb-link">
                    <i class="bi bi-arrow-left" aria-hidden="true"></i>
                    <span>Usuarios</span>
                </RouterLink>
                <i class="bi bi-chevron-right page-breadcrumb-separator" aria-hidden="true"></i>
                <span aria-current="page">Editar usuario</span>
            </nav>

            <section class="page-hero mb-4">
                <div class="row align-items-center position-relative">
                    <div class="col-12">
                        <span class="page-kicker">
                            {{ appName }} · {{ viewName }}
                        </span>

                        <h1 class="fw-bold mb-2">
                            Editar usuario #{{ userId }}
                        </h1>

                        <p class="text-white-50 mb-0">
                            Actualiza la información y los permisos de la cuenta seleccionada.
                        </p>
                    </div>
                </div>
            </section>

            <section class="row g-4">
                <div class="col-lg-8">
                    <div class="product-form-card">
                        <div class="product-form-header edit-form-header">
                            <span class="badge text-bg-primary mb-2">
                                Edición de usuario
                            </span>

                            <h4 class="form-section-title mb-1">
                                Información de la cuenta
                            </h4>

                            <p class="form-section-subtitle mb-0">
                                Actualiza los datos personales, el rol y el estado del usuario.
                            </p>
                        </div>

                        <div class="p-4">
                            <div v-if="loadingUser" class="loading-premium-box" role="status" aria-live="polite">
                                <div class="d-flex align-items-center gap-3">
                                    <span class="spinner-border spinner-border-sm" role="status"
                                        aria-hidden="true"></span>
                                    <div>
                                        <strong>Cargando información del usuario...</strong>
                                        <div class="small">En breve podrás revisar y actualizar sus datos.</div>
                                    </div>
                                </div>
                            </div>

                            <form v-else @submit.prevent="updateUser" novalidate>
                                <div class="row g-4">
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
                                                :aria-describedby="errors.name ? 'user-name-error' : undefined"
                                                placeholder="Ej. Juan Pérez" autocomplete="name" maxlength="150"
                                                aria-required="true" @input="clearFieldError('name')" />
                                        </div>
                                        <div v-if="errors.name" id="user-name-error" class="invalid-feedback d-block">
                                            {{ errors.name }}
                                        </div>
                                    </div>

                                    <div class="col-md-6">
                                        <label for="email" class="form-label fw-semibold">
                                            Correo electrónico
                                        </label>
                                        <div class="input-group">
                                            <span class="input-group-text">
                                                <i class="bi bi-envelope"></i>
                                            </span>
                                            <input id="email" :value="email" type="email"
                                                class="form-control premium-input" readonly aria-readonly="true"
                                                autocomplete="email" />
                                        </div>
                                        <div class="form-text">
                                            El correo electrónico no se puede modificar.
                                        </div>
                                    </div>

                                    <div class="col-md-6">
                                        <label for="address" class="form-label fw-semibold">
                                            Dirección <small class="text-muted fw-normal">(opcional)</small>
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

                                    <div class="col-md-3">
                                        <label for="role" class="form-label fw-semibold">
                                            Rol <span class="required-mark" aria-hidden="true">*</span>
                                        </label>
                                        <div class="input-group has-validation">
                                            <span class="input-group-text" :class="{ 'is-invalid': errors.role }">
                                                <i class="bi bi-shield-check"></i>
                                            </span>
                                            <select id="role" v-model="form.role" class="form-select premium-input"
                                                :class="{ 'is-invalid': errors.role }" :aria-invalid="!!errors.role"
                                                :aria-describedby="errors.role ? 'user-role-error' : undefined"
                                                aria-required="true" @change="clearFieldError('role')">
                                                <option value="USER">Usuario</option>
                                                <option value="ADMIN">Administrador</option>
                                            </select>
                                        </div>
                                        <div v-if="errors.role" id="user-role-error" class="invalid-feedback d-block">
                                            {{ errors.role }}
                                        </div>
                                    </div>

                                    <div class="col-md-3">
                                        <label for="status" class="form-label fw-semibold">
                                            Estado <span class="required-mark" aria-hidden="true">*</span>
                                        </label>
                                        <div class="input-group has-validation">
                                            <span class="input-group-text" :class="{ 'is-invalid': errors.status }">
                                                <i class="bi bi-toggle-on"></i>
                                            </span>
                                            <select id="status" v-model="form.status" class="form-select premium-input"
                                                :class="{ 'is-invalid': errors.status }" :aria-invalid="!!errors.status"
                                                :aria-describedby="errors.status ? 'user-status-error' : undefined"
                                                :disabled="isEditingCurrentUser" aria-required="true"
                                                @change="clearFieldError('status')">
                                                <option value="ACTIVE">Activo</option>
                                                <option value="INACTIVE">Inactivo</option>
                                            </select>
                                        </div>
                                        <small v-if="isEditingCurrentUser" class="form-text text-muted">
                                            No puedes cambiar el estado de tu propia cuenta.
                                        </small>
                                        <div v-if="errors.status" id="user-status-error"
                                            class="invalid-feedback d-block">
                                            {{ errors.status }}
                                        </div>
                                    </div>
                                </div>

                                <div class="form-help-box mt-4 mb-4">
                                    El correo de acceso se conserva sin cambios. Revisa el rol y el estado antes de guardar.
                                </div>

                                <div class="d-flex flex-column flex-md-row justify-content-end gap-2">
                                    <button type="button" class="btn btn-outline-secondary btn-form-cancel"
                                        :disabled="loading" @click="cancel">
                                        <i class="bi bi-x-lg me-1"></i>
                                        Cancelar
                                    </button>
                                    <button type="submit" class="btn btn-form-update" :disabled="loading"
                                        :aria-busy="loading">
                                        <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"
                                            aria-hidden="true"></span>
                                        <i v-else class="bi bi-check2 me-1"></i>
                                        {{ loading ? 'Actualizando usuario...' : 'Guardar cambios' }}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <div class="col-lg-4">
                    <aside class="product-preview-card product-preview-card-edit">
                        <div class="d-flex align-items-center gap-3 mb-4">
                            <div class="preview-icon" aria-hidden="true">
                                <i class="bi bi-person"></i>
                            </div>
                            <div>
                                <span class="small text-white-50">Vista previa</span>
                                <h5 class="fw-bold mb-0">{{ previewName }}</h5>
                            </div>
                        </div>

                        <div class="preview-row">
                            <span class="preview-label">Correo</span>
                            <span class="preview-value">{{ email || 'Sin correo' }}</span>
                        </div>
                        <div class="preview-row">
                            <span class="preview-label">Rol</span>
                            <span class="preview-value">{{ roleLabel }}</span>
                        </div>
                        <div class="preview-row">
                            <span class="preview-label">Estado</span>
                            <span class="preview-value">{{ statusLabel }}</span>
                        </div>
                    </aside>
                </div>
            </section>
        </div>
    </main>
    <AppFooter />
</template>

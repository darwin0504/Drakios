<script setup>
import { ref, watch } from 'vue'
import Swal from 'sweetalert2'
import { getErrorMessage } from '@/helpers/errorHelper'
import { rolesService } from '@/modules/roles/services/rolesService'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  role: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close', 'saved'])

const permissions = ref([])
const selectedPermissionIds = ref([])
const loading = ref(false)
const saving = ref(false)
const error = ref('')

let requestSequence = 0

const loadPermissions = async () => {
  if (!props.role) return

  const currentRequest = ++requestSequence
  const roleId = props.role.id
  permissions.value = []
  selectedPermissionIds.value = []
  error.value = ''
  loading.value = true

  try {
    const [catalogResponse, assignedResponse] = await Promise.all([
      rolesService.getAllPermissions(),
      rolesService.getRolePermissions(roleId),
    ])

    if (currentRequest !== requestSequence) return

    permissions.value = Array.isArray(catalogResponse.data)
      ? catalogResponse.data
      : []

    const assigned = assignedResponse.data?.permissions ?? []
    selectedPermissionIds.value = assigned
      .map((permission) => Number(permission.id))
      .filter(Number.isFinite)
  } catch (cause) {
    if (currentRequest === requestSequence) {
      error.value = getErrorMessage(cause)
    }
  } finally {
    if (currentRequest === requestSequence) {
      loading.value = false
    }
  }
}

watch(
  () => [props.visible, props.role],
  ([visible]) => {
    if (visible) {
      loadPermissions()
    } else {
      requestSequence += 1
      loading.value = false
    }
  },
)

const close = () => {
  if (saving.value) return
  requestSequence += 1
  emit('close')
}

const selectAll = () => {
  selectedPermissionIds.value = permissions.value.map((permission) =>
    Number(permission.id),
  )
}

const save = async () => {
  if (!props.role) return

  saving.value = true
  error.value = ''

  try {
    await rolesService.assignPermissions(
      props.role.id,
      selectedPermissionIds.value,
    )

    emit('close')
    emit('saved')

    await Swal.fire({
      icon: 'success',
      title: 'Permisos actualizados',
      text: `Se actualizaron los permisos del rol ${props.role.name}.`,
      confirmButtonText: 'Aceptar',
    })
  } catch (cause) {
    error.value = getErrorMessage(cause)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div
    v-if="visible"
    class="modal-backdrop-custom"
    @click.self="close"
  >
    <section
      class="role-modal-card role-modal-card-wide card border-0 shadow-lg"
      role="dialog"
      aria-modal="true"
      aria-labelledby="permissions-modal-title"
    >
      <div class="card-header premium-modal-header d-flex justify-content-between align-items-center py-3">
        <div>
          <h5 id="permissions-modal-title" class="mb-1">Asignar permisos</h5>
          <small class="text-muted">Rol: {{ role?.name }}</small>
        </div>
        <button
          type="button"
          class="btn-close"
          aria-label="Cerrar"
          :disabled="saving"
          @click="close"
        ></button>
      </div>

      <div class="card-body">
        <div v-if="loading" class="text-center py-4" role="status" aria-live="polite">
          <div class="spinner-border text-primary" aria-hidden="true"></div>
          <p class="text-muted mt-2 mb-0">Cargando permisos...</p>
        </div>

        <template v-else>
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
            <span class="text-muted small">
              {{ selectedPermissionIds.length }} de {{ permissions.length }} seleccionados
            </span>
            <div class="d-flex gap-2">
              <button
                type="button"
                class="btn btn-sm btn-outline-secondary"
                :disabled="!permissions.length"
                @click="selectAll"
              >
                Seleccionar todos
              </button>
              <button
                type="button"
                class="btn btn-sm btn-outline-secondary"
                :disabled="!selectedPermissionIds.length"
                @click="selectedPermissionIds = []"
              >
                Limpiar
              </button>
            </div>
          </div>

          <div v-if="error" class="alert alert-danger" role="alert">
            {{ error }}
            <button type="button" class="btn btn-sm btn-outline-danger ms-2" @click="loadPermissions">
              Reintentar
            </button>
          </div>

          <div v-else-if="permissions.length === 0" class="alert alert-warning mb-0">
            No hay permisos disponibles en el sistema.
          </div>

          <div v-else class="permission-list">
            <label
              v-for="permission in permissions"
              :key="permission.id"
              class="permission-item"
            >
              <input
                v-model="selectedPermissionIds"
                type="checkbox"
                class="form-check-input mt-1"
                :value="Number(permission.id)"
              />
              <span class="flex-grow-1">
                <span class="d-block fw-semibold">{{ permission.name }}</span>
                <small class="text-muted">
                  {{ permission.description || 'Sin descripción' }}
                </small>
              </span>
            </label>
          </div>
        </template>
      </div>

      <div class="card-footer premium-modal-footer d-flex justify-content-end gap-2 py-3">
        <button type="button" class="btn btn-outline-secondary" :disabled="saving" @click="close">
          Cancelar
        </button>
        <button
          type="button"
          class="btn btn-primary"
          :disabled="loading || saving || !!error || !permissions.length"
          @click="save"
        >
          <span
            v-if="saving"
            class="spinner-border spinner-border-sm me-2"
            role="status"
            aria-hidden="true"
          ></span>
          Guardar permisos
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.modal-backdrop-custom {
  position: fixed;
  inset: 0;
  z-index: 1050;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  overflow-y: auto;
  background: rgba(5, 10, 18, 0.76);
  backdrop-filter: blur(5px);
}

.role-modal-card {
  width: 100%;
  max-width: 540px;
  max-height: calc(100vh - 2rem);
  overflow-y: auto;
  border: 1px solid rgba(145, 208, 255, 0.25);
  border-radius: 20px;
  background: var(--app-surface);
  color: var(--bs-body-color);
  box-shadow: 0 24px 70px rgba(2, 6, 23, 0.55);
}

.role-modal-card-wide {
  max-width: 760px;
}

.premium-modal-header,
.premium-modal-footer {
  border-color: var(--app-border);
  background: var(--app-surface-raised);
}

.permission-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  max-height: min(48vh, 440px);
  overflow-y: auto;
  padding: 1px;
}

.permission-item {
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  min-width: 0;
  padding: 0.85rem;
  border: 1px solid var(--app-border);
  border-radius: 12px;
  background: var(--app-surface-raised);
  cursor: pointer;
  overflow-wrap: anywhere;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.permission-item:hover {
  border-color: rgba(145, 208, 255, 0.42);
  background: var(--app-soft);
}

@media (max-width: 576px) {
  .permission-list {
    grid-template-columns: 1fr;
  }
}
</style>

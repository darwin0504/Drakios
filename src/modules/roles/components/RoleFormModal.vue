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

const form = ref({ name: '', description: '' })
const saving = ref(false)
const error = ref('')

watch(
  () => [props.visible, props.role],
  ([visible, role]) => {
    if (!visible) return

    form.value = {
      name: role?.name || '',
      description: role?.description || '',
    }
    error.value = ''
  },
)

const close = () => {
  if (!saving.value) emit('close')
}

const save = async () => {
  const name = form.value.name.trim()
  const description = form.value.description.trim()

  if (!/^[A-Z][A-Z0-9_]{0,49}$/.test(name)) {
    error.value =
      'El nombre debe comenzar con una letra mayúscula y contener solo mayúsculas, números o guiones bajos.'
    return
  }

  const wasEditing = Boolean(props.role)
  saving.value = true
  error.value = ''

  try {
    const data = { name, description }

    if (props.role) {
      await rolesService.update(props.role.id, data)
    } else {
      await rolesService.create(data)
    }

    emit('close')
    emit('saved')

    await Swal.fire({
      icon: 'success',
      title: wasEditing ? 'Rol actualizado' : 'Rol creado',
      text: 'La operación se realizó correctamente.',
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
      class="role-modal-card card border-0 shadow-lg"
      role="dialog"
      aria-modal="true"
      aria-labelledby="role-modal-title"
    >
      <div class="card-header premium-modal-header d-flex justify-content-between align-items-center py-3">
        <h5 id="role-modal-title" class="mb-0">
          {{ role ? 'Editar rol' : 'Crear rol' }}
        </h5>
        <button
          type="button"
          class="btn-close"
          aria-label="Cerrar"
          :disabled="saving"
          @click="close"
        ></button>
      </div>

      <form @submit.prevent="save">
        <div class="card-body">
          <div class="mb-3">
            <label for="roleName" class="form-label fw-semibold">
              Nombre del rol <span class="required-mark" aria-hidden="true">*</span>
            </label>
            <input
              id="roleName"
              v-model="form.name"
              class="form-control premium-input"
              maxlength="50"
              placeholder="Ej. SUPERVISOR"
              required
              pattern="[A-Z][A-Z0-9_]*"
              title="Usa mayúsculas, números y guiones bajos. Debe comenzar con una letra."
              aria-required="true"
              @input="form.name = form.name.toUpperCase().replace(/[^A-Z0-9_]/g, '')"
            />
            <div class="form-text">
              Mayúsculas, números y guiones bajos. Máximo 50 caracteres.
            </div>
          </div>

          <div class="mb-3">
            <label for="roleDescription" class="form-label fw-semibold">Descripción</label>
            <textarea
              id="roleDescription"
              v-model="form.description"
              class="form-control premium-input role-description-input"
              rows="3"
              maxlength="255"
              placeholder="Describe las responsabilidades de este rol"
            ></textarea>
          </div>

          <div v-if="error" class="alert alert-danger mb-0" role="alert">
            {{ error }}
          </div>
        </div>

        <div class="card-footer premium-modal-footer d-flex justify-content-end gap-2 py-3">
          <button type="button" class="btn btn-outline-secondary" :disabled="saving" @click="close">
            Cancelar
          </button>
          <button type="submit" class="btn btn-primary" :disabled="saving">
            <span
              v-if="saving"
              class="spinner-border spinner-border-sm me-2"
              role="status"
              aria-hidden="true"
            ></span>
            {{ role ? 'Guardar cambios' : 'Crear rol' }}
          </button>
        </div>
      </form>
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

.premium-modal-header,
.premium-modal-footer {
  border-color: var(--app-border);
  background: var(--app-surface-raised);
}

.role-description-input {
  height: auto;
  min-height: 100px;
}
</style>

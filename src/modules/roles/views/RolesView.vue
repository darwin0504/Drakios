<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Swal from 'sweetalert2'
import $ from 'jquery'
import 'datatables.net-bs5'
import 'datatables.net-responsive-bs5'
import AppNavbar from '@/components/AppNavbar.vue'
import AppFooter from '@/components/AppFooter.vue'
import { getErrorMessage } from '@/helpers/errorHelper'
import { useAuthStore } from '@/modules/auth/stores/authStore'
import { rolesService } from '@/modules/roles/services/rolesService'
import RoleFormModal from '@/modules/roles/components/RoleFormModal.vue'
import RolePermissionsModal from '@/modules/roles/components/RolePermissionsModal.vue'

const authStore = useAuthStore()
const appName = 'Drakios'
const viewName = 'Gestión de roles'

const roles = ref([])
const searchQuery = ref('')
const loading = ref(false)
const checkingAccess = ref(true)
const accessError = ref('')
const error = ref('')

const showRoleModal = ref(false)
const editingRole = ref(null)
const showPermissionsModal = ref(false)
const selectedRole = ref(null)

let dataTable = null

const totalRoles = computed(() => roles.value.length)
const documentedRoles = computed(() =>
  roles.value.filter((role) => role.description?.trim()).length,
)
const undocumentedRoles = computed(() => totalRoles.value - documentedRoles.value)
const hasRoleAccess = computed(() =>
  authStore.permissionsLoaded && authStore.hasPermission('roles.read'),
)

const applySearch = () => {
  if (!dataTable) return
  dataTable.search(searchQuery.value.trim()).draw()
}

watch(searchQuery, applySearch)

const destroyDataTable = () => {
  if ($.fn.DataTable.isDataTable('#rolesTable')) {
    $('#rolesTable').DataTable().destroy()
  }

  dataTable = null
}

const initDataTable = async () => {
  await nextTick()
  destroyDataTable()

  dataTable = $('#rolesTable').DataTable({
    responsive: true,
    pageLength: 10,
    ordering: true,
    layout: {
      topEnd: null,
    },
    columnDefs: [
      {
        targets: [0, 3],
        searchable: false,
      },
      {
        targets: 3,
        orderable: false,
        searchable: false,
      },
    ],
    language: {
      search: 'Buscar:',
      lengthMenu: 'Mostrar _MENU_ registros',
      info: 'Mostrando _START_ a _END_ de _TOTAL_ roles',
      infoEmpty: 'No hay roles disponibles',
      infoFiltered: '(filtrado de _MAX_ registros en total)',
      zeroRecords: 'No se encontraron roles',
      emptyTable: 'No hay roles registrados',
      loadingRecords: 'Cargando...',
      processing: 'Procesando...',
      paginate: {
        first: 'Primero',
        last: 'Último',
        next: 'Siguiente',
        previous: 'Anterior',
      },
    },
  })

  applySearch()
}

const loadRoles = async () => {
  loading.value = true
  error.value = ''

  try {
    destroyDataTable()
    const response = await rolesService.getAll()
    roles.value = Array.isArray(response.data) ? response.data : []
    await initDataTable()
  } catch (cause) {
    error.value = getErrorMessage(cause)

    if (!dataTable) {
      await initDataTable()
    }
  } finally {
    loading.value = false
  }
}

const openCreate = () => {
  editingRole.value = null
  showRoleModal.value = true
}

const openEdit = (role) => {
  editingRole.value = role
  showRoleModal.value = true
}

const openPermissions = (role) => {
  selectedRole.value = role
  showPermissionsModal.value = true
}

const deleteRole = async (role) => {
  const result = await Swal.fire({
    icon: 'warning',
    title: `¿Eliminar el rol ${role.name}?`,
    text: 'Esta acción puede afectar a los usuarios que tengan asignado este rol.',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#dc3545',
    reverseButtons: true,
  })

  if (!result.isConfirmed) return

  try {
    await rolesService.remove(role.id)
    await loadRoles()

    await Swal.fire({
      icon: 'success',
      title: 'Rol eliminado',
      confirmButtonText: 'Aceptar',
    })
  } catch (cause) {
    await Swal.fire({
      icon: 'error',
      title: 'No se pudo eliminar',
      text: getErrorMessage(cause),
    })
  }
}

onMounted(async () => {
  try {
    if (!authStore.permissionsLoaded) {
      await authStore.loadPermissions()
    }

    checkingAccess.value = false

    if (authStore.hasPermission('roles.read')) {
      await nextTick()
      await loadRoles()
    }
  } catch (cause) {
    accessError.value = getErrorMessage(cause)
    checkingAccess.value = false
  }
})

onBeforeUnmount(() => {
  destroyDataTable()
})
</script>

<template>
  <AppNavbar />

  <main class="app-page">
    <div class="container page-shell">
      <div v-if="checkingAccess" class="alert alert-info border-0 rounded-4" role="status" aria-live="polite">
        Verificando permisos...
      </div>

      <div v-else-if="accessError" class="alert alert-danger border-0 rounded-4" role="alert">
        No fue posible verificar tus permisos: {{ accessError }}
      </div>

      <div v-else-if="!hasRoleAccess" class="alert alert-warning border-0 rounded-4" role="alert">
        No tienes permiso para consultar los roles.
      </div>

      <template v-else>
        <section class="page-hero mb-4">
          <div class="row align-items-center position-relative">
            <div class="col-lg-8">
              <span class="page-kicker">{{ appName }} · {{ viewName }}</span>
              <h1 class="fw-bold mb-2">Roles y permisos</h1>
              <p class="text-white-50 mb-0">
                Administra los roles y controla el acceso a las funciones de Drakios.
              </p>
            </div>

            <div class="col-lg-4 text-lg-end mt-4 mt-lg-0">
              <button
                v-if="authStore.hasPermission('roles.create')"
                type="button"
                class="btn btn-hero-action btn-lg fw-semibold action-btn"
                @click="openCreate"
              >
                <i class="bi bi-shield-plus me-1" aria-hidden="true"></i>
                Crear rol
              </button>
            </div>
          </div>
        </section>

        <section class="row g-3 mb-4" aria-label="Resumen de roles">
          <div class="col-md-4">
            <div class="stat-card">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <p class="text-muted mb-1">Roles registrados</p>
                  <h3 class="fw-bold mb-0">{{ totalRoles }}</h3>
                </div>
                <div class="stat-icon" aria-hidden="true">
                  <i class="bi bi-shield-lock"></i>
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-4">
            <div class="stat-card">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <p class="text-muted mb-1">Con descripción</p>
                  <h3 class="fw-bold mb-0">{{ documentedRoles }}</h3>
                </div>
                <div class="stat-icon" aria-hidden="true">
                  <i class="bi bi-card-text"></i>
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-4">
            <div class="stat-card">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <p class="text-muted mb-1">Sin descripción</p>
                  <h3 class="fw-bold mb-0">{{ undocumentedRoles }}</h3>
                </div>
                <div class="stat-icon" aria-hidden="true">
                  <i class="bi bi-card-list"></i>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="premium-card">
          <div class="premium-card-header">
            <div class="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
              <div>
                <span class="badge text-bg-primary mb-2">Administración</span>
                <h4 class="fw-bold mb-1">Roles registrados</h4>
                <p class="text-muted mb-0">
                  Revisa los roles, sus descripciones y los accesos asignados.
                </p>
              </div>

              <button
                type="button"
                class="btn btn-soft-primary action-btn"
                :disabled="loading"
                @click="loadRoles"
              >
                <span
                  v-if="loading"
                  class="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                {{ loading ? 'Actualizando...' : 'Recargar' }}
              </button>
            </div>
          </div>

          <div class="card-body p-4">
            <div class="user-search-filters mb-4">
              <div class="user-search-field">
                <label for="role-search" class="form-label fw-semibold mb-2">Buscar roles</label>
                <div class="input-group">
                  <span class="input-group-text" aria-hidden="true">
                    <i class="bi bi-search"></i>
                  </span>
                  <input
                    id="role-search"
                    v-model="searchQuery"
                    type="search"
                    class="form-control premium-input"
                    placeholder="Nombre o descripción"
                    autocomplete="off"
                    aria-describedby="role-search-help"
                  />
                </div>
                <div id="role-search-help" class="form-text">
                  Busca por nombre o descripción del rol.
                </div>
              </div>

              <button
                type="button"
                class="btn btn-outline-secondary action-btn user-filter-reset"
                :disabled="!searchQuery"
                @click="searchQuery = ''"
              >
                <i class="bi bi-x-circle me-1" aria-hidden="true"></i>
                Limpiar búsqueda
              </button>
            </div>

            <div v-if="error" class="alert alert-danger border-0 rounded-4" role="alert">
              {{ error }}
              <button type="button" class="btn btn-sm btn-outline-danger ms-2" @click="loadRoles">
                Reintentar
              </button>
            </div>

            <div v-if="loading" class="alert alert-info border-0 rounded-4" role="status" aria-live="polite">
              Consultando los roles registrados...
            </div>

            <div class="table-responsive">
              <table
                id="rolesTable"
                class="table table-hover align-middle nowrap premium-table"
                style="width: 100%;"
                aria-label="Roles registrados"
              >
                <thead>
                  <tr>
                    <th scope="col">ID</th>
                    <th scope="col">Rol</th>
                    <th scope="col">Descripción</th>
                    <th scope="col">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="role in roles" :key="role.id">
                    <td>
                      <span class="badge text-bg-light">#{{ role.id }}</span>
                    </td>

                    <td class="role-name-cell">
                      <span class="badge text-bg-primary">{{ role.name }}</span>
                    </td>

                    <td class="role-description-cell">
                      <span :title="role.description || 'Sin descripción'">
                        {{ role.description || 'Sin descripción' }}
                      </span>
                    </td>

                    <td>
                      <div class="table-actions">
                        <button
                          v-if="authStore.hasPermission('roles.update')"
                          type="button"
                          class="btn btn-sm action-btn table-action-btn table-action-view"
                          :aria-label="`Asignar permisos a ${role.name}`"
                          :title="`Asignar permisos a ${role.name}`"
                          @click="openPermissions(role)"
                        >
                          <i class="bi bi-shield-check" aria-hidden="true"></i>
                        </button>
                        <button
                          v-if="authStore.hasPermission('roles.update')"
                          type="button"
                          class="btn btn-sm action-btn table-action-btn table-action-edit"
                          :aria-label="`Editar ${role.name}`"
                          :title="`Editar ${role.name}`"
                          @click="openEdit(role)"
                        >
                          <i class="bi bi-pencil-square" aria-hidden="true"></i>
                        </button>
                        <button
                          v-if="authStore.hasPermission('roles.delete')"
                          type="button"
                          class="btn btn-sm action-btn table-action-btn table-action-delete"
                          :aria-label="`Eliminar ${role.name}`"
                          :title="`Eliminar ${role.name}`"
                          @click="deleteRole(role)"
                        >
                          <i class="bi bi-trash3" aria-hidden="true"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </template>
    </div>
  </main>

  <AppFooter />

  <RoleFormModal
    :visible="showRoleModal"
    :role="editingRole"
    @close="showRoleModal = false"
    @saved="loadRoles"
  />
  <RolePermissionsModal
    :visible="showPermissionsModal"
    :role="selectedRole"
    @close="showPermissionsModal = false"
    @saved="loadRoles"
  />
</template>

<style scoped>
.role-name-cell {
  min-width: 150px;
}

.role-description-cell {
  min-width: 180px;
  max-width: 360px;
  color: var(--app-muted);
}

.role-description-cell > span {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

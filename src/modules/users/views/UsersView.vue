```vue
<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import Swal from 'sweetalert2'
import $ from 'jquery'
import 'datatables.net-bs5'
import 'datatables.net-responsive-bs5'
import AppNavbar from '@/components/AppNavbar.vue'
import AppFooter from '@/components/AppFooter.vue'
import userService from '@/modules/users/services/userService'
import { getErrorMessage } from '@/helpers/errorHelper'

const appName = 'Drakios'
const viewName = 'Gestión de usuarios'

const users = ref([])
const loading = ref(false)

let dataTable = null

const totalUsers = computed(() => users.value.length)

const adminUsers = computed(() => {
  return users.value.filter((user) => user.role?.name === 'ADMIN').length
})

const activeUsers = computed(() => {
  return users.value.filter((user) => user.status === 'ACTIVE').length
})

const inactiveUsers = computed(() => {
  return users.value.filter((user) => user.status !== 'ACTIVE').length
})

const formatDate = (value) => {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'short',
    timeZone: 'America/Bogota',
  }).format(new Date(value))
}

const destroyDataTable = () => {
  if ($.fn.DataTable.isDataTable('#usersTable')) {
    $('#usersTable').DataTable().destroy()
  }

  dataTable = null
}

const initDataTable = async () => {
  await nextTick()

  destroyDataTable()

  dataTable = $('#usersTable').DataTable({
    responsive: true,
    pageLength: 10,
    ordering: true,
    columnDefs: [
      {
        targets: -1,
        orderable: false,
        searchable: false,
      },
    ],
    language: {
      search: 'Buscar:',
      lengthMenu: 'Mostrar _MENU_ registros',
      info: 'Mostrando _START_ a _END_ de _TOTAL_ usuarios',
      infoEmpty: 'No hay usuarios disponibles',
      infoFiltered: '(filtrado de _MAX_ registros en total)',
      zeroRecords: 'No se encontraron usuarios',
      emptyTable: 'No hay usuarios registrados',
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
}

const loadUsers = async () => {
  loading.value = true

  try {
    destroyDataTable()

    const response = await userService.getAll()

    users.value = Array.isArray(response.data)
      ? response.data
      : Array.isArray(response)
        ? response
        : []

    await initDataTable()
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'No fue posible cargar los usuarios',
      text: getErrorMessage(error),
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadUsers()
})

onBeforeUnmount(() => {
  destroyDataTable()
})
</script>

<template>
  <AppNavbar />

  <main class="app-page">
    <div class="container page-shell">
      <section class="page-hero mb-4">
        <div class="row align-items-center position-relative">
          <div class="col-lg-8">
            <span class="page-kicker">
              {{ appName }} · {{ viewName }}
            </span>

            <h1 class="fw-bold mb-2">
              Gestión de usuarios
            </h1>

            <p class="text-white-50 mb-0">
              Consulta los usuarios registrados, sus roles y el estado actual de sus cuentas.
            </p>
          </div>

          <div class="col-lg-4 text-lg-end mt-4 mt-lg-0">
            <RouterLink to="/users/create" class="btn btn-hero-action btn-lg fw-semibold action-btn">
              <i class="bi bi-person-plus me-1"></i>
              Crear usuario
            </RouterLink>
          </div>
        </div>
      </section>

      <section class="row g-3 mb-4">
        <div class="col-md-6 col-xl-3">
          <div class="stat-card">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <p class="text-muted mb-1">Usuarios</p>
                <h3 class="fw-bold mb-0">
                  {{ totalUsers }}
                </h3>
              </div>

              <div class="stat-icon" aria-hidden="true">
                <i class="bi bi-people"></i>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-6 col-xl-3">
          <div class="stat-card">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <p class="text-muted mb-1">Administradores</p>
                <h3 class="fw-bold mb-0">
                  {{ adminUsers }}
                </h3>
              </div>

              <div class="stat-icon" aria-hidden="true">
                <i class="bi bi-shield-check"></i>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-6 col-xl-3">
          <div class="stat-card">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <p class="text-muted mb-1">Usuarios activos</p>
                <h3 class="fw-bold mb-0">
                  {{ activeUsers }}
                </h3>
              </div>

              <div class="stat-icon" aria-hidden="true">
                <i class="bi bi-person-check"></i>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-6 col-xl-3">
          <div class="stat-card">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <p class="text-muted mb-1">Usuarios inactivos</p>
                <h3 class="fw-bold mb-0">
                  {{ inactiveUsers }}
                </h3>
              </div>

              <div class="stat-icon" aria-hidden="true">
                <i class="bi bi-person-x"></i>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="premium-card">
        <div class="premium-card-header">
          <div class="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
            <div>
              <span class="badge text-bg-primary mb-2">
                Administración
              </span>

              <h4 class="fw-bold mb-1">
                Usuarios registrados
              </h4>

              <p class="text-muted mb-0">
                Revisa las cuentas registradas, sus roles y su estado dentro del sistema.
              </p>
            </div>

            <div class="d-flex gap-2">
              <button type="button" class="btn btn-soft-primary action-btn" :disabled="loading" @click="loadUsers">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"
                  aria-hidden="true"></span>

                {{ loading ? 'Actualizando...' : 'Recargar' }}
              </button>
            </div>
          </div>
        </div>

        <div class="card-body p-4">

          <div v-if="loading" class="alert alert-info border-0 rounded-4" role="status" aria-live="polite">
            Consultando los usuarios registrados...
          </div>

          <div class="table-responsive">
            <table id="usersTable" class="table table-hover align-middle nowrap premium-table" style="width: 100%;"
              aria-label="Usuarios registrados">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Usuario</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Registro</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="user in users" :key="user.id">
                  <td>
                    <span class="badge text-bg-light">
                      #{{ user.id }}
                    </span>
                  </td>

                  <td class="product-name-cell">
                    <span :title="user.name">
                      {{ user.name }}
                    </span>
                  </td>

                  <td>
                    <span :title="user.email">
                      {{ user.email }}
                    </span>
                  </td>

                  <td>
                    <span class="badge" :class="user.role?.name === 'ADMIN'
                      ? 'text-bg-primary'
                      : 'text-bg-secondary'
                      ">
                      {{ user.role?.name || 'Sin rol' }}
                    </span>
                  </td>

                  <td>
                    <span class="badge" :class="user.status === 'ACTIVE'
                      ? 'text-bg-success'
                      : 'text-bg-danger'
                      ">
                      {{ user.status }}
                    </span>
                  </td>

                  <td>
                    {{ formatDate(user.createdAt) }}
                  </td>

                  <td>
                    <div class="d-flex gap-2">
                      <RouterLink :to="{ name: 'users-edit', params: { id: user.id } }" class="btn btn-soft-primary btn-sm action-btn"
                        :aria-label="`Editar ${user.name}`">
                        <i class="bi bi-pencil-square me-1" aria-hidden="true"></i>
                        Editar
                      </RouterLink>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  </main>
  <AppFooter />
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppNavbar from '@/components/AppNavbar.vue'
import AppFooter from '@/components/AppFooter.vue'
import userService from '@/modules/users/services/userService'
import { getErrorMessage } from '@/helpers/errorHelper'

const route = useRoute()
const user = ref(null)
const loading = ref(true)
const errorMessage = ref('')

const userId = computed(() => Number(route.params.id))
const userRole = computed(() => {
  const role = user.value?.role?.name ?? user.value?.role

  if (role === 'ADMIN') return 'Administrador'
  if (role === 'USER') return 'Usuario'

  return role || 'Sin rol asignado'
})
const isAdmin = computed(() => (user.value?.role?.name ?? user.value?.role) === 'ADMIN')
const userStatus = computed(() => {
  if (user.value?.status === 'ACTIVE') return 'Activo'
  if (user.value?.status === 'INACTIVE') return 'Inactivo'

  return user.value?.status || 'Sin estado'
})
const isActive = computed(() => user.value?.status === 'ACTIVE')
const userInitials = computed(() => {
  const name = user.value?.name?.trim()

  if (!name) return 'US'

  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
})

const formatDate = (value, includeTime = false) => {
  if (!value) return 'No disponible'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return 'No disponible'

  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'long',
    ...(includeTime && { timeStyle: 'short' }),
    timeZone: 'America/Bogota',
  }).format(date)
}

const loadUser = async () => {
  if (!Number.isInteger(userId.value) || userId.value < 1) {
    errorMessage.value = 'El identificador del usuario no es válido.'
    loading.value = false
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const response = await userService.getById(userId.value)
    user.value = response.user ?? response

    if (!user.value || typeof user.value !== 'object') {
      errorMessage.value = 'No se encontró información para este usuario.'
    }
  } catch (error) {
    errorMessage.value = getErrorMessage(error)
  } finally {
    loading.value = false
  }
}

watch(() => route.params.id, loadUser, { immediate: true })
</script>

<template>
  <AppNavbar />

  <main class="app-page entity-detail-page">
    <div class="container page-shell">
      <nav class="page-breadcrumb" aria-label="Ruta de navegación">
        <RouterLink to="/users" class="page-breadcrumb-link">
          <i class="bi bi-arrow-left" aria-hidden="true"></i>
          <span>Usuarios</span>
        </RouterLink>
        <i class="bi bi-chevron-right page-breadcrumb-separator" aria-hidden="true"></i>
        <span aria-current="page">Detalle del usuario</span>
      </nav>

      <section v-if="loading" class="entity-detail-state" role="status" aria-live="polite">
        <span class="spinner-border text-primary" aria-hidden="true"></span>
        <h1 class="h5 mt-3 mb-1">Cargando perfil</h1>
        <p class="text-muted mb-0">Estamos consultando la información de este usuario.</p>
      </section>

      <section v-else-if="errorMessage" class="entity-detail-state entity-detail-error" role="alert">
        <div class="entity-detail-state-icon">
          <i class="bi bi-exclamation-triangle" aria-hidden="true"></i>
        </div>
        <h1 class="h5 mt-3 mb-2">No fue posible cargar el usuario</h1>
        <p class="text-muted mb-4">{{ errorMessage }}</p>
        <div class="d-flex flex-wrap justify-content-center gap-2">
          <button type="button" class="btn btn-soft-primary action-btn" @click="loadUser">
            <i class="bi bi-arrow-clockwise me-1" aria-hidden="true"></i>
            Intentar de nuevo
          </button>
          <RouterLink to="/users" class="btn btn-outline-secondary action-btn">
            Volver al listado
          </RouterLink>
        </div>
      </section>

      <template v-else-if="user">
        <section class="entity-detail-hero">
          <div class="entity-detail-identity">
            <div class="entity-detail-avatar" aria-hidden="true">{{ userInitials }}</div>
            <div class="entity-detail-heading">
              <div class="entity-detail-eyebrow">PERFIL DE USUARIO · #{{ user.id ?? userId }}</div>
              <h1>{{ user.name || 'Usuario sin nombre' }}</h1>
              <a v-if="user.email" class="entity-detail-email" :href="`mailto:${user.email}`">
                <i class="bi bi-envelope" aria-hidden="true"></i>
                {{ user.email }}
              </a>
              <span v-else class="entity-detail-email">Correo no disponible</span>
            </div>
          </div>

          <div class="entity-detail-actions">
            <span class="entity-detail-status" :class="isActive ? 'is-active' : 'is-inactive'">
              <span class="entity-detail-status-dot" aria-hidden="true"></span>
              {{ userStatus }}
            </span>
            <RouterLink
              :to="{ name: 'users-edit', params: { id: user.id ?? userId } }"
              class="btn btn-hero-action fw-semibold action-btn"
            >
              <i class="bi bi-pencil-square me-1" aria-hidden="true"></i>
              Editar usuario
            </RouterLink>
          </div>
        </section>

        <section class="entity-detail-content" aria-label="Información del usuario">
          <article class="entity-detail-card">
            <div class="entity-detail-card-heading">
              <div class="entity-detail-section-icon">
                <i class="bi bi-person-vcard" aria-hidden="true"></i>
              </div>
              <div>
                <h2>Información personal</h2>
                <p>Datos asociados a la cuenta del usuario.</p>
              </div>
            </div>

            <dl class="entity-detail-fields">
              <div class="entity-detail-field">
                <dt>Nombre completo</dt>
                <dd>{{ user.name || 'No disponible' }}</dd>
              </div>
              <div class="entity-detail-field">
                <dt>Correo electrónico</dt>
                <dd>
                  <a v-if="user.email" :href="`mailto:${user.email}`">{{ user.email }}</a>
                  <span v-else>No disponible</span>
                </dd>
              </div>
              <div class="entity-detail-field entity-detail-field-wide">
                <dt>Dirección</dt>
                <dd>{{ user.address || 'No registrada' }}</dd>
              </div>
            </dl>
          </article>

          <article class="entity-detail-card">
            <div class="entity-detail-card-heading">
              <div class="entity-detail-section-icon entity-detail-section-icon-access">
                <i class="bi bi-shield-lock" aria-hidden="true"></i>
              </div>
              <div>
                <h2>Acceso y actividad</h2>
                <p>Rol asignado y fechas de registro de la cuenta.</p>
              </div>
            </div>

            <dl class="entity-detail-fields">
              <div class="entity-detail-field">
                <dt>Rol</dt>
                <dd>
                  <span class="entity-detail-role" :class="{ 'is-admin': isAdmin }">
                    <i :class="isAdmin ? 'bi bi-shield-check' : 'bi bi-person'" aria-hidden="true"></i>
                    {{ userRole }}
                  </span>
                </dd>
              </div>
              <div class="entity-detail-field">
                <dt>Estado de la cuenta</dt>
                <dd>
                  <span class="entity-detail-status" :class="isActive ? 'is-active' : 'is-inactive'">
                    <span class="entity-detail-status-dot" aria-hidden="true"></span>
                    {{ userStatus }}
                  </span>
                </dd>
              </div>
              <div class="entity-detail-field">
                <dt>Fecha de registro</dt>
                <dd>{{ formatDate(user.createdAt, true) }}</dd>
              </div>
              <div class="entity-detail-field">
                <dt>Última actualización</dt>
                <dd>{{ formatDate(user.updatedAt, true) }}</dd>
              </div>
            </dl>
          </article>
        </section>
      </template>
    </div>
  </main>

  <AppFooter />
</template>

<style>
.entity-detail-page {
  min-height: calc(100vh - 150px);
}

.entity-detail-fields a:hover {
  text-decoration: underline;
}

.entity-detail-state {
  display: flex;
  min-height: 340px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  border: 1px solid var(--app-border);
  border-radius: 1.25rem;
  background: var(--app-surface);
  text-align: center;
  box-shadow: 0 16px 36px rgb(2 6 23 / 20%);
}

.entity-detail-state-icon {
  display: grid;
  width: 3.5rem;
  height: 3.5rem;
  place-items: center;
  border-radius: 50%;
  background: rgba(245, 158, 11, 0.14);
  color: #fcd34d;
  font-size: 1.5rem;
}

.entity-detail-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  padding: clamp(1.5rem, 4vw, 2.5rem);
  border: 1px solid var(--app-border);
  border-radius: 1.25rem;
  background:
    radial-gradient(ellipse at 100% 0%, rgba(57, 140, 245, 0.16), transparent 38%),
    linear-gradient(135deg, var(--app-surface), var(--app-surface-raised));
  box-shadow: 0 16px 36px rgb(2 6 23 / 20%);
}

.entity-detail-identity {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 1.25rem;
}

.entity-detail-avatar {
  display: grid;
  width: 5rem;
  height: 5rem;
  flex: 0 0 5rem;
  place-items: center;
  border: 4px solid var(--app-surface-raised);
  border-radius: 1.35rem;
  background: linear-gradient(145deg, rgba(57, 140, 245, 0.28), rgba(57, 140, 245, 0.12));
  color: var(--app-neon);
  font-size: 1.5rem;
  font-weight: 750;
  box-shadow: 0 5px 16px rgb(2 6 23 / 24%);
}

.entity-detail-heading {
  min-width: 0;
}

.entity-detail-eyebrow {
  margin-bottom: 0.35rem;
  color: var(--app-muted);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.09em;
}

.entity-detail-heading h1 {
  margin: 0;
  color: var(--app-dark);
  font-size: clamp(1.45rem, 3vw, 2rem);
  font-weight: 750;
  overflow-wrap: anywhere;
}

.entity-detail-email {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  margin-top: 0.4rem;
  color: var(--app-muted);
  text-decoration: none;
  overflow-wrap: anywhere;
}

.entity-detail-email[href]:hover {
  color: var(--app-neon);
  text-decoration: underline;
}

.entity-detail-actions {
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.9rem;
}

.entity-detail-status {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.38rem 0.7rem;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 650;
  white-space: nowrap;
}

.entity-detail-status.is-active {
  background: rgba(34, 197, 94, 0.14);
  color: #86efac;
}

.entity-detail-status.is-inactive {
  background: rgba(160, 173, 189, 0.14);
  color: #cbd5e1;
}

.entity-detail-status.is-warning {
  background: rgba(245, 158, 11, 0.14);
  color: #fcd34d;
}

.entity-detail-status-dot {
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 50%;
  background: currentColor;
}

.entity-detail-content {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.25rem;
  margin-top: 1.25rem;
}

.entity-detail-card {
  min-width: 0;
  padding: clamp(1.25rem, 3vw, 1.75rem);
  border: 1px solid var(--app-border);
  border-radius: 1.15rem;
  background: var(--app-surface);
  box-shadow: 0 12px 30px rgb(2 6 23 / 16%);
}

.entity-detail-card-heading {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid var(--app-border);
}

.entity-detail-section-icon {
  display: grid;
  width: 2.75rem;
  height: 2.75rem;
  flex: 0 0 2.75rem;
  place-items: center;
  border-radius: 0.85rem;
  background: rgba(57, 140, 245, 0.17);
  color: #b5dcff;
  font-size: 1.2rem;
}

.entity-detail-section-icon-access {
  background: rgba(34, 197, 94, 0.14);
  color: #86efac;
}

.entity-detail-card-heading h2 {
  margin: 0 0 0.2rem;
  color: var(--app-dark);
  font-size: 1rem;
  font-weight: 700;
}

.entity-detail-card-heading p {
  margin: 0;
  color: var(--app-muted);
  font-size: 0.84rem;
}

.entity-detail-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.35rem 1rem;
  margin: 0;
  padding-top: 1.3rem;
}

.entity-detail-field {
  min-width: 0;
}

.entity-detail-field-wide {
  grid-column: 1 / -1;
}

.entity-detail-field dt {
  margin-bottom: 0.35rem;
  color: var(--app-muted);
  font-size: 0.78rem;
  font-weight: 600;
}

.entity-detail-field dd {
  margin: 0;
  color: var(--app-dark);
  font-size: 0.94rem;
  font-weight: 550;
  overflow-wrap: anywhere;
}

.entity-detail-fields a {
  color: var(--app-neon);
  text-decoration: none;
}

.entity-detail-role {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--app-muted);
}

.entity-detail-role.is-admin {
  color: var(--app-neon);
}

@media (max-width: 767.98px) {
  .entity-detail-hero {
    align-items: flex-start;
    flex-direction: column;
    gap: 1.25rem;
  }

  .entity-detail-actions {
    width: 100%;
    align-items: flex-start;
    flex-direction: row;
    justify-content: space-between;
  }

  .entity-detail-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 479.98px) {
  .entity-detail-identity {
    align-items: flex-start;
    gap: 0.85rem;
  }

  .entity-detail-avatar {
    width: 3.75rem;
    height: 3.75rem;
    flex-basis: 3.75rem;
    border-radius: 1rem;
    font-size: 1.2rem;
  }

  .entity-detail-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .entity-detail-actions .entity-detail-status {
    align-self: flex-start;
  }

  .entity-detail-fields {
    grid-template-columns: 1fr;
  }

  .entity-detail-field-wide {
    grid-column: auto;
  }
}
</style>

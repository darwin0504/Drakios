<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Offcanvas } from 'bootstrap'
import Swal from 'sweetalert2'
import { useAuthStore } from '@/modules/auth/stores/authStore'
import { authService } from '@/modules/auth/services/authService'

const router = useRouter()
const authStore = useAuthStore()
const appName = 'Drakios'
const modulesOffcanvas = ref(null)

const loadPermissions = async () => {
  try {
    await authStore.loadPermissions()
  } catch (error) {
    console.error('Error al cargar los permisos del usuario:', error)
  }
}

onMounted(() => {
  loadPermissions()
})

const userName = computed(() => {
  return authStore.user?.name || 'Usuario'
})

const userEmail = computed(() => {
  return authStore.user?.email || ''
})

const userInitials = computed(() => {
  const name = userName.value.trim()

  if (!name) return 'US'

  const parts = name.split(' ').filter(Boolean)

  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase()
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
})

const navigateFromAccount = async (path) => {
  router.push(path)
}

const goToProfile = () => navigateFromAccount('/profile')
const goToChangePassword = () => navigateFromAccount('/change-password')
const goToSettings = () => navigateFromAccount('/settings')

const navigateToModule = async (path) => {
  const element = modulesOffcanvas.value
  const offcanvas = Offcanvas.getInstance(element)

  if (offcanvas && element.classList.contains('show')) {
    const hidden = new Promise((resolve) => {
      element.addEventListener('hidden.bs.offcanvas', resolve, { once: true })
    })

    offcanvas.hide()
    await hidden
  }

  await router.push(path)
}

const logout = async () => {
  const result = await Swal.fire({
    icon: 'question',
    title: 'Cerrar sesión',
    text: '¿Deseas cerrar tu sesión en Drakios?',
    showCancelButton: true,
    confirmButtonText: 'Cerrar sesión',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#398cf5',
  })

  if (!result.isConfirmed) return

  try {
    await authService.logout()
  } catch (error) {
    console.log('Local logout executed:', error)
  } finally {
    authStore.clearSession()
    router.push('/login')
  }
}
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark premium-navbar sticky-top">
    <div class="container">

      <!-- Brand -->
      <RouterLink class="navbar-brand-premium" to="/dashboard">
        <div class="navbar-logo">
          DK
        </div>

        <div class="navbar-brand-copy">
          <div class="navbar-app-title">
            {{ appName }}
          </div>

          <div class="navbar-app-subtitle">
            Gestión comercial
          </div>
        </div>
      </RouterLink>

      <!-- Modules trigger -->
      <button type="button" class="modules-trigger" data-bs-toggle="offcanvas" data-bs-target="#modulesOffcanvas"
        aria-controls="modulesOffcanvas" aria-label="Abrir módulos">
        <i class="bi bi-grid"></i>
        <span>Módulos</span>
      </button>

      <!-- Account dropdown -->
      <div class="dropdown account-dropdown">
        <button id="accountMenuToggle" type="button" class="account-trigger" data-bs-toggle="dropdown"
          aria-expanded="false" aria-label="Abrir menú de cuenta">
          <span class="account-trigger-avatar">
            {{ userInitials }}
          </span>

          <span class="account-trigger-info">
            <span class="account-trigger-name">
              {{ userName }}
            </span>

            <span class="account-trigger-email">
              {{ userEmail }}
            </span>
          </span>

          <span class="account-trigger-chevron">
            <i class="bi bi-chevron-down"></i>
          </span>
        </button>

        <div class="dropdown-menu dropdown-menu-end account-dropdown-menu" aria-labelledby="accountMenuToggle">
          <div class="account-profile-card">
            <div class="account-profile-avatar">
              {{ userInitials }}
            </div>

            <div class="account-profile-info">
              <div class="account-profile-name">
                {{ userName }}
              </div>

              <div class="account-profile-email">
                {{ userEmail }}
              </div>

              <div class="account-profile-status">
                <span class="account-status-dot"></span>
                Cuenta activa
              </div>
            </div>
          </div>

          <div class="account-section-label">
            CUENTA
          </div>

          <button type="button" class="account-menu-item" @click="goToProfile">
            <span class="account-menu-icon">
              <i class="bi bi-person"></i>
            </span>

            <span class="account-menu-content">
              <span class="account-menu-title">
                Mi perfil
              </span>

              <span class="account-menu-description">
                Consulta tu información personal
              </span>
            </span>

            <span class="account-menu-arrow">
              <i class="bi bi-chevron-right"></i>
            </span>
          </button>

          <button type="button" class="account-menu-item" @click="goToChangePassword">
            <span class="account-menu-icon">
              <i class="bi bi-shield-lock"></i>
            </span>

            <span class="account-menu-content">
              <span class="account-menu-title">
                Cambiar contraseña
              </span>

              <span class="account-menu-description">
                Actualiza la contraseña de tu cuenta
              </span>
            </span>

            <span class="account-menu-arrow">
              <i class="bi bi-chevron-right"></i>
            </span>
          </button>

          <button type="button" class="account-menu-item" @click="goToSettings">
            <span class="account-menu-icon">
              <i class="bi bi-gear"></i>
            </span>

            <span class="account-menu-content">
              <span class="account-menu-title">
                Configuración
              </span>

              <span class="account-menu-description">
                Administra las preferencias de tu cuenta
              </span>
            </span>

            <span class="account-menu-arrow">
              <i class="bi bi-chevron-right"></i>
            </span>
          </button>

          <div class="account-dropdown-divider"></div>

          <button type="button" class="account-logout-button" @click="logout">
            <span class="account-logout-icon">
              <i class="bi bi-box-arrow-right"></i>
            </span>

            <span>
              Cerrar sesión
            </span>
          </button>
        </div>
      </div>
    </div>
  </nav>

  <!-- Modules menu -->
  <div id="modulesOffcanvas" ref="modulesOffcanvas" class="offcanvas offcanvas-start app-menu-offcanvas" tabindex="-1"
    aria-labelledby="modulesOffcanvasLabel">
    <!-- Header -->
    <div class="offcanvas-header account-offcanvas-header">
      <div>
        <div class="account-offcanvas-kicker">
          ESPACIO DE TRABAJO
        </div>

        <h5 id="modulesOffcanvasLabel" class="account-offcanvas-title">
          Centro de módulos
        </h5>

        <p class="account-offcanvas-subtitle">
          Accede a las herramientas de gestión de Drakios.
        </p>
      </div>

      <button type="button" class="account-close-button" data-bs-dismiss="offcanvas" aria-label="Cerrar">
        <i class="bi bi-x-lg"></i>
      </button>
    </div>

    <!-- Body -->
    <div class="offcanvas-body account-offcanvas-body modules-offcanvas-body">

      <!-- Modules -->
      <section class="account-menu-section modules-menu-section">
        <div class="account-section-label">
          GESTIÓN COMERCIAL
        </div>

        <RouterLink class="account-menu-item account-module-item"
          to="/dashboard" exact-active-class="router-link-exact-active" @click.prevent="navigateToModule('/dashboard')">
          <span class="account-menu-icon">
            <i class="bi bi-grid-1x2"></i>
          </span>

          <span class="account-menu-content">
            <span class="account-menu-title">
              Dashboard
            </span>

            <span class="account-menu-description">
              Resumen general de la actividad del negocio.
            </span>
          </span>

          <span class="account-menu-arrow">
            <i class="bi bi-arrow-up-right"></i>
          </span>
        </RouterLink>

        <RouterLink v-if="authStore.permissionsLoaded && authStore.hasPermission('users.read')" class="account-menu-item account-module-item"
          to="/users" exact-active-class="router-link-exact-active" @click.prevent="navigateToModule('/users')">
          <span class="account-menu-icon">
            <i class="bi bi-people"></i>
          </span>

          <span class="account-menu-content">
            <span class="account-menu-title">
              Usuarios
            </span>

            <span class="account-menu-description">
              Consulta los usuarios y el estado de sus cuentas.
            </span>
          </span>

          <span class="account-menu-arrow">
            <i class="bi bi-arrow-up-right"></i>
          </span>
        </RouterLink>

        <RouterLink v-if="authStore.permissionsLoaded && authStore.hasPermission('roles.read')" class="account-menu-item account-module-item"
          to="/roles" exact-active-class="router-link-exact-active" @click.prevent="navigateToModule('/roles')">
          <span class="account-menu-icon">
            <i class="bi bi-shield-lock"></i>
          </span>

          <span class="account-menu-content">
            <span class="account-menu-title">
              Roles y permisos
            </span>

            <span class="account-menu-description">
              Administra los roles y el acceso a las funciones.
            </span>
          </span>

          <span class="account-menu-arrow">
            <i class="bi bi-arrow-up-right"></i>
          </span>
        </RouterLink>

        <RouterLink v-if="authStore.permissionsLoaded && authStore.hasPermission('products.read')" class="account-menu-item account-module-item"
          to="/products" exact-active-class="router-link-exact-active" @click.prevent="navigateToModule('/products')">
          <span class="account-menu-icon">
            <i class="bi bi-box-seam"></i>
          </span>

          <span class="account-menu-content">
            <span class="account-menu-title">
              Productos
            </span>

            <span class="account-menu-description">
              Consulta y administra el catálogo de productos.
            </span>
          </span>

          <span class="account-menu-arrow">
            <i class="bi bi-arrow-up-right"></i>
          </span>
        </RouterLink>
      </section>
    </div>
  </div>

</template>

<style scoped>
/* NAVBAR */

.premium-navbar {
  background: rgba(15, 23, 42, 0.97);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(145, 208, 255, 0.25);
  box-shadow: 0 12px 30px rgba(2, 6, 23, 0.28), 0 1px 15px rgba(57, 140, 245, 0.14);
}

.navbar-brand-premium {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #ffffff;
  text-decoration: none;
  min-width: 0;
}

.navbar-brand-premium:hover {
  color: #ffffff;
}

.navbar-logo {
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 13px;
  background: linear-gradient(135deg, var(--app-primary), var(--app-primary-dark));
  color: #ffffff;
  font-weight: 800;

  box-shadow: 0 6px 16px rgba(49, 95, 158, 0.34), 0 0 18px rgba(145, 208, 255, 0.2);
}

.navbar-brand-copy {
  min-width: 0;
}

.navbar-app-title {
  font-weight: 800;
  line-height: 1;
  color: #ffffff;
}

.navbar-app-subtitle {
  margin-top: 4px;
  font-size: 12px;
  color: #94a3b8;
}

/* ACCOUNT TRIGGER */

.modules-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  min-height: 44px;
  margin-left: auto;
  padding: 0 16px;
  border: 1px solid rgba(145, 208, 255, 0.24);
  border-radius: 12px;
  background: rgba(57, 140, 245, 0.12);
  color: #dbeafe;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.modules-trigger:hover {
  border-color: rgba(145, 208, 255, 0.5);
  background: rgba(57, 140, 245, 0.22);
  color: #ffffff;
}

.modules-trigger:focus-visible {
  outline: 2px solid var(--app-neon);
  outline-offset: 3px;
}

.modules-trigger i {
  font-size: 16px;
}

.account-trigger {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: 12px;
  padding: 6px 9px 6px 7px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.07);
  color: #ffffff;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.account-trigger:hover {
  background: rgba(57, 140, 245, 0.2);
  border-color: rgba(145, 208, 255, 0.44);
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.2);
}

.account-trigger:focus-visible {
  outline: 2px solid var(--app-neon);
  outline-offset: 3px;
}

.account-trigger-avatar {
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: linear-gradient(135deg, #76baff, var(--app-primary-dark));
  color: #ffffff;
  font-size: 13px;
  font-weight: 800;
  box-shadow: 0 6px 14px rgba(49, 95, 158, 0.34), 0 0 14px rgba(145, 208, 255, 0.18);
}

.account-trigger-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
  text-align: left;
}

.account-trigger-name {
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.2;
}

.account-trigger-email {
  max-width: 150px;
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #94a3b8;
  font-size: 11px;
  line-height: 1.2;
}

.account-trigger-chevron {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 14px;
}

.account-dropdown-menu {
  width: min(360px, calc(100vw - 24px));
  max-height: calc(100vh - 76px);
  margin-top: 10px !important;
  padding: 12px;
  overflow-y: auto;
  border: 1px solid rgba(145, 208, 255, 0.2);
  border-radius: 16px;
  background: linear-gradient(180deg, #182231 0%, #141c28 100%);
  box-shadow: 0 18px 44px rgba(2, 6, 23, 0.42);
  color: #ffffff;
}

.account-dropdown-menu .account-profile-card {
  margin-bottom: 12px;
  padding: 14px;
}

.account-dropdown-menu .account-menu-item {
  padding: 8px;
}

.account-dropdown-divider {
  height: 1px;
  margin: 10px 4px;
  background: rgba(255, 255, 255, 0.1);
}

/* ACCOUNT OFFCANVAS */

.app-menu-offcanvas {
  width: 400px !important;
  max-width: 100vw;
  background: linear-gradient(180deg, #141c28 0%, #182231 48%, #141c28 100%);
  color: #ffffff;
  border-left: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: -20px 0 60px rgba(2, 6, 23, 0.35);
}

/* OFFCANVAS HEADER */

.account-offcanvas-header {
  padding: 24px 22px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.offcanvas-header {
  justify-content: space-between;
}

.account-offcanvas-kicker {
  margin-bottom: 6px;
  color: var(--app-neon);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.account-offcanvas-title {
  margin: 0;
  color: #ffffff;
  font-size: 22px;
  font-weight: 800;
}

.account-offcanvas-subtitle {
  margin: 5px 0 0;
  color: #94a3b8;
  font-size: 13px;
}

.account-close-button {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
  color: #cbd5e1;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease;
}

.account-close-button:hover {
  background: rgba(139, 182, 232, 0.12);
  border-color: rgba(160, 190, 222, 0.25);
  color: #ffffff;
}

.account-close-button i {
  font-size: 16px;
}

/* OFFCANVAS BODY */

.account-offcanvas-body {
  padding: 20px 16px 24px;
  overflow-y: auto;
}

.modules-offcanvas-body {
  padding: 28px 22px;
}

.modules-menu-section .account-section-label {
  padding: 0 4px 12px;
  color: #91a4bb;
}

/* PROFILE CARD */

.account-profile-card {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 26px;
  padding: 18px;
  border: 1px solid rgba(145, 208, 255, 0.29);
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(57, 140, 245, 0.22), rgba(57, 140, 245, 0.07));
}

.account-profile-avatar {
  width: 56px;
  height: 56px;
  flex: 0 0 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  background: linear-gradient(135deg, #76baff, var(--app-primary-dark));
  color: #ffffff;
  font-size: 18px;
  font-weight: 800;
  box-shadow:
    0 10px 22px rgba(49, 95, 158, 0.32), 0 0 16px rgba(145, 208, 255, 0.18);
}

.account-profile-info {
  min-width: 0;
}

.account-profile-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #ffffff;
  font-size: 15px;
  font-weight: 800;
}

.account-profile-email {
  margin-top: 3px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #94a3b8;
  font-size: 12px;
}

.account-profile-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 9px;
  color: #c8e1fb;
  font-size: 11px;
  font-weight: 600;
}

.account-status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--app-neon);
  box-shadow: 0 0 0 3px rgba(139, 182, 232, 0.12);
}

/* MENU SECTIONS */

.account-menu-section {
  margin-bottom: 22px;
}

.account-section-label {
  padding: 0 8px 9px;
  color: #64748b;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.14em;
}

/* MENU ITEMS */

.account-menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 9px;
  border: 1px solid transparent;
  border-radius: 12px;
  background: transparent;
  color: #ffffff;
  text-align: left;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.account-menu-item:hover:not(:disabled) {
  background: rgba(57, 140, 245, 0.18);
  border-color: rgba(145, 208, 255, 0.28);
  transform: translateX(2px);
}

.account-module-item {
  margin-bottom: 10px;
  padding: 13px 12px;
  border-color: rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.025);
  text-decoration: none;
}

.account-module-item:hover {
  background: rgba(57, 140, 245, 0.12);
  border-color: rgba(145, 208, 255, 0.22);
  transform: translateY(-1px);
}

.account-module-item.router-link-exact-active {
  background: linear-gradient(110deg, rgba(57, 140, 245, 0.2), rgba(57, 140, 245, 0.07));
  border-color: rgba(145, 208, 255, 0.32);
  box-shadow: inset 3px 0 0 var(--app-neon);
}

.account-module-item.router-link-exact-active .account-menu-arrow {
  color: var(--app-neon);
}

.account-module-item .account-menu-icon {
  width: 44px;
  height: 44px;
  flex-basis: 44px;
  border-color: rgba(145, 208, 255, 0.14);
  border-radius: 13px;
  background: linear-gradient(145deg, rgba(57, 140, 245, 0.26), rgba(57, 140, 245, 0.1));
}

.account-module-item .account-menu-title {
  font-size: 14px;
}

.account-module-item .account-menu-description {
  color: #91a1b5;
  font-size: 11px;
  line-height: 1.45;
}

.account-menu-item:focus-visible {
  outline: 2px solid var(--app-neon);
  outline-offset: 2px;
}

.account-menu-icon {
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(160, 190, 222, 0.12);
  border-radius: 11px;
  background: rgba(57, 140, 245, 0.2);
  color: var(--app-neon);
  font-size: 18px;
}

.account-menu-content {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.account-menu-title {
  color: #f8fafc;
  font-size: 13px;
  font-weight: 700;
}

.account-menu-description {
  margin-top: 3px;
  color: #64748b;
  font-size: 11px;
  line-height: 1.35;
}

.account-menu-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #475569;
  font-size: 14px;
}

/* LOGOUT */

.account-logout-button {
  width: 100%;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 46px;
  border: 1px solid rgba(248, 113, 113, 0.25);
  border-radius: 12px;
  background: rgba(127, 29, 29, 0.12);
  color: #fca5a5;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;
}

.account-logout-button:hover {
  background: rgba(220, 38, 38, 0.18);
  border-color: rgba(248, 113, 113, 0.4);
  color: #fecaca;
}

.account-logout-icon {
  display: flex;
  font-size: 18px;
}

/* RESPONSIVE */

@media (max-width: 991.98px) {
  .navbar-brand-copy {
    display: none;
  }

  .modules-trigger {
    width: 42px;
    min-width: 42px;
    min-height: 42px;
    padding: 0;
  }

  .modules-trigger span {
    display: none;
  }

  .account-trigger {
    margin-left: 10px;
  }

  .account-trigger-info,
  .account-trigger-chevron {
    display: none;
  }

  .account-trigger {
    width: 42px;
    height: 42px;
    padding: 3px;
    justify-content: center;
    border-radius: 50%;
  }

  .account-trigger-avatar {
    width: 34px;
    height: 34px;
  }
}

@media (max-width: 575.98px) {
  .premium-navbar .container {
    padding-left: 12px;
    padding-right: 12px;
  }

  .navbar-logo {
    width: 40px;
    height: 40px;
    flex-basis: 40px;
  }

  .account-trigger {
    width: 40px;
    height: 40px;
  }

  .account-trigger-avatar {
    width: 32px;
    height: 32px;
  }

  .app-menu-offcanvas {
    width: 100% !important;
  }

  .account-offcanvas-header {
    padding: 20px 18px 18px;
  }

  .account-offcanvas-body {
    padding-left: 12px;
    padding-right: 12px;
  }

  .modules-offcanvas-body {
    padding: 24px 16px;
  }

  .account-profile-card {
    padding: 16px;
  }
}
</style>

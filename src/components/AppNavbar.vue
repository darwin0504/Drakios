<script setup>
import { computed, nextTick, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Offcanvas } from 'bootstrap'
import Swal from 'sweetalert2'
import { useAuthStore } from '@/modules/auth/stores/authStore'
import { authService } from '@/modules/auth/services/authService'

const router = useRouter()
const authStore = useAuthStore()

const appName = 'Drakios'

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
  await nextTick()

  router.push(path)
}

const goToProfile = () => {
  navigateFromAccount('/profile')
}

const goToChangePassword = () => {
  navigateFromAccount('/change-password')
}

const goToSettings = () => {
  navigateFromAccount('/settings')
}

const logout = async () => {
  const result = await Swal.fire({
    icon: 'question',
    title: 'Cerrar sesión',
    text: '¿Seguro que deseas cerrar sesión?',
    showCancelButton: true,
    confirmButtonText: 'Sí, salir',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#dc3545',
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
      <RouterLink class="navbar-brand-premium" to="/products">
        <div class="navbar-logo">
          DK
        </div>

        <div class="navbar-brand-copy">
          <div class="navbar-app-title">
            {{ appName }}
          </div>

          <div class="navbar-app-subtitle">
            Panel de productos
          </div>
        </div>
      </RouterLink>

      <!-- Main navigation toggle -->
      <button class="navbar-toggler border-0 shadow-none" type="button" data-bs-toggle="collapse"
        data-bs-target="#navbarContent" aria-controls="navbarContent" aria-expanded="false" aria-label="Mostrar menú">
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Main navigation -->
      <div id="navbarContent" class="collapse navbar-collapse">
        <ul class="navbar-nav mx-lg-auto mb-2 mb-lg-0 gap-lg-2 mt-3 mt-lg-0">
          <li class="nav-item">
            <RouterLink class="nav-link premium-nav-link" to="/products">
              <i class="bi bi-box-seam me-1"></i>
              Productos
            </RouterLink>
          </li>

          <li class="nav-item">
            <RouterLink class="nav-link premium-nav-link" to="/products/create">
              <i class="bi bi-plus-circle me-1"></i>
              Nuevo producto
            </RouterLink>
          </li>
        </ul>
      </div>

      <!-- Account trigger -->
      <button type="button" class="account-trigger" data-bs-toggle="offcanvas" data-bs-target="#userAccountOffcanvas"
        aria-controls="userAccountOffcanvas" aria-label="Abrir menú de cuenta">
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
    </div>
  </nav>

  <!-- User account offcanvas -->
  <div id="userAccountOffcanvas" ref="accountOffcanvas" class="offcanvas offcanvas-end user-account-offcanvas"
    tabindex="-1" aria-labelledby="userAccountOffcanvasLabel">
    <!-- Header -->
    <div class="offcanvas-header account-offcanvas-header">
      <div>
        <div class="account-offcanvas-kicker">
          CUENTA
        </div>

        <h5 id="userAccountOffcanvasLabel" class="account-offcanvas-title">
          Mi cuenta
        </h5>

        <p class="account-offcanvas-subtitle">
          Administra tu cuenta y seguridad
        </p>
      </div>

      <button type="button" class="account-close-button" data-bs-dismiss="offcanvas" aria-label="Cerrar">
        <i class="bi bi-x-lg"></i>
      </button>
    </div>

    <!-- Body -->
    <div class="offcanvas-body account-offcanvas-body">

      <!-- User profile -->
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

      <!-- Account section -->
      <section class="account-menu-section">
        <div class="account-section-label">
          CUENTA
        </div>

        <!-- Profile -->
        <button type="button" class="account-menu-item" @click="goToProfile">
          <span class="account-menu-icon">
            <i class="bi bi-person"></i>
          </span>

          <span class="account-menu-content">
            <span class="account-menu-title">
              Mi perfil
            </span>

            <span class="account-menu-description">
              Consulta y administra tu información
            </span>
          </span>

          <span class="account-menu-arrow">
            <i class="bi bi-chevron-right"></i>
          </span>
        </button>

        <!-- Change password -->
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

        <!-- Settings -->
        <button type="button" class="account-menu-item" @click="goToSettings">
          <span class="account-menu-icon">
            <i class="bi bi-gear"></i>
          </span>

          <span class="account-menu-content">
            <span class="account-menu-title">
              Configuración
            </span>

            <span class="account-menu-description">
              Configura las preferencias de tu cuenta
            </span>
          </span>

          <span class="account-menu-arrow">
            <i class="bi bi-chevron-right"></i>
          </span>
        </button>
      </section>

      <!-- Security section -->
      <section class="account-menu-section account-security-section">
        <div class="account-section-label">
          SEGURIDAD
        </div>

        <button type="button" class="account-menu-item account-menu-item-disabled" disabled>
          <span class="account-menu-icon">
            <i class="bi bi-shield-check"></i>
          </span>

          <span class="account-menu-content">
            <span class="account-menu-title">
              Seguridad
            </span>

            <span class="account-menu-description">
              Próximamente
            </span>
          </span>
        </button>
      </section>

      <!-- Logout -->
      <div class="account-logout-wrapper">
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
</template>

<style scoped>
/* NAVBAR */

.premium-navbar {
  background: rgba(15, 23, 42, 0.97);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.18);
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

  box-shadow: 0 10px 22px rgba(37, 99, 235, 0.35);
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

.premium-nav-link {
  color: #cbd5e1 !important;
  font-weight: 600;
  border-radius: 999px;
  padding: 8px 14px !important;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.premium-nav-link:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff !important;
}

.premium-nav-link.router-link-active {
  background: rgba(37, 99, 235, 0.22);
  color: #dbeafe !important;
}

/* ACCOUNT TRIGGER */

.account-trigger {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: 18px;
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
  background: rgba(37, 99, 235, 0.18);
  border-color: rgba(96, 165, 250, 0.35);
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.2);
}

.account-trigger:focus-visible {
  outline: 2px solid #60a5fa;
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
  background: linear-gradient(135deg, #60a5fa, var(--app-primary));
  color: #ffffff;
  font-size: 13px;
  font-weight: 800;
  box-shadow: 0 6px 14px rgba(37, 99, 235, 0.3);
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

/* ACCOUNT OFFCANVAS */

.user-account-offcanvas {
  width: 400px !important;
  max-width: 100vw;
  background: linear-gradient(180deg, #0f172a 0%, #111c35 45%, #0f172a 100%);
  color: #ffffff;
  border-left: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: -20px 0 60px rgba(2, 6, 23, 0.35);
}

/* OFFCANVAS HEADER */

.account-offcanvas-header {
  padding: 24px 22px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.account-offcanvas-kicker {
  margin-bottom: 6px;
  color: #60a5fa;
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
  background: rgba(37, 99, 235, 0.2);
  border-color: rgba(96, 165, 250, 0.3);
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

/* PROFILE CARD */

.account-profile-card {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 26px;
  padding: 18px;
  border: 1px solid rgba(96, 165, 250, 0.16);
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.18), rgba(30, 64, 175, 0.08));
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
  background: linear-gradient(135deg, #60a5fa, var(--app-primary-dark));
  color: #ffffff;
  font-size: 18px;
  font-weight: 800;
  box-shadow:
    0 10px 22px rgba(37, 99, 235, 0.25);
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
  color: #bfdbfe;
  font-size: 11px;
  font-weight: 600;
}

.account-status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #60a5fa;
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.12);
}

/* MENU SECTIONS */

.account-menu-section {
  margin-bottom: 22px;
}

.account-security-section {
  padding-top: 2px;
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
  background: rgba(37, 99, 235, 0.12);
  border-color: rgba(96, 165, 250, 0.1);
  transform: translateX(2px);
}

.account-menu-item:focus-visible {
  outline: 2px solid #60a5fa;
  outline-offset: 2px;
}

.account-menu-item-disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.account-menu-icon {
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(96, 165, 250, 0.1);
  border-radius: 11px;
  background: rgba(37, 99, 235, 0.1);
  color: #60a5fa;
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

.account-logout-wrapper {
  padding-top: 8px;
}

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

  .navbar-toggler {
    margin-left: auto;
    margin-right: 8px;
  }

  .account-trigger {
    margin-left: 0;
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

  .navbar-collapse {
    margin-top: 12px;
    padding-bottom: 8px;
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

  .user-account-offcanvas {
    width: 100% !important;
  }

  .account-offcanvas-header {
    padding: 20px 18px 18px;
  }

  .account-offcanvas-body {
    padding-left: 12px;
    padding-right: 12px;
  }

  .account-profile-card {
    padding: 16px;
  }
}
</style>

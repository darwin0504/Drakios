<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import { useAuthStore } from '@/modules/auth/stores/authStore'
import { authService } from '@/modules/auth/services/authService'

const router = useRouter()
const authStore = useAuthStore()

const appName = 'Drakios'

const userName = computed(() => {
  return authStore.user?.nombre || 'Usuario'
})

const userEmail = computed(() => {
  return authStore.user?.correo || ''
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
    console.log('Logout local ejecutado:', error)
  } finally {
    authStore.clearSession()

    router.push('/login')
  }
}
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark premium-navbar sticky-top">
    <div class="container">
      <RouterLink class="navbar-brand-premium" to="/products">
        <div class="navbar-logo">
          DK
        </div>

        <div>
          <div class="navbar-app-title">
            {{ appName }}
          </div>

          <div class="navbar-app-subtitle">
            Panel de productos
          </div>
        </div>
      </RouterLink>

      <button class="navbar-toggler border-0 shadow-none" type="button" data-bs-toggle="collapse"
        data-bs-target="#navbarContent" aria-controls="navbarContent" aria-expanded="false" aria-label="Mostrar menú">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div id="navbarContent" class="collapse navbar-collapse">
        <ul class="navbar-nav mx-lg-auto mb-2 mb-lg-0 gap-lg-2 mt-3 mt-lg-0">
          <li class="nav-item">
            <RouterLink class="nav-link premium-nav-link" to="/products">
              Productos
            </RouterLink>
          </li>

          <li class="nav-item">
            <RouterLink class="nav-link premium-nav-link" to="/products/create">
              Nuevo producto
            </RouterLink>
          </li>
        </ul>

        <div class="navbar-actions d-flex align-items-center gap-3">
          <div class="user-chip">
            <div class="user-avatar">
              {{ userInitials }}
            </div>

            <div class="d-none d-md-block">
              <div class="user-chip-name">
                {{ userName }}
              </div>

              <div class="user-chip-email">
                {{ userEmail }}
              </div>
            </div>
          </div>

          <button type="button" class="btn btn-navbar-logout" @click="logout">
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

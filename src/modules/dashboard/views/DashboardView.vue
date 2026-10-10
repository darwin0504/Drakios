<script setup>
import { computed, onMounted, ref } from 'vue'
import AppNavbar from '@/components/AppNavbar.vue'
import AppFooter from '@/components/AppFooter.vue'
import { getErrorMessage } from '@/helpers/errorHelper'
import { useAuthStore } from '@/modules/auth/stores/authStore'
import { productService } from '@/modules/products/services/productService'

const authStore = useAuthStore()

const products = ref([])
const productsLoading = ref(false)
const productsError = ref('')
const permissionsError = ref('')
const inventoryLoaded = ref(false)

const userName = computed(() => authStore.user?.name?.trim() || 'Usuario')
const firstName = computed(() => userName.value.split(/\s+/)[0])
const todayLabel = new Intl.DateTimeFormat('es-CO', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
}).format(new Date())

const lowStockProducts = computed(() =>
  products.value
    .filter((product) => Number(product.quantity) <= 5)
    .sort((first, second) => Number(first.quantity) - Number(second.quantity)),
)

const hasProductAccess = computed(() =>
  authStore.permissionsLoaded && authStore.hasPermission('products.read'),
)

const availableShortcuts = computed(() => [
  {
    label: 'Productos',
    description: 'Consulta el catálogo y las existencias.',
    icon: 'bi-box-seam',
    to: '/products',
    permission: 'products.read',
    tone: 'blue',
  },
  {
    label: 'Usuarios',
    description: 'Administra las cuentas del sistema.',
    icon: 'bi-people',
    to: '/users',
    permission: 'users.read',
    tone: 'violet',
  },
  {
    label: 'Roles y permisos',
    description: 'Gestiona roles y accesos.',
    icon: 'bi-shield-lock',
    to: '/roles',
    permission: 'roles.read',
    tone: 'cyan',
  },
].filter((shortcut) => authStore.hasPermission(shortcut.permission)))

const loadInventory = async () => {
  if (!hasProductAccess.value) return

  productsLoading.value = true
  productsError.value = ''

  try {
    const response = await productService.getAll()
    products.value = Array.isArray(response.data) ? response.data : []
    inventoryLoaded.value = true
  } catch (error) {
    productsError.value = getErrorMessage(error)
  } finally {
    productsLoading.value = false
  }
}

onMounted(async () => {
  if (!authStore.permissionsLoaded) {
    try {
      await authStore.loadPermissions()
    } catch (error) {
      permissionsError.value = getErrorMessage(error)
      return
    }
  }

  await loadInventory()
})
</script>

<template>
  <AppNavbar />

  <main class="app-page dashboard-page">
    <div class="container page-shell">
      <section class="dashboard-welcome mb-4">
        <div class="dashboard-welcome-content">
          <span class="dashboard-eyebrow">
            <i class="bi bi-grid-1x2-fill" aria-hidden="true"></i>
            CENTRO DE CONTROL
          </span>
          <h1 class="dashboard-title">
            Hola, {{ firstName }}
            <span aria-hidden="true">👋</span>
          </h1>
          <p class="dashboard-subtitle mb-0">
            Aquí tienes una vista general de tu negocio y sus indicadores.
          </p>
        </div>
        <div class="dashboard-date">
          <span class="dashboard-date-icon" aria-hidden="true">
            <i class="bi bi-calendar3"></i>
          </span>
          <span>
            <span class="dashboard-date-label">Hoy</span>
            <span class="dashboard-date-value">{{ todayLabel }}</span>
          </span>
        </div>
        <div class="dashboard-orbit dashboard-orbit-one" aria-hidden="true"></div>
        <div class="dashboard-orbit dashboard-orbit-two" aria-hidden="true"></div>
      </section>

      <div v-if="permissionsError" class="alert alert-danger border-0 rounded-4" role="alert">
        No fue posible consultar tus permisos: {{ permissionsError }}
      </div>

      <section class="dashboard-metrics mb-4" aria-label="Indicadores del negocio">
        <article class="dashboard-metric">
          <div class="dashboard-metric-top">
            <span class="dashboard-metric-icon metric-icon-blue" aria-hidden="true">
              <i class="bi bi-cash-stack"></i>
            </span>
            <span class="dashboard-metric-status">Ventas</span>
          </div>
          <p class="dashboard-metric-label">Ventas de hoy</p>
          <p class="dashboard-metric-value">--</p>
          <p class="dashboard-metric-foot">Disponible al conectar el módulo de ventas</p>
        </article>

        <article class="dashboard-metric">
          <div class="dashboard-metric-top">
            <span class="dashboard-metric-icon metric-icon-violet" aria-hidden="true">
              <i class="bi bi-calendar2-range"></i>
            </span>
            <span class="dashboard-metric-status">Este mes</span>
          </div>
          <p class="dashboard-metric-label">Ventas mensuales</p>
          <p class="dashboard-metric-value">--</p>
          <p class="dashboard-metric-foot">Resumen mensual pendiente de datos</p>
        </article>

        <article class="dashboard-metric">
          <div class="dashboard-metric-top">
            <span class="dashboard-metric-icon metric-icon-cyan" aria-hidden="true">
              <i class="bi bi-person-plus"></i>
            </span>
            <span class="dashboard-metric-status">Clientes</span>
          </div>
          <p class="dashboard-metric-label">Clientes registrados</p>
          <p class="dashboard-metric-value">--</p>
          <p class="dashboard-metric-foot">Disponible al conectar el módulo de clientes</p>
        </article>

        <article class="dashboard-metric">
          <div class="dashboard-metric-top">
            <span class="dashboard-metric-icon metric-icon-amber" aria-hidden="true">
              <i class="bi bi-exclamation-triangle"></i>
            </span>
            <span
              v-if="hasProductAccess && inventoryLoaded"
              class="dashboard-metric-status dashboard-metric-status-live"
            >
              Actualizado
            </span>
            <span v-else class="dashboard-metric-status">Inventario</span>
          </div>
          <p class="dashboard-metric-label">Productos con stock bajo</p>
          <p v-if="hasProductAccess && inventoryLoaded" class="dashboard-metric-value">
            {{ lowStockProducts.length }}
          </p>
          <p v-else-if="productsLoading" class="dashboard-metric-value dashboard-metric-value-muted">...</p>
          <p v-else class="dashboard-metric-value dashboard-metric-value-muted">--</p>
          <p class="dashboard-metric-foot">
            {{ hasProductAccess ? 'Umbral de alerta: 5 unidades o menos' : 'Requiere permiso de lectura de productos' }}
          </p>
        </article>
      </section>

      <section class="row g-4 mb-4">
        <div class="col-xl-8">
          <article class="dashboard-panel h-100">
            <header class="dashboard-panel-header">
              <div>
                <span class="dashboard-panel-kicker">RENDIMIENTO</span>
                <h2 class="dashboard-panel-title">Ventas del período</h2>
                <p class="dashboard-panel-subtitle">Comportamiento de las ventas durante el mes</p>
              </div>
              <span class="dashboard-panel-badge">
                <i class="bi bi-clock-history me-1" aria-hidden="true"></i>
                Próximamente
              </span>
            </header>

            <div class="sales-chart-placeholder" role="status">
              <div class="sales-chart-grid" aria-hidden="true">
                <span></span><span></span><span></span><span></span>
              </div>
              <div class="sales-chart-empty">
                <span class="sales-chart-icon" aria-hidden="true">
                  <i class="bi bi-graph-up-arrow"></i>
                </span>
                <h3>Tu actividad de ventas aparecerá aquí</h3>
                <p class="mb-0">
                  Conecta el módulo de ventas para visualizar tendencias y comparar períodos.
                </p>
              </div>
              <div class="sales-chart-axis" aria-hidden="true">
                <span>Sem 1</span>
                <span>Sem 2</span>
                <span>Sem 3</span>
                <span>Sem 4</span>
              </div>
            </div>
          </article>
        </div>

        <div class="col-xl-4">
          <article class="dashboard-panel h-100">
            <header class="dashboard-panel-header">
              <div>
                <span class="dashboard-panel-kicker">RESUMEN FINANCIERO</span>
                <h2 class="dashboard-panel-title">Indicadores</h2>
                <p class="dashboard-panel-subtitle">Lectura rápida de tu negocio</p>
              </div>
              <span class="dashboard-panel-icon" aria-hidden="true">
                <i class="bi bi-wallet2"></i>
              </span>
            </header>

            <div class="financial-list">
              <div class="financial-row">
                <span class="financial-row-icon financial-icon-green" aria-hidden="true">
                  <i class="bi bi-arrow-down-left"></i>
                </span>
                <span class="financial-row-copy">
                  <span class="financial-row-label">Ingresos del mes</span>
                  <span class="financial-row-note">Requiere datos de ventas</span>
                </span>
                <span class="financial-row-value">--</span>
              </div>
              <div class="financial-row">
                <span class="financial-row-icon financial-icon-red" aria-hidden="true">
                  <i class="bi bi-arrow-up-right"></i>
                </span>
                <span class="financial-row-copy">
                  <span class="financial-row-label">Gastos del mes</span>
                  <span class="financial-row-note">Requiere datos de compras</span>
                </span>
                <span class="financial-row-value">--</span>
              </div>
              <div class="financial-row">
                <span class="financial-row-icon financial-icon-blue" aria-hidden="true">
                  <i class="bi bi-pie-chart"></i>
                </span>
                <span class="financial-row-copy">
                  <span class="financial-row-label">Utilidad estimada</span>
                  <span class="financial-row-note">Disponible al conectar ventas y compras</span>
                </span>
                <span class="financial-row-value">--</span>
              </div>
            </div>

            <div class="dashboard-coming-note">
              <i class="bi bi-info-circle me-2" aria-hidden="true"></i>
              Los indicadores se activarán cuando estén disponibles sus módulos de origen.
            </div>
          </article>
        </div>
      </section>

      <section class="row g-4 mb-4">
        <div class="col-lg-6">
          <article class="dashboard-panel h-100">
            <header class="dashboard-panel-header">
              <div>
                <span class="dashboard-panel-kicker">INVENTARIO</span>
                <h2 class="dashboard-panel-title">Productos con stock bajo</h2>
                <p class="dashboard-panel-subtitle">Productos con 5 unidades o menos disponibles</p>
              </div>
              <RouterLink
                v-if="authStore.hasPermission('products.read')"
                to="/products"
                class="dashboard-panel-link"
              >
                Ver catálogo <i class="bi bi-arrow-up-right ms-1" aria-hidden="true"></i>
              </RouterLink>
            </header>

            <div v-if="productsLoading" class="dashboard-widget-state" role="status" aria-live="polite">
              <span class="spinner-border spinner-border-sm text-primary" aria-hidden="true"></span>
              Consultando inventario...
            </div>
            <div v-else-if="productsError" class="dashboard-widget-error" role="alert">
              <p class="mb-2">{{ productsError }}</p>
              <button type="button" class="btn btn-sm btn-outline-secondary" @click="loadInventory">
                Reintentar
              </button>
            </div>
            <div v-else-if="!hasProductAccess" class="dashboard-empty-state">
              <i class="bi bi-lock" aria-hidden="true"></i>
              <p class="mb-0">No tienes permiso para consultar el inventario.</p>
            </div>
            <div v-else-if="lowStockProducts.length === 0" class="dashboard-empty-state">
              <i class="bi bi-check2-circle dashboard-empty-success" aria-hidden="true"></i>
              <p class="mb-0">No hay productos con stock bajo.</p>
              <small>El inventario está por encima del umbral establecido.</small>
            </div>
            <div v-else class="low-stock-list">
              <div
                v-for="product in lowStockProducts.slice(0, 5)"
                :key="product.id"
                class="low-stock-item"
              >
                <span class="low-stock-product-icon" aria-hidden="true">
                  <i class="bi bi-box-seam"></i>
                </span>
                <span class="low-stock-product-copy">
                  <span class="low-stock-product-name">{{ product.name }}</span>
                  <span class="low-stock-product-id">Producto #{{ product.id }}</span>
                </span>
                <span class="low-stock-quantity">
                  {{ product.quantity }} <small>uds.</small>
                </span>
              </div>
              <RouterLink
                v-if="lowStockProducts.length > 5"
                to="/products"
                class="dashboard-list-more"
              >
                Ver {{ lowStockProducts.length - 5 }} productos más
                <i class="bi bi-arrow-right ms-1" aria-hidden="true"></i>
              </RouterLink>
            </div>
          </article>
        </div>

        <div class="col-lg-6">
          <article class="dashboard-panel h-100">
            <header class="dashboard-panel-header">
              <div>
                <span class="dashboard-panel-kicker">DESEMPEÑO</span>
                <h2 class="dashboard-panel-title">Productos más vendidos</h2>
                <p class="dashboard-panel-subtitle">Los productos con mayor movimiento</p>
              </div>
              <span class="dashboard-panel-icon dashboard-panel-icon-gold" aria-hidden="true">
                <i class="bi bi-trophy"></i>
              </span>
            </header>

            <div class="dashboard-empty-state dashboard-empty-state-large">
              <i class="bi bi-bar-chart-line" aria-hidden="true"></i>
              <p class="mb-1">Aún no hay datos de ventas</p>
              <small>Cuando registres ventas, aquí verás tus productos más vendidos.</small>
            </div>
          </article>
        </div>
      </section>

      <section class="row g-4 mb-4">
        <div class="col-lg-7">
          <article class="dashboard-panel h-100">
            <header class="dashboard-panel-header">
              <div>
                <span class="dashboard-panel-kicker">ACTIVIDAD</span>
                <h2 class="dashboard-panel-title">Compras recientes</h2>
                <p class="dashboard-panel-subtitle">Últimos movimientos de compra registrados</p>
              </div>
              <span class="dashboard-panel-icon" aria-hidden="true">
                <i class="bi bi-receipt"></i>
              </span>
            </header>

            <div class="dashboard-empty-state dashboard-empty-state-large">
              <i class="bi bi-inbox" aria-hidden="true"></i>
              <p class="mb-1">El historial de compras estará aquí</p>
              <small>Conecta el módulo de compras para consultar movimientos recientes.</small>
            </div>
          </article>
        </div>

        <div class="col-lg-5">
          <article class="dashboard-panel h-100">
            <header class="dashboard-panel-header">
              <div>
                <span class="dashboard-panel-kicker">ACCESOS</span>
                <h2 class="dashboard-panel-title">Tus módulos</h2>
                <p class="dashboard-panel-subtitle">Continúa trabajando en Drakios</p>
              </div>
            </header>

            <div v-if="availableShortcuts.length" class="dashboard-shortcuts">
              <RouterLink
                v-for="shortcut in availableShortcuts"
                :key="shortcut.to"
                :to="shortcut.to"
                class="dashboard-shortcut"
              >
                <span class="dashboard-shortcut-icon" :class="`shortcut-${shortcut.tone}`" aria-hidden="true">
                  <i class="bi" :class="shortcut.icon"></i>
                </span>
                <span class="dashboard-shortcut-copy">
                  <span class="dashboard-shortcut-title">{{ shortcut.label }}</span>
                  <span class="dashboard-shortcut-description">{{ shortcut.description }}</span>
                </span>
                <i class="bi bi-arrow-up-right dashboard-shortcut-arrow" aria-hidden="true"></i>
              </RouterLink>
            </div>
            <div v-else class="dashboard-empty-state">
              <i class="bi bi-grid" aria-hidden="true"></i>
              <p class="mb-0">No hay módulos disponibles para tu cuenta todavía.</p>
            </div>
          </article>
        </div>
      </section>
    </div>
  </main>

  <AppFooter />
</template>

<style scoped>
.dashboard-page {
  background:
    radial-gradient(ellipse at 85% 0%, rgba(57, 140, 245, 0.09), transparent 34%),
    linear-gradient(180deg, #0d121b 0%, #111925 100%);
}

.dashboard-welcome {
  position: relative;
  display: flex;
  min-height: 190px;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  overflow: hidden;
  padding: 2rem 2.25rem;
  border: 1px solid rgba(145, 208, 255, 0.24);
  border-radius: 24px;
  background:
    linear-gradient(112deg, rgba(23, 33, 49, 0.98) 5%, rgba(35, 61, 92, 0.96) 65%, rgba(42, 83, 128, 0.94)),
    radial-gradient(circle at 75% 15%, rgba(126, 190, 255, 0.3), transparent 35%);
  box-shadow: 0 20px 45px rgba(2, 6, 23, 0.28), 0 0 34px rgba(57, 140, 245, 0.12);
}

.dashboard-welcome-content,
.dashboard-date {
  position: relative;
  z-index: 1;
}

.dashboard-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.8rem;
  color: #a9d7ff;
  font-size: 0.72rem;
  font-weight: 750;
  letter-spacing: 0.12em;
}

.dashboard-title {
  margin: 0 0 0.45rem;
  color: #fff;
  font-size: clamp(1.8rem, 4vw, 2.55rem);
  font-weight: 800;
  letter-spacing: -0.035em;
}

.dashboard-title span {
  display: inline-block;
  font-size: 0.78em;
  transform-origin: 70% 70%;
}

.dashboard-subtitle {
  color: rgba(226, 237, 250, 0.72);
  font-size: 0.96rem;
}

.dashboard-date {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.85rem 1rem;
  border: 1px solid rgba(210, 231, 255, 0.16);
  border-radius: 14px;
  background: rgba(11, 20, 33, 0.28);
  color: #f1f6fc;
  backdrop-filter: blur(8px);
}

.dashboard-date-icon {
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  border-radius: 12px;
  background: rgba(116, 180, 248, 0.16);
  color: #b7dcff;
  font-size: 1.05rem;
}

.dashboard-date-label,
.dashboard-date-value {
  display: block;
}

.dashboard-date-label {
  margin-bottom: 0.15rem;
  color: #b7c7db;
  font-size: 0.72rem;
}

.dashboard-date-value {
  font-size: 0.84rem;
  font-weight: 650;
  text-transform: capitalize;
}

.dashboard-orbit {
  position: absolute;
  border: 1px solid rgba(181, 218, 255, 0.09);
  border-radius: 50%;
  pointer-events: none;
}

.dashboard-orbit-one {
  top: -160px;
  right: 8%;
  width: 360px;
  height: 360px;
}

.dashboard-orbit-two {
  top: -112px;
  right: 13%;
  width: 265px;
  height: 265px;
}

.dashboard-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
}

.dashboard-metric {
  min-width: 0;
  padding: 1.25rem;
  border: 1px solid var(--app-border);
  border-radius: 18px;
  background: linear-gradient(145deg, rgba(24, 34, 48, 0.98), rgba(19, 28, 40, 0.98));
  box-shadow: 0 12px 30px rgba(2, 6, 23, 0.14);
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.dashboard-metric:hover {
  transform: translateY(-2px);
  border-color: rgba(145, 208, 255, 0.32);
}

.dashboard-metric-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.dashboard-metric-icon,
.dashboard-panel-icon {
  display: grid;
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  place-items: center;
  border: 1px solid transparent;
  border-radius: 13px;
  font-size: 1.1rem;
}

.metric-icon-blue {
  border-color: rgba(96, 165, 250, 0.2);
  background: rgba(59, 130, 246, 0.14);
  color: #8fc5ff;
}

.metric-icon-violet {
  border-color: rgba(167, 139, 250, 0.2);
  background: rgba(139, 92, 246, 0.14);
  color: #c3adff;
}

.metric-icon-cyan {
  border-color: rgba(103, 232, 249, 0.2);
  background: rgba(6, 182, 212, 0.13);
  color: #80e7f2;
}

.metric-icon-amber {
  border-color: rgba(251, 191, 36, 0.2);
  background: rgba(245, 158, 11, 0.12);
  color: #ffd17d;
}

.dashboard-metric-status {
  padding: 0.28rem 0.55rem;
  border: 1px solid rgba(160, 174, 192, 0.13);
  border-radius: 999px;
  background: rgba(160, 174, 192, 0.07);
  color: #9eacbd;
  font-size: 0.67rem;
  font-weight: 650;
  white-space: nowrap;
}

.dashboard-metric-status-live {
  border-color: rgba(74, 222, 128, 0.18);
  background: rgba(34, 197, 94, 0.09);
  color: #86e7a9;
}

.dashboard-metric-label {
  margin: 0 0 0.25rem;
  color: #aab7c8;
  font-size: 0.83rem;
  font-weight: 600;
}

.dashboard-metric-value {
  margin: 0;
  color: #f2f6fb;
  font-size: 1.8rem;
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1.2;
}

.dashboard-metric-value-muted {
  color: #64748b;
}

.dashboard-metric-foot {
  margin: 0.5rem 0 0;
  color: #78889d;
  font-size: 0.69rem;
  line-height: 1.45;
}

.dashboard-panel {
  min-width: 0;
  overflow: hidden;
  border: 1px solid rgba(145, 208, 255, 0.17);
  border-radius: 20px;
  background: linear-gradient(145deg, rgba(21, 30, 43, 0.98), rgba(18, 27, 39, 0.98));
  box-shadow: 0 14px 34px rgba(2, 6, 23, 0.16);
}

.dashboard-panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.3rem 1.4rem 1.1rem;
  border-bottom: 1px solid rgba(160, 174, 192, 0.09);
}

.dashboard-panel-kicker {
  display: block;
  margin-bottom: 0.38rem;
  color: #78b8f5;
  font-size: 0.64rem;
  font-weight: 750;
  letter-spacing: 0.11em;
}

.dashboard-panel-title {
  margin: 0;
  color: #eaf0f7;
  font-size: 1.04rem;
  font-weight: 750;
}

.dashboard-panel-subtitle {
  margin: 0.3rem 0 0;
  color: #8594a8;
  font-size: 0.77rem;
}

.dashboard-panel-badge {
  flex: 0 0 auto;
  padding: 0.38rem 0.6rem;
  border: 1px solid rgba(145, 208, 255, 0.14);
  border-radius: 999px;
  background: rgba(57, 140, 245, 0.08);
  color: #9fcfff;
  font-size: 0.66rem;
  font-weight: 650;
}

.dashboard-panel-icon {
  border-color: rgba(145, 208, 255, 0.13);
  background: rgba(57, 140, 245, 0.1);
  color: #9bcfff;
}

.dashboard-panel-icon-gold {
  border-color: rgba(251, 191, 36, 0.18);
  background: rgba(245, 158, 11, 0.1);
  color: #f6ca74;
}

.sales-chart-placeholder {
  position: relative;
  min-height: 300px;
  margin: 0.5rem 1.4rem 1.25rem;
  padding: 1rem 0 2rem;
}

.sales-chart-grid {
  position: absolute;
  inset: 1.25rem 0 2.2rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.sales-chart-grid span {
  border-top: 1px dashed rgba(160, 174, 192, 0.13);
}

.sales-chart-empty {
  position: absolute;
  top: 50%;
  left: 50%;
  width: min(90%, 360px);
  text-align: center;
  transform: translate(-50%, -50%);
}

.sales-chart-icon {
  display: grid;
  width: 54px;
  height: 54px;
  margin: 0 auto 0.85rem;
  place-items: center;
  border: 1px solid rgba(145, 208, 255, 0.14);
  border-radius: 17px;
  background: rgba(57, 140, 245, 0.1);
  color: #88c2fb;
  font-size: 1.35rem;
}

.sales-chart-empty h3 {
  margin: 0 0 0.4rem;
  color: #c8d4e2;
  font-size: 0.92rem;
  font-weight: 700;
}

.sales-chart-empty p {
  color: #7f8ea2;
  font-size: 0.78rem;
  line-height: 1.55;
}

.sales-chart-axis {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  justify-content: space-between;
  color: #728197;
  font-size: 0.66rem;
}

.financial-list {
  padding: 0 1.35rem;
}

.financial-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(160, 174, 192, 0.08);
}

.financial-row:last-child {
  border-bottom: 0;
}

.financial-row-icon {
  display: grid;
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  place-items: center;
  border-radius: 11px;
  font-size: 0.95rem;
}

.financial-icon-green {
  background: rgba(34, 197, 94, 0.1);
  color: #81dfa2;
}

.financial-icon-red {
  background: rgba(248, 113, 113, 0.1);
  color: #f5a0a0;
}

.financial-icon-blue {
  background: rgba(59, 130, 246, 0.12);
  color: #93c5fd;
}

.financial-row-copy {
  display: flex;
  min-width: 0;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 0.2rem;
}

.financial-row-label {
  color: #d1dbe7;
  font-size: 0.79rem;
  font-weight: 650;
}

.financial-row-note {
  color: #74849a;
  font-size: 0.66rem;
  line-height: 1.35;
}

.financial-row-value {
  color: #8292a7;
  font-size: 1rem;
  font-weight: 750;
}

.dashboard-coming-note {
  margin: 0.25rem 1.35rem 1.2rem;
  padding: 0.7rem 0.75rem;
  border: 1px solid rgba(145, 208, 255, 0.1);
  border-radius: 10px;
  background: rgba(57, 140, 245, 0.045);
  color: #8293a8;
  font-size: 0.68rem;
  line-height: 1.45;
}

.dashboard-panel-link,
.dashboard-list-more {
  flex: 0 0 auto;
  color: #8fc5ff;
  font-size: 0.72rem;
  font-weight: 650;
  text-decoration: none;
}

.dashboard-panel-link:hover,
.dashboard-list-more:hover {
  color: #d4edff;
}

.dashboard-widget-state,
.dashboard-widget-error,
.dashboard-empty-state {
  display: flex;
  min-height: 174px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  padding: 1.5rem;
  color: #8594a8;
  text-align: center;
}

.dashboard-widget-state {
  flex-direction: row;
}

.dashboard-widget-error {
  color: #fca5a5;
}

.dashboard-empty-state > i {
  color: #71839a;
  font-size: 1.8rem;
}

.dashboard-empty-state .dashboard-empty-success {
  color: #70d99a;
}

.dashboard-empty-state p {
  color: #becbd9;
  font-size: 0.82rem;
  font-weight: 650;
}

.dashboard-empty-state small {
  max-width: 340px;
  color: #7c8ca1;
  font-size: 0.72rem;
  line-height: 1.5;
}

.dashboard-empty-state-large {
  min-height: 240px;
}

.low-stock-list {
  padding: 0.25rem 1.35rem 1.1rem;
}

.low-stock-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(160, 174, 192, 0.08);
}

.low-stock-product-icon {
  display: grid;
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  place-items: center;
  border: 1px solid rgba(145, 208, 255, 0.1);
  border-radius: 12px;
  background: rgba(57, 140, 245, 0.08);
  color: #9bcfff;
}

.low-stock-product-copy {
  display: flex;
  min-width: 0;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 0.2rem;
}

.low-stock-product-name {
  overflow: hidden;
  color: #d8e2ed;
  font-size: 0.79rem;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.low-stock-product-id {
  color: #728197;
  font-size: 0.67rem;
}

.low-stock-quantity {
  flex: 0 0 auto;
  padding: 0.33rem 0.55rem;
  border: 1px solid rgba(251, 191, 36, 0.2);
  border-radius: 8px;
  background: rgba(245, 158, 11, 0.1);
  color: #ffd17d;
  font-size: 0.77rem;
  font-weight: 750;
}

.low-stock-quantity small {
  color: #caa55e;
  font-size: 0.62rem;
  font-weight: 600;
}

.dashboard-list-more {
  display: inline-block;
  margin-top: 0.85rem;
}

.dashboard-shortcuts {
  padding: 0.3rem 1.3rem 1.1rem;
}

.dashboard-shortcut {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
  padding: 0.8rem 0.2rem;
  border-bottom: 1px solid rgba(160, 174, 192, 0.08);
  color: inherit;
  text-decoration: none;
  transition: background-color 0.18s ease, padding 0.18s ease;
}

.dashboard-shortcut:last-child {
  border-bottom: 0;
}

.dashboard-shortcut:hover {
  padding-right: 0.55rem;
  padding-left: 0.55rem;
  border-radius: 10px;
  background: rgba(145, 208, 255, 0.045);
}

.dashboard-shortcut-icon {
  display: grid;
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  place-items: center;
  border: 1px solid transparent;
  border-radius: 12px;
}

.shortcut-blue {
  border-color: rgba(96, 165, 250, 0.18);
  background: rgba(59, 130, 246, 0.12);
  color: #8fc5ff;
}

.shortcut-violet {
  border-color: rgba(167, 139, 250, 0.18);
  background: rgba(139, 92, 246, 0.12);
  color: #c3adff;
}

.shortcut-cyan {
  border-color: rgba(103, 232, 249, 0.18);
  background: rgba(6, 182, 212, 0.1);
  color: #80e7f2;
}

.dashboard-shortcut-copy {
  display: flex;
  min-width: 0;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 0.2rem;
}

.dashboard-shortcut-title {
  color: #d8e2ed;
  font-size: 0.8rem;
  font-weight: 700;
}

.dashboard-shortcut-description {
  color: #7c8ca1;
  font-size: 0.68rem;
}

.dashboard-shortcut-arrow {
  color: #71839a;
  font-size: 0.82rem;
}

@media (max-width: 991.98px) {
  .dashboard-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 575.98px) {
  .dashboard-welcome {
    min-height: 0;
    align-items: flex-start;
    flex-direction: column;
    gap: 1.25rem;
    padding: 1.5rem;
    border-radius: 20px;
  }

  .dashboard-date {
    padding: 0.65rem 0.75rem;
  }

  .dashboard-date-icon {
    width: 34px;
    height: 34px;
  }

  .dashboard-metrics {
    gap: 0.7rem;
  }

  .dashboard-metric {
    padding: 0.95rem;
    border-radius: 15px;
  }

  .dashboard-metric-icon {
    width: 36px;
    height: 36px;
    flex-basis: 36px;
  }

  .dashboard-metric-value {
    font-size: 1.5rem;
  }

  .dashboard-metric-status {
    font-size: 0.59rem;
  }

  .dashboard-panel-header {
    padding: 1.1rem 1rem 0.9rem;
  }

  .sales-chart-placeholder {
    min-height: 270px;
    margin-right: 1rem;
    margin-left: 1rem;
  }
}

@media (max-width: 380px) {
  .dashboard-metrics {
    grid-template-columns: 1fr;
  }
}
</style>

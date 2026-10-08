<script setup>
defineProps({
  compact: {
    type: Boolean,
    default: false,
  },
})

const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="app-footer" :class="{ 'app-footer-compact': compact }">
    <div class="container app-footer-content">
      <p class="app-footer-copyright">
        <span class="app-footer-copyright-brand">&copy; {{ currentYear }} Drakios</span>
        <span class="app-footer-copyright-divider" aria-hidden="true"></span>
        <span>Todos los derechos reservados</span>
      </p>

      <div v-if="!compact" class="app-footer-platform" aria-label="Plataforma de gestión">
        <span class="app-footer-platform-icon" aria-hidden="true">
          <i class="bi bi-grid-1x2"></i>
        </span>
        <span>Plataforma de gestión</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  position: relative;
  border-top: 1px solid rgba(160, 174, 192, 0.1);
  background: linear-gradient(180deg, rgba(17, 25, 37, 0.72), rgba(11, 16, 24, 0.94));
}

.app-footer::before {
  position: absolute;
  top: -1px;
  left: 50%;
  width: min(240px, 42vw);
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(113, 177, 245, 0.48), transparent);
  content: "";
  transform: translateX(-50%);
}

.app-footer-content {
  min-height: 68px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.app-footer-copyright {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin: 0;
  color: #8d9aad;
  font-size: 12px;
  line-height: 1.5;
}

.app-footer-copyright-brand {
  color: #d5deea;
  font-weight: 650;
  letter-spacing: 0.01em;
}

.app-footer-copyright-divider {
  width: 3px;
  height: 3px;
  flex: 0 0 3px;
  border-radius: 50%;
  background: #506177;
}

.app-footer-platform {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
  gap: 9px;
  padding: 7px 12px 7px 8px;
  border: 1px solid rgba(145, 208, 255, 0.12);
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(57, 140, 245, 0.08), rgba(255, 255, 255, 0.025));
  color: #b1bfd0;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.2;
  white-space: nowrap;
}

.app-footer-platform-icon {
  width: 25px;
  height: 25px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(145, 208, 255, 0.11);
  border-radius: 7px;
  background: rgba(57, 140, 245, 0.1);
  color: #8fc5ff;
  font-size: 12px;
}

.app-footer-compact {
  border-top-color: rgba(160, 174, 192, 0.08);
  background: rgba(11, 16, 24, 0.28);
}

.app-footer-compact::before {
  display: none;
}

.app-footer-compact .app-footer-content {
  min-height: 48px;
  justify-content: center;
}

.app-footer-compact .app-footer-copyright {
  gap: 8px;
  color: #8290a2;
  font-size: 11px;
}

@media (max-width: 420px) {
  .app-footer-content {
    min-height: 82px;
    flex-direction: column;
    justify-content: center;
    gap: 10px;
    padding-top: 14px;
    padding-bottom: 14px;
  }

  .app-footer-copyright {
    text-align: center;
    justify-content: center;
    gap: 7px;
    font-size: 11px;
  }

  .app-footer-platform {
    padding: 5px 10px 5px 6px;
    font-size: 10px;
  }

  .app-footer-platform-icon {
    width: 22px;
    height: 22px;
  }

  .app-footer-compact .app-footer-content {
    min-height: 46px;
    padding-top: 8px;
    padding-bottom: 8px;
  }
}
</style>

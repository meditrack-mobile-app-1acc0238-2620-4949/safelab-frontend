<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/boundedcontext/identityaccess/application/stores/auth.store'
import { useAppStore } from '@/shared/application/stores/app.store'
import { useSafeLabDemoStore } from '@/shared/application/stores/demo.store'
import AppSidebar from '@/shared/presentation/components/AppSidebar.vue'
import AppTopbar from '@/shared/presentation/components/AppTopbar.vue'

const appStore = useAppStore()
const demoStore = useSafeLabDemoStore()

const shellClasses = computed(() => ({
  'sidebar-hidden': !appStore.sidebarVisible
}))

const auth = useAuthStore()
const refreshOnFocus = () => { if (auth.isAuthenticated) demoStore.syncFromBackend() }
onMounted(() => {
  demoStore.initializeOperationalState()
  window.addEventListener('focus', refreshOnFocus)
})
onUnmounted(() => window.removeEventListener('focus', refreshOnFocus))
</script>

<template>
  <div class="app-shell" :class="shellClasses">
    <AppSidebar />

    <div class="app-main">
      <AppTopbar />

      <main class="app-content">
        <div class="route-frame">
          <RouterView />
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-shell {
  --sidebar-width: 248px;

  min-height: 100vh;
  background: var(--surface);
}

.app-main {
  min-height: 100vh;
  width: calc(100% - var(--sidebar-width));
  margin-left: var(--sidebar-width);
  display: flex;
  flex-direction: column;
  transition:
      margin-left 0.25s ease,
      width 0.25s ease;
}

.app-shell.sidebar-hidden .app-main {
  width: 100%;
  margin-left: 0;
}

:deep(.app-topbar) {
  position: sticky !important;
  top: 0 !important;
  left: auto !important;
  right: auto !important;
  width: 100% !important;
  z-index: 30;
  flex-shrink: 0;
}

.app-content {
  flex: 1;
  display: flex;
  justify-content: center;
  padding: 32px 28px 48px;
}

.route-frame {
  width: min(100%, 1440px);
  min-width: 0;
}

@media (max-width: 1024px) {
  .app-main,
  .app-shell.sidebar-hidden .app-main {
    width: 100%;
    margin-left: 0;
  }

  .app-content {
    padding: 24px 18px 40px;
  }
}
</style>
<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { boundedContextNavigation } from '@/shared/domain/model/navigation-items'
import { useAppStore } from '@/shared/application/stores/app.store'
import { useAuthStore } from '@/identity-access/application/stores/auth.store'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const appStore = useAppStore()
const authStore = useAuthStore()

authStore.restoreSession()

const sidebarClasses = computed(() => ({
  'is-hidden': !appStore.sidebarVisible,
  'is-mobile-open': appStore.mobileSidebarVisible
}))

const visibleNavigationItems = computed(() => {
  return boundedContextNavigation.filter((item) =>
      authStore.canAccessContext(item.context)
  )
})

const currentRoleLabel = computed(() => {
  return authStore.roleLabel || t('roles.safeLabAdministrator')
})

function isActive(path, context) {
  if (route.meta?.hideSidebarActive) return false

  if (route.meta?.sidebarContext) {
    return route.meta.sidebarContext === context
  }

  return route.path === path || route.path.startsWith(`/${context}`)
}

function closeOnMobile() {
  if (window.innerWidth < 1024) appStore.closeMobileSidebar()
}

function logout() {
  authStore.logout()
  appStore.closeMobileSidebar()
  router.push('/identity-access/login')
}
</script>

<template>
  <aside class="app-sidebar" :class="sidebarClasses" :aria-label="t('navigation.main')">
    <RouterLink to="/" class="brand" @click="closeOnMobile">
      <span class="brand-mark">
        <img src="/safelab-shield.png" alt="" aria-hidden="true" />
      </span>

      <span class="brand-copy">
        <strong>{{ t('app.name') }}</strong>
        <small>{{ t('app.tagline') }}</small>
      </span>
    </RouterLink>

    <div class="nav-caption">
      {{ t('navigation.allModules') }}
    </div>

    <nav class="sidebar-nav">
      <RouterLink
          v-for="item in visibleNavigationItems"
          :key="item.context"
          class="nav-group-link"
          :class="{ active: isActive(item.path, item.context) }"
          :to="item.path"
          @click="closeOnMobile"
      >
        <i :class="`pi pi-${item.icon}`" aria-hidden="true"></i>
        <span>{{ item.shortLabel || t(item.titleKey) }}</span>
      </RouterLink>
    </nav>

    <footer class="sidebar-footnote">
      <div class="role-preview">
        <span>{{ t('navigation.rolePreview') }}</span>
        <strong>{{ currentRoleLabel }}</strong>
      </div>

      <button class="logout-button" type="button" @click="logout">
        <i class="pi pi-sign-out" aria-hidden="true"></i>
        <span>{{ t('auth.logout') }}</span>
      </button>
    </footer>
  </aside>
</template>

<style scoped>
.app-sidebar {
  position: fixed !important;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 40;
  width: 248px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  background: linear-gradient(180deg, #1d4ed8 0%, #2e1065 100%);
  transition: transform 0.25s ease;
}

.app-sidebar.is-hidden {
  transform: translateX(-100%);
}

.app-sidebar.is-mobile-open {
  transform: translateX(0);
}

@media (max-width: 1024px) {
  .app-sidebar {
    transform: translateX(-100%);
  }

  .app-sidebar.is-mobile-open {
    transform: translateX(0);
  }
}

.sidebar-footnote {
  margin-top: auto;
  display: grid;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.16);
}

.role-preview {
  display: grid;
  gap: 0.25rem;
}

.role-preview span {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.75rem;
  font-weight: 700;
}

.role-preview strong {
  color: #ffffff;
  font-size: 0.85rem;
  font-weight: 900;
}

.logout-button {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  min-height: 38px;
  border: 0;
  border-radius: 12px;
  color: #ffffff;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  cursor: pointer;
  font-weight: 900;
  box-shadow: 0 10px 22px rgba(239, 68, 68, 0.24);
}

.logout-button:hover {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
}

</style>
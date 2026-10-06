<script setup>
import { computed, ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { setLocale } from '@/shared/application/services/i18n.service'
import { useAppStore } from '@/shared/application/stores/app.store'
import { useNotificationStore } from '@/alerts-notifications/application/stores/notification.store'
import NotificationBellPanel from '@/alerts-notifications/presentation/components/NotificationBellPanel.vue'

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()
const notificationStore = useNotificationStore()
const { t, locale } = useI18n()

const isNotificationPanelOpen = ref(false)
const notificationWrapperRef = ref(null)

const isNotificationsRoute = computed(() =>
    route.meta?.topbarContext === 'notifications'
)

const currentRoleLabel = computed(() =>
  appStore.currentUser.roleLabel || appStore.currentUser.position || appStore.currentUser.role
)

function toggleSidebar() {
  if (window.innerWidth < 1024) {
    appStore.openMobileSidebar()
    return
  }

  appStore.toggleSidebar()
}

function changeLanguage(language) {
  setLocale(language)
}

function toggleTheme() {
  appStore.toggleTheme()
}

function openProfile() {
  router.push('/user-profiles/my-profile')
}

function closeNotifications() {
  isNotificationPanelOpen.value = false
}

function toggleNotifications() {
  isNotificationPanelOpen.value = !isNotificationPanelOpen.value

  if (isNotificationPanelOpen.value) {
    notificationStore.fetchNotifications()
  }
}

function handleClickOutside(event) {
  if (!isNotificationPanelOpen.value) {
    return
  }

  const wrapper = notificationWrapperRef.value

  if (wrapper && !wrapper.contains(event.target)) {
    closeNotifications()
  }
}

function handleEscapeKey(event) {
  if (event.key === 'Escape') {
    closeNotifications()
  }
}

watch(
    () => route.fullPath,
    () => {
      closeNotifications()
    }
)

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleEscapeKey)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleEscapeKey)
})
</script>

<template>
  <header class="app-topbar">
    <button
        class="icon-button menu-toggle"
        type="button"
        :aria-label="t('actions.toggleSidebar')"
        @click="toggleSidebar"
    >
      <i class="pi pi-bars" aria-hidden="true"></i>
    </button>

    <div class="topbar-spacer" aria-hidden="true"></div>

    <div class="topbar-actions">
      <button
          class="theme-toggle-button"
          type="button"
          :aria-label="t('actions.toggleTheme')"
          @click="toggleTheme"
      >
        <i :class="appStore.isDarkMode ? 'pi pi-sun' : 'pi pi-moon'" aria-hidden="true"></i>
      </button>

      <div class="language-pill" role="group" :aria-label="t('actions.language')">
        <button
            type="button"
            :class="{ active: locale === 'en' }"
            @click="changeLanguage('en')"
        >
          EN
        </button>

        <button
            type="button"
            :class="{ active: locale === 'es' }"
            @click="changeLanguage('es')"
        >
          ES
        </button>
      </div>

      <div
          ref="notificationWrapperRef"
          class="notification-wrapper"
      >
        <button
            class="notification-button"
            :class="{ active: isNotificationPanelOpen || isNotificationsRoute }"
            type="button"
            :aria-label="t('actions.notifications')"
            @click="toggleNotifications"
        >
          <i class="pi pi-bell" aria-hidden="true"></i>

          <span
              v-if="notificationStore.unreadCount > 0"
              class="notification-count"
              aria-hidden="true"
          >
            {{ notificationStore.unreadCount }}
          </span>
        </button>

        <NotificationBellPanel v-if="isNotificationPanelOpen" />
      </div>

      <button
          class="profile-button"
          type="button"
          :aria-label="t('actions.profile')"
          @click="openProfile"
      >
        <span class="avatar">{{ appStore.currentUser.initials }}</span>

        <span class="profile-copy">
          <strong>{{ appStore.currentUser.fullName }}</strong>
          <small>{{ currentRoleLabel }}</small>
        </span>

        <i class="pi pi-angle-right" aria-hidden="true"></i>
      </button>
    </div>
  </header>
</template>

<style scoped>
.notification-wrapper {
  position: relative;
}

.notification-count {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  color: #ffffff;
  background: #ef4444;
  font-size: 0.68rem;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.theme-toggle-button {
  width: 42px;
  height: 42px;
  border: 0;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-dark);
  background: var(--surface-card);
  box-shadow: 0 8px 20px rgba(31,41,79,.08);
  cursor: pointer;
}

.theme-toggle-button:hover {
  outline: 2px solid rgba(79, 70, 229, 0.22);
}

.notification-button.active {
  outline: 2px solid rgba(79, 70, 229, 0.35);
  background: #eef2ff;
  color: #4f46e5;
}

.topbar-spacer {
  flex: 1;
}
</style>
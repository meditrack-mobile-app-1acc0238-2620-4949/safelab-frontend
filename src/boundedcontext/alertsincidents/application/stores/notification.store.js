import { defineStore } from 'pinia'
import { useSafeLabDemoStore } from '@/shared/application/stores/demo.store'

export const useNotificationStore = defineStore('alerts-notifications-notifications', {
  state: () => ({ loading: false, error: null }),
  getters: {
    notifications: () => useSafeLabDemoStore().notifications,
    unreadCount: () => useSafeLabDemoStore().unreadCount
  },
  actions: {
    async fetchNotifications() { this.loading = false; return useSafeLabDemoStore().notifications },
    markAsRead(id) { useSafeLabDemoStore().markNotificationRead(id) },
    markAllAsRead() { useSafeLabDemoStore().markAllNotificationsRead() }
  }
})

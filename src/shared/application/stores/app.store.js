import { defineStore } from 'pinia'

const THEME_KEY = 'safelab-theme'

const applyTheme = (theme) => {
  if (typeof document === 'undefined') return
  document.documentElement.dataset.theme = theme
  localStorage.setItem(THEME_KEY, theme)
}

export const useAppStore = defineStore('app', {
  state: () => ({
    sidebarVisible: true,
    mobileSidebarVisible: false,
    theme: localStorage.getItem(THEME_KEY) || 'light',
    currentUser: {
      fullName: 'Guest User',
      role: 'guest',
      roleLabel: 'Guest',
      position: 'Guest',
      initials: 'GU'
    }
  }),
  getters: {
    isDarkMode: (state) => state.theme === 'dark'
  },
  actions: {
    initializeTheme() {
      applyTheme(this.theme)
    },
    toggleSidebar() {
      this.sidebarVisible = !this.sidebarVisible
    },
    openMobileSidebar() {
      this.mobileSidebarVisible = true
    },
    closeMobileSidebar() {
      this.mobileSidebarVisible = false
    },
    toggleTheme() {
      this.theme = this.theme === 'dark' ? 'light' : 'dark'
      applyTheme(this.theme)
    }
  }
})

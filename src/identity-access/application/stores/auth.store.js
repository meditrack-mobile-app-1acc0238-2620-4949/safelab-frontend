import { defineStore } from 'pinia'
import { IdentityAccessApiService } from '../../infrastructure/http/identity-access-api.service'
import { useAppStore } from '@/shared/application/stores/app.store'
import {
  getAllowedContextsByRole,
  getRoleLabel,
  isAdministratorRole,
  roleSegmentMap
} from '../../domain/models/role-access.config'
import { demoUsers } from '@/shared/domain/data/safelab-demo-seed'

const identityAccessApiService = new IdentityAccessApiService()
const SESSION_KEY = 'safelab-auth-session'

const buildInitials = (firstName, lastName) => {
  const first = firstName?.charAt(0) || ''
  const last = lastName?.charAt(0) || ''

  return `${first}${last}`.toUpperCase() || 'SL'
}

const buildFullName = (firstName, lastName) => {
  return `${firstName || ''} ${lastName || ''}`.trim()
}

const syncAppUser = (user) => {
  const appStore = useAppStore()
  const roleLabel = user.position || getRoleLabel(user.role)

  appStore.$patch({
    currentUser: {
      ...appStore.currentUser,
      id: user.id,
      accountId: user.id,
      fullName: user.fullName,
      name: user.fullName,
      displayName: user.fullName,
      initials: user.initials,
      email: user.email,
      role: user.role,
      position: roleLabel,
      roleLabel,
      segment: user.segment,
      facilityId: user.facilityId,
      facilityName: user.facilityName
    }
  })
}

export const useAuthStore = defineStore('identity-access-auth', {
  state: () => ({
    currentUser: null,
    failedLoginAttempts: 0,
    recoveryMessage: '',
    recoveryCode: '',
    loading: false,
    error: null,
    registerMessage: ''
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.currentUser),

    allowedContexts: (state) => state.currentUser?.allowedContexts || [],

    isAdmin: (state) => isAdministratorRole(state.currentUser?.role),

    roleLabel: (state) => {
      if (!state.currentUser) return 'Guest'
      return state.currentUser.position || getRoleLabel(state.currentUser.role)
    },

    shouldShowForgotPassword: (state) => state.failedLoginAttempts >= 3,

    canAccessContext: (state) => (context) => {
      if (!context) return true
      if (!state.currentUser) return false
      if (isAdministratorRole(state.currentUser.role)) return true

      return state.currentUser.allowedContexts?.includes(context)
    }
  },

  actions: {
    normalizeUser(user) {
      return {
        ...user,
        position: user.position || getRoleLabel(user.role),
        segment: user.segment || roleSegmentMap[user.role] || 'shared',
        facilityId: user.facilityId || 'FAC-DEMO-001',
        facilityName: user.facilityName || user.laboratory || 'Demo Laboratory',
        allowedContexts: user.allowedContexts || getAllowedContextsByRole(user.role)
      }
    },

    restoreSession() {
      if (this.currentUser) return

      const rawSession = localStorage.getItem(SESSION_KEY)
      if (!rawSession) return

      try {
        const session = JSON.parse(rawSession)
        this.currentUser = this.normalizeUser(session.user)
        syncAppUser(this.currentUser)
      } catch {
        localStorage.removeItem(SESSION_KEY)
      }
    },

    persistSession(user) {
      const normalizedUser = this.normalizeUser(user)

      this.currentUser = normalizedUser
      this.failedLoginAttempts = 0

      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          user: normalizedUser,
          token: `fake-token-${normalizedUser.id}`,
          createdAt: new Date().toISOString()
        })
      )

      syncAppUser(normalizedUser)
    },

    logout() {
      this.currentUser = null
      localStorage.removeItem(SESSION_KEY)

      const appStore = useAppStore()
      appStore.$patch({
        sidebarVisible: true,
        mobileSidebarVisible: false,
        currentUser: {
          fullName: 'Guest User',
          role: 'guest',
          roleLabel: 'Guest',
          position: 'Guest',
          initials: 'GU'
        }
      })
    },



    updateCurrentUserProfile(profile) {
      if (!this.currentUser || !profile) return

      const updatedUser = this.normalizeUser({
        ...this.currentUser,
        firstName: profile.firstName,
        lastName: profile.lastName,
        fullName: profile.fullName,
        initials: profile.initials,
        email: profile.email,
        phone: profile.phone,
        laboratory: profile.laboratory,
        facilityName: profile.facilityName || profile.laboratory || this.currentUser.facilityName,
        timezone: profile.timezone || this.currentUser.timezone
      })

      this.currentUser = updatedUser
      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          user: updatedUser,
          token: `fake-token-${updatedUser.id}`,
          createdAt: new Date().toISOString()
        })
      )

      syncAppUser(updatedUser)
    },

    async login(identifier, password) {
      this.loading = true
      this.error = null

      try {
        const normalizedIdentifier = identifier.trim().toLowerCase()
        const response = await identityAccessApiService.signIn({
          email: normalizedIdentifier,
          username: normalizedIdentifier,
          password
        })
        const user = response.data?.user

        if (!user) {
          this.failedLoginAttempts += 1
          this.error = 'Invalid username, email or password.'
          return false
        }

        if (user.status && user.status !== 'active') {
          this.failedLoginAttempts += 1
          this.error = 'This account is not active.'
          return false
        }

        this.persistSession(user)
        return true
      } catch (error) {
        const normalizedIdentifier = identifier.trim().toLowerCase()
        const fallbackUser = demoUsers.find((item) => {
          const matchesIdentifier = item.email.toLowerCase() === normalizedIdentifier || item.username.toLowerCase() === normalizedIdentifier
          return matchesIdentifier && item.password === password
        })

        if (fallbackUser) {
          this.persistSession(fallbackUser)
          return true
        }

        console.error(error)
        this.failedLoginAttempts += 1
        this.error = 'Could not sign in. Try admin@safelab.pe / 123456 for the demo.'
        return false
      } finally {
        this.loading = false
      }
    },

    async register(form) {
      this.loading = true
      this.error = null
      this.registerMessage = ''

      try {
        const usersResponse = await identityAccessApiService.getUsers()
        const users = usersResponse.data

        const emailExists = users.some(
          (user) => user.email.toLowerCase() === form.email.toLowerCase()
        )

        const usernameExists = users.some(
          (user) => user.username.toLowerCase() === form.username.toLowerCase()
        )

        if (emailExists) {
          this.error = 'Email is already registered.'
          return false
        }

        if (usernameExists) {
          this.error = 'Username is already registered.'
          return false
        }

        const fullName = buildFullName(form.firstName, form.lastName)
        const initials = buildInitials(form.firstName, form.lastName)
        const position = getRoleLabel(form.role)
        const segment = roleSegmentMap[form.role] || 'shared'
        const facilityName = segment === 'hospital-pharmacy' ? 'Demo Hospital Pharmacy' : 'Demo Clinical Laboratory'

        const userPayload = {
          username: form.username,
          email: form.email,
          password: form.password,
          firstName: form.firstName,
          lastName: form.lastName,
          fullName,
          initials,
          phone: form.phone,
          role: form.role,
          position,
          status: 'active',
          segment,
          organization: `${fullName} Workspace`,
          laboratory: facilityName,
          facilityId: 'FAC-DEMO-001',
          facilityName,
          timezone: form.timezone,
          allowedContexts: getAllowedContextsByRole(form.role),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        const userResponse = await identityAccessApiService.createUser(userPayload)
        const createdUser = this.normalizeUser(userResponse.data)

        await identityAccessApiService.createUserProfile({
          accountId: createdUser.id,
          userId: `USR-${String(createdUser.id).padStart(3, '0')}`,
          firstName: form.firstName,
          lastName: form.lastName,
          fullName,
          initials,
          email: form.email,
          phone: form.phone,
          role: form.role,
          status: 'active',
          position,
          segment,
          organization: `${fullName} Workspace`,
          laboratory: facilityName,
          facilityId: 'FAC-DEMO-001',
          facilityName,
          language: 'en',
          timezone: form.timezone,
          notificationPreference: 'critical-and-daily',
          lastAccess: new Date().toISOString(),
          lastPasswordChange: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })

        this.persistSession(createdUser)
        this.registerMessage = 'Account created successfully.'
        return true
      } catch (error) {
        console.error(error)
        this.error = 'Could not create account.'
        return false
      } finally {
        this.loading = false
      }
    },

    async requestPasswordRecovery(email) {
      this.loading = true
      this.error = null
      this.recoveryMessage = ''
      this.recoveryCode = ''

      try {
        const response = await identityAccessApiService.getUsers()
        const users = response.data

        const userExists = users.some(
          (user) => user.email.toLowerCase() === email.toLowerCase()
        )

        if (!userExists) {
          this.error = 'No account was found with this email.'
          return false
        }

        this.recoveryCode = `SL-${Math.floor(100000 + Math.random() * 900000)}`
        this.recoveryMessage = 'Recovery instructions were sent successfully.'
        return true
      } catch (error) {
        console.error(error)
        this.error = 'Could not process password recovery.'
        return false
      } finally {
        this.loading = false
      }
    }
  }
})

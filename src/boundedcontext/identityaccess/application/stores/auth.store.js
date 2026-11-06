import { defineStore } from 'pinia'
import { useAppStore } from '@/shared/application/stores/app.store'
import { getAllowedContextsByRole, getRoleLabel, isAdministratorRole } from '../../domain/models/role-access.config'
import { ADMIN_ID, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_USERNAME, generateUserId, generateUsername, isValidName, isValidEmail, isValidPhone, isValidPassword } from '../../domain/models/mock-identity'

const SESSION_KEY = 'safelab-web-session-v2'
const ACCOUNTS_KEY = 'safelab-web-registered-v2'

export const DEMO_ADMIN = {
  id: ADMIN_ID, username: ADMIN_USERNAME, email: ADMIN_EMAIL,
  firstName: 'SafeLab', lastName: 'Administrator', fullName: 'SafeLab Administrator',
  initials: 'SA', phone: '999999999', age: null, city: '', jobTitle: '',
  role: 'safeLabAdministrator', position: 'SafeLab Administrator', status: 'active',
  segment: 'platform', facilityId: 'global', facilityName: 'All facilities',
  organization: 'SafeLab', timezone: 'America/Lima'
}

function readAccounts() {
  try { return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]') } catch { return [] }
}
function fullName(firstName, lastName) { return `${firstName.trim()} ${lastName.trim()}` }
function initials(firstName, lastName) { return `${firstName.trim()[0] || ''}${lastName.trim()[0] || ''}`.toUpperCase() }

export const useAuthStore = defineStore('identity-access-auth', {
  state: () => ({ currentUser: null, failedLoginAttempts: 0, loading: false, error: '', registerMessage: '', generatedUsername: '', recoveryMessage: '' }),
  getters: {
    isAuthenticated: (s) => Boolean(s.currentUser),
    allowedContexts: (s) => s.currentUser?.allowedContexts || [],
    isAdmin: (s) => isAdministratorRole(s.currentUser?.role),
    roleLabel: (s) => s.currentUser?.position || 'Guest',
    shouldShowForgotPassword: (s) => s.failedLoginAttempts >= 3,
    canAccessContext: (s) => (context) => Boolean(s.currentUser && (!context || isAdministratorRole(s.currentUser.role) || s.currentUser.allowedContexts?.includes(context)))
  },
  actions: {
    normalizeUser(user) { return { ...user, position: user.position || getRoleLabel(user.role), allowedContexts: user.allowedContexts || getAllowedContextsByRole(user.role) } },
    syncUser() {
      const user = this.currentUser
      if (!user) return
      useAppStore().$patch({currentUser: { ...user, name: user.fullName, displayName: user.fullName, roleLabel: user.position, accountId: user.id }})
    },
    restoreSession() {
      if (this.currentUser) return
      try {
        const data = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null')
        if (!data?.id) return
        const known = data.id === ADMIN_ID ? DEMO_ADMIN : readAccounts().find((account) => account.id === data.id && account.status === 'active')
        if (!known) { localStorage.removeItem(SESSION_KEY); return }
        this.currentUser = this.normalizeUser({ ...known, ...data })
        this.syncUser()
      } catch { localStorage.removeItem(SESSION_KEY) }
    },
    persistSession(user) {
      this.currentUser = this.normalizeUser(user)
      localStorage.setItem(SESSION_KEY, JSON.stringify(this.currentUser))
      this.failedLoginAttempts = 0
      this.syncUser()
    },
    logout() {
      this.currentUser = null
      localStorage.removeItem(SESSION_KEY)
      useAppStore().$patch({currentUser: {fullName:'Guest',initials:'GU',role:'guest',position:'Guest'}})
    },
    async login(identifier, password) {
      this.loading = true; this.error = ''
      try {
        const name = identifier.trim().toLowerCase()
        const accounts = [DEMO_ADMIN, ...readAccounts()]
        const user = accounts.find((a) => a.email.toLowerCase() === name || a.username === name)
        const matches = user && (user.id === ADMIN_ID ? password === ADMIN_PASSWORD : password === user.password)
        if (!matches) { this.failedLoginAttempts++; this.error = 'invalidCredentials'; return false }
        if (user.status !== 'active') { this.error = 'pendingActivation'; return false }
        const { password: ignored, ...safeUser } = user
        this.persistSession(safeUser)
        return true
      } finally { this.loading = false }
    },
    async register(form) {
      this.error = ''; this.registerMessage = ''; this.generatedUsername = ''
      const firstName = form.firstName.trim(), lastName = form.lastName.trim()
      if (!isValidName(firstName) || !isValidName(lastName)) { this.error='invalidName'; return false }
      if (!isValidEmail(form.email)) { this.error='invalidEmail'; return false }
      if (!isValidPhone(form.phone)) { this.error='invalidPhone'; return false }
      if (!isValidPassword(form.password)) { this.error='invalidPassword'; return false }
      if (form.password !== form.confirmPassword) { this.error='passwordMismatch'; return false }
      const accounts = readAccounts()
      if ([DEMO_ADMIN, ...accounts].some((a)=>a.email.toLowerCase()===form.email.trim().toLowerCase())) { this.error='duplicateEmail'; return false }
      const username = generateUsername([DEMO_ADMIN.username,...accounts.map(a=>a.username)])
      const account = { id: generateUserId(), username, firstName, lastName, fullName: fullName(firstName,lastName), initials:initials(firstName,lastName), email:form.email.trim().toLowerCase(), phone:form.phone.replace(/[\s-]/g,''), password:form.password, age:null, city:'', jobTitle:'', role:'bioclinicalCoordinator', position:'Bioclinical Operations Coordinator', status:'pending_activation', facilityId:'fac-central', facilityName:'Central Clinical Laboratory', segment:'clinical-laboratory', organization:'SafeLab', timezone:'America/Lima' }
      accounts.push(account)
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
      this.generatedUsername = username
      this.registerMessage='pendingActivation'
      return true
    },
    updateCurrentUserProfile(profile) {
      if (!this.currentUser) return
      const user={...this.currentUser,...profile,username:this.currentUser.username,id:this.currentUser.id,role:this.currentUser.role,position:this.currentUser.position}
      user.fullName=fullName(user.firstName,user.lastName);user.initials=initials(user.firstName,user.lastName)
      if (user.id !== ADMIN_ID) {
        const accounts=readAccounts();const i=accounts.findIndex(a=>a.id===user.id)
        if (i!==-1) {accounts[i]={...accounts[i],...user};localStorage.setItem(ACCOUNTS_KEY,JSON.stringify(accounts))}
      }
      this.persistSession(user)
    },
    async requestPasswordRecovery() {this.recoveryMessage='recoveryDemo';return true}
  }
})

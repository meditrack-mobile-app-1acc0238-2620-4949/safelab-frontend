import { defineStore } from 'pinia'
import { apiClient, TOKEN_KEY } from '@/shared/infrastructure/http/api-client'
import { useAppStore } from '@/shared/application/stores/app.store'
import { useSafeLabDemoStore } from '@/shared/application/stores/demo.store'
import { ADMIN_EMAIL, ADMIN_PASSWORD, generateUserId, generateUsername, isValidName, isValidEmail, isValidPhone, isValidPassword } from '../../domain/models/mock-identity'
import { effectivePermissions, CONTEXT_PERMISSION } from '../../domain/models/permission-catalog'
import { getRoleLabel } from '../../domain/models/role-access.config'

const SESSION_KEY = 'safelab-multitenant-session-v1' // legacy key: removed on logout
const normalizedEmail = value => String(value || '').trim().toLowerCase()
const nameParts = form => `${form.firstName.trim()} ${form.lastName.trim()}`
const initials = form => `${form.firstName?.trim()[0] || ''}${form.lastName?.trim()[0] || ''}`.toUpperCase()
const withoutPassword = user => { const { password, ...safe } = user; return safe }
// Simple RUC checksum for form feedback; verification against official records belongs to the backend.
export function validRuc(value) {
  if(!/^\d{11}$/.test(value) || !['10','15','17','20','21'].includes(value.slice(0,2)))return false
  const factors=[5,4,3,2,7,6,5,4,3,2]
  const remainder=value.slice(0,10).split('').reduce((sum,d,i)=>sum+Number(d)*factors[i],0)%11
  return Number(value[10])===(11-remainder)%10
}
const freeMail = /@(gmail|hotmail|outlook|yahoo|icloud|live)\./i
const validCorporate = email => isValidEmail(email) && !freeMail.test(email)

export const useAuthStore = defineStore('identity-access-auth', {
  state: () => ({ currentUser:null,failedLoginAttempts:0,loading:false,error:'',generatedUsername:'',registerMessage:'',recoveryMessage:'' }),
  getters: {
    isAuthenticated:s=>Boolean(s.currentUser),
    isPlatformAdmin:s=>s.currentUser?.role==='platformAdmin',
    isOrganizationAdmin:s=>s.currentUser?.role==='organizationAdmin',
    isAdmin:s=>['platformAdmin','organizationAdmin'].includes(s.currentUser?.role),
    roleLabel:s=>getRoleLabel(s.currentUser?.role),
    shouldShowForgotPassword:s=>s.failedLoginAttempts>=3,
    allowedPermissions:s=>effectivePermissions(s.currentUser,useSafeLabDemoStore().data.permissionOverrides[s.currentUser?.id]),
    canAccessContext:s=>context=>{
      if(!s.currentUser)return false
      if(context==='userprofiles')return true
      if(context==='platform')return s.currentUser.role==='platformAdmin'
      if(s.currentUser.role==='platformAdmin')return context==='platform'
      if(context==='subscriptionbilling')return s.currentUser.role==='organizationAdmin'
      if(context==='identityaccess')return s.currentUser.role==='organizationAdmin'
      if(context==='userpermissions')return s.currentUser.role==='organizationAdmin'
      const permission=CONTEXT_PERMISSION[context]
      return Boolean(permission && effectivePermissions(s.currentUser,useSafeLabDemoStore().data.permissionOverrides[s.currentUser.id]).includes(permission))
    },
    hasPermission:s=>permission=>Boolean(s.currentUser && effectivePermissions(s.currentUser,useSafeLabDemoStore().data.permissionOverrides[s.currentUser.id]).includes(permission))
  },
  actions: {
    normalizeUser(user){return {...user,position:getRoleLabel(user.role)}},
    syncUser(){
      const user=this.currentUser
      if(!user)return
      useAppStore().$patch({currentUser:{...user,name:user.fullName,displayName:user.fullName,roleLabel:getRoleLabel(user.role),accountId:user.id}})
      useSafeLabDemoStore().setSessionScope(user)
    },
    async restoreSession() {
      if (this.currentUser) return
      if (!sessionStorage.getItem(TOKEN_KEY)) return
      try {
        const { data } = await apiClient.get('/auth/me')
        if (await useSafeLabDemoStore().syncFromBackend()) this.setRemoteUser(useSafeLabDemoStore().sessionUser || data)
      } catch {
        sessionStorage.removeItem(TOKEN_KEY)
        this.currentUser = null
      }
    },
    setRemoteUser(user) {
      this.currentUser = this.normalizeUser(withoutPassword(user))
      this.failedLoginAttempts = 0
      this.syncUser()
    },
    async logout() {
      try { if (sessionStorage.getItem(TOKEN_KEY)) await apiClient.post('/auth/logout') } catch { /* limpiar siempre */ }
      sessionStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(SESSION_KEY)
      this.currentUser = null
      useSafeLabDemoStore().setSessionScope(null)
      useAppStore().$patch({currentUser:{fullName:'Guest',initials:'GU',role:'guest',position:'Guest'}})
    },
    async login(identifier,password) {
      this.loading = true
      this.error = ''
      try {
        const { data } = await apiClient.post('/auth/login', { identifier: identifier.trim(), password })
        sessionStorage.setItem(TOKEN_KEY, data.accessToken)
        if (!await useSafeLabDemoStore().syncFromBackend()) throw new Error('No se pudo cargar información de SafeLab API')
        this.setRemoteUser(useSafeLabDemoStore().sessionUser || data.user)
        return true
      } catch (error) {
        sessionStorage.removeItem(TOKEN_KEY)
        this.failedLoginAttempts++
        this.error = error.status === 403 ? 'pendingActivation' : 'invalidCredentials'
        useSafeLabDemoStore().backendError = error.message
        return false
      } finally { this.loading = false }
    },
    validatePersonal(form){
      if(!isValidName(form.firstName||'')||!isValidName(form.lastName||''))return 'invalidName'
      if(!isValidEmail(form.email||''))return 'invalidEmail'
      if(!isValidPhone(form.phone||''))return 'invalidPhone'
      if(!isValidPassword(form.password||''))return 'invalidPassword'
      if(form.password!==form.confirmPassword)return 'passwordMismatch'
      const used=useSafeLabDemoStore().data.users.some(u=>normalizedEmail(u.email)===normalizedEmail(form.email))
      if(used)return 'duplicateEmail'
      return ''
    },
    async registerCompany(form) {
      this.error = ''; this.generatedUsername = ''
      const validation = this.validatePersonal(form)
      if (validation) { this.error = validation; return false }
      try {
        await apiClient.post('/auth/register/company', {
          companyName: form.companyName, ruc:String(form.ruc), segment:form.segment,
          corporateEmail:form.corporateEmail, firstName:form.firstName, lastName:form.lastName,
          email:form.email, password:form.password, phone:form.phone
        })
        this.registerMessage='pendingActivation';return true
      } catch (error) { this.error = error.code || 'invalidCompany'; return false }
    },
    async registerInvited(form) {
      this.error = ''; this.generatedUsername = ''
      const validation = this.validatePersonal(form)
      if (validation) { this.error = validation; return false }
      try {
        await apiClient.post('/auth/register/invitation', {
          code: form.invitationCode, firstName:form.firstName, lastName:form.lastName,
          phone:form.phone, password:form.password
        })
        this.registerMessage='pendingActivation';return true
      } catch (error) { this.error = error.code || 'invalidInvitation'; return false }
    },
    async register(form){return this.registerCompany(form)},
    async updateCurrentUserProfile(profile) {
      if (!this.currentUser) return
      const patch = Object.fromEntries(Object.entries(profile).filter(([key]) =>
        ['firstName','lastName','phone','age','city','jobTitle'].includes(key)))
      const { data } = await apiClient.patch('/userprofiles/me', patch)
      await useSafeLabDemoStore().syncFromBackend()
      this.setRemoteUser(useSafeLabDemoStore().sessionUser || data)
    },
    async requestPasswordRecovery(){this.recoveryMessage='recoveryDemo';return true}
  }
})

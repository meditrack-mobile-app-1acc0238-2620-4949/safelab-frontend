import { defineStore } from 'pinia'
import { useAppStore } from '@/shared/application/stores/app.store'
import { useSafeLabDemoStore } from '@/shared/application/stores/demo.store'
import { ADMIN_EMAIL, ADMIN_PASSWORD, generateUserId, generateUsername, isValidName, isValidEmail, isValidPhone, isValidPassword } from '../../domain/models/mock-identity'
import { effectivePermissions, CONTEXT_PERMISSION } from '../../domain/models/permission-catalog'
import { getRoleLabel } from '../../domain/models/role-access.config'

const SESSION_KEY = 'safelab-multitenant-session-v1'
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
    restoreSession(){
      if(this.currentUser)return
      try{
        const parsed=JSON.parse(localStorage.getItem(SESSION_KEY)||'null')
        const known=useSafeLabDemoStore().data.users.find(u=>u.id===parsed?.id&&u.status==='active')
        if(!known){localStorage.removeItem(SESSION_KEY);return}
        this.currentUser=this.normalizeUser(withoutPassword(known));this.syncUser()
      }catch{localStorage.removeItem(SESSION_KEY)}
    },
    persistSession(user){
      this.currentUser=this.normalizeUser(withoutPassword(user))
      localStorage.setItem(SESSION_KEY,JSON.stringify({id:this.currentUser.id}))
      this.failedLoginAttempts=0;this.syncUser()
    },
    logout(){
      this.currentUser=null;localStorage.removeItem(SESSION_KEY)
      useSafeLabDemoStore().setSessionScope(null)
      useAppStore().$patch({currentUser:{fullName:'Guest',initials:'GU',role:'guest',position:'Guest'}})
    },
    async login(identifier,password){
      this.loading=true;this.error=''
      try{
        const text=normalizedEmail(identifier)
        const store=useSafeLabDemoStore()
        const account=store.data.users.find(u=>normalizedEmail(u.email)===text||u.username===text)
        const matches=account && password===(account.role==='platformAdmin'?ADMIN_PASSWORD:account.password)
        if(!matches){this.failedLoginAttempts++;this.error='invalidCredentials';return false}
        if(account.status!=='active'){this.error='pendingActivation';return false}
        const org=store.data.organizations.find(o=>o.id===account.organizationId)
        if(org && (org.status!=='active'||store.subscriptionFor(org.id)?.status!=='active')){this.error='pendingActivation';return false}
        this.persistSession(account);return true
      }finally{this.loading=false}
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
    async registerCompany(form){
      this.error='';this.generatedUsername=''
      const validation=this.validatePersonal(form)
      if(validation){this.error=validation;return false}
      if(!validRuc(String(form.ruc||''))){this.error='invalidRuc';return false}
      if(!String(form.companyName||'').trim()){this.error='invalidCompany';return false}
      if(!validCorporate(form.corporateEmail||'')||normalizedEmail(form.corporateEmail)===normalizedEmail(form.email)){this.error='invalidCorporateEmail';return false}
      if(!['laboratory','pharmaceutical'].includes(form.segment)){this.error='invalidCompany';return false}
      const demo=useSafeLabDemoStore()
      if(demo.data.organizations.some(o=>o.ruc===form.ruc)){this.error='duplicateRuc';return false}
      const username=generateUsername(demo.data.users.map(u=>u.username))
      const organizationId=generateUserId(),managerId=generateUserId()
      const company={id:organizationId,name:form.companyName.trim(),ruc:String(form.ruc),segment:form.segment,corporateEmail:normalizedEmail(form.corporateEmail),city:'',status:'pending_corporate_verification',managerId,facilityIds:[]}
      demo.data.organizations.push(company)
      demo.data.users.push({id:managerId,username,email:normalizedEmail(form.email),password:form.password,firstName:form.firstName.trim(),lastName:form.lastName.trim(),fullName:nameParts(form),initials:initials(form),phone:form.phone,role:'organizationAdmin',position:getRoleLabel('organizationAdmin'),status:'pending_corporate_verification',organizationId,organization:company.name,segment:company.segment,facilityId:null,facilityIds:[],resourceIds:[]})
      demo.data.subscriptions.push({id:generateUserId(),organizationId,plan:'SafeLab Business',status:'pending_payment',startDate:null,renewalDate:null,includedSeats:10,additionalSeats:0,seatPrice:17,baseAmount:118,monthlyCost:118,currencyCode:'PEN',invoices:[]})
      demo.data.accountRequests.push({id:generateUserId(),managerId,organizationId,status:'pending_corporate_verification',createdAt:new Date().toISOString()})
      demo.persist();this.generatedUsername=username;this.registerMessage='pendingActivation';return true
    },
    async registerInvited(form){
      this.error='';this.generatedUsername=''
      const validation=this.validatePersonal(form)
      if(validation){this.error=validation;return false}
      const demo=useSafeLabDemoStore()
      const invitation=demo.data.invitations.find(i=>i.token===String(form.invitationCode||'').trim().toUpperCase() && i.status==='pending')
      if(!invitation||new Date(invitation.expiresAt)<=new Date()||normalizedEmail(invitation.email)!==normalizedEmail(form.email)){this.error='invalidInvitation';return false}
      const org=demo.data.organizations.find(o=>o.id===invitation.organizationId)
      if(!org||org.status!=='active'||demo.subscriptionFor(org.id)?.status!=='active'){this.error='pendingActivation';return false}
      const username=generateUsername(demo.data.users.map(u=>u.username))
      demo.data.users.push({id:generateUserId(),username,email:normalizedEmail(form.email),password:form.password,firstName:form.firstName.trim(),lastName:form.lastName.trim(),fullName:nameParts(form),initials:initials(form),phone:form.phone,role:invitation.role,position:getRoleLabel(invitation.role),organizationId:org.id,organization:org.name,segment:org.segment,facilityIds:invitation.facilityIds,facilityId:invitation.facilityIds?.[0]||org.facilityIds[0],resourceIds:invitation.resourceIds,status:'pending_email_verification'})
      invitation.status='accepted';demo.persist();this.generatedUsername=username;this.registerMessage='pendingActivation';return true
    },
    async register(form){return this.registerCompany(form)},
    updateCurrentUserProfile(profile){
      if(!this.currentUser)return
      const store=useSafeLabDemoStore()
      const found=store.data.users.find(u=>u.id===this.currentUser.id)
      if(!found)return
      Object.assign(found,profile,{id:found.id,username:found.username,role:found.role,organizationId:found.organizationId})
      found.fullName=`${found.firstName} ${found.lastName}`;found.initials=`${found.firstName[0]||''}${found.lastName[0]||''}`.toUpperCase()
      store.persist();this.persistSession(found)
    },
    async requestPasswordRecovery(){this.recoveryMessage='recoveryDemo';return true}
  }
})

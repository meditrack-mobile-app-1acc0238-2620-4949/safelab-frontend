<script setup>
import ContextPageHeading from '@/shared/presentation/components/ContextPageHeading.vue'
import { reactive,ref,computed,watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/boundedcontext/identityaccess/application/stores/auth.store'
import { isValidName,isValidEmail,isValidPhone } from '@/boundedcontext/identityaccess/domain/models/mock-identity'
import { useSafeLabDemoStore } from '@/shared/application/stores/demo.store'
const auth=useAuthStore(),demo=useSafeLabDemoStore(),{t,locale}=useI18n()
auth.restoreSession()
const user=computed(()=>auth.currentUser),editing=ref(false),error=ref(''),success=ref('')
const fields=reactive({firstName:'',lastName:'',email:'',phone:'',age:'',city:'',jobTitle:''})
const accountBilling=computed(()=>user.value?.id===demo.billing.accountId?demo.billing:null)
const currency=computed(()=>new Intl.NumberFormat(locale.value==='es'?'es-PE':'en-US',{style:'currency',currency:'PEN'}).format(accountBilling.value?.monthlyCost||0))
function cancel(){if(!user.value)return;for(const key of Object.keys(fields))fields[key]=user.value[key]??'';editing.value=false;error.value=''}
watch(user,cancel,{immediate:true})
function save(){
  error.value='';success.value=''
  if(!isValidName(fields.firstName)||!isValidName(fields.lastName)){error.value=t('webAuth.invalidName');return}
  if(!isValidEmail(fields.email)){error.value=t('webAuth.invalidEmail');return}
  if(!isValidPhone(fields.phone)){error.value=t('webAuth.invalidPhone');return}
  if(fields.age!==''&&(!Number.isInteger(Number(fields.age))||Number(fields.age)<1||Number(fields.age)>120)){error.value=t('profile.invalidAge');return}
  if(fields.city&&!isValidName(fields.city)){error.value=t('profile.invalidCity');return}
  if(fields.jobTitle&&!isValidName(fields.jobTitle)){error.value=t('profile.invalidJob');return}
  auth.updateCurrentUserProfile({...fields,age:fields.age?Number(fields.age):null})
  editing.value=false;success.value=t('profile.saved')
}
const info=[['firstName','profile.firstNames'],['lastName','profile.lastNames'],['email','webAuth.email'],['phone','webAuth.phone'],['age','profile.age'],['city','profile.city'],['jobTitle','profile.jobTitle']]
</script>
<template>
  <section class="page profile-page">
    <div class="page-hero compact"><ContextPageHeading :description="t('profile.description')" /></div>
<div class="profile-identity standalone-identity"><span class="avatar-large">{{user?.initials||'SA'}}</span><div><strong>{{user?.fullName}}</strong><small>@{{user?.username}}</small></div></div>
    <div class="grid-2 profile-grid">
      <article class="card"><div class="card-header"><div><p class="eyebrow">{{t('profile.personal')}}</p><h2>{{t('profile.details')}}</h2></div><div class="actions"><template v-if="editing"><button class="btn small primary" type="button" @click="save"><i class="pi pi-check"></i> {{t('profile.save')}}</button><button class="btn small" type="button" @click="cancel">{{t('profile.cancel')}}</button></template><button v-else class="btn small" type="button" @click="editing=true;success=''"><i class="pi pi-pencil"></i> {{t('profile.edit')}}</button></div></div>
      <div class="pair-grid"><div v-for="[key,label] in info" :key="key" class="pair-box"><span>{{t(label)}}</span><template v-if="editing"><input v-model.trim="fields[key]" class="input" :type="key==='email'?'email':key==='age'?'number':'text'" :min="key==='age'?1:undefined" :max="key==='age'?120:undefined" :maxlength="key==='phone'?15:70" /></template><strong v-else>{{user?.[key]||'—'}}</strong></div><div class="pair-box"><span>{{t('profile.username')}}</span><strong class="unbreakable">{{user?.username}}</strong><small>{{t('profile.immutable')}}</small></div><div class="pair-box"><span>{{t('profile.role')}}</span><strong>{{user?.position}}</strong></div></div><p v-if="error" class="validation-message" role="alert">{{error}}</p><p v-if="success" class="success-message" role="status">{{success}}</p></article>
      <div class="profile-side"><article class="card"><div class="card-header"><div><p class="eyebrow">{{t('profile.preferences')}}</p><h2>{{t('profile.settings')}}</h2></div></div><div class="item-list"><div class="list-row"><span><strong>{{t('profile.language')}}</strong><small>{{t('profile.languageHint')}}</small></span><span class="status-pill success">{{locale.toUpperCase()}}</span></div><div class="list-row"><span><strong>{{t('profile.notifications')}}</strong><small>{{t('profile.notificationsHint')}}</small></span><span class="status-pill success">{{t('profile.enabled')}}</span></div></div></article><article class="card"><div class="card-header"><div><p class="eyebrow">{{t('billing.title')}}</p><h2>{{t('billing.overview')}}</h2></div></div><div class="pair-grid"><div class="pair-box"><span>{{t('billing.plan')}}</span><strong>{{accountBilling?.plan||'—'}}</strong></div><div class="pair-box"><span>{{t('billing.status')}}</span><strong>{{accountBilling?.status||t('billing.noSubscription')}}</strong></div><div class="pair-box"><span>{{t('billing.nextRenewal')}}</span><strong>{{accountBilling?.renewalDate||'—'}}</strong></div><div class="pair-box"><span>{{t('billing.monthly')}}</span><strong>{{accountBilling?currency:'—'}}</strong></div></div><RouterLink class="btn primary billing-link" to="/subscriptionbilling/plans"><i class="pi pi-receipt"></i> {{t('billing.viewDetails')}}</RouterLink></article></div>
    </div>
  </section>
</template>
<style scoped>
.profile-identity{display:flex;align-items:center;gap:16px;min-width:0}.profile-identity strong,.profile-identity small{display:block;overflow-wrap:anywhere}.profile-identity strong{font-size:1.08rem}.profile-identity small{color:var(--muted)}.avatar-large{height:68px;width:68px;flex-shrink:0;display:grid;place-items:center;border-radius:23px;color:white;background:linear-gradient(135deg,var(--primary),var(--primary-blue));font-size:1.5rem;font-weight:900}.profile-grid{align-items:start}.profile-side{display:grid;gap:18px}.pair-box{min-width:0}.pair-box strong{overflow-wrap:anywhere;white-space:normal}.pair-box small{display:block;color:var(--muted);margin-top:6px;font-size:.75rem}.pair-box .input{margin-top:6px}.unbreakable{word-break:break-all}.validation-message{color:var(--danger);font-weight:800}.success-message{color:var(--success);font-weight:800}.billing-link{margin-top:18px;display:inline-flex}.card{min-width:0}
</style>

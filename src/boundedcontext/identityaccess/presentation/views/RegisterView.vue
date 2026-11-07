<script setup>
import { reactive, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../../application/stores/auth.store'
import AuthShell from '../components/AuthShell.vue'
const {t}=useI18n(),route=useRoute(),auth=useAuthStore()
const mode=ref(route.query.invite?'invitation':'company')
const form=reactive({firstName:'',lastName:'',phone:'',email:'',password:'',confirmPassword:'',companyName:'',ruc:'',segment:'laboratory',corporateEmail:'',invitationCode:String(route.query.invite||'')})
const showPassword=ref(false),submitted=ref(false),submitting=ref(false),errorKey=ref('')
async function create(){
  errorKey.value='';submitting.value=true
  try{
    const ok=mode.value==='company'?await auth.registerCompany(form):await auth.registerInvited(form)
    if(ok)submitted.value=true;else errorKey.value=auth.error
  }catch(error){console.error('Registration',error);errorKey.value='registrationError'}
  finally{submitting.value=false}
}
</script>
<template>
<AuthShell :simple="true" :title="t('webAuth.registerTitle')" :subtitle="t('multi.registerDescription')">
  <section v-if="submitted" class="registration-success" role="status"><i class="pi pi-check-circle success-icon"></i><h3>{{t('multi.registrationPending')}}</h3><p>{{t(mode==='company'?'multi.companyPending':'multi.employeePending')}}</p><span>{{t('webAuth.yourUsername')}}</span><strong class="assigned-username">{{auth.generatedUsername}}</strong><p>{{t('webAuth.keepUsername')}}</p><RouterLink class="auth-submit" to="/identityaccess/login">{{t('webAuth.signIn')}}</RouterLink></section>
  <template v-else>
    <div class="register-options" role="group" :aria-label="t('multi.registrationType')">
      <button :class="['option',mode==='company'?'selected':'']" type="button" @click="mode='company';errorKey=''" ><i class="pi pi-building"></i><strong>{{t('multi.registerCompany')}}</strong><small>{{t('multi.companyRegistrationHint')}}</small></button>
      <button :class="['option',mode==='invitation'?'selected':'']" type="button" @click="mode='invitation';errorKey=''" ><i class="pi pi-ticket"></i><strong>{{t('multi.haveInvitation')}}</strong><small>{{t('multi.invitationRegistrationHint')}}</small></button>
    </div>
    <form class="register-form" @submit.prevent="create">
      <h3>{{t(mode==='company'?'multi.companyData':'multi.invitationDetails')}}</h3>
      <div v-if="mode==='company'" class="registration-fields">
        <label class="full">{{t('multi.companyLegalName')}}<input v-model.trim="form.companyName" required maxlength="120"/></label>
        <label>RUC<input v-model.trim="form.ruc" required inputmode="numeric" pattern="[0-9]{11}" minlength="11" maxlength="11"/></label>
        <label>{{t('multi.segment')}}<select v-model="form.segment" required><option value="laboratory">{{t('multi.segmentLaboratory')}}</option><option value="pharmaceutical">{{t('multi.segmentPharmaceutical')}}</option></select></label>
        <label class="full">{{t('multi.corporateEmail')}}<input v-model.trim="form.corporateEmail" type="email" required maxlength="120" autocomplete="off"/></label>
      </div>
      <div v-else class="registration-fields"><label class="full">{{t('multi.invitationCode')}}<input v-model.trim="form.invitationCode" required maxlength="64" autocapitalize="characters"/></label></div>
      <h3>{{t('multi.personalData')}}</h3>
      <div class="registration-fields">
        <label>{{t('webAuth.firstNames')}}<input v-model.trim="form.firstName" type="text" autocomplete="given-name" maxlength="70" required/></label>
        <label>{{t('webAuth.lastNames')}}<input v-model.trim="form.lastName" type="text" autocomplete="family-name" maxlength="70" required/></label>
        <label>{{t('webAuth.phone')}}<input v-model.trim="form.phone" type="tel" inputmode="numeric" autocomplete="tel" maxlength="15" required/></label>
        <label>{{t('webAuth.email')}}<input v-model.trim="form.email" type="email" autocomplete="email" maxlength="120" required/></label>
        <label>{{t('webAuth.password')}}<input v-model="form.password" :type="showPassword?'text':'password'" autocomplete="new-password" minlength="10" required/></label>
        <label>{{t('webAuth.confirmPassword')}}<input v-model="form.confirmPassword" :type="showPassword?'text':'password'" autocomplete="new-password" minlength="10" required/></label>
      </div>
      <label class="toggle-password"><input v-model="showPassword" type="checkbox"/> {{t('webAuth.showPassword')}}</label>
      <p class="password-help">{{t('webAuth.passwordRules')}}</p>
      <p v-if="errorKey" class="registration-error" role="alert">{{t(`webAuth.${errorKey}`)===`webAuth.${errorKey}`?t(`multi.${errorKey}`):t(`webAuth.${errorKey}`)}}</p>
      <button class="auth-submit" type="submit" :disabled="submitting">{{t('multi.createAccount')}}</button>
      <p class="auth-switch">{{t('webAuth.haveAccount')}} <RouterLink to="/identityaccess/login">{{t('webAuth.signIn')}}</RouterLink></p>
    </form>
  </template>
</AuthShell>
</template>
<style scoped>
.register-options{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:25px}.option{min-width:0;display:grid;gap:6px;text-align:left;background:var(--surface-soft);color:var(--text);border:1px solid var(--border);border-radius:15px;padding:15px;cursor:pointer}.option.selected{border:2px solid var(--primary);background:color-mix(in srgb,var(--primary) 7%,var(--surface-card))}.option i{color:var(--primary);font-size:1.3rem}.option strong{font-size:.92rem}.option small{color:var(--muted);line-height:1.35}.register-form{display:grid;gap:14px}.register-form h3{font-size:1rem;color:var(--text);margin:8px 0 0}.registration-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.registration-fields .full{grid-column:1/-1}.registration-fields label{display:grid;gap:6px;min-width:0;color:var(--text);font-size:.87rem;font-weight:800}.registration-fields input,.registration-fields select{display:block;width:100%;min-width:0;min-height:43px;padding:10px 13px;border:1px solid var(--border);border-radius:12px;background:var(--surface-card);color:var(--text);font:inherit}.registration-fields input:focus,.registration-fields select:focus{outline:2px solid var(--primary)}.toggle-password{display:flex;gap:9px;align-items:center;color:var(--muted);font-size:.86rem}.password-help{color:var(--muted);font-size:.82rem;line-height:1.5;margin:0}.auth-submit{display:grid;place-items:center;min-height:47px;border:0;border-radius:12px;padding:12px;background:linear-gradient(130deg,var(--primary),var(--primary-blue));color:white;text-decoration:none;cursor:pointer;font:inherit;font-weight:850}.auth-switch{text-align:center;color:var(--muted);margin:0}.auth-switch a{color:var(--primary);font-weight:850}.registration-error{color:var(--danger);font-weight:750;margin:0}.registration-success{display:grid;gap:15px;text-align:center;color:var(--text)}.registration-success p{margin:0;color:var(--muted)}.success-icon{font-size:2.5rem;color:var(--success)}.assigned-username{color:var(--primary);font-size:1.6rem;overflow-wrap:anywhere}@media(max-width:570px){.registration-fields,.register-options{grid-template-columns:1fr}.registration-fields .full{grid-column:auto}}
</style>

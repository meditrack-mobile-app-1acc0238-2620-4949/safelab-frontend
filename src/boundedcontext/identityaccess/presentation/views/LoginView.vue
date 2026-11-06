<script setup>
import { ref, computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../../application/stores/auth.store'
import AuthShell from '../components/AuthShell.vue'
const route=useRoute(),router=useRouter(),auth=useAuthStore(),{t}=useI18n()
const identifier=ref(''),password=ref(''),showPassword=ref(false)
const errorText=computed(()=>auth.error?t(`webAuth.${auth.error}`):'')
async function signIn(){if(await auth.login(identifier.value,password.value))router.push(route.query.redirect||'/dashboardinsights/laboratory-dashboard')}
</script>
<template>
  <AuthShell :title="t('webAuth.welcome')" :subtitle="t('webAuth.loginIntro')">
    <form class="auth-form" @submit.prevent="signIn">
      <label>{{t('webAuth.identifier')}}<input v-model.trim="identifier" type="text" autocomplete="username" :placeholder="t('webAuth.identifierHint')" required /></label>
      <label>{{t('webAuth.password')}}<span class="password-wrap"><input v-model="password" :type="showPassword?'text':'password'" autocomplete="current-password" required :placeholder="t('webAuth.passwordHint')"/><button type="button" :aria-label="t('webAuth.showPassword')" @click="showPassword=!showPassword"><i :class="showPassword?'pi pi-eye-slash':'pi pi-eye'"></i></button></span></label>
      <p v-if="errorText" class="auth-error" role="alert">{{errorText}}</p>
      <RouterLink v-if="auth.shouldShowForgotPassword" class="auth-link" to="/identityaccess/forgot-password">{{t('webAuth.forgot')}}</RouterLink>
      <button class="auth-submit" type="submit" :disabled="auth.loading">{{t('webAuth.signIn')}}</button>
      <p class="auth-switch">{{t('webAuth.newHere')}} <RouterLink to="/identityaccess/register">{{t('webAuth.createAccount')}}</RouterLink></p>
    </form>
  </AuthShell>
</template>
<style scoped>
.auth-form{display:grid;gap:20px}.auth-form label{font-weight:800;color:var(--text);display:grid;gap:8px}.auth-form input{width:100%;min-height:49px;background:var(--surface-card);border:1px solid var(--border);border-radius:14px;padding:12px 15px;color:var(--text);font:inherit}.auth-form input:focus{outline:3px solid color-mix(in srgb,var(--primary) 20%,transparent);border-color:var(--primary)}.password-wrap{position:relative;display:flex}.password-wrap input{padding-right:55px}.password-wrap button{position:absolute;right:4px;top:4px;height:calc(100% - 8px);width:42px;cursor:pointer;border:0;background:transparent;color:var(--muted)}.auth-submit{background:linear-gradient(130deg,var(--primary),var(--primary-blue));color:white;min-height:50px;border:0;border-radius:14px;font:inherit;font-weight:900;cursor:pointer}.auth-switch{text-align:center;color:var(--muted);font-weight:600;margin:0}.auth-switch a,.auth-link{color:var(--primary);font-weight:900;text-decoration:none}.auth-link{text-align:right}.auth-error{background:color-mix(in srgb,var(--danger) 12%,var(--surface-card));border:1px solid color-mix(in srgb,var(--danger) 25%,transparent);color:var(--danger);border-radius:12px;padding:12px;margin:0}
</style>

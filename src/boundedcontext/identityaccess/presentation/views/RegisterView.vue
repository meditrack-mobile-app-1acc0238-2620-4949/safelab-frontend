<script setup>
import { reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../../application/stores/auth.store'
import AuthShell from '../components/AuthShell.vue'

// The registration form is independent of the login session and can always render.
// IAM is accessed only when the user submits the form.
const { t } = useI18n()
const form = reactive({
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  password: '',
  confirmPassword: ''
})
const showPassword = ref(false)
const isSubmitting = ref(false)
const assignedUsername = ref('')
const errorKey = ref('')

async function registerAccount() {
  if (isSubmitting.value) return
  errorKey.value = ''
  isSubmitting.value = true

  try {
    const auth = useAuthStore()
    const created = await auth.register({ ...form })
    if (created && auth.generatedUsername) {
      assignedUsername.value = auth.generatedUsername
    } else {
      errorKey.value = auth.error || 'registrationError'
    }
  } catch (error) {
    console.error('[SafeLab] Registration failed:', error)
    errorKey.value = 'registrationError'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <AuthShell :simple="true" :title="t('webAuth.registerTitle')" :subtitle="t('webAuth.registerIntro')">
    <section v-if="assignedUsername" class="registration-success" role="status">
      <i class="pi pi-check-circle success-icon" aria-hidden="true"></i>
      <h3>{{ t('webAuth.accountPending') }}</h3>
      <p>{{ t('webAuth.pendingDescription') }}</p>
      <span>{{ t('webAuth.yourUsername') }}</span>
      <strong class="assigned-username">{{ assignedUsername }}</strong>
      <p>{{ t('webAuth.keepUsername') }}</p>
      <RouterLink class="auth-submit" to="/identityaccess/login">{{ t('webAuth.signIn') }}</RouterLink>
    </section>

    <form v-else class="register-form" @submit.prevent="registerAccount">
      <div class="registration-fields">
        <label for="registration-first-name">
          {{ t('webAuth.firstNames') }}
          <input id="registration-first-name" v-model.trim="form.firstName" type="text" autocomplete="given-name" maxlength="70" required />
        </label>
        <label for="registration-last-name">
          {{ t('webAuth.lastNames') }}
          <input id="registration-last-name" v-model.trim="form.lastName" type="text" autocomplete="family-name" maxlength="70" required />
        </label>
        <label for="registration-phone">
          {{ t('webAuth.phone') }}
          <input id="registration-phone" v-model.trim="form.phone" type="tel" autocomplete="tel" inputmode="numeric" maxlength="15" required />
        </label>
        <label for="registration-email">
          {{ t('webAuth.email') }}
          <input id="registration-email" v-model.trim="form.email" type="email" autocomplete="email" maxlength="120" required />
        </label>
        <label for="registration-password">
          {{ t('webAuth.password') }}
          <input id="registration-password" v-model="form.password" :type="showPassword ? 'text' : 'password'" autocomplete="new-password" minlength="10" required />
        </label>
        <label for="registration-confirm">
          {{ t('webAuth.confirmPassword') }}
          <input id="registration-confirm" v-model="form.confirmPassword" :type="showPassword ? 'text' : 'password'" autocomplete="new-password" minlength="10" required />
        </label>
      </div>

      <label class="toggle-password">
        <input v-model="showPassword" type="checkbox" />
        {{ t('webAuth.showPassword') }}
      </label>
      <p class="password-help">{{ t('webAuth.passwordRules') }}</p>
      <p v-if="errorKey" class="registration-error" role="alert">{{ t(`webAuth.${errorKey}`) }}</p>
      <button class="auth-submit" type="submit" :disabled="isSubmitting">
        {{ t('webAuth.createAccount') }}
      </button>
      <p class="auth-switch">
        {{ t('webAuth.haveAccount') }}
        <RouterLink to="/identityaccess/login">{{ t('webAuth.signIn') }}</RouterLink>
      </p>
    </form>
  </AuthShell>
</template>

<style scoped>
.register-form { display: grid; gap: 16px; }
.registration-fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 15px; }
.registration-fields label { display: grid; gap: 7px; min-width: 0; font-weight: 800; color: var(--text); }
.registration-fields input { display: block; width: 100%; min-width: 0; min-height: 44px; padding: 11px 14px; border: 1px solid var(--border); border-radius: 13px; background: var(--surface-card); color: var(--text); font: inherit; }
.registration-fields input:focus { border-color: var(--primary); outline: 3px solid color-mix(in srgb, var(--primary) 22%, transparent); }
.toggle-password { display: flex; gap: 9px; align-items: center; color: var(--muted); font-size: .91rem; }
.password-help { margin: 0; color: var(--muted); font-size: .86rem; line-height: 1.5; }
.auth-submit { min-height: 48px; display: grid; place-items: center; padding: 12px; color: #fff; background: linear-gradient(135deg, var(--primary), var(--primary-blue)); border: 0; border-radius: 13px; font-weight: 850; text-align: center; text-decoration: none; cursor: pointer; }
.auth-submit:disabled { opacity: .6; cursor: wait; }
.auth-switch { margin: 0; text-align: center; color: var(--muted); }
.auth-switch a { color: var(--primary); font-weight: 850; }
.registration-error { margin: 0; color: var(--danger); font-weight: 750; }
.registration-success { display: grid; gap: 15px; text-align: center; color: var(--text); }
.registration-success h3, .registration-success p { margin: 0; }
.registration-success p { color: var(--muted); line-height: 1.6; }
.success-icon { color: var(--success); font-size: 2.3rem; }
.assigned-username { font-size: 1.55rem; color: var(--primary); overflow-wrap: anywhere; }
@media (max-width: 600px) { .registration-fields { grid-template-columns: 1fr; } }
</style>

<script setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '../../application/stores/auth.store'
import AuthShell from '../components/AuthShell.vue'

const authStore = useAuthStore()
const email = ref('')
const submitted = ref(false)

const recoveryLink = computed(() => {
  if (!authStore.recoveryCode) return ''

  return `/identity-access/reset-password?token=${authStore.recoveryCode}`
})

const sendRecovery = async () => {
  const success = await authStore.requestPasswordRecovery(email.value)

  if (success) {
    submitted.value = true
  }
}
</script>

<template>
  <AuthShell
      title="Recover access"
      subtitle="Enter your registered email to simulate a password recovery request."
  >
    <form v-if="!submitted" class="auth-form" @submit.prevent="sendRecovery">
      <label>
        Registered email
        <input
            v-model.trim="email"
            type="email"
            placeholder="admin@safelab.com"
            required
        />
      </label>

      <p v-if="authStore.error" class="error-message">
        {{ authStore.error }}
      </p>

      <button type="submit" :disabled="authStore.loading">
        {{ authStore.loading ? 'Sending...' : 'Send recovery code' }}
      </button>

      <p class="auth-switch">
        Remembered your password?
        <RouterLink to="/identity-access/login">
          Back to login
        </RouterLink>
      </p>
    </form>

    <section v-else class="success-card">
      <span class="success-icon">
        <i class="pi pi-check"></i>
      </span>

      <h3>Recovery email sent</h3>

      <p>
        A simulated recovery code was sent to your registered email.
      </p>

      <div class="code-box">
        <span>Recovery code</span>
        <strong>{{ authStore.recoveryCode }}</strong>
      </div>

      <div class="code-box">
        <span>Simulated reset link</span>
        <strong>{{ recoveryLink }}</strong>
      </div>

      <RouterLink class="primary-link" to="/identity-access/login">
        Back to login
      </RouterLink>
    </section>
  </AuthShell>
</template>

<style scoped>
.auth-form,
.success-card {
  display: grid;
  gap: 1rem;
}

label {
  display: grid;
  gap: 0.45rem;
  color: #0f172a;
  font-weight: 800;
}

input {
  min-height: 44px;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 0.7rem 0.85rem;
  font: inherit;
}

button,
.primary-link {
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 14px;
  background: #4f46e5;
  color: #ffffff;
  cursor: pointer;
  font-weight: 900;
  min-height: 46px;
  text-decoration: none;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.error-message {
  margin: 0;
  padding: 0.85rem;
  border-radius: 12px;
  background: #fee2e2;
  color: #991b1b;
  font-weight: 700;
}

.auth-switch {
  text-align: center;
  color: #64748b;
  font-weight: 600;
}

.auth-switch a {
  color: #4f46e5;
  font-weight: 900;
  text-decoration: none;
}

.success-icon {
  display: grid;
  place-items: center;
  width: 58px;
  height: 58px;
  border-radius: 20px;
  color: #047857;
  background: #d1fae5;
  font-size: 1.4rem;
}

.success-card h3 {
  margin: 0;
  color: #0f172a;
  font-size: 1.5rem;
}

.success-card p {
  margin: 0;
  color: #64748b;
  font-weight: 600;
}

.code-box {
  display: grid;
  gap: 0.25rem;
  padding: 1rem;
  border-radius: 16px;
  background: #f8fafc;
}

.code-box span {
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 900;
  text-transform: uppercase;
}

.code-box strong {
  color: #0f172a;
  word-break: break-all;
}
</style>
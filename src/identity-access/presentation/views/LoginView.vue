<script setup>
import { ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../application/stores/auth.store'
import AuthShell from '../components/AuthShell.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const identifier = ref('')
const password = ref('')

const login = async () => {
  const success = await authStore.login(identifier.value, password.value)

  if (success) {
    router.push(route.query.redirect || '/dashboard-overview/laboratory-dashboard')
  }
}
</script>

<template>
  <AuthShell
      title="Welcome back"
      subtitle="Sign in with your username or email to access the monitoring workspace."
  >
    <form class="auth-form" @submit.prevent="login">
      <label>
        Username or email
        <input
            v-model.trim="identifier"
            type="text"
            placeholder="admin@safelab.com"
            required
        />
      </label>

      <label>
        Password
        <input
            v-model="password"
            type="password"
            placeholder="Enter your password"
            required
        />
      </label>

      <p v-if="authStore.error" class="error-message">
        {{ authStore.error }}
      </p>

      <RouterLink
          v-if="authStore.shouldShowForgotPassword"
          class="forgot-link"
          to="/identity-access/forgot-password"
      >
        Forgot your password?
      </RouterLink>

      <button type="submit" :disabled="authStore.loading">
        {{ authStore.loading ? 'Signing in...' : 'Sign in' }}
      </button>

      <p class="auth-switch">
        New to SafeLab?
        <RouterLink to="/identity-access/register">
          Create an account
        </RouterLink>
      </p>
    </form>
  </AuthShell>
</template>

<style scoped>
.auth-form {
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

input:focus {
  outline: 2px solid rgba(79, 70, 229, 0.25);
  border-color: #4f46e5;
}

button {
  border: 0;
  border-radius: 14px;
  background: #4f46e5;
  color: #ffffff;
  cursor: pointer;
  font-weight: 900;
  min-height: 46px;
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

.forgot-link {
  color: #4f46e5;
  font-weight: 900;
  text-align: right;
  text-decoration: none;
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
</style>
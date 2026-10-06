<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../../application/stores/auth.store'
import { registerRoleOptions } from '../../domain/models/role-access.config'
import AuthShell from '../components/AuthShell.vue'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  role: 'bioclinicalCoordinator',
  timezone: 'America/Lima'
})

const validationError = ref('')

const roleOptions = registerRoleOptions
const validateForm = () => {
  validationError.value = ''

  if (!form.value.firstName || !form.value.lastName || !form.value.username || !form.value.email) {
    validationError.value = 'Please complete all required personal fields.'
    return false
  }

  if (!form.value.password || form.value.password.length < 6) {
    validationError.value = 'Password must have at least 6 characters.'
    return false
  }

  if (form.value.password !== form.value.confirmPassword) {
    validationError.value = 'Passwords do not match.'
    return false
  }

  return true
}

const register = async () => {
  if (!validateForm()) return

  const success = await authStore.register(form.value)

  if (success) {
    router.push('/dashboard-overview/laboratory-dashboard')
  }
}
</script>

<template>
  <AuthShell
      title="Create your SafeLab account"
      subtitle="Register your access profile and continue to the monitoring workspace."
  >
    <form class="register-form" @submit.prevent="register">
      <div class="form-grid">
        <label>
          First name
          <input v-model.trim="form.firstName" type="text" required />
        </label>

        <label>
          Last name
          <input v-model.trim="form.lastName" type="text" required />
        </label>

        <label>
          Username
          <input v-model.trim="form.username" type="text" required />
        </label>

        <label>
          Email
          <input v-model.trim="form.email" type="email" required />
        </label>

        <label>
          Phone
          <input v-model.trim="form.phone" type="text" />
        </label>

        <label>
          Role
          <select v-model="form.role">
            <option
                v-for="role in roleOptions"
                :key="role.value"
                :value="role.value"
            >
              {{ role.label }}
            </option>
          </select>
        </label>

        <label>
          Timezone
          <select v-model="form.timezone">
            <option value="America/Lima">America/Lima</option>
            <option value="America/Bogota">America/Bogota</option>
            <option value="America/Mexico_City">America/Mexico City</option>
          </select>
        </label>

        <label>
          Password
          <input v-model="form.password" type="password" required />
        </label>

        <label class="full-row">
          Confirm password
          <input v-model="form.confirmPassword" type="password" required />
        </label>
      </div>

      <p v-if="validationError" class="error-message">
        {{ validationError }}
      </p>

      <p v-if="authStore.error" class="error-message">
        {{ authStore.error }}
      </p>

      <button type="submit" :disabled="authStore.loading">
        {{ authStore.loading ? 'Creating account...' : 'Create account' }}
      </button>

      <p class="auth-switch">
        Already have an account?
        <RouterLink to="/identity-access/login">
          Sign in
        </RouterLink>
      </p>
    </form>
  </AuthShell>
</template>

<style scoped>
.register-form {
  display: grid;
  gap: 1rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
}

label {
  min-width: 0;
  display: grid;
  gap: 0.4rem;
  color: #0f172a;
  font-weight: 800;
}

.full-row {
  grid-column: 1 / -1;
}

input,
select {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  min-height: 42px;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 0.65rem 0.8rem;
  font: inherit;
  background: #ffffff;
}

input:focus,
select:focus {
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

.auth-switch {
  margin: 0;
  text-align: center;
  color: #64748b;
  font-weight: 600;
}

.auth-switch a {
  color: #4f46e5;
  font-weight: 900;
  text-decoration: none;
}

@media (max-width: 720px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .full-row {
    grid-column: auto;
  }
}
</style>
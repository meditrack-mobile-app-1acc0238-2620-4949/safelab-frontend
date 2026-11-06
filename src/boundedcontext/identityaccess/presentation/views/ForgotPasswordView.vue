<script setup>
import { useI18n } from 'vue-i18n'
import AuthShell from '../components/AuthShell.vue'
const { t } = useI18n()
</script>
<template>
  <AuthShell simple :title="t('webAuth.forgot')" :subtitle="t('webAuth.recoveryDemo')">
    <RouterLink class="btn primary" to="/identityaccess/login">{{t('webAuth.signIn')}}</RouterLink>
  </AuthShell>
</template>

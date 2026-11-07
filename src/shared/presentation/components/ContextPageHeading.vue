<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { boundedContextNavigation } from '@/shared/domain/model/navigation-items'

// A single navigation catalog determines both the sidebar and the page title.
const props = defineProps({ description: { type: String, default: '' } })
const route = useRoute()
const { t } = useI18n()
const titleKey = computed(() => {
  const context = route.meta.sidebarContext || route.path.split('/')[1]
  const item = boundedContextNavigation.find((entry) => entry.context === context)
  if (item) return item.titleKey
  if (context === 'userprofiles') return 'sidebar.profile'
  if (context === 'subscriptionbilling') return 'sidebar.billing'
  if (context === 'userpermissions') return 'multi.usersTitle'
  if (context === 'platform') return 'multi.platform_overview'
  return route.meta.titleKey || 'sidebar.dashboard'
})
</script>

<template>
  <div class="context-page-heading">
    <h1>{{ t(titleKey) }}</h1>
    <p v-if="description">{{ description }}</p>
  </div>
</template>

<style scoped>
.context-page-heading { min-width: 0; max-width: 980px; }
.context-page-heading h1 { margin: 0 0 9px; line-height: 1.12; overflow-wrap: break-word; }
.context-page-heading p { margin: 0; color: var(--muted); line-height: 1.55; max-width: 850px; }
</style>

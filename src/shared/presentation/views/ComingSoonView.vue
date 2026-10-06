<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const { t } = useI18n()

const contextKey = computed(() => route.meta.contextKey)
const viewKey = computed(() => route.meta.viewKey)
const title = computed(() => viewKey.value ? t(`menu.${viewKey.value}`) : t(`contextLabels.${contextKey.value}`))
const contextTitle = computed(() => t(`contextLabels.${contextKey.value}`))
</script>

<template>
  <section class="coming-soon">
    <div class="coming-soon-card">
      <div class="work-emoji" aria-hidden="true">🚧</div>
      <p class="eyebrow">{{ contextTitle }}</p>
      <h1>{{ title }}</h1>
      <span class="status-pill">{{ t('status.inDevelopment') }}</span>
      <p>{{ t('status.comingSoon') }}</p>
      <p class="muted">{{ t('status.templateNote') }}</p>
    </div>
  </section>
</template>

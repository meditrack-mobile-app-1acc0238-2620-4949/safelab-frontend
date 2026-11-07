<script setup>
import LocalizedStatusBadge from '@/shared/presentation/components/LocalizedStatusBadge.vue'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSafeLabDemoStore } from '@/shared/application/stores/demo.store'
const route = useRoute(); const router = useRouter(); const demo = useSafeLabDemoStore()
const alert = computed(() => demo.alerts.find((item) => item.id === route.params.id) || demo.alerts[0])
</script>
<template><section class="page"><button class="btn" @click="router.back()"><i class="pi pi-arrow-left"></i> {{ $t('legacy.label_b52b36b726') }}</button><article class="card" v-if="alert"><div class="card-header"><div><p class="eyebrow">{{ $t('legacy.label_9da05ba303') }}</p><h1>{{ alert.title }}</h1><p>{{ alert.message }}</p></div><LocalizedStatusBadge :status="alert.status" context="alerts"/></div><div class="pair-grid"><div class="pair-box"><span>{{ $t('legacy.label_3deb745651') }}</span><strong>{{ alert.type }}</strong></div><div class="pair-box"><span>{{ $t('legacy.label_de314fa0c9') }}</span><LocalizedStatusBadge :status="alert.severity"/></div><div class="pair-box"><span>{{ $t('legacy.label_bb2279f04d') }}</span><strong>{{ alert.assignedTo }}</strong></div><div class="pair-box"><span>{{ $t('legacy.label_accf40c89b') }}</span><strong>{{ new Date(alert.createdAt).toLocaleString() }}</strong></div></div><div class="modal-footer"><button class="btn" @click="demo.acknowledgeAlert(alert.id)">{{ $t('legacy.label_9beb96dac8') }}</button><button class="btn success" @click="demo.resolveAlert(alert.id)">{{ $t('legacy.label_ac7f958cc0') }}</button><button class="btn danger" @click="demo.escalateAlert(alert.id)">{{ $t('legacy.label_012bb11a52') }}</button></div></article></section></template>

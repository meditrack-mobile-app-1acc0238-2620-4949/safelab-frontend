<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSafeLabDemoStore } from '@/shared/application/stores/demo.store'
const route = useRoute(); const router = useRouter(); const demo = useSafeLabDemoStore()
const alert = computed(() => demo.alerts.find((item) => item.id === route.params.id) || demo.alerts[0])
</script>
<template><section class="page"><button class="btn" @click="router.back()"><i class="pi pi-arrow-left"></i> Back</button><article class="card" v-if="alert"><div class="card-header"><div><p class="eyebrow">Alert detail</p><h1>{{ alert.title }}</h1><p>{{ alert.message }}</p></div><span :class="['status-pill', alert.status]">{{ alert.status }}</span></div><div class="pair-grid"><div class="pair-box"><span>Type</span><strong>{{ alert.type }}</strong></div><div class="pair-box"><span>Severity</span><strong>{{ alert.severity }}</strong></div><div class="pair-box"><span>Assigned to</span><strong>{{ alert.assignedTo }}</strong></div><div class="pair-box"><span>Created</span><strong>{{ new Date(alert.createdAt).toLocaleString() }}</strong></div></div><div class="modal-footer"><button class="btn" @click="demo.acknowledgeAlert(alert.id)">Acknowledge</button><button class="btn success" @click="demo.resolveAlert(alert.id)">Resolve</button><button class="btn danger" @click="demo.escalateAlert(alert.id)">Escalate</button></div></article></section></template>

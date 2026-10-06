<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSafeLabDemoStore } from '@/shared/application/stores/demo.store'
const route = useRoute(); const router = useRouter(); const demo = useSafeLabDemoStore()
const incident = computed(() => demo.incidents.find((item) => item.id === route.params.id) || demo.incidents[0])
</script>
<template><section class="page"><button class="btn" @click="router.back()">Back</button><article v-if="incident" class="card" style="max-width:760px;margin:auto;"><p class="eyebrow">SafeLab incident report</p><h1>{{ incident.title }}</h1><div class="pair-grid"><div class="pair-box"><span>Severity</span><strong>{{ incident.severity }}</strong></div><div class="pair-box"><span>Status</span><strong>{{ incident.status }}</strong></div><div class="pair-box"><span>Affected area</span><strong>{{ incident.facilityId }}</strong></div><div class="pair-box"><span>Assigned to</span><strong>{{ incident.assignedTo }}</strong></div></div><hr style="border:0;border-top:1px solid var(--border);margin:22px 0"><h2>Summary</h2><p>{{ incident.description }}</p><h2>Traceability</h2><p>Created at {{ new Date(incident.createdAt).toLocaleString() }}. Last updated at {{ new Date(incident.updatedAt).toLocaleString() }}.</p><button class="btn primary" @click="demo.generateReport('Incident', incident.title + ' report')">Generate PDF simulation</button></article></section></template>

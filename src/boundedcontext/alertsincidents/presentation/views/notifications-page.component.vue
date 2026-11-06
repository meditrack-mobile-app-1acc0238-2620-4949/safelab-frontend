<script setup>
import ContextPageHeading from '@/shared/presentation/components/ContextPageHeading.vue'
import { useSafeLabDemoStore } from '@/shared/application/stores/demo.store'
const demo = useSafeLabDemoStore()
</script>
<template><section class="page"><div class="page-hero compact"><ContextPageHeading :description="$t('legacy.label_8d15900b37')" /></div>
<div class="page-toolbar"><button class="btn" @click="demo.markAllNotificationsRead()">{{ $t('legacy.label_8958e22c23') }}</button></div><article class="card"><div class="item-list"><article v-for="n in demo.notifications" :key="n.id" class="list-row compact"><span><strong>{{ n.title }}</strong><small>{{ n.message }} · {{ new Date(n.createdAt).toLocaleString() }}</small></span><span :class="['status-pill', n.severity]">{{ n.severity }}</span><span :class="['status-pill', n.unread ? 'warning' : 'success']">{{ n.unread ? 'unread' : 'read' }}</span></article></div></article></section></template>

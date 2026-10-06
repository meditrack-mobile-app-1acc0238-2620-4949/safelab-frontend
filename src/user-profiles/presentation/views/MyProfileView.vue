<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/identity-access/application/stores/auth.store'
import { useSafeLabDemoStore } from '@/shared/application/stores/demo.store'
const auth = useAuthStore(); const demo = useSafeLabDemoStore(); auth.restoreSession()
const user = computed(() => auth.currentUser)
const billing = computed(() => demo.billing)
</script>
<template>
  <section class="page">
    <div class="page-hero compact"><div><p class="eyebrow">User profile</p><h1>{{ user?.fullName }}</h1><p>{{ user?.position }} · {{ user?.facilityName }}</p></div><div class="hero-score"><span>Role scope</span><strong>{{ user?.allowedContexts?.length || 0 }}</strong><small>Available modules</small></div></div>
    <div class="grid-2"><article class="card"><div class="card-header"><div><p class="eyebrow">Personal information</p><h2>Account details</h2></div></div><div class="pair-grid"><div class="pair-box"><span>Email</span><strong>{{ user?.email }}</strong></div><div class="pair-box"><span>Phone</span><strong>{{ user?.phone || '—' }}</strong></div><div class="pair-box"><span>Organization</span><strong>{{ user?.organization }}</strong></div><div class="pair-box"><span>Timezone</span><strong>{{ user?.timezone }}</strong></div></div></article><article class="card"><div class="card-header"><div><p class="eyebrow">Preferences</p><h2>Interface settings</h2></div></div><div class="item-list"><div class="list-row"><span><strong>Language</strong><small>Configured from topbar switch.</small></span><span class="status-pill success">Enabled</span></div><div class="list-row"><span><strong>Notifications</strong><small>Critical alerts and daily summaries.</small></span><span class="status-pill warning">Active</span></div></div></article></div>
    <article class="card"><div class="card-header"><div><p class="eyebrow">Billing & plans</p><h2>Subscription summary</h2><p>Billing is shown inside the profile because the user can review but cannot self-upgrade without support approval.</p></div><RouterLink class="btn" to="/subscription-billing/plans">Open billing detail</RouterLink></div><div class="grid-4"><div class="pair-box"><span>Current plan</span><strong>{{ billing.plan }}</strong></div><div class="pair-box"><span>Status</span><strong>{{ billing.status }}</strong></div><div class="pair-box"><span>Renewal date</span><strong>{{ billing.renewalDate }}</strong></div><div class="pair-box"><span>Monthly cost</span><strong>${{ billing.monthlyCost }}</strong></div></div><div class="progress" style="margin-top:16px"><i :style="{width: `${Math.round((billing.deviceUsage / billing.deviceLimit) * 100)}%`}"></i></div><p style="margin-top:10px">{{ billing.deviceUsage }} / {{ billing.deviceLimit }} monitored devices</p></article>
  </section>
</template>

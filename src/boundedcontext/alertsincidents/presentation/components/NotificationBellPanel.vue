<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/boundedcontext/alertsincidents/application/stores/notification.store'
const router = useRouter(); const store = useNotificationStore()
const notifications = computed(() => store.notifications.slice(0, 6))
function open(notification){ store.markAsRead(notification.id); router.push(notification.context === 'alertsincidents' ? '/alertsincidents/incident-list' : notification.context === 'remoteactuation' ? '/remoteactuation/remoteactuation-panel' : '/alertsincidents/active-alerts') }
</script>
<template>
  <section class="notification-panel">
    <header><div><strong>{{ $t('legacy.label_b3c964996f') }}</strong><small class="text-muted">{{ store.unreadCount }} unread</small></div><button class="btn small" @click="store.markAllAsRead()">{{ $t('legacy.label_3bf98fa618') }}</button></header>
    <ul><li v-for="n in notifications" :key="n.id"><span :class="['dot', n.severity]"></span><button class="btn ghost" style="justify-content:flex-start;text-align:left;padding:0;box-shadow:none" @click="open(n)"><span><strong>{{ n.title }}</strong><small class="text-muted">{{ n.message }} · {{ n.context }}</small></span></button><i v-if="!n.unread" class="pi pi-check status-pill success"></i></li></ul>
    <footer><RouterLink class="btn primary" to="/alertsincidents/notification-history">{{ $t('legacy.label_61d4c4521e') }}</RouterLink></footer>
  </section>
</template>

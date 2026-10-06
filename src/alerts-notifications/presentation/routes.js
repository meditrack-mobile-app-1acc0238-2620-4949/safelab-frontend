import AlertsPage from './views/alerts-page.component.vue'
import AlertDetailPage from './views/alert-detail-page.component.vue'
import NotificationsPage from './views/notifications-page.component.vue'
import DeliveryRulesPage from './views/delivery-rules-page.component.vue'
import ComingSoonView from '@/shared/presentation/views/ComingSoonView.vue'

export const routes = [
    {
        path: 'alerts-notifications',
        name: 'alerts-notifications',
        component: AlertsPage,
        meta: {
            titleKey: 'contextLabels.alerts',
            contextKey: 'alerts',
            sidebarContext: 'alerts-notifications'
        }
    },
    {
        path: 'alerts-notifications/active-alerts',
        name: 'alerts-notifications-active-alerts',
        component: AlertsPage,
        meta: {
            titleKey: 'menu.alerts.ActiveAlerts',
            contextKey: 'alerts',
            viewKey: 'alerts.ActiveAlerts',
            sidebarContext: 'alerts-notifications'
        }
    },
    {
        path: 'alerts-notifications/alert-detail/:id',
        name: 'alerts-notifications-alert-detail',
        component: AlertDetailPage,
        props: true,
        meta: {
            titleKey: 'menu.alerts.AlertDetail',
            contextKey: 'alerts',
            viewKey: 'alerts.AlertDetail',
            sidebarContext: 'alerts-notifications'
        }
    },
    {
        path: 'alerts-notifications/alert-history',
        name: 'alerts-notifications-alert-history',
        component: ComingSoonView,
        meta: {
            title: 'Alert History',
            contextKey: 'alerts',
            viewKey: 'alerts.AlertHistory',
            sidebarContext: 'alerts-notifications'
        }
    },
    {
        path: 'alerts-notifications/critical-alerts',
        name: 'alerts-notifications-critical-alerts',
        component: AlertsPage,
        meta: {
            titleKey: 'menu.alerts.CriticalAlerts',
            contextKey: 'alerts',
            viewKey: 'alerts.CriticalAlerts',
            sidebarContext: 'alerts-notifications'
        }
    },

    /*
     * Notification routes belong to the topbar bell.
     * They should not activate the Alerts item in the sidebar.
     */
    {
        path: 'alerts-notifications/notification-history',
        name: 'alerts-notifications-notification-history',
        component: NotificationsPage,
        meta: {
            titleKey: 'menu.alerts.NotificationHistory',
            contextKey: 'notifications',
            viewKey: 'notifications.NotificationHistory',
            hideSidebarActive: true,
            topbarContext: 'notifications'
        }
    },
    {
        path: 'alerts-notifications/notification-settings',
        name: 'alerts-notifications-notification-settings',
        component: DeliveryRulesPage,
        meta: {
            titleKey: 'menu.alerts.NotificationSettings',
            contextKey: 'notifications',
            viewKey: 'notifications.NotificationSettings',
            hideSidebarActive: true,
            topbarContext: 'notifications'
        }
    },

    {
        path: 'alerts-notifications/recipient-management',
        name: 'alerts-notifications-recipient-management',
        component: ComingSoonView,
        meta: {
            titleKey: 'menu.alerts.RecipientManagement',
            contextKey: 'notifications',
            viewKey: 'notifications.RecipientManagement',
            hideSidebarActive: true,
            topbarContext: 'notifications'
        }
    },
    {
        path: 'alerts-notifications/escalation-policy',
        name: 'alerts-notifications-escalation-policy',
        component: ComingSoonView,
        meta: {
            titleKey: 'menu.alerts.EscalationPolicy',
            contextKey: 'alerts',
            viewKey: 'alerts.EscalationPolicy',
            sidebarContext: 'alerts-notifications'
        }
    }
]
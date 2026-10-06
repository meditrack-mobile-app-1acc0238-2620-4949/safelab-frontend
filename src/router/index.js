import { createRouter, createWebHistory } from 'vue-router'
import AppShell from '@/shared/presentation/layouts/AppShell.vue'
import HomeView from '@/shared/presentation/views/HomeView.vue'
import { useAuthStore } from '@/identity-access/application/stores/auth.store'

import { routes as IdentityAccessRoutes } from '@/identity-access/presentation/routes'
import { routes as UserProfilesRoutes } from '@/user-profiles/presentation/routes'
import { routes as SubscriptionBillingRoutes } from '@/subscription-billing/presentation/routes'
import { routes as DashboardOverviewRoutes } from '@/dashboard-overview/presentation/routes'
import { routes as AssetInventoryRoutes } from '@/asset-inventory/presentation/routes'
import { routes as SensorMonitoringRoutes } from '@/sensor-monitoring/presentation/routes'
import { routes as EnvironmentalComplianceRoutes } from '@/environmental-compliance/presentation/routes'
import { routes as AlertsNotificationsRoutes } from '@/alerts-notifications/presentation/routes'
import { routes as RemoteControlRoutes } from '@/remote-control/presentation/routes'
import { routes as ReportsAnalyticsRoutes } from '@/reports-analytics/presentation/routes'
import { routes as IncidentManagementRoutes } from '@/incident-management/presentation/routes'
import { routes as AuditTraceabilityRoutes } from '@/audit-traceability/presentation/routes'

const routes = [
    ...IdentityAccessRoutes,

    {
        path: '/',
        component: AppShell,
        children: [
            {
                path: '',
                name: 'home',
                component: HomeView,
                meta: { title: 'Home', contextKey: 'home' }
            },
            ...UserProfilesRoutes,
            ...SubscriptionBillingRoutes,
            ...DashboardOverviewRoutes,
            ...AssetInventoryRoutes,
            ...SensorMonitoringRoutes,
            ...EnvironmentalComplianceRoutes,
            ...AlertsNotificationsRoutes,
            ...RemoteControlRoutes,
            ...ReportsAnalyticsRoutes,
            ...IncidentManagementRoutes,
            ...AuditTraceabilityRoutes
        ]
    },

    {
        path: '/:pathMatch(.*)*',
        redirect: '/'
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior() {
        return { top: 0 }
    }
})

router.beforeEach((to) => {
    const authStore = useAuthStore()

    authStore.restoreSession()

    const isPublicRoute = to.meta.public === true
    const isAuthenticated = authStore.isAuthenticated
    const protectedContext = to.meta.sidebarContext

    if (!isPublicRoute && !isAuthenticated) {
        return {
            path: '/identity-access/login',
            query: {
                redirect: to.fullPath
            }
        }
    }

    if (isPublicRoute && isAuthenticated) {
        return '/dashboard-overview/laboratory-dashboard'
    }

    if (
        isAuthenticated &&
        protectedContext &&
        !authStore.canAccessContext(protectedContext)
    ) {
        return '/dashboard-overview/laboratory-dashboard'
    }

    return true
})

export default router
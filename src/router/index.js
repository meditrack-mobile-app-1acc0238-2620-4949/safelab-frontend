import { createRouter, createWebHistory } from 'vue-router'
import AppShell from '@/shared/presentation/layouts/AppShell.vue'
import { useAuthStore } from '@/boundedcontext/identityaccess/application/stores/auth.store'

import { routes as IdentityAccessRoutes } from '@/boundedcontext/identityaccess/presentation/routes'
import { routes as UserProfilesRoutes } from '@/boundedcontext/userprofiles/presentation/routes'
import { routes as SubscriptionBillingRoutes } from '@/boundedcontext/subscriptionbilling/presentation/routes'
import { routes as DashboardOverviewRoutes } from '@/boundedcontext/dashboardinsights/presentation/routes'
import { routes as EquipmentMaintenanceRoutes } from '@/boundedcontext/equipmentmaintenance/presentation/routes'
import { routes as AssetInventoryRoutes } from '@/boundedcontext/facilityassets/presentation/routes'
import { routes as SensorMonitoringRoutes } from '@/boundedcontext/sensormonitoring/presentation/routes'
import { routes as EnvironmentalComplianceRoutes } from '@/boundedcontext/environmentalcompliance/presentation/routes'
import { routes as AlertsNotificationsRoutes } from '@/boundedcontext/alertsincidents/presentation/routes'
import { routes as RemoteControlRoutes } from '@/boundedcontext/remoteactuation/presentation/routes'
import { routes as ReportsAnalyticsRoutes } from '@/boundedcontext/reportinganalytics/presentation/routes'
import { routes as IncidentManagementRoutes } from '@/boundedcontext/alertsincidents/presentation/incident-routes'
import { routes as AuditTraceabilityRoutes } from '@/boundedcontext/audittraceability/presentation/routes'
import { recordRoutes } from '@/shared/presentation/routes/record-routes'

const routes = [
    ...IdentityAccessRoutes,

    {
        path: '/',
        component: AppShell,
        children: [
            {
                path: '',
                redirect: '/dashboardinsights/laboratory-dashboard'
            },
            ...UserProfilesRoutes,
            ...SubscriptionBillingRoutes,
            ...DashboardOverviewRoutes,
            ...AssetInventoryRoutes,
            ...EquipmentMaintenanceRoutes,
            ...SensorMonitoringRoutes,
            ...EnvironmentalComplianceRoutes,
            ...AlertsNotificationsRoutes,
            ...RemoteControlRoutes,
            ...ReportsAnalyticsRoutes,
            ...IncidentManagementRoutes,
            ...AuditTraceabilityRoutes,
            ...recordRoutes
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
            path: '/identityaccess/login',
            query: {
                redirect: to.fullPath
            }
        }
    }

    if (isPublicRoute && isAuthenticated) {
        return '/dashboardinsights/laboratory-dashboard'
    }

    if (
        isAuthenticated &&
        protectedContext &&
        !authStore.canAccessContext(protectedContext)
    ) {
        return '/dashboardinsights/laboratory-dashboard'
    }

    return true
})

export default router
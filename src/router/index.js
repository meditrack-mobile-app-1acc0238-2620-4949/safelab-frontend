import { createRouter, createWebHistory } from 'vue-router'
import AppShell from '@/shared/presentation/layouts/AppShell.vue'
import UsersPermissionsView from '@/boundedcontext/identityaccess/presentation/views/UsersPermissionsView.vue'
import PlatformConsoleView from '@/boundedcontext/identityaccess/presentation/views/PlatformConsoleView.vue'
import PlatformRecordsView from '@/boundedcontext/identityaccess/presentation/views/PlatformRecordsView.vue'
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
            { path:'identityaccess/users-permissions',component:UsersPermissionsView,meta:{sidebarContext:'userpermissions'} },
            { path:'platform/organizations/:organizationId',component:PlatformConsoleView,meta:{sidebarContext:'platform'} },
            { path:'platform/records/:collection',component:PlatformRecordsView,meta:{sidebarContext:'platform'} },
            { path:'platform/:section',component:PlatformConsoleView,meta:{sidebarContext:'platform'} },
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

router.beforeEach(to => {
    const auth = useAuthStore()
    auth.restoreSession()
    const isPublic=to.meta.public===true
    if(!isPublic && !auth.isAuthenticated)return {path:'/identityaccess/login',query:{redirect:to.fullPath}}
    const home=auth.isPlatformAdmin?'/platform/overview':'/dashboardinsights/laboratory-dashboard'
    if(isPublic && auth.isAuthenticated)return home
    if(to.path==='/' || to.path==='/dashboardinsights/laboratory-dashboard' && auth.isPlatformAdmin)return home
    if(auth.isPlatformAdmin && !to.path.startsWith('/platform/') && !to.path.startsWith('/userprofiles/'))return home
    if(!auth.isPlatformAdmin && to.path.startsWith('/platform/'))return home
    if(to.meta.sidebarContext && !auth.canAccessContext(to.meta.sidebarContext))return home
    return true
})
export default router

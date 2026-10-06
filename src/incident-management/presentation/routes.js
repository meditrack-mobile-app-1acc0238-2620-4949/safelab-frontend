import ComingSoonView from '@/shared/presentation/views/ComingSoonView.vue'

const IncidentsPage = () => import('./views/incidents-page.component.vue')
const IncidentDetailPage = () => import('./views/incident-detail-page.component.vue')
const IncidentReportPage = () => import('./views/incident-report-page.component.vue')

export const routes = [
    {
        path: 'incident-management',
        name: 'incident-management',
        component: IncidentsPage,
        meta: {
            titleKey: 'contextLabels.incidents',
            contextKey: 'incidents',
            sidebarContext: 'incident-management'
        }
    },
    {
        path: 'incident-management/incident-list',
        name: 'incident-management-incident-list',
        component: IncidentsPage,
        meta: {
            titleKey: 'menu.incidents.IncidentList',
            contextKey: 'incidents',
            viewKey: 'incidents.IncidentList',
            sidebarContext: 'incident-management'
        }
    },
    {
        path: 'incident-management/incident-detail/:id',
        name: 'incident-management-detail',
        component: IncidentDetailPage,
        meta: {
            titleKey: 'menu.incidents.IncidentDetail',
            contextKey: 'incidents',
            viewKey: 'incidents.IncidentDetail',
            sidebarContext: 'incident-management'
        }
    },
    {
        path: 'incident-management/incident-report/:id',
        name: 'incident-management-report',
        component: IncidentReportPage,
        meta: {
            titleKey: 'menu.incidents.IncidentReport',
            contextKey: 'incidents',
            viewKey: 'incidents.IncidentReport',
            sidebarContext: 'incident-management'
        }
    },
    {
        path: 'incident-management/incident-tracking',
        name: 'incident-management-incident-tracking',
        component: IncidentsPage,
        meta: {
            titleKey: 'menu.incidents.IncidentTracking',
            contextKey: 'incidents',
            viewKey: 'incidents.IncidentTracking',
            sidebarContext: 'incident-management'
        }
    },
    {
        path: 'incident-management/assignment',
        name: 'incident-management-assignment',
        component: ComingSoonView,
        meta: {
            titleKey: 'menu.incidents.Assignment',
            contextKey: 'incidents',
            viewKey: 'incidents.Assignment',
            sidebarContext: 'incident-management'
        }
    },
    {
        path: 'incident-management/corrective-actions',
        name: 'incident-management-corrective-actions',
        component: ComingSoonView,
        meta: {
            titleKey: 'menu.incidents.CorrectiveActions',
            contextKey: 'incidents',
            viewKey: 'incidents.CorrectiveActions',
            sidebarContext: 'incident-management'
        }
    },
    {
        path: 'incident-management/resolution-review',
        name: 'incident-management-resolution-review',
        component: ComingSoonView,
        meta: {
            titleKey: 'menu.incidents.ResolutionReview',
            contextKey: 'incidents',
            viewKey: 'incidents.ResolutionReview',
            sidebarContext: 'incident-management'
        }
    },
    {
        path: 'incident-management/incident-evidence',
        name: 'incident-management-incident-evidence',
        component: ComingSoonView,
        meta: {
            titleKey: 'menu.incidents.IncidentEvidence',
            contextKey: 'incidents',
            viewKey: 'incidents.IncidentEvidence',
            sidebarContext: 'incident-management'
        }
    },
    {
        path: 'incident-management/critical-incidents',
        name: 'incident-management-critical-incidents',
        component: IncidentsPage,
        meta: {
            titleKey: 'menu.incidents.CriticalIncidents',
            contextKey: 'incidents',
            viewKey: 'incidents.CriticalIncidents',
            sidebarContext: 'incident-management'
        }
    }
]
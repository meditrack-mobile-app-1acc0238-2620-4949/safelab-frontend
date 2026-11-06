import ComingSoonView from '@/shared/presentation/views/ComingSoonView.vue'

const IncidentsPage = () => import('./views/incidents-page.component.vue')
const IncidentDetailPage = () => import('./views/incident-detail-page.component.vue')
const IncidentReportPage = () => import('./views/incident-report-page.component.vue')

export const routes = [
    {
        path: 'alertsincidents/incident-list',
        name: 'incident-management-incident-list',
        component: IncidentsPage,
        meta: {
            titleKey: 'menu.incidents.IncidentList',
            contextKey: 'incidents',
            viewKey: 'incidents.IncidentList',
            sidebarContext: 'alertsincidents'
        }
    },
    {
        path: 'alertsincidents/incident-detail/:id',
        name: 'incident-management-detail',
        component: IncidentDetailPage,
        meta: {
            titleKey: 'menu.incidents.IncidentDetail',
            contextKey: 'incidents',
            viewKey: 'incidents.IncidentDetail',
            sidebarContext: 'alertsincidents'
        }
    },
    {
        path: 'alertsincidents/incident-report/:id',
        name: 'incident-management-report',
        component: IncidentReportPage,
        meta: {
            titleKey: 'menu.incidents.IncidentReport',
            contextKey: 'incidents',
            viewKey: 'incidents.IncidentReport',
            sidebarContext: 'alertsincidents'
        }
    },
    {
        path: 'alertsincidents/incident-tracking',
        name: 'incident-management-incident-tracking',
        component: IncidentsPage,
        meta: {
            titleKey: 'menu.incidents.IncidentTracking',
            contextKey: 'incidents',
            viewKey: 'incidents.IncidentTracking',
            sidebarContext: 'alertsincidents'
        }
    },
    {
        path: 'alertsincidents/assignment',
        name: 'incident-management-assignment',
        component: ComingSoonView,
        meta: {
            titleKey: 'menu.incidents.Assignment',
            contextKey: 'incidents',
            viewKey: 'incidents.Assignment',
            sidebarContext: 'alertsincidents'
        }
    },
    {
        path: 'alertsincidents/corrective-actions',
        name: 'incident-management-corrective-actions',
        component: ComingSoonView,
        meta: {
            titleKey: 'menu.incidents.CorrectiveActions',
            contextKey: 'incidents',
            viewKey: 'incidents.CorrectiveActions',
            sidebarContext: 'alertsincidents'
        }
    },
    {
        path: 'alertsincidents/resolution-review',
        name: 'incident-management-resolution-review',
        component: ComingSoonView,
        meta: {
            titleKey: 'menu.incidents.ResolutionReview',
            contextKey: 'incidents',
            viewKey: 'incidents.ResolutionReview',
            sidebarContext: 'alertsincidents'
        }
    },
    {
        path: 'alertsincidents/incident-evidence',
        name: 'incident-management-incident-evidence',
        component: ComingSoonView,
        meta: {
            titleKey: 'menu.incidents.IncidentEvidence',
            contextKey: 'incidents',
            viewKey: 'incidents.IncidentEvidence',
            sidebarContext: 'alertsincidents'
        }
    },
    {
        path: 'alertsincidents/critical-incidents',
        name: 'incident-management-critical-incidents',
        component: IncidentsPage,
        meta: {
            titleKey: 'menu.incidents.CriticalIncidents',
            contextKey: 'incidents',
            viewKey: 'incidents.CriticalIncidents',
            sidebarContext: 'alertsincidents'
        }
    }
]
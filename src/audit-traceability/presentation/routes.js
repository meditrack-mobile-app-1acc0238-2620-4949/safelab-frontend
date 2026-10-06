import AuditTraceabilityView from '@/audit-traceability/presentation/views/AuditTraceabilityView.vue'

export const routes = [
    {
        path: 'audit-traceability',
        redirect: '/audit-traceability/audit-log'
    },
    {
        path: 'audit-traceability/audit-log',
        name: 'audit-traceability-audit-log',
        component: AuditTraceabilityView,
        meta: {
            titleKey: 'menu.audit.AuditLog',
            contextKey: 'audit',
            viewKey: 'audit.AuditLog',
            sidebarContext: 'audit-traceability'
        }
    },
    {
        path: 'audit-traceability/activity-history',
        name: 'audit-traceability-activity-history',
        component: AuditTraceabilityView,
        meta: {
            titleKey: 'menu.audit.ActivityHistory',
            contextKey: 'audit',
            viewKey: 'audit.ActivityHistory',
            sidebarContext: 'audit-traceability'
        }
    },
    {
        path: 'audit-traceability/traceability-timeline',
        name: 'audit-traceability-traceability-timeline',
        component: AuditTraceabilityView,
        meta: {
            titleKey: 'menu.audit.TraceabilityTimeline',
            contextKey: 'audit',
            viewKey: 'audit.TraceabilityTimeline',
            sidebarContext: 'audit-traceability'
        }
    },
    {
        path: 'audit-traceability/compliance-traceability',
        name: 'audit-traceability-compliance-traceability',
        component: AuditTraceabilityView,
        meta: {
            titleKey: 'menu.audit.ComplianceTraceability',
            contextKey: 'audit',
            viewKey: 'audit.ComplianceTraceability',
            sidebarContext: 'audit-traceability'
        }
    },
    {
        path: 'audit-traceability/audit-evidence',
        name: 'audit-traceability-audit-evidence',
        component: AuditTraceabilityView,
        meta: {
            titleKey: 'menu.audit.AuditEvidence',
            contextKey: 'audit',
            viewKey: 'audit.AuditEvidence',
            sidebarContext: 'audit-traceability'
        }
    },
    {
        path: 'audit-traceability/change-history',
        name: 'audit-traceability-change-history',
        component: AuditTraceabilityView,
        meta: {
            titleKey: 'menu.audit.ChangeHistory',
            contextKey: 'audit',
            viewKey: 'audit.ChangeHistory',
            sidebarContext: 'audit-traceability'
        }
    },
    {
        path: 'audit-traceability/remote-command-history',
        name: 'audit-traceability-remote-command-history',
        component: AuditTraceabilityView,
        meta: {
            titleKey: 'menu.audit.RemoteCommandHistory',
            contextKey: 'audit',
            viewKey: 'audit.RemoteCommandHistory',
            sidebarContext: 'audit-traceability'
        }
    }
]
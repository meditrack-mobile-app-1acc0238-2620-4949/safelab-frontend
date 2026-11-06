import AuditTraceabilityView from '@/boundedcontext/audittraceability/presentation/views/AuditTraceabilityView.vue'

export const routes = [
    {
        path: 'audittraceability',
        redirect: '/audittraceability/audit-log'
    },
    {
        path: 'audittraceability/audit-log',
        name: 'audit-traceability-audit-log',
        component: AuditTraceabilityView,
        meta: {
            titleKey: 'menu.audit.AuditLog',
            contextKey: 'audit',
            viewKey: 'audit.AuditLog',
            sidebarContext: 'audittraceability'
        }
    },
    {
        path: 'audittraceability/activity-history',
        name: 'audit-traceability-activity-history',
        component: AuditTraceabilityView,
        meta: {
            titleKey: 'menu.audit.ActivityHistory',
            contextKey: 'audit',
            viewKey: 'audit.ActivityHistory',
            sidebarContext: 'audittraceability'
        }
    },
    {
        path: 'audittraceability/traceability-timeline',
        name: 'audit-traceability-traceability-timeline',
        component: AuditTraceabilityView,
        meta: {
            titleKey: 'menu.audit.TraceabilityTimeline',
            contextKey: 'audit',
            viewKey: 'audit.TraceabilityTimeline',
            sidebarContext: 'audittraceability'
        }
    },
    {
        path: 'audittraceability/compliance-traceability',
        name: 'audit-traceability-compliance-traceability',
        component: AuditTraceabilityView,
        meta: {
            titleKey: 'menu.audit.ComplianceTraceability',
            contextKey: 'audit',
            viewKey: 'audit.ComplianceTraceability',
            sidebarContext: 'audittraceability'
        }
    },
    {
        path: 'audittraceability/audit-evidence',
        name: 'audit-traceability-audit-evidence',
        component: AuditTraceabilityView,
        meta: {
            titleKey: 'menu.audit.AuditEvidence',
            contextKey: 'audit',
            viewKey: 'audit.AuditEvidence',
            sidebarContext: 'audittraceability'
        }
    },
    {
        path: 'audittraceability/change-history',
        name: 'audit-traceability-change-history',
        component: AuditTraceabilityView,
        meta: {
            titleKey: 'menu.audit.ChangeHistory',
            contextKey: 'audit',
            viewKey: 'audit.ChangeHistory',
            sidebarContext: 'audittraceability'
        }
    },
    {
        path: 'audittraceability/remote-command-history',
        name: 'audit-traceability-remote-command-history',
        component: AuditTraceabilityView,
        meta: {
            titleKey: 'menu.audit.RemoteCommandHistory',
            contextKey: 'audit',
            viewKey: 'audit.RemoteCommandHistory',
            sidebarContext: 'audittraceability'
        }
    }
]
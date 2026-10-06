import ReportsPage from './views/reports-page.component.vue'
import HistoricalDataPage from './views/historical-data-page.component.vue'
import AnalyticsPage from './views/analytics-page.component.vue'
import ComingSoonView from '@/shared/presentation/views/ComingSoonView.vue'

export const routes = [
    {
        path: 'reports-analytics',
        name: 'reports-analytics',
        component: AnalyticsPage,
        meta: {
            titleKey: 'contextLabels.reports',
            contextKey: 'reports',
            sidebarContext: 'reports-analytics'
        }
    },
    {
        path: 'reports-analytics/analytics-dashboard',
        name: 'reports-analytics-analytics-dashboard',
        component: AnalyticsPage,
        meta: {
            titleKey: 'menu.reports.AnalyticsDashboard',
            contextKey: 'reports',
            viewKey: 'reports.AnalyticsDashboard',
            sidebarContext: 'reports-analytics'
        }
    },
    {
        path: 'reports-analytics/analytics-overview',
        name: 'reports-analytics-overview',
        component: AnalyticsPage,
        meta: {
            titleKey: 'menu.reports.AnalyticsDashboard',
            contextKey: 'reports',
            viewKey: 'reports.AnalyticsDashboard',
            sidebarContext: 'reports-analytics'
        }
    },
    {
        path: 'reports-analytics/reports',
        name: 'reports-analytics-reports',
        component: ReportsPage,
        meta: {
            titleKey: 'menu.reports.ReportsList',
            contextKey: 'reports',
            viewKey: 'reports.ReportsList',
            sidebarContext: 'reports-analytics'
        }
    },
    {
        path: 'reports-analytics/historical-data',
        name: 'reports-analytics-historical-data',
        component: HistoricalDataPage,
        meta: {
            titleKey: 'menu.reports.HistoricalData',
            contextKey: 'reports',
            viewKey: 'reports.HistoricalData',
            sidebarContext: 'reports-analytics'
        }
    },
    {
        path: 'reports-analytics/export-data',
        name: 'reports-analytics-export-data',
        component: ComingSoonView,
        meta: {
            titleKey: 'menu.reports.ExportData',
            contextKey: 'reports',
            viewKey: 'reports.ExportData',
            sidebarContext: 'reports-analytics'
        }
    },
    {
        path: 'reports-analytics/trend-analysis',
        name: 'reports-analytics-trend-analysis',
        component: AnalyticsPage,
        meta: {
            titleKey: 'menu.reports.TrendAnalysis',
            contextKey: 'reports',
            viewKey: 'reports.TrendAnalysis',
            sidebarContext: 'reports-analytics'
        }
    },
    {
        path: 'reports-analytics/compliance-reports',
        name: 'reports-analytics-compliance-reports',
        component: ReportsPage,
        meta: {
            titleKey: 'menu.reports.ComplianceReports',
            contextKey: 'reports',
            viewKey: 'reports.ComplianceReports',
            sidebarContext: 'reports-analytics'
        }
    },
    {
        path: 'reports-analytics/operational-reports',
        name: 'reports-analytics-operational-reports',
        component: ReportsPage,
        meta: {
            titleKey: 'menu.reports.OperationalReports',
            contextKey: 'reports',
            viewKey: 'reports.OperationalReports',
            sidebarContext: 'reports-analytics'
        }
    }
]
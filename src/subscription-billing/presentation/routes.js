import SubscriptionOverviewView from './views/SubscriptionOverviewView.vue'
import InvoicesView from './views/InvoicesView.vue'
import PaymentHistoryView from './views/PaymentHistoryView.vue'
import UsageLimitsView from './views/UsageLimitsView.vue'
import UpgradePlanView from './views/UpgradePlanView.vue'

export const routes = [
    {
        path: 'subscription-billing',
        redirect: '/subscription-billing/plans'
    },
    {
        path: 'subscription-billing/plans',
        name: 'subscription-billing-plans',
        component: SubscriptionOverviewView,
        meta: {
            titleKey: 'contextLabels.billing',
            contextKey: 'billing',
            viewKey: 'billing.Plans',
            sidebarContext: 'subscription-billing'
        }
    },
    {
        path: 'subscription-billing/invoices',
        name: 'subscription-billing-invoices',
        component: InvoicesView,
        meta: {
            titleKey: 'menu.billing.Invoices',
            contextKey: 'billing',
            viewKey: 'billing.Invoices',
            sidebarContext: 'subscription-billing'
        }
    },
    {
        path: 'subscription-billing/payment-history',
        name: 'subscription-billing-payment-history',
        component: PaymentHistoryView,
        meta: {
            titleKey: 'menu.billing.PaymentHistory',
            contextKey: 'billing',
            viewKey: 'billing.PaymentHistory',
            sidebarContext: 'subscription-billing'
        }
    },
    {
        path: 'subscription-billing/usage-limits',
        name: 'subscription-billing-usage-limits',
        component: UsageLimitsView,
        meta: {
            titleKey: 'menu.billing.UsageLimits',
            contextKey: 'billing',
            viewKey: 'billing.UsageLimits',
            sidebarContext: 'subscription-billing'
        }
    },
    {
        path: 'subscription-billing/upgrade-plan',
        name: 'subscription-billing-upgrade-plan',
        component: UpgradePlanView,
        meta: {
            titleKey: 'menu.billing.UpgradePlan',
            contextKey: 'billing',
            viewKey: 'billing.UpgradePlan',
            sidebarContext: 'subscription-billing'
        }
    }
]
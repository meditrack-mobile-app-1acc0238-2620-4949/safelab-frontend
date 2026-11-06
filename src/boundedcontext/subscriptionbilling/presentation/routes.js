import SubscriptionOverviewView from './views/SubscriptionOverviewView.vue'
export const routes = [
  {path:'subscriptionbilling',redirect:'/subscriptionbilling/plans'},
  {path:'subscriptionbilling/plans',name:'subscription-billing-plans',component:SubscriptionOverviewView,meta:{titleKey:'contextLabels.billing',contextKey:'billing',sidebarContext:'subscriptionbilling'}},
  ...['invoices','payment-history','usage-limits','upgrade-plan','billing-dashboard','customer-subscriptions'].map(path=>({path:`subscriptionbilling/${path}`,redirect:'/subscriptionbilling/plans'}))
]

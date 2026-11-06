import ComingSoonView from '@/shared/presentation/views/ComingSoonView.vue'
import ComplianceStatusView from './views/ComplianceStatusView.vue'

export const routes = [
  {
    path: 'environmentalcompliance',
    name: 'environmentalcompliance',
    redirect: { name: 'environmental-compliance-compliance-status' },
    meta: { title: 'Environmental Compliance', contextKey: 'compliance' }
  },
  {
    path: 'environmentalcompliance/compliance-status',
    name: 'environmental-compliance-compliance-status',
    component: ComplianceStatusView,
    meta: { title: 'Compliance Status', contextKey: 'compliance', viewKey: 'compliance.ComplianceStatus' }
  },
  {
    path: 'environmentalcompliance/storage-compliance',
    name: 'environmental-compliance-storage-compliance',
    component: ComingSoonView,
    meta: { title: 'Storage Compliance', contextKey: 'compliance', viewKey: 'compliance.StorageCompliance' }
  },
  {
    path: 'environmentalcompliance/compliance-rules',
    name: 'environmental-compliance-compliance-rules',
    component: ComingSoonView,
    meta: { title: 'Compliance Rules', contextKey: 'compliance', viewKey: 'compliance.ComplianceRules' }
  },
  {
    path: 'environmentalcompliance/environmental-validation-results',
    name: 'environmental-compliance-environmental-validation-results',
    component: ComingSoonView,
    meta: { title: 'Environmental Validation Results', contextKey: 'compliance', viewKey: 'compliance.EnvironmentalValidationResults' }
  },
  {
    path: 'environmentalcompliance/violation-history',
    name: 'environmental-compliance-violation-history',
    component: ComingSoonView,
    meta: { title: 'Violation History', contextKey: 'compliance', viewKey: 'compliance.ViolationHistory' }
  },
  {
    path: 'environmentalcompliance/violation-detail',
    name: 'environmental-compliance-violation-detail',
    component: ComingSoonView,
    meta: { title: 'Violation Detail', contextKey: 'compliance', viewKey: 'compliance.ViolationDetail' }
  },
  {
    path: 'environmentalcompliance/compliance-evidence',
    name: 'environmental-compliance-compliance-evidence',
    component: ComingSoonView,
    meta: { title: 'Compliance Evidence', contextKey: 'compliance', viewKey: 'compliance.ComplianceEvidence' }
  },
]

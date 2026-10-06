export const roleDisplayMap = {
  safeLabAdministrator: 'SafeLab Administrator',
  bioclinicalCoordinator: 'Bioclinical Operations Coordinator',
  hospitalPharmacyCoordinator: 'Hospital Pharmacy Coordinator',
  labTechnician: 'Laboratory Technician',
  pharmacyTechnician: 'Pharmacy Technician',
  complianceOfficer: 'Compliance Officer',
  maintenanceOperator: 'Maintenance Operator',
  billingManager: 'Billing Manager'
}

export const roleSegmentMap = {
  safeLabAdministrator: 'platform',
  bioclinicalCoordinator: 'clinical-laboratory',
  hospitalPharmacyCoordinator: 'hospital-pharmacy',
  labTechnician: 'clinical-laboratory',
  pharmacyTechnician: 'hospital-pharmacy',
  complianceOfficer: 'shared',
  maintenanceOperator: 'shared',
  billingManager: 'shared'
}

export const roleAccessMap = {
  safeLabAdministrator: [
    'dashboard-overview',
    'asset-inventory',
    'sensor-monitoring',
    'environmental-compliance',
    'alerts-notifications',
    'remote-control',
    'reports-analytics',
    'incident-management',
    'audit-traceability',
    'subscription-billing'
  ],
  bioclinicalCoordinator: [
    'dashboard-overview',
    'asset-inventory',
    'sensor-monitoring',
    'environmental-compliance',
    'alerts-notifications',
    'reports-analytics',
    'incident-management',
    'audit-traceability'
  ],
  hospitalPharmacyCoordinator: [
    'dashboard-overview',
    'asset-inventory',
    'sensor-monitoring',
    'environmental-compliance',
    'alerts-notifications',
    'reports-analytics',
    'incident-management',
    'audit-traceability'
  ],
  labTechnician: [
    'dashboard-overview',
    'asset-inventory',
    'sensor-monitoring',
    'alerts-notifications',
    'incident-management'
  ],
  pharmacyTechnician: [
    'dashboard-overview',
    'asset-inventory',
    'sensor-monitoring',
    'alerts-notifications',
    'incident-management'
  ],
  complianceOfficer: [
    'dashboard-overview',
    'environmental-compliance',
    'alerts-notifications',
    'reports-analytics',
    'incident-management',
    'audit-traceability'
  ],
  maintenanceOperator: [
    'dashboard-overview',
    'sensor-monitoring',
    'alerts-notifications',
    'remote-control',
    'incident-management'
  ],
  billingManager: [
    'dashboard-overview',
    'subscription-billing',
    'reports-analytics'
  ]
}

export const registerRoleOptions = [
  { value: 'bioclinicalCoordinator', label: roleDisplayMap.bioclinicalCoordinator },
  { value: 'hospitalPharmacyCoordinator', label: roleDisplayMap.hospitalPharmacyCoordinator },
  { value: 'labTechnician', label: roleDisplayMap.labTechnician },
  { value: 'pharmacyTechnician', label: roleDisplayMap.pharmacyTechnician },
  { value: 'complianceOfficer', label: roleDisplayMap.complianceOfficer },
  { value: 'maintenanceOperator', label: roleDisplayMap.maintenanceOperator },
  { value: 'billingManager', label: roleDisplayMap.billingManager }
]

export const getRoleLabel = (role) => roleDisplayMap[role] || role || 'SafeLab User'
export const getAllowedContextsByRole = (role) => roleAccessMap[role] || []
export const isAdministratorRole = (role) => role === 'safeLabAdministrator'

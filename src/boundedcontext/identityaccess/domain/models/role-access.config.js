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
    'dashboardinsights',
    'facilityassets',
    'equipmentmaintenance',
    'sensormonitoring',
    'environmentalcompliance',
    'alertsincidents',
    'remoteactuation',
    'reportinganalytics',
    'audittraceability',
    'subscriptionbilling'
  ],
  bioclinicalCoordinator: [
    'dashboardinsights',
    'facilityassets',
    'equipmentmaintenance',
    'sensormonitoring',
    'environmentalcompliance',
    'alertsincidents',
    'reportinganalytics',
    'audittraceability'
  ],
  hospitalPharmacyCoordinator: [
    'dashboardinsights',
    'facilityassets',
    'equipmentmaintenance',
    'sensormonitoring',
    'environmentalcompliance',
    'alertsincidents',
    'reportinganalytics',
    'audittraceability'
  ],
  labTechnician: [
    'dashboardinsights',
    'facilityassets',
    'equipmentmaintenance',
    'sensormonitoring',
    'alertsincidents'
  ],
  pharmacyTechnician: [
    'dashboardinsights',
    'facilityassets',
    'equipmentmaintenance',
    'sensormonitoring',
    'alertsincidents'
  ],
  complianceOfficer: [
    'dashboardinsights',
    'environmentalcompliance',
    'alertsincidents',
    'reportinganalytics',
    'audittraceability'
  ],
  maintenanceOperator: [
    'dashboardinsights',
    'equipmentmaintenance',
    'sensormonitoring',
    'alertsincidents',
    'remoteactuation',
    'alertsincidents'
  ],
  billingManager: [
    'dashboardinsights',
    'subscriptionbilling',
    'reportinganalytics'
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

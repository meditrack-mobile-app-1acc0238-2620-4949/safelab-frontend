import { AuditTraceabilityApiService } from '@/audit-traceability/infrastructure/http/audit-traceability-api.service'

export const fallbackAuditTraceability = {
  summary: {
    totalLogs: 1842,
    reviewedLogs: 1496,
    pendingLogs: 46,
    criticalEvents: 7,
    integrityScore: 99.4,
    retainedDays: 365
  },
  traceabilityHealth: {
    auditCoverage: 98,
    evidenceCoverage: 94,
    changeIntegrity: 99,
    remoteCommandTraceability: 97
  },
  auditLogs: [
    { id: 'AUD-1208', actor: 'Dr. Maria Lopez', action: 'Reviewed compliance evidence', module: 'Compliance Traceability', severity: 'info', status: 'reviewed', ipAddress: '192.168.1.24', createdAt: '2026-05-13 09:45', evidenceId: 'EVD-442' },
    { id: 'AUD-1207', actor: 'System', action: 'Registered temperature threshold event', module: 'Sensor History', severity: 'warning', status: 'pending', ipAddress: '10.0.0.12', createdAt: '2026-05-13 09:12', evidenceId: 'EVD-441' },
    { id: 'AUD-1206', actor: 'Lab Technician', action: 'Executed remote cooling adjustment', module: 'Remote Command History', severity: 'critical', status: 'reviewed', ipAddress: '192.168.1.41', createdAt: '2026-05-13 08:54', evidenceId: 'EVD-440' },
    { id: 'AUD-1205', actor: 'Compliance Officer', action: 'Approved incident closure evidence', module: 'Incident History', severity: 'info', status: 'reviewed', ipAddress: '192.168.1.18', createdAt: '2026-05-12 18:20', evidenceId: 'EVD-439' },
    { id: 'AUD-1204', actor: 'SafeLab Administrator', action: 'Updated user permission set', module: 'Change History', severity: 'warning', status: 'pending', ipAddress: '192.168.1.10', createdAt: '2026-05-12 17:36', evidenceId: 'EVD-438' }
  ],
  timeline: [
    { id: 1, time: '09:45', title: 'Compliance evidence reviewed', module: 'Compliance', status: 'reviewed' },
    { id: 2, time: '09:12', title: 'Sensor threshold event recorded', module: 'Sensors', status: 'pending' },
    { id: 3, time: '08:54', title: 'Remote command execution traced', module: 'Remote Control', status: 'reviewed' },
    { id: 4, time: '07:35', title: 'Asset status change appended', module: 'Assets', status: 'reviewed' }
  ],
  evidence: [
    { id: 'EVD-442', type: 'Compliance report', owner: 'Compliance Officer', linkedRecord: 'CMP-087', status: 'ready' },
    { id: 'EVD-441', type: 'Sensor reading snapshot', owner: 'System', linkedRecord: 'SNS-204', status: 'pending' },
    { id: 'EVD-440', type: 'Command execution receipt', owner: 'Lab Technician', linkedRecord: 'CMD-081', status: 'ready' },
    { id: 'EVD-439', type: 'Incident closure note', owner: 'Operations Team', linkedRecord: 'INC-025', status: 'ready' }
  ],
  trackedEntities: [
    { labelKey: 'audit.tracked.assets', value: 156, icon: 'pi pi-box', trend: '+12' },
    { labelKey: 'audit.tracked.sensors', value: 24, icon: 'pi pi-wifi', trend: '+4' },
    { labelKey: 'audit.tracked.incidents', value: 31, icon: 'pi pi-exclamation-triangle', trend: '+3' },
    { labelKey: 'audit.tracked.commands', value: 18, icon: 'pi pi-sliders-h', trend: '+2' }
  ],
  changeHistory: [
    { id: 'CHG-088', object: 'Threshold rule', description: 'Temperature range adjusted for Cold Room A', changedBy: 'Compliance Officer', risk: 'medium' },
    { id: 'CHG-087', object: 'User role', description: 'Supervisor permissions updated', changedBy: 'SafeLab Administrator', risk: 'medium' },
    { id: 'CHG-086', object: 'Sensor assignment', description: 'Sensor T-204 linked to Clinical Lab 2', changedBy: 'Lab Technician', risk: 'low' }
  ],
  commandHistory: [
    { id: 'CMD-081', command: 'Adjust cooling level', actuator: 'Cold Chamber A-01', requestedBy: 'Lab Technician', result: 'confirmed' },
    { id: 'CMD-080', command: 'Restart sensor gateway', actuator: 'Gateway S-02', requestedBy: 'SafeLab Administrator', result: 'confirmed' },
    { id: 'CMD-079', command: 'Cancel pending actuator command', actuator: 'Freezer B-02', requestedBy: 'Dr. Maria Lopez', result: 'cancelled' }
  ]
}

export class AuditTraceabilityService {
  constructor(api = new AuditTraceabilityApiService()) {
    this.api = api
  }

  async getOverview() {
    try {
      const data = await this.api.getOverview()
      return data?.summary ? data : fallbackAuditTraceability
    } catch (error) {
      return fallbackAuditTraceability
    }
  }
}

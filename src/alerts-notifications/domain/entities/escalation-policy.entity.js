import { PolicyStatus } from '../models/policy-status.enum';

export class EscalationPolicy {
    constructor({
                    id,
                    name,
                    severity,
                    delayMinutes,
                    nextRecipientIds = [],
                    status = PolicyStatus.ACTIVE
                }) {
        this.id = id;
        this.name = name;
        this.severity = severity;
        this.delayMinutes = delayMinutes;
        this.nextRecipientIds = nextRecipientIds;
        this.status = status;
    }
}
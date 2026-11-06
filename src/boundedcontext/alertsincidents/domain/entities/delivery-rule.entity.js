export class DeliveryRule {
    constructor({
                    id,
                    minimumSeverity,
                    channel,
                    recipientIds = [],
                    active = true
                }) {
        this.id = id;
        this.minimumSeverity = minimumSeverity;
        this.channel = channel;
        this.recipientIds = recipientIds;
        this.active = active;
    }
}
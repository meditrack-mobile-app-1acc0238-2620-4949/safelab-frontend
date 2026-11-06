import { defineStore } from 'pinia';
import { RecipientService } from '../services/recipient.service';

const recipientService = new RecipientService();

export const useRecipientStore = defineStore('recipients', {
    state: () => ({
        recipients: [],
        loading: false,
        error: null
    }),

    actions: {
        async fetchRecipients(filters = {}) {
            this.loading = true;
            this.error = null;

            try {
                this.recipients = await recipientService.findAll(filters);
            } catch (error) {
                this.error = 'Could not load recipients.';
            } finally {
                this.loading = false;
            }
        }
    }
});
<script setup>
import { ref } from 'vue';

const props = defineProps({
  recipients: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['submit']);

const form = ref({
  minimumSeverity: '',
  channel: '',
  recipientIds: [],
  active: true
});

const severityOptions = ['Info', 'Warning', 'Critical'];
const channelOptions = ['Email', 'SMS', 'Push', 'WhatsApp'];

const submitForm = () => {
  emit('submit', { ...form.value });

  form.value = {
    minimumSeverity: '',
    channel: '',
    recipientIds: [],
    active: true
  };
};
</script>

<template>
  <form class="delivery-rule-form" @submit.prevent="submitForm">
    <label>
      Minimum severity
      <select v-model="form.minimumSeverity" required>
        <option value="" disabled>Select severity</option>
        <option
            v-for="severity in severityOptions"
            :key="severity"
            :value="severity"
        >
          {{ severity }}
        </option>
      </select>
    </label>

    <label>
      Channel
      <select v-model="form.channel" required>
        <option value="" disabled>Select channel</option>
        <option
            v-for="channel in channelOptions"
            :key="channel"
            :value="channel"
        >
          {{ channel }}
        </option>
      </select>
    </label>

    <fieldset>
      <legend>Recipients</legend>

      <label
          v-for="recipient in props.recipients"
          :key="recipient.id"
          class="checkbox-label"
      >
        <input
            v-model="form.recipientIds"
            type="checkbox"
            :value="recipient.id"
        />
        {{ recipient.fullName }} - {{ recipient.role }}
      </label>
    </fieldset>

    <label class="checkbox-label">
      <input v-model="form.active" type="checkbox" />
      Active rule
    </label>

    <button type="submit" class="primary-button">
      Save rule
    </button>
  </form>
</template>

<style scoped>
.delivery-rule-form {
  display: grid;
  gap: 1rem;
}

label {
  color: #334155;
  display: grid;
  font-size: 0.875rem;
  font-weight: 600;
  gap: 0.5rem;
}

select {
  border: 1px solid #cbd5e1;
  border-radius: 0.375rem;
  min-height: 40px;
  padding: 0.5rem 0.75rem;
}

fieldset {
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
  display: grid;
  gap: 0.5rem;
  padding: 1rem;
}

legend {
  color: #334155;
  font-weight: 700;
}

.checkbox-label {
  align-items: center;
  display: flex;
  gap: 0.5rem;
}

.primary-button {
  border: 0;
  border-radius: 0.375rem;
  background: #4f46e5;
  color: white;
  cursor: pointer;
  font-weight: 600;
  min-height: 40px;
  padding: 0.5rem 1rem;
}

.primary-button:hover {
  background: #4338ca;
}
</style>
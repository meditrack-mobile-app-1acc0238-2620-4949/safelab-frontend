<script setup>
defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  plan: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['confirm', 'cancel'])
</script>

<template>
  <div v-if="visible" class="modal-backdrop">
    <section class="payment-modal">
      <header>
        <span class="modal-icon">
          <i class="pi pi-credit-card"></i>
        </span>

        <div>
          <h2>Simulated payment</h2>
          <p>Confirm the payment to complete your SafeLab registration.</p>
        </div>
      </header>

      <div v-if="plan" class="payment-summary">
        <span>Selected plan</span>
        <strong>{{ plan.name }}</strong>
        <p>${{ plan.monthlyCost }} / month</p>
      </div>

      <div class="fake-card">
        <span>Demo card</span>
        <strong>4242 4242 4242 4242</strong>
        <small>Payment simulation only</small>
      </div>

      <footer>
        <button type="button" class="secondary" @click="$emit('cancel')">
          Cancel payment
        </button>

        <button type="button" :disabled="loading" @click="$emit('confirm')">
          {{ loading ? 'Processing...' : 'Confirm payment' }}
        </button>
      </footer>
    </section>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgba(15, 23, 42, 0.45);
}

.payment-modal {
  width: min(460px, 100%);
  display: grid;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 24px;
  background: #ffffff;
  box-shadow: 0 30px 80px rgba(15, 23, 42, 0.28);
}

header {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.modal-icon {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border-radius: 18px;
  color: #ffffff;
  background: #4f46e5;
}

h2,
p {
  margin: 0;
}

p,
span,
small {
  color: #64748b;
  font-weight: 600;
}

.payment-summary,
.fake-card {
  display: grid;
  gap: 0.35rem;
  padding: 1rem;
  border-radius: 18px;
  background: #f8fafc;
}

.payment-summary strong,
.fake-card strong {
  color: #0f172a;
}

.payment-summary p {
  color: #4f46e5;
  font-size: 1.5rem;
  font-weight: 900;
}

footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

button {
  border: 0;
  border-radius: 12px;
  background: #4f46e5;
  color: #ffffff;
  cursor: pointer;
  font-weight: 900;
  min-height: 42px;
  padding: 0.7rem 1rem;
}

button.secondary {
  background: #eef2ff;
  color: #4f46e5;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}
</style>
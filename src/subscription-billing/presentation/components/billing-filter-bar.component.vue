<script setup>
defineProps({
  query: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    default: ''
  },
  statusOptions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:query', 'update:status', 'clear'])
</script>

<template>
  <section class="filter-bar">
    <label>
      Search
      <input
        :value="query"
        type="search"
        placeholder="Search by customer, plan or invoice"
        @input="emit('update:query', $event.target.value)"
      />
    </label>

    <label>
      Status
      <select
        :value="status"
        @change="emit('update:status', $event.target.value)"
      >
        <option value="">All statuses</option>
        <option
          v-for="option in statusOptions"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
    </label>

    <button type="button" @click="emit('clear')">
      Clear filters
    </button>
  </section>
</template>

<style scoped>
.filter-bar {
  align-items: end;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr 220px auto;
  padding: 1rem;
}

label {
  color: #334155;
  display: grid;
  font-size: 0.875rem;
  font-weight: 700;
  gap: 0.4rem;
}

input,
select {
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
  min-height: 40px;
  padding: 0 0.75rem;
}

button {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
  color: #334155;
  cursor: pointer;
  font-weight: 700;
  min-height: 40px;
  padding: 0 1rem;
}

@media (max-width: 767px) {
  .filter-bar {
    grid-template-columns: 1fr;
  }
}
</style>

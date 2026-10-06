<script setup>
import { computed } from 'vue'

const props = defineProps({
  searchQuery: {
    type: String,
    required: true
  },
  statusFilter: {
    type: String,
    required: true
  },
  typeFilter: {
    type: String,
    required: true
  },
  statusOptions: {
    type: Array,
    required: true
  },
  typeOptions: {
    type: Array,
    required: true
  },
  searchPlaceholder: {
    type: String,
    required: true
  },
  searchAriaLabel: {
    type: String,
    required: true
  },
  typeLabel: {
    type: String,
    required: true
  },
  statusLabel: {
    type: String,
    required: true
  }
})

const emit = defineEmits([
  'update:searchQuery',
  'update:statusFilter',
  'update:typeFilter'
])

const searchValue = computed({
  get: () => props.searchQuery,
  set: (value) => emit('update:searchQuery', value)
})

const statusValue = computed({
  get: () => props.statusFilter,
  set: (value) => emit('update:statusFilter', value)
})

const typeValue = computed({
  get: () => props.typeFilter,
  set: (value) => emit('update:typeFilter', value)
})
</script>

<template>
  <div class="toolbar">
    <label class="search-input" :aria-label="searchAriaLabel">
      <i class="pi pi-search" aria-hidden="true" />

      <input
          v-model="searchValue"
          type="text"
          :placeholder="searchPlaceholder"
      />
    </label>

    <div class="toolbar-actions">
      <label class="status-filter">
        <span>{{ typeLabel }}</span>

        <select v-model="typeValue">
          <option
              v-for="type in typeOptions"
              :key="type.value"
              :value="type.value"
          >
            {{ type.label }}
          </option>
        </select>
      </label>

      <label class="status-filter">
        <span>{{ statusLabel }}</span>

        <select v-model="statusValue">
          <option
              v-for="status in statusOptions"
              :key="status.value"
              :value="status.value"
          >
            {{ status.label }}
          </option>
        </select>
      </label>
    </div>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 220px;
  max-width: 520px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 11px 14px;
  border-radius: 16px;
  border: 1px solid var(--border);
  background: #ffffff;
  box-shadow: 0 8px 20px rgba(31, 41, 79, 0.06);
}

.search-input input {
  border: 0;
  outline: none;
  flex: 1;
  background: transparent;
  color: var(--text);
  font-weight: 600;
}

.toolbar-actions {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.status-filter {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 8px 20px rgba(31, 41, 79, 0.06);
  font-weight: 700;
}

.status-filter span {
  color: var(--text);
}

.status-filter select {
  border: 0;
  background: transparent;
  color: var(--text);
  font-weight: 700;
  outline: none;
}

@media (max-width: 720px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .status-filter {
    justify-content: space-between;
  }
}
</style>
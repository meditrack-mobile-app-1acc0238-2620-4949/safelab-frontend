<script setup>
import { reactive } from 'vue'
import { ReportFormat } from '../../domain/models/report-format.enum'

const emit = defineEmits(['submit'])

const form = reactive({
  title: '',
  equipmentId: '',
  startDate: '',
  endDate: '',
  format: ReportFormat.PDF
})

const submit = () => {
  emit('submit', {
    ...form,
    equipmentId: form.equipmentId || null
  })
}
</script>

<template>
  <form class="report-form" @submit.prevent="submit">
    <label>
      Report title
      <input v-model="form.title" required type="text" placeholder="Monthly compliance report" />
    </label>

    <label>
      Equipment ID
      <input v-model="form.equipmentId" type="text" placeholder="Optional" />
    </label>

    <label>
      Start date
      <input v-model="form.startDate" required type="date" />
    </label>

    <label>
      End date
      <input v-model="form.endDate" required type="date" />
    </label>

    <label>
      Format
      <select v-model="form.format">
        <option :value="ReportFormat.PDF">PDF</option>
        <option :value="ReportFormat.CSV">CSV</option>
        <option :value="ReportFormat.XLSX">XLSX</option>
      </select>
    </label>

    <button type="submit">Generate report</button>
  </form>
</template>

<style scoped>
.report-form {
  display: grid;
  gap: 1rem;
}

label {
  color: #334155;
  display: grid;
  font-weight: 700;
  gap: 0.35rem;
}

input,
select {
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
  padding: 0.65rem;
}

button {
  background: #4f46e5;
  border: none;
  border-radius: 0.5rem;
  color: #ffffff;
  cursor: pointer;
  font-weight: 700;
  padding: 0.75rem 1rem;
}
</style>

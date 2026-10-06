import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { HistoricalDataService } from '../services/historical-data.service'
import { filterRecordsForCurrentUser } from '@/shared/application/services/role-data-filter.service'

const historicalDataService = new HistoricalDataService()

export const useHistoricalDataStore = defineStore('reportsAnalyticsHistoricalData', () => {
    const records = ref([])
    const loading = ref(false)
    const error = ref(null)

    const filters = ref({
        equipmentId: null,
        startDate: '',
        endDate: ''
    })

    const hasFilters = computed(() => {
        return Boolean(filters.value.equipmentId || filters.value.startDate || filters.value.endDate)
    })

    const fetchRecords = async (newFilters = {}) => {
        loading.value = true
        error.value = null

        filters.value = {
            ...filters.value,
            ...newFilters
        }

        try {
            records.value = filterRecordsForCurrentUser(await historicalDataService.findAll(filters.value))
        } catch (exception) {
            console.error(exception)
            error.value = 'Could not load historical data.'
        } finally {
            loading.value = false
        }
    }

    const clearFilters = async () => {
        filters.value = {
            equipmentId: null,
            startDate: '',
            endDate: ''
        }

        await fetchRecords()
    }

    return {
        records,
        loading,
        error,
        filters,
        hasFilters,
        fetchRecords,
        clearFilters
    }
})

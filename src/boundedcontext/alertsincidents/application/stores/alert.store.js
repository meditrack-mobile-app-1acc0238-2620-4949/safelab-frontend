import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { AlertService } from '../services/alert.service'
import { filterRecordsForCurrentUser } from '@/shared/application/services/role-data-filter.service'

const alertService = new AlertService()

const getField = (record, fieldName, fallback = '') => {
    return record?.[fieldName] ?? fallback
}

const getTextField = (record, fieldName) => {
    return String(getField(record, fieldName, '')).toLowerCase()
}

export const useAlertStore = defineStore('alerts', () => {
    const alerts = ref([])
    const selectedAlert = ref(null)
    const loading = ref(false)
    const error = ref(null)

    const filters = ref({
        severity: null,
        status: null,
        query: ''
    })

    const filteredAlerts = computed(() => {
        return alerts.value.filter((alert) => {
            const alertSeverity = getField(alert, 'severity')
            const alertStatus = getField(alert, 'status')

            const matchesSeverity =
                !filters.value.severity || alertSeverity === filters.value.severity

            const matchesStatus =
                !filters.value.status || alertStatus === filters.value.status

            const query = String(filters.value.query || '').toLowerCase().trim()

            const matchesQuery =
                !query ||
                getTextField(alert, 'title').includes(query) ||
                getTextField(alert, 'type').includes(query) ||
                getTextField(alert, 'deviceName').includes(query) ||
                getTextField(alert, 'location').includes(query)

            return matchesSeverity && matchesStatus && matchesQuery
        })
    })

    const criticalAlerts = computed(() => {
        return alerts.value.filter((alert) => {
            return getField(alert, 'severity') === 'critical'
        })
    })

    const unacknowledgedAlerts = computed(() => {
        return alerts.value.filter((alert) => {
            return getField(alert, 'status') === 'active'
        })
    })

    const fetchAlerts = async () => {
        loading.value = true
        error.value = null

        try {
            alerts.value = filterRecordsForCurrentUser(await alertService.findAll())
        } catch (exception) {
            console.error(exception)
            error.value = 'Could not load alerts.'
        } finally {
            loading.value = false
        }
    }

    const fetchAlertById = async (id) => {
        loading.value = true
        error.value = null
        selectedAlert.value = null

        try {
            selectedAlert.value = await alertService.findById(id)
        } catch (exception) {
            console.error(exception)
            error.value = 'Could not load alert detail.'
        } finally {
            loading.value = false
        }
    }

    const acknowledgeAlert = async (id) => {
        await alertService.acknowledge(id)
        await fetchAlertById(id)
        await fetchAlerts()
    }

    const resolveAlert = async (id) => {
        await alertService.resolve(id)
        await fetchAlertById(id)
        await fetchAlerts()
    }

    const escalateAlert = async (id) => {
        await alertService.escalate(id)
        await fetchAlertById(id)
        await fetchAlerts()
    }

    const setFilters = (newFilters) => {
        filters.value = {
            ...filters.value,
            ...newFilters
        }
    }

    const clearFilters = () => {
        filters.value = {
            severity: null,
            status: null,
            query: ''
        }
    }

    return {
        alerts,
        selectedAlert,
        loading,
        error,
        filters,
        filteredAlerts,
        criticalAlerts,
        unacknowledgedAlerts,
        fetchAlerts,
        fetchAlertById,
        acknowledgeAlert,
        resolveAlert,
        escalateAlert,
        setFilters,
        clearFilters
    }
})
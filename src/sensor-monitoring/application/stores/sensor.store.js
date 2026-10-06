import { defineStore } from 'pinia'
import { fetchSensors } from '../services'
import { filterRecordsForCurrentUser } from '@/shared/application/services/role-data-filter.service'

export const useSensorStore = defineStore('sensor-monitoring', {
    state: () => ({
        sensors: [],
        loading: false,
        error: null,
        searchQuery: '',
        statusFilter: 'All',
        typeFilter: 'All'
    }),

    getters: {
        filteredSensors(state) {
            const normalizedQuery = state.searchQuery.trim().toLowerCase()

            const byQuery = normalizedQuery
                ? state.sensors.filter(sensor =>
                    sensor.name.toLowerCase().includes(normalizedQuery) ||
                    sensor.code.toLowerCase().includes(normalizedQuery)
                )
                : state.sensors

            const byStatus = state.statusFilter === 'All'
                ? byQuery
                : byQuery.filter(sensor => sensor.status === state.statusFilter)

            const byType = state.typeFilter === 'All'
                ? byStatus
                : byStatus.filter(sensor => sensor.type === state.typeFilter)

            return [...byType].sort((left, right) => {
                const leftTime = left.lastReadingAt ? left.lastReadingAt.getTime() : 0
                const rightTime = right.lastReadingAt ? right.lastReadingAt.getTime() : 0

                return rightTime - leftTime
            })
        }
    },

    actions: {
        async loadSensors() {
            this.loading = true
            this.error = null

            try {
                this.sensors = filterRecordsForCurrentUser(await fetchSensors())
            } catch (error) {
                this.error = error
            } finally {
                this.loading = false
            }
        },

        setSearchQuery(value) {
            this.searchQuery = value
        },

        setStatusFilter(value) {
            this.statusFilter = value
        },

        setTypeFilter(value) {
            this.typeFilter = value
        }
    }
})
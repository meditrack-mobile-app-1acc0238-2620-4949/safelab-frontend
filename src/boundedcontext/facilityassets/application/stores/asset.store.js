import { defineStore } from 'pinia'
import { AssetService } from '../../infrastructure/services/AssetService'
import { filterRecordsForCurrentUser } from '@/shared/application/services/role-data-filter.service'

export const useAssetStore = defineStore('asset', {
    state: () => ({
        assets: [],
        isLoading: false,
        error: null
    }),
    actions: {
        async fetchAssets() {
            this.isLoading = true; this.error = null
            try {
                this.assets = filterRecordsForCurrentUser(await AssetService.getAll())
            } catch (err) {
                this.error = 'No se pudieron cargar los activos.'
            } finally {
                this.isLoading = false
            }
        },
        async createAsset(assetData) {
            try {
                const newAsset = await AssetService.create(assetData)
                this.assets.push(newAsset)
            } catch (err) {
                this.error = 'Error al crear el activo.'
            }
        },
        async updateAsset(id, assetData) {
            try {
                const updatedAsset = await AssetService.update(id, assetData)
                const index = this.assets.findIndex(a => a.id === id)
                if (index !== -1) {
                    this.assets[index] = updatedAsset
                }
            } catch (err) {
                this.error = 'Error al actualizar el activo.'
            }
        },
        async deleteAsset(id) {
            try {
                await AssetService.delete(id)
                this.assets = this.assets.filter(a => a.id !== id)
            } catch (err) {
                this.error = 'Error al eliminar el activo.'
            }
        }
    }
})
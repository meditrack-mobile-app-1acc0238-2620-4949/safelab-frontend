import axios from 'axios'
import { Asset } from '../../domain/models/Asset'

const API_URL = `${import.meta.env.VITE_API_BASE_URL || 'https://safelab-platform-api.onrender.com/api/v1'}/assets`

export const AssetService = {
    async getAll() {
        try {
            const response = await axios.get(API_URL)
            return response.data.map(item => new Asset(item))
        } catch (error) {
            console.error('Error fetching assets:', error)
            throw error
        }
    },

    async create(assetData) {
        const response = await axios.post(API_URL, assetData)
        return new Asset(response.data)
    },

    async update(id, assetData) {
        const response = await axios.put(`${API_URL}/${id}`, assetData)
        return new Asset(response.data)
    },

    async delete(id) {
        await axios.delete(`${API_URL}/${id}`)
        return id
    }
}
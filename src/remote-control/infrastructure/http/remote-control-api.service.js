import axios from 'axios'

const http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://safelab-platform-api.onrender.com/api/v1'
})

export class RemoteControlApiService {
    getActuators() {
        return http.get('/remoteActuators')
    }

    getCommands() {
        return http.get('/remoteCommands')
    }

    getPolicies() {
        return http.get('/deviceControlPolicies')
    }

    createCommand(payload) {
        return http.post('/remoteCommands', payload)
    }

    updateActuator(id, payload) {
        return http.patch(`/remoteActuators/${id}`, payload)
    }
}
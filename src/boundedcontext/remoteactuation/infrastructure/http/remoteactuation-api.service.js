import axios from 'axios'

const http = axios.create({
    baseURL: 'http://localhost:3000'
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
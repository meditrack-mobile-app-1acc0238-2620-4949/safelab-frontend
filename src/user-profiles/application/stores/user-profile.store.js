import { defineStore } from 'pinia'
import { UserProfileApiService } from '../../infrastructure/http/user-profile-api.service'
import { useAppStore } from '@/shared/application/stores/app.store'
import { useAuthStore } from '@/identity-access/application/stores/auth.store'

const userProfileApiService = new UserProfileApiService()

const buildFormFromProfile = (profile) => ({
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    laboratory: profile?.laboratory || '',
    language: profile?.language || 'en',
    timezone: profile?.timezone || 'America/Lima',
    notificationPreference: profile?.notificationPreference || 'critical-and-daily'
})

const buildFullName = (firstName, lastName) => {
    return `${firstName || ''} ${lastName || ''}`.trim()
}

const buildInitials = (firstName, lastName) => {
    const first = firstName?.charAt(0) || ''
    const last = lastName?.charAt(0) || ''

    return `${first}${last}`.toUpperCase() || 'SL'
}

const syncTopbarUser = (profile) => {
    const appStore = useAppStore()

    appStore.$patch({
        currentUser: {
            ...appStore.currentUser,
            fullName: profile.fullName,
            initials: profile.initials,
            role: profile.role,
            position: profile.position
        }
    })
}

export const useUserProfileStore = defineStore('user-profile', {
    state: () => ({
        profile: null,
        form: buildFormFromProfile(null),
        loading: false,
        saving: false,
        error: null,
        successMessage: ''
    }),

    getters: {
        fullName(state) {
            if (!state.profile) return ''

            return `${state.profile.firstName} ${state.profile.lastName}`.trim()
        },

        initials(state) {
            if (!state.profile) return 'SL'

            return buildInitials(state.profile.firstName, state.profile.lastName)
        }
    },

    actions: {
        async loadProfile() {
            this.loading = true
            this.error = null
            this.successMessage = ''

            try {
                const authStore = useAuthStore()
                authStore.restoreSession()

                const accountId = authStore.currentUser?.id || 1
                const response = await userProfileApiService.getProfileByAccountId(accountId)
                const profile = Array.isArray(response.data) ? response.data[0] : response.data

                this.profile = profile
                this.form = buildFormFromProfile(profile)

                syncTopbarUser(profile)
            } catch (error) {
                console.error(error)
                this.error = 'Could not load user profile.'
            } finally {
                this.loading = false
            }
        },

        async saveProfile() {
            this.saving = true
            this.error = null
            this.successMessage = ''

            try {
                const fullName = buildFullName(this.form.firstName, this.form.lastName)
                const initials = buildInitials(this.form.firstName, this.form.lastName)

                const payload = {
                    firstName: this.form.firstName,
                    lastName: this.form.lastName,
                    fullName,
                    initials,
                    email: this.form.email,
                    phone: this.form.phone,
                    laboratory: this.form.laboratory,
                    language: this.form.language,
                    timezone: this.form.timezone,
                    notificationPreference: this.form.notificationPreference,
                    updatedAt: new Date().toISOString()
                }

                const response = await userProfileApiService.updateProfile(this.profile.id, payload)

                this.profile = response.data
                this.form = buildFormFromProfile(response.data)
                this.successMessage = 'Profile updated successfully.'

                syncTopbarUser(response.data)

                const authStore = useAuthStore()
                authStore.updateCurrentUserProfile(response.data)
            } catch (error) {
                console.error(error)
                this.error = 'Could not update user profile.'
            } finally {
                this.saving = false
            }
        },

        async simulatePasswordChange() {
            this.saving = true
            this.error = null
            this.successMessage = ''

            try {
                const response = await userProfileApiService.updateProfile(this.profile.id, {
                    lastPasswordChange: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                })

                this.profile = response.data
                this.successMessage = 'Security information updated successfully.'

                syncTopbarUser(response.data)

                const authStore = useAuthStore()
                authStore.updateCurrentUserProfile(response.data)
            } catch (error) {
                console.error(error)
                this.error = 'Could not update security information.'
            } finally {
                this.saving = false
            }
        }
    }
})
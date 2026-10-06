import MyProfileView from './views/MyProfileView.vue'

export const routes = [
    {
        path: 'user-profiles',
        redirect: '/user-profiles/my-profile'
    },
    {
        path: 'user-profiles/my-profile',
        name: 'user-profiles-my-profile',
        component: MyProfileView,
        meta: {
            titleKey: 'menu.profiles.MyProfile',
            contextKey: 'profiles',
            viewKey: 'profiles.MyProfile',
            hideSidebarActive: true
        }
    }
]
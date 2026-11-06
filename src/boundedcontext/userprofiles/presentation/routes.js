import MyProfileView from './views/MyProfileView.vue'

export const routes = [
    {
        path: 'userprofiles',
        redirect: '/userprofiles/my-profile'
    },
    {
        path: 'userprofiles/my-profile',
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
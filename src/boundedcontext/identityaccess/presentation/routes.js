import LoginView from './views/LoginView.vue'
import RegisterView from './views/RegisterView.vue'
import ForgotPasswordView from './views/ForgotPasswordView.vue'

export const routes = [
    {
        path: '/identityaccess',
        redirect: '/identityaccess/login'
    },
    {
        path: '/identityaccess/login',
        name: 'identity-access-login',
        component: LoginView,
        meta: {
            public: true,
            authLayout: true,
            titleKey: 'identityAccess.login.title'
        }
    },
    {
        path: '/identityaccess/register',
        name: 'identity-access-register',
        component: RegisterView,
        meta: {
            public: true,
            authLayout: true,
            titleKey: 'identityAccess.register.title'
        }
    },
    {
        path: '/identityaccess/forgot-password',
        name: 'identity-access-forgot-password',
        component: ForgotPasswordView,
        meta: {
            public: true,
            authLayout: true,
            titleKey: 'identityAccess.forgotPassword.title'
        }
    }
]
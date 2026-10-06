import LoginView from './views/LoginView.vue'
import RegisterView from './views/RegisterView.vue'
import ForgotPasswordView from './views/ForgotPasswordView.vue'

export const routes = [
    {
        path: '/identity-access',
        redirect: '/identity-access/login'
    },
    {
        path: '/identity-access/login',
        name: 'identity-access-login',
        component: LoginView,
        meta: {
            public: true,
            authLayout: true,
            titleKey: 'identityAccess.login.title'
        }
    },
    {
        path: '/identity-access/register',
        name: 'identity-access-register',
        component: RegisterView,
        meta: {
            public: true,
            authLayout: true,
            titleKey: 'identityAccess.register.title'
        }
    },
    {
        path: '/identity-access/forgot-password',
        name: 'identity-access-forgot-password',
        component: ForgotPasswordView,
        meta: {
            public: true,
            authLayout: true,
            titleKey: 'identityAccess.forgotPassword.title'
        }
    }
]
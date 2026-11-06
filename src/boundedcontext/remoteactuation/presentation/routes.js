import ComingSoonView from '@/shared/presentation/views/ComingSoonView.vue'
import RemoteControlPanelView from './views/RemoteControlPanelView.vue'

export const routes = [
    {
        path: 'remoteactuation',
        name: 'remoteactuation',
        component: RemoteControlPanelView,
        meta: {
            titleKey: 'contextLabels.remote',
            contextKey: 'remote',
            sidebarContext: 'remoteactuation'
        }
    },
    {
        path: 'remoteactuation/remoteactuation-panel',
        name: 'remote-control-remote-control-panel',
        component: RemoteControlPanelView,
        meta: {
            titleKey: 'menu.remote.RemoteControlPanel',
            contextKey: 'remote',
            viewKey: 'remote.RemoteControlPanel',
            sidebarContext: 'remoteactuation'
        }
    },
    {
        path: 'remoteactuation/command-history',
        name: 'remote-control-command-history',
        component: RemoteControlPanelView,
        meta: {
            titleKey: 'menu.remote.CommandHistory',
            contextKey: 'remote',
            viewKey: 'remote.CommandHistory',
            sidebarContext: 'remoteactuation'
        }
    },
    {
        path: 'remoteactuation/command-status',
        name: 'remote-control-command-status',
        component: ComingSoonView,
        meta: {
            titleKey: 'menu.remote.CommandStatus',
            contextKey: 'remote',
            viewKey: 'remote.CommandStatus',
            sidebarContext: 'remoteactuation'
        }
    },
    {
        path: 'remoteactuation/actuator-status',
        name: 'remote-control-actuator-status',
        component: ComingSoonView,
        meta: {
            titleKey: 'menu.remote.ActuatorStatus',
            contextKey: 'remote',
            viewKey: 'remote.ActuatorStatus',
            sidebarContext: 'remoteactuation'
        }
    },
    {
        path: 'remoteactuation/device-control-policy',
        name: 'remote-control-device-control-policy',
        component: ComingSoonView,
        meta: {
            titleKey: 'menu.remote.DeviceControlPolicy',
            contextKey: 'remote',
            viewKey: 'remote.DeviceControlPolicy',
            sidebarContext: 'remoteactuation'
        }
    },
    {
        path: 'remoteactuation/execution-result',
        name: 'remote-control-execution-result',
        component: ComingSoonView,
        meta: {
            titleKey: 'menu.remote.ExecutionResult',
            contextKey: 'remote',
            viewKey: 'remote.ExecutionResult',
            sidebarContext: 'remoteactuation'
        }
    },
    {
        path: 'remoteactuation/safety-validation',
        name: 'remote-control-safety-validation',
        component: ComingSoonView,
        meta: {
            titleKey: 'menu.remote.SafetyValidation',
            contextKey: 'remote',
            viewKey: 'remote.SafetyValidation',
            sidebarContext: 'remoteactuation'
        }
    }
]
import ComingSoonView from '@/shared/presentation/views/ComingSoonView.vue'
import RemoteControlPanelView from './views/RemoteControlPanelView.vue'

export const routes = [
    {
        path: 'remote-control',
        name: 'remote-control',
        component: RemoteControlPanelView,
        meta: {
            titleKey: 'contextLabels.remote',
            contextKey: 'remote',
            sidebarContext: 'remote-control'
        }
    },
    {
        path: 'remote-control/remote-control-panel',
        name: 'remote-control-remote-control-panel',
        component: RemoteControlPanelView,
        meta: {
            titleKey: 'menu.remote.RemoteControlPanel',
            contextKey: 'remote',
            viewKey: 'remote.RemoteControlPanel',
            sidebarContext: 'remote-control'
        }
    },
    {
        path: 'remote-control/command-history',
        name: 'remote-control-command-history',
        component: RemoteControlPanelView,
        meta: {
            titleKey: 'menu.remote.CommandHistory',
            contextKey: 'remote',
            viewKey: 'remote.CommandHistory',
            sidebarContext: 'remote-control'
        }
    },
    {
        path: 'remote-control/command-status',
        name: 'remote-control-command-status',
        component: ComingSoonView,
        meta: {
            titleKey: 'menu.remote.CommandStatus',
            contextKey: 'remote',
            viewKey: 'remote.CommandStatus',
            sidebarContext: 'remote-control'
        }
    },
    {
        path: 'remote-control/actuator-status',
        name: 'remote-control-actuator-status',
        component: ComingSoonView,
        meta: {
            titleKey: 'menu.remote.ActuatorStatus',
            contextKey: 'remote',
            viewKey: 'remote.ActuatorStatus',
            sidebarContext: 'remote-control'
        }
    },
    {
        path: 'remote-control/device-control-policy',
        name: 'remote-control-device-control-policy',
        component: ComingSoonView,
        meta: {
            titleKey: 'menu.remote.DeviceControlPolicy',
            contextKey: 'remote',
            viewKey: 'remote.DeviceControlPolicy',
            sidebarContext: 'remote-control'
        }
    },
    {
        path: 'remote-control/execution-result',
        name: 'remote-control-execution-result',
        component: ComingSoonView,
        meta: {
            titleKey: 'menu.remote.ExecutionResult',
            contextKey: 'remote',
            viewKey: 'remote.ExecutionResult',
            sidebarContext: 'remote-control'
        }
    },
    {
        path: 'remote-control/safety-validation',
        name: 'remote-control-safety-validation',
        component: ComingSoonView,
        meta: {
            titleKey: 'menu.remote.SafetyValidation',
            contextKey: 'remote',
            viewKey: 'remote.SafetyValidation',
            sidebarContext: 'remote-control'
        }
    }
]
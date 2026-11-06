import EquipmentMaintenanceView from './views/EquipmentMaintenanceView.vue'
export const routes = [{path:'equipmentmaintenance',redirect:'/equipmentmaintenance/overview'},{path:'equipmentmaintenance/overview',name:'equipment-maintenance-overview',component:EquipmentMaintenanceView,meta:{titleKey:'bc.equipment',contextKey:'equipment',sidebarContext:'equipmentmaintenance'}}]

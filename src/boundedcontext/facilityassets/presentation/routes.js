import ComingSoonView from '@/shared/presentation/views/ComingSoonView.vue'
import AssetListView from './views/AssetListView.vue'

export const routes = [
  {
    path: 'facilityassets',
    name: 'facilityassets',
    redirect: { name: 'asset-inventory-asset-list' },
    meta: { title: 'Asset & Inventory', contextKey: 'assets' }
  },
  {
    path: 'facilityassets/asset-list',
    name: 'asset-inventory-asset-list',
    component: AssetListView,
    meta: { title: 'Asset List', contextKey: 'assets', viewKey: 'assets.AssetList' }
  },
  {
    path: 'facilityassets/asset-detail',
    name: 'asset-inventory-asset-detail',
    component: ComingSoonView,
    meta: { title: 'Asset Detail', contextKey: 'assets', viewKey: 'assets.AssetDetail' }
  },
  {
    path: 'facilityassets/equipment-status',
    name: 'asset-inventory-equipment-status',
    component: ComingSoonView,
    meta: { title: 'Equipment Status', contextKey: 'assets', viewKey: 'assets.EquipmentStatus' }
  },
  {
    path: 'facilityassets/inventory-list',
    name: 'asset-inventory-inventory-list',
    component: ComingSoonView,
    meta: { title: 'Inventory List', contextKey: 'assets', viewKey: 'assets.InventoryList' }
  },
  {
    path: 'facilityassets/critical-supplies',
    name: 'asset-inventory-critical-supplies',
    component: ComingSoonView,
    meta: { title: 'Critical Supplies', contextKey: 'assets', viewKey: 'assets.CriticalSupplies' }
  },
  {
    path: 'facilityassets/stock-movement-history',
    name: 'asset-inventory-stock-movement-history',
    component: ComingSoonView,
    meta: { title: 'Stock Movement History', contextKey: 'assets', viewKey: 'assets.StockMovementHistory' }
  },
  {
    path: 'facilityassets/storage-unit',
    name: 'asset-inventory-storage-unit',
    component: ComingSoonView,
    meta: { title: 'Storage Unit', contextKey: 'assets', viewKey: 'assets.StorageUnit' }
  },
  {
    path: 'facilityassets/maintenance-overview',
    name: 'asset-inventory-maintenance-overview',
    component: ComingSoonView,
    meta: { title: 'Maintenance Overview', contextKey: 'assets', viewKey: 'assets.MaintenanceOverview' }
  }
]
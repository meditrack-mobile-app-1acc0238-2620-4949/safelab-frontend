import ComingSoonView from '@/shared/presentation/views/ComingSoonView.vue'
import AssetListView from './views/AssetListView.vue'

export const routes = [
  {
    path: 'asset-inventory',
    name: 'asset-inventory',
    redirect: { name: 'asset-inventory-asset-list' },
    meta: { title: 'Asset & Inventory', contextKey: 'assets' }
  },
  {
    path: 'asset-inventory/asset-list',
    name: 'asset-inventory-asset-list',
    component: AssetListView,
    meta: { title: 'Asset List', contextKey: 'assets', viewKey: 'assets.AssetList' }
  },
  {
    path: 'asset-inventory/asset-detail',
    name: 'asset-inventory-asset-detail',
    component: ComingSoonView,
    meta: { title: 'Asset Detail', contextKey: 'assets', viewKey: 'assets.AssetDetail' }
  },
  {
    path: 'asset-inventory/equipment-status',
    name: 'asset-inventory-equipment-status',
    component: ComingSoonView,
    meta: { title: 'Equipment Status', contextKey: 'assets', viewKey: 'assets.EquipmentStatus' }
  },
  {
    path: 'asset-inventory/inventory-list',
    name: 'asset-inventory-inventory-list',
    component: ComingSoonView,
    meta: { title: 'Inventory List', contextKey: 'assets', viewKey: 'assets.InventoryList' }
  },
  {
    path: 'asset-inventory/critical-supplies',
    name: 'asset-inventory-critical-supplies',
    component: ComingSoonView,
    meta: { title: 'Critical Supplies', contextKey: 'assets', viewKey: 'assets.CriticalSupplies' }
  },
  {
    path: 'asset-inventory/stock-movement-history',
    name: 'asset-inventory-stock-movement-history',
    component: ComingSoonView,
    meta: { title: 'Stock Movement History', contextKey: 'assets', viewKey: 'assets.StockMovementHistory' }
  },
  {
    path: 'asset-inventory/storage-unit',
    name: 'asset-inventory-storage-unit',
    component: ComingSoonView,
    meta: { title: 'Storage Unit', contextKey: 'assets', viewKey: 'assets.StorageUnit' }
  },
  {
    path: 'asset-inventory/maintenance-overview',
    name: 'asset-inventory-maintenance-overview',
    component: ComingSoonView,
    meta: { title: 'Maintenance Overview', contextKey: 'assets', viewKey: 'assets.MaintenanceOverview' }
  }
]
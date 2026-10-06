import { useAuthStore } from '@/identity-access/application/stores/auth.store'

const toId = (value) => String(value ?? '')

const hasAssignedUser = (record, userId) => {
  const assignedUserIds = record?.assignedUserIds || record?.assignedUsers || []
  return Array.isArray(assignedUserIds) && assignedUserIds.map(toId).includes(toId(userId))
}

const matchesUserName = (record, fullName) => {
  const normalizedName = String(fullName || '').toLowerCase()
  if (!normalizedName) return false

  return [record?.assignedTo, record?.requestedBy, record?.ownerName, record?.responsible]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase() === normalizedName)
}

export const canSeeRecord = (record, user) => {
  if (!user) return false
  if (user.role === 'safeLabAdministrator') return true

  const userId = toId(user.id)
  const facilityId = toId(user.facilityId)
  const segment = user.segment

  if (toId(record?.ownerUserId) === userId) return true
  if (hasAssignedUser(record, userId)) return true
  if (matchesUserName(record, user.fullName)) return true

  if (
    ['bioclinicalCoordinator', 'hospitalPharmacyCoordinator', 'complianceOfficer', 'billingManager'].includes(user.role) &&
    facilityId &&
    toId(record?.facilityId) === facilityId
  ) {
    return true
  }

  if (
    ['complianceOfficer', 'maintenanceOperator'].includes(user.role) &&
    segment &&
    segment !== 'shared' &&
    record?.segment === segment
  ) {
    return true
  }

  return false
}

export const filterRecordsForCurrentUser = (records = []) => {
  const authStore = useAuthStore()
  authStore.restoreSession()

  return Array.isArray(records)
    ? records.filter((record) => canSeeRecord(record, authStore.currentUser))
    : []
}

export const currentScopeLabel = () => {
  const authStore = useAuthStore()
  authStore.restoreSession()

  const user = authStore.currentUser
  if (!user) return 'Guest scope'
  if (user.role === 'safeLabAdministrator') return 'Global administrator scope'
  if (user.facilityName) return user.facilityName
  return user.segment || 'Assigned operational scope'
}

export class DashboardWidget {
  constructor({ id, titleKey, type, value, status = 'neutral', descriptionKey = '', route = '', items = [] }) {
    this.id = id
    this.titleKey = titleKey
    this.type = type
    this.value = value
    this.status = status
    this.descriptionKey = descriptionKey
    this.route = route
    this.items = items
  }

  get hasItems() {
    return Array.isArray(this.items) && this.items.length > 0
  }
}

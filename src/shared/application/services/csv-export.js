// Reusable CSV export for the record tables. UTF-8 BOM helps spreadsheet programs.
export function downloadCsv(filename, records, columns = null) {
  if (!Array.isArray(records) || !records.length) return false
  const keys = columns?.length ? columns : [...new Set(records.flatMap(r => Object.keys(r)))]
  const cell = value => {
    const text = typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value ?? '')
    // Prevent spreadsheet formula evaluation when opening exported user data.
    const safe = /^[\t\r\n\s]*[=+\-@]/.test(text) ? `'${text}` : text
    return `"${safe.replaceAll('"','""')}"`
  }
  const csv = '\uFEFF' + [keys, ...records.map(row => keys.map(key => row[key]))].map(row => row.map(cell).join(',')).join('\r\n')
  const url = URL.createObjectURL(new Blob([csv], { type:'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url;link.download = `${filename.replace(/[^\w-]/g,'-')}.csv`
  document.body.appendChild(link);link.click();link.remove()
  URL.revokeObjectURL(url)
  return true
}

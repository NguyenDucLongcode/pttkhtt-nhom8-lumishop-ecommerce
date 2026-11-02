export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount || 0)
}

export function formatDate(isoString?: string): string {
  if (!isoString) return '--'
  try {
    const d = new Date(isoString)
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return isoString
  }
}

export function formatDateTime(isoString?: string): string {
  if (!isoString) return '--'
  try {
    const d = new Date(isoString)
    return `${d.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    })} ${d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })}`
  } catch {
    return isoString
  }
}

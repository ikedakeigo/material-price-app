export const api = {
  async listItems() {
    const res = await fetch('/api/items')
    if (!res.ok) throw new Error('failed to fetch items')
    return res.json()
  },
  async createItem(payload: any) {
    const res = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error('failed to create item')
    return res.json()
  },
  async refresh() {
    const res = await fetch('/api/refresh', { method: 'POST' })
    if (!res.ok) throw new Error('failed to refresh')
    return res.json()
  },
  async history(itemId: string, limit = 30) {
    const res = await fetch(`/api/items/${itemId}/prices?limit=${limit}`)
    if (!res.ok) throw new Error('failed to fetch history')
    return res.json()
  },
}

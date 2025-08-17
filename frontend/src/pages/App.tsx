import React, { useEffect, useState } from 'react'
import { api } from '../api'
import ItemCard from '../components/ItemCard'
import type { LatestItem } from '../types'

export default function App() {
  const [items, setItems] = useState<LatestItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string|undefined>()

  const load = async () => {
    setLoading(true)
    setError(undefined)
    try {
      const data = await api.listItems()
      setItems(data)
    } catch (e:any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const onAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const payload = {
      name: String(form.get('name') || ''),
      unit: String(form.get('unit') || '本'),
      base_unit: String(form.get('base_unit') || 'kg'),
      conversion_factor: Number(form.get('conversion_factor') || 1),
      category: String(form.get('category') || '') || undefined,
      source_key: String(form.get('source_key') || '') || undefined,
    }
    await api.createItem(payload)
    ;(e.currentTarget as HTMLFormElement).reset()
    await load()
  }

  const onRefresh = async () => {
    await api.refresh()
    await load()
  }

  return (
    <div style={{maxWidth:720, margin:'20px auto', padding:'0 16px'}}>
      <h1>Material Price App</h1>
      <p>ユーザー登録した資材の最新価格と前日比を表示します。</p>

      <form onSubmit={onAdd} style={{display:'grid', gridTemplateColumns:'1fr 120px 120px 120px 1fr 1fr', gap:8, alignItems:'center'}}>
        <input name="name" placeholder="品名（例: 異形棒鋼 D10）" required />
        <input name="unit" placeholder="表示単位 (本)" defaultValue="本" />
        <input name="base_unit" placeholder="基準単位 (kg)" defaultValue="kg" />
        <input name="conversion_factor" type="number" step="0.0001" placeholder="換算(例: 1本=3.4kg → 3.4)" defaultValue="1" />
        <input name="category" placeholder="カテゴリ(任意)" />
        <input name="source_key" placeholder="ソースキー(任意)" />
        <button type="submit">追加</button>
        <button type="button" onClick={onRefresh}>手動更新</button>
      </form>

      {loading && <p>読み込み中...</p>}
      {error && <p style={{color:'red'}}>Error: {error}</p>}

      <div style={{marginTop:16}}>
        {items.map(it => <ItemCard key={it.id} item={it} />)}
      </div>
    </div>
  )
}

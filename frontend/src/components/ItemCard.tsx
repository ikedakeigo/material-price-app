import React from 'react'
import type { LatestItem } from '../types'

export default function ItemCard({ item }: { item: LatestItem }) {
  const rate = item.deltaRate ?? 0
  const upDown = rate > 0 ? '↑' : rate < 0 ? '↓' : '→'
  const color = rate > 0 ? 'red' : rate < 0 ? 'blue' : 'gray'
  return (
    <div style={{border:'1px solid #ddd', padding:12, borderRadius:8, marginBottom:8}}>
      <div style={{display:'flex', justifyContent:'space-between'}}>
        <strong>{item.name}</strong>
        <span style={{color}}>{upDown} {rate ? rate.toFixed(1) : '0.0'}%</span>
      </div>
      <div style={{marginTop:6}}>
        単価: {item.latestPrice?.toLocaleString()} / {item.unit}
      </div>
      {item.updatedAt && <div style={{fontSize:12, color:'#666'}}>更新: {new Date(item.updatedAt).toLocaleString()}</div>}
    </div>
  )
}

export type LatestItem = {
  id: string
  name: string
  category?: string
  unit: string
  base_unit: string
  conversion_factor: number
  latestPrice?: number
  delta?: number
  deltaRate?: number
  updatedAt?: string
}

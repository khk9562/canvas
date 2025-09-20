export interface Item {
  tooltipTitle: string
  x: string | Date // 'YYYY-MM-DD HH:mm:ss' or Date object
  y: number
  unit: number
}
export interface Dataset {
  label: string
  items: Item[]
}
export interface ProcessData {
  width: number | string
  height: number | string
  unit: string
  data: Dataset[]
  colorData: string[]
  xScaleList: [Date, Date] | [string, string]
  interval?: string // '1H' | '1D' | '1W' | '1MO' | '1Y'
  tooltipComponent?: any
}
export interface TooltipData {
  dataset: Dataset
  item: Item
  backgroundColor: string
}

export interface MultiLineChartProps {
  processData: ProcessData
  // customTooltipRenderer?: (data: TooltipData[], timeLabel: string) => string;
}

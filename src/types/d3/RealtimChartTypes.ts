export interface DataPoint {
  timestamp: string
  value: number
  category: "A" | "B" | "C"
}

export interface ChartDimensions {
  width: number
  height: number
  margin: {
    top: number
    right: number
    bottom: number
    left: number
  }
}

export interface ScaleConfig {
  x: d3.ScaleTime<number, number>
  y: d3.ScaleTime<number, number>
}

export interface RealtimeChartTypes {
  width?: number
  height?: number
}

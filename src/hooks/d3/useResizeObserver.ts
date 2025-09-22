import { useEffect, RefObject } from "react"

interface UseResizeObserverProps {
  createChart: () => void
  svgRef: RefObject<SVGSVGElement>
}

export default function useResizeObserver({ createChart, svgRef }: UseResizeObserverProps) {
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      createChart && createChart() // 크기 변경시 차트 재생성
    })

    if (svgRef.current) {
      resizeObserver.observe(svgRef.current)
    }

    return () => resizeObserver.disconnect()
  }, [])
}

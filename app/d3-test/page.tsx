"use client"
import styles from "./page.module.css"
import useMakeBasicTest from "@/hooks/d3/useMakeBasicTest"
import { useRouter, usePathname } from "next/navigation"
import useResizeObserver from "@/hooks/d3/useResizeObserver"

import { Button } from "react-bootstrap"
import RealtimeChart from "@/components/D3/RealtimeChart"

// d3 테스트 메인 페이지
export default function D3TestPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { containerRef, svgRef, createDirectlyBarChart } = useMakeBasicTest()
  useResizeObserver({ createChart: createDirectlyBarChart, svgRef })

  return (
    <article className={styles.chartTestPage} ref={containerRef}>
      <nav className={styles.navBtns}>
        <Button
          variant='secondary'
          size='sm'
          onClick={() => router.push(`${pathname}/multi-line-chart`)}
        >
          Go MultiLineChart
        </Button>
      </nav>

      <section>
        <svg
          ref={svgRef}
          className={styles.boxCont}
          // CHECK: viewbox도 처음 마운트시에 유동적으로 불러오기
          preserveAspectRatio='xMidYMid meet'
        />
      </section>

      <section>
        <RealtimeChart width={1200} height={800} />
      </section>
    </article>
  )
}

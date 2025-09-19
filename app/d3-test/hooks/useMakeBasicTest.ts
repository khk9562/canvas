import { useEffect, useRef } from "react"
import * as d3 from "d3"

export default function useMakeBasicTest() {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // 1. 기본 텍스트 추가
    if (containerRef.current) {
      d3.select(containerRef.current)
        .append("p")
        .text("Hello D3 from Next.js!")
        .style("color", "green")
        .style("font-size", "18px")
    }

    // 2. 데이터로 DIV 만들기
    const data = [10, 20, 30, 40, 50]
    d3.select(containerRef.current)
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("div")
      .attr("class", "bar")
      .style("width", (d) => d * 4 + "px")
      .style("height", "25px")
      .style("background", "steelblue")
      .style("margin", "2px 0")
      .style("color", "white")
      .style("text-align", "center")
      .style("line-height", "25px")
      .text((d) => d)

    // 3. SVG 바 차트
    if (svgRef.current) {
      const svg = d3.select(svgRef.current)
      const chartData = [30, 80, 45, 60, 20, 90, 75]

      svg
        .selectAll("rect")
        .data(chartData)
        .enter()
        .append("rect")
        .attr("x", (d, i) => i * 70)
        .attr("y", (d) => 300 - d * 3)
        .attr("width", 60)
        .attr("height", (d) => d * 3)
        .attr("fill", "steelblue")
        .on("click", function (event, d) {
          alert(`값: ${d}`)
        })
    }

    // 브라우저 콘솔에 d3를 전역으로 노출 (개발용)
    ;(window as any).d3 = d3
    console.log("✅ D3가 window.d3에 노출되었습니다!")
    console.log("콘솔에서 d3.version 또는 window.d3.version을 입력해보세요")
  }, [])

  const handleButtonTest = () => {
    // 버튼 클릭으로 D3 테스트
    d3.select(containerRef.current)
      .append("p")
      .text(`새 텍스트 추가됨: ${new Date().toLocaleTimeString()}`)
      .style("color", "red")
  }

  return {
    svgRef,
    containerRef,
    handleButtonTest,
  }
}

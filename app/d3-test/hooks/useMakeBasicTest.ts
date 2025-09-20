import { useEffect, useRef } from "react"
import * as d3 from "d3"
import { COLORS } from "../constants/colors"

export default function useMakeBasicTest() {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 바 차트 데이터
  const testData = [30, 80, 45, 60, 20, 90, 75]

  const createBarChart = () => {
    const svg = d3.select(svgRef.current)

    // SVG 전체 클리어
    svg.selectAll("*").remove()

    // 차트 설정
    const margin = { top: 50, right: 50, bottom: 80, left: 80 }
    const chartWidth = 1200 - margin.left - margin.right
    const chartHeight = 400 - margin.top - margin.bottom
    const barWidth = (chartWidth / testData.length) * 0.8

    // y 스케일 (데이터 값 -> SVG 좌표)
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(testData) || 0])
      .range([chartHeight, 0])

    // 차트 그룹 생성
    const chartGroup = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`)

    // 바 생성
    chartGroup
      .selectAll("rect")
      .data(testData)
      .enter()
      .append("rect")
      .attr(
        "x",
        (d, i) =>
          i * (chartWidth / testData.length) +
          (chartWidth / testData.length - barWidth) / 2
      )
      .attr("y", (d) => yScale(d))
      .attr("width", barWidth)
      .attr("height", (d) => chartHeight - yScale(d))
      .attr("fill", (d, i) => COLORS[i % COLORS.length])
      .attr("stroke", "#333")
      .attr("stroke-width", 1)

    // 값 라벨 추가
    chartGroup
      .selectAll("text")
      .data(testData)
      .enter()
      .append("text")
      .attr(
        "x",
        (d, i) =>
          i * (chartWidth / testData.length) + chartWidth / testData.length / 2
      )
      .attr("y", (d) => yScale(d) - 10)
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .attr("fill", "#333")
      .text((d) => d)

    console.log("바 차트 생성 완료")
  }

  const createDirectlyBarChart = () => {
    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const svgElement = svgRef.current
    const actualWidth = svgElement?.getBoundingClientRect().width || 0
    const actualHeight = svgElement?.getBoundingClientRect().height || 0

    const margin = {
      left: 50,
      right: 50,
      top: 50,
      bottom: 50,
    }

    const chartWidth = Math.max(actualWidth - margin.left - margin.right, 0)
    const chartHeight = Math.max(actualHeight - margin.top - margin.bottom, 0)

    const xScale = d3
      .scaleBand()
      .domain(testData.map((d, i) => i.toString()))
      .range([0, chartWidth])
      .padding(0.1) // gap 비율로 조절

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(testData) || 0])
      .range([chartHeight, 0]) // svg는 위가 0이므로 뒤집기

    // viewBox를 실제 크기에 맞춰 동적 설정
    // svg.attr("viewBox", `0 0 ${actualWidth} ${actualHeight}`)

    // const gap = 10
    // const barWidth =
    //   (chartWidth - (testData.length - 1) * gap) / testData.length
    // console.log("barWidth", barWidth)

    const chartGroup = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`)

    chartGroup
      .selectAll("rect")
      .data(testData)
      .enter()
      .append("rect")
      .attr("x", (d, i) => xScale(i.toString() || 0))
      .attr("y", (d) => yScale(d))
      .attr("width", xScale.bandwidth()) // 자동계산된 바 너비
      .attr("height", (d) => chartHeight - yScale(d))
      .attr("fill", (d, i) => COLORS[i % COLORS.length])
  }

  useEffect(() => {
    if (svgRef.current) {
      // createBarChart()
      createDirectlyBarChart()
    }
  }, [])

  return {
    svgRef,
    containerRef,
    createDirectlyBarChart,
  }
}

"use client"

import { useEffect, useRef, useMemo, useState } from "react"
import * as d3 from "d3"
import { DataPoint, RealtimeChartTypes } from "@/types/d3/RealtimChartTypes"
import styles from "./RealtimeChart.module.scss"
import useSSE from "@/hooks/shared/useSSE"

export default function RealtimeChart({
  width = 800,
  height = 400,
}: RealtimeChartTypes) {
  const svgRef = useRef<SVGSVGElement>(null)

  // 차트 여백 설정
  const margin = {
    top: 20,
    right: 30,
    bottom: 40,
    left: 50,
  }
  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  // SSE 연결 및 데이터 수신
  const { isLoading, isConnected, data } = useSSE<DataPoint>()

  // D3 스케일 메모이제이션
  const scales = useMemo(() => {
    if (data.length === 0) return null

    const timeExtent = d3.extent(data, (d) => new Date(d.timestamp)) as [
      Date,
      Date
    ]
    const valueExtent = d3.extent(data, (d) => d.value) as [number, number]

    return {
      x: d3.scaleTime().domain(timeExtent).range([0, innerWidth]),
      y: d3.scaleLinear().domain(valueExtent).range([innerHeight, 0]),
    }
  }, [data, innerWidth, innerHeight])

  // D3 라인 생성기 메모이제이션
  const lineGenerator = useMemo(() => {
    if (!scales) return null

    return d3
      .line<DataPoint>()
      .x((d) => scales.x(new Date(d.timestamp)))
      .y((d) => scales.y(d.value))
      .curve(d3.curveMonotoneX) // 부드러운 곡선
  }, [scales])

  // 축 생성기 메모이제이션
  const axisGenerators = useMemo(() => {
    if (!scales) return null

    return {
      x: d3.axisBottom(scales.x).tickFormat(d3.timeFormat("%H:%M:%S") as any),
      y: d3
        .axisLeft(scales.y)
        .ticks(5) // Y축 틱 개수 조정
        .tickFormat(d3.format(".1f")), // 소수점 1자리까지
    }
  }, [scales])

  // 차트 렌더링 (D3 DOM 조작)
  useEffect(() => {
    if (!scales || !lineGenerator || !axisGenerators || data.length === 0)
      return

    const svg = d3.select(svgRef.current)
    const g = svg.select("g")

    // 라인 업데이트
    const path = g.select("path").datum(data).attr("d", lineGenerator)

    // 카테고리별 색상 매핑
    const categoryColors = {
      A: "#ff6b6b",
      B: "#4ecdc4",
      C: "#45b7d1",
    }

    // 포인트 업데이트 (data binding의 핵심!)
    const circles = g.selectAll<SVGCircleElement, DataPoint>(".dot").data(data)

    // Enter: 새로운 데이터 포인트
    circles
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("fill", (d) => categoryColors[d.category])
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 0)
      .attr("r", 0)
      .attr("cx", (d) => scales.x(new Date(d.timestamp)))
      .attr("cy", (d) => scales.y(d.value))
      .style("cursor", "pointer")
      .on("mouseenter", function () {
        d3.select(this).attr("stroke-width", 2)
      })
      .on("mouseleave", function () {
        d3.select(this).attr("stroke-width", 0)
      })
      .transition()
      .duration(100)
      .attr("r", 6)

    // Update: 기존 데이터 포인트 위치 업데이트
    circles
      .transition()
      .duration(100)
      .attr("cx", (d) => scales.x(new Date(d.timestamp)))
      .attr("cy", (d) => scales.y(d.value))

    // Exit: 제거될 데이터 포인트 애니메이션
    circles.exit().transition().duration(300).attr("r", 0).remove()

    // 축 업데이트
    g.select<SVGGElement>(`.${styles.xAxis}`).call(axisGenerators.x)

    g.select<SVGGElement>(`.${styles.yAxis}`).call(axisGenerators.y)
  }, [data, scales, lineGenerator, axisGenerators])

  console.log("data", data)

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>
        실시간 차트 {isLoading && <>(로딩중..)</>}
      </h3>

      <article className={styles.chartWrapper}>
        <div className={styles.svgContainer}>
          <svg
            ref={svgRef}
            className={styles.chartSvg}
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
          >
            <g
              className={styles.chartGroup}
              transform={`translate(${margin.left},${margin.top})`}
            >
              {/* 라인 패스 */}
              <path className={styles.line} />

              {/* X축 */}
              <g
                className={styles.xAxis}
                transform={`translate(0,${innerHeight})`}
              />

              {/* Y축 */}
              <g className={styles.yAxis} />

              {/* 축 레이블 */}
              <text
                className={styles.axisLabel}
                transform={`translate(${innerWidth / 2},${innerHeight + 35})`}
              >
                시간
              </text>
              <text
                className={styles.axisLabel}
                transform={`translate(-35,${innerHeight / 2}) rotate(-90)`}
              >
                값
              </text>
            </g>
          </svg>
        </div>

        {/* 범례 */}
        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <div className={`${styles.legendColor} ${styles.categoryA}`}></div>
            <span className={styles.legendText}>Category A</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendColor} ${styles.categoryB}`}></div>
            <span className={styles.legendText}>Category B</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendColor} ${styles.categoryC}`}></div>
            <span className={styles.legendText}>Category C</span>
          </div>
        </div>

        {/* 상태 정보 */}
        <div className={styles.statusInfo}>
          <span>
            현재 데이터 포인트:{" "}
            <span className={styles.dataCount}>{data.length}개</span>
          </span>
          <span
            className={`${styles.connectionStatus} ${
              isConnected ? styles.connected : styles.disconnected
            }`}
          >
            {isConnected ? "연결됨" : "연결 끊김"}
          </span>
        </div>
      </article>
    </div>
  )
}

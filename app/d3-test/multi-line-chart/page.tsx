"use client"

import React, { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
// import {
//   convertSizeToPrettyFormat,
//   convertToComma,
//   xScaleLabel,
// } from "@/app/src/shared/convert.shared"
import { xScaleLabel } from "./xScaleLabel"
import { sampleProcessData } from "../../../src/constants/d3/sampleData"
// import FloatingMenu from "../components/FloatingMenu"
// import Loading from "../Loading"
import "./MultiLineChart.scss"
import type {
  Dataset,
  ProcessData,
  TooltipData,
  MultiLineChartProps,
  Item,
} from "../../../src/types/d3/MultiLineChartTypes"

/** 중복되는 라벨을 간단히 숨김 처리 */
function hideOverlappingLabels(
  axisG: d3.Selection<SVGGElement, unknown, null, undefined>,
  chartInnerWidth: number
) {
  const ticks = axisG.selectAll<SVGGElement, unknown>("g.tick").nodes()
  if (!ticks.length) return

  // 각 라벨의 텍스트 내용과 위치 수집
  const ticksData = ticks.map((tick, index) => {
    const text = tick.querySelector("text") as SVGTextElement | null
    const textContent = text?.textContent || ""
    const width = text ? text.getBBox().width : 0
    const transform = tick.getAttribute("transform")
    let x = 0
    if (transform) {
      const match = transform.match(/translate\(([^,]+)/)
      x = match ? parseFloat(match[1]) : 0
    }
    return { index, textContent, width, x, tick, text }
  })

  console.log("ticksData", ticksData)

  // 텍스트 내용으로 중복 검사 및 겹침 검사
  const seenTexts = new Set<string>()
  const visibleTicks: typeof ticksData = []

  ticksData.forEach((tickData) => {
    // 이미 같은 텍스트가 표시되었다면 숨김
    if (seenTexts.has(tickData.textContent)) {
      if (tickData.text) {
        d3.select(tickData.text).style("display", "none")
      }
      return
    }

    // 이전에 표시된 라벨과 겹치는지 검사
    let hasOverlap = false
    for (const visible of visibleTicks) {
      const distance = Math.abs(tickData.x - visible.x)
      const minDistance = (tickData.width + visible.width) / 2 + 10 // 10px 패딩
      if (distance < minDistance) {
        hasOverlap = true
        break
      }
    }

    if (!hasOverlap) {
      // 겹치지 않으면 표시
      seenTexts.add(tickData.textContent)
      visibleTicks.push(tickData)
      if (tickData.text) {
        d3.select(tickData.text).style("display", null)
      }
    } else {
      // 겹치면 숨김
      if (tickData.text) {
        d3.select(tickData.text).style("display", "none")
      }
    }
  })

  console.log("ticksData after hiding", ticksData)
}

function MultiLineChart({ processData }: MultiLineChartProps) {
  const {
    width,
    height,
    unit,
    data,
    colorData,
    xScaleList,
    interval = "1H",
    tooltipComponent,
  } = processData
  console.log("processData", processData)

  // 컴포넌트별 고유 식별자 생성
  const chartId = useRef(
    `chart-${Math.random().toString(36).substring(2)}`
  ).current

  // 툴팁 상태 관리
  const [tooltipData, setTooltipData] = useState<{
    data: TooltipData[]
    timeLabel: string
    visible: boolean
    x: number
    y: number
  }>({
    data: [],
    timeLabel: "",
    visible: false,
    x: 0,
    y: 0,
  })

  // top 늘림(단위 텍스트 잘림 방지)
  const margin = { top: 25, right: 0, bottom: 0, left: 50 }
  const X_AXIS_H = 24
  const LEGEND_ROW_H = 18
  const RESERVED_LEGEND_H = LEGEND_ROW_H + 8
  const LEGEND_OFFSET = 8

  const [resizeEvent, setResizeEvent] = useState("")
  const svgRef = useRef<SVGSVGElement | null>(null)
  const bodyRef = useRef<HTMLDivElement | null>(null)
  const tooltipRef = useRef<HTMLDivElement | null>(null)
  const tooltipCompRef = useRef<HTMLDivElement | null>(null)

  // Zoom state
  const [zoomDomain, setZoomDomain] = useState<[Date, Date] | null>(null)
  const dragStateRef = useRef<{
    isDragging: boolean
    startX: number
    currentX: number
    dragRect: d3.Selection<SVGRectElement, unknown, null, undefined> | null
  }>({ isDragging: false, startX: 0, currentX: 0, dragRect: null })

  const parse = d3.timeParse("%Y-%m-%d %H:%M:%S")
  const fmt = d3.timeFormat("%Y-%m-%d %H:%M:%S")

  // Date 객체를 문자열로 변환하는 헬퍼 함수
  const normalizeXValue = (x: string | Date): string => {
    if (x instanceof Date) {
      return fmt(x)
    }
    return x
  }

  // 문자열을 Date 객체로 변환하는 헬퍼 함수
  const parseXValue = (x: string | Date): Date => {
    const xStr = normalizeXValue(x)
    return parse(xStr) ?? new Date(xStr)
  }

  // xScaleList를 Date 객체 배열로 변환하는 헬퍼 함수
  const normalizeXScaleList = (
    xScaleList: [Date, Date] | [string, string]
  ): [Date, Date] => {
    return [
      xScaleList[0] instanceof Date
        ? xScaleList[0]
        : parseXValue(xScaleList[0]),
      xScaleList[1] instanceof Date
        ? xScaleList[1]
        : parseXValue(xScaleList[1]),
    ]
  }

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    if (!bodyRef.current || !svgRef.current) return

    const { width: aw, height: ah } = bodyRef.current.getBoundingClientRect()
    svg.selectAll("*").remove()

    if (data && data.length) makeMultiLine(svg, aw, ah)
    else makeEmptyMultiLine(svg, aw, ah)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resizeEvent, data, zoomDomain])

  // 전역 이벤트 리스너 설정
  useEffect(() => {
    const handleMouseUp = () => {
      const dragState = dragStateRef.current
      if (dragState.isDragging) {
        const normalizedXScaleList = normalizeXScaleList(xScaleList)
        const currentDomain = zoomDomain || normalizedXScaleList
        const chartInnerWidth =
          (bodyRef.current?.getBoundingClientRect().width || 0) -
          margin.left -
          margin.right
        const xScale = d3
          .scaleTime()
          .domain(currentDomain)
          .range([margin.left, margin.left + chartInnerWidth])

        const minX = Math.min(dragState.startX, dragState.currentX)
        const maxX = Math.max(dragState.startX, dragState.currentX)
        const dragWidth = Math.abs(dragState.currentX - dragState.startX)

        if (dragWidth > 10) {
          // 최소 드래그 거리
          const startDate = xScale.invert(minX)
          const endDate = xScale.invert(maxX)
          setZoomDomain([startDate, endDate])
        }

        // 드래그 박스 숨기기
        if (dragState.dragRect) {
          dragState.dragRect.style("display", "none")
        }

        dragStateRef.current = {
          isDragging: false,
          startX: 0,
          currentX: 0,
          dragRect: dragState.dragRect,
        }
      }
    }

    const handleMouseMove = (event: MouseEvent) => {
      const dragState = dragStateRef.current
      if (dragState.isDragging && dragState.dragRect && bodyRef.current) {
        const rect = bodyRef.current.getBoundingClientRect()
        const mouseX = event.clientX - rect.left
        const chartInnerWidth = rect.width - margin.left - margin.right
        const currentX = Math.max(
          margin.left,
          Math.min(mouseX, margin.left + chartInnerWidth)
        )

        dragState.currentX = currentX

        const rectX = Math.min(dragState.startX, currentX)
        const rectWidth = Math.abs(currentX - dragState.startX)

        dragState.dragRect
          .attr("x", rectX)
          .attr("width", rectWidth)
          .style("display", rectWidth > 2 ? "block" : "none")
      }
    }

    // 항상 이벤트 리스너 등록
    document.addEventListener("mouseup", handleMouseUp)
    document.addEventListener("mousemove", handleMouseMove)

    return () => {
      document.removeEventListener("mouseup", handleMouseUp)
      document.removeEventListener("mousemove", handleMouseMove)
    }
  }, [xScaleList, zoomDomain, margin])

  // 줌 리셋 함수
  const resetZoom = () => {
    setZoomDomain(null)
  }

  // 줌 아웃 함수 (현재 범위를 1.5배 확장하되 원본 범위를 초과하지 않음)
  const zoomOut = () => {
    if (!zoomDomain) return

    const normalizedXScaleList = normalizeXScaleList(xScaleList)
    const originalStart = normalizedXScaleList[0].getTime()
    const originalEnd = normalizedXScaleList[1].getTime()
    const originalRange = originalEnd - originalStart

    const currentRange = zoomDomain[1].getTime() - zoomDomain[0].getTime()
    const expandedRange = currentRange * 1.5 // 1.5배 확장

    const center = (zoomDomain[0].getTime() + zoomDomain[1].getTime()) / 2
    let newStart = center - expandedRange / 2
    let newEnd = center + expandedRange / 2

    // 원본 데이터 범위를 초과하지 않도록 제한
    if (newStart < originalStart) {
      newStart = originalStart
    }
    if (newEnd > originalEnd) {
      newEnd = originalEnd
    }

    // 새로운 범위가 원본 범위와 거의 같거나 더 크면 줌 해제
    const newRange = newEnd - newStart
    if (newRange >= originalRange * 0.98) {
      // 98% 이상이면 전체 범위로 간주
      setZoomDomain(null)
    } else {
      setZoomDomain([new Date(newStart), new Date(newEnd)])
    }
  }

  useEffect(() => {
    if (!bodyRef.current) return
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect
      setResizeEvent(`${r.width}-${r.height}`)
    })
    ro.observe(bodyRef.current)

    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    console.log("resizeEvent", resizeEvent)
  }, [resizeEvent])

  function makeMultiLine(
    svg: d3.Selection<SVGSVGElement | null, unknown, null, undefined>,
    activeWidth: number,
    activeHeight: number
  ) {
    // ---------- Legend width ----------
    const circleWidth = 20
    const padding = 5
    const legendWidths = data.map((ds) => {
      const tmp = svg
        .append("text")
        .style("visibility", "hidden")
        .text(ds.label)
      const w = tmp.node()?.getBBox().width || 0
      tmp.remove()
      return w + circleWidth + padding
    })

    const chartInnerWidth = activeWidth - margin.left - margin.right
    const totalLegendWidth = legendWidths.reduce((a, b) => a + b, 0)
    const showLegend = totalLegendWidth <= chartInnerWidth

    const legendHeight = RESERVED_LEGEND_H
    const chartHeight =
      activeHeight -
      legendHeight -
      X_AXIS_H -
      LEGEND_OFFSET -
      margin.top -
      margin.bottom
    if (chartHeight <= 0) return

    // ---------- Scale ----------
    const normalizedXScaleList = normalizeXScaleList(xScaleList)
    const currentDomain = zoomDomain || normalizedXScaleList
    const xScale = d3
      .scaleTime()
      .domain(currentDomain)
      .range([margin.left, margin.right + margin.left + chartInnerWidth])

    // 줌된 X축 범위에 해당하는 데이터만 필터링하여 Y축 범위 계산
    const filteredItems = data.flatMap((ds) =>
      ds.items.filter((item) => {
        const itemDate = parseXValue(item.x)
        return itemDate >= currentDomain[0] && itemDate <= currentDomain[1]
      })
    )

    const itemsForYScale =
      filteredItems.length > 0 ? filteredItems : data.flatMap((ds) => ds.items)
    // null 값을 필터링하여 Y축 스케일 계산
    const validItems = itemsForYScale.filter(
      (d) => d.y !== null && d.y !== undefined && !isNaN(Number(d.y))
    )
    let [yMin, yMax] = d3.extent(validItems, (d) => Number(d.y)) as [
      number,
      number
    ]

    if (yMin === 0 && yMax === 0) {
      yMax = 1
    } else if (yMin === yMax) {
      const buffer = Math.abs(yMin) * 0.1 || 1
      yMin -= buffer
      yMax += buffer
    }

    const yScale = d3
      .scaleLinear()
      .domain([yMin ?? 0, yMax ?? 100])
      .nice()
      .range([margin.top + chartHeight, margin.top])

    // ---------- Axes ----------
    const xAxis = d3
      .axisBottom(xScale)
      .tickSize(0)
      .tickPadding(10)
      .tickFormat((d: any) => xScaleLabel(fmt(d), interval))

    // --- Y축 Tick formatter 결정 ---
    const yTicks = yScale.ticks(7) // 실제 사용될 tick 값들
    const hasFractionStep = yTicks.some((v) => !Number.isInteger(v)) // 소수 tick 존재 여부

    // const ticks = yScale.ticks(7);
    const maxTick = d3.max(yTicks)

    // 3) D3 포맷터 생성: 최대 decimalPlaces 자리까지 표시, '~' 로 불필요한 0 제거
    const tickFmt = (val: number) => {
      if (Math.abs(val) >= 1000) return d3.format(".2s")(val) // e.g. 1.2k, 10k
      // if (hasFractionStep) return d3.format('.1f')(val); // e.g. 0.5, 2.3
      if (Math.abs(val) < 0.1) {
        // 소수점 아래 값은 지수 표현
        return d3.format(".1e")(val)
      }
      return val // e.g. 0, 1, 2
    }

    // 3) yAxis 에 적용
    const yAxis = d3
      .axisLeft(yScale)
      .tickPadding(10)
      .tickSize(0)
      .ticks(7)
      .tickFormat(tickFmt as any)

    const xAxisG = svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${margin.top + chartHeight})`)
      .call(xAxis)

    const yAxisG = svg
      .append("g")
      .attr("class", "y-axis")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(yAxis)

    // 축 스타일링 - refactoring 브랜치 스타일 유지
    xAxisG.selectAll(".tick text").style("fill", "var(--text-secondary)")
    xAxisG.selectAll(".domain").style("stroke", "var(--border-primary)")
    yAxisG.selectAll(".tick text").style("fill", "var(--text-secondary)")
    yAxisG.selectAll(".domain").style("stroke", "var(--border-primary)")

    hideOverlappingLabels(xAxisG, chartInnerWidth)

    // Unit 텍스트
    svg
      .append("text")
      .attr("class", "y-text")
      .attr("transform", `translate(${margin.left - 10}, ${margin.top - 5})`)
      .style("fill", "var(--text-secondary)")
      .style("font-size", "14px")
      .text(unit)

    // 줌 컨트롤 버튼들 (줌이 활성화된 경우에만 표시)
    if (zoomDomain) {
      // Zoom Out 버튼 (-)
      const zoomOutButtonG = svg
        .append("g")
        .attr("class", "zoom-out-btn")
        .attr(
          "transform",
          `translate(${margin.left + chartInnerWidth - 85}, ${margin.top - 25})`
        )
        .style("cursor", "pointer")
        .style("pointer-events", "all")
        .on("click", (event) => {
          event.stopPropagation()
          zoomOut()
        })

      zoomOutButtonG
        .append("circle")
        .attr("cx", 12)
        .attr("cy", 10)
        .attr("r", 10)
        .attr("fill", "var(--bg-secondary)")
        .attr("stroke", "var(--border-primary)")
        .attr("stroke-width", 1)
        .style("filter", "drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.1))")

      zoomOutButtonG
        .append("text")
        .attr("x", 12)
        .attr("y", 14)
        .attr("text-anchor", "middle")
        .style("fill", "var(--text-primary)")
        .style("font-size", "24px")
        .style("font-weight", "500")
        .text("-")

      // 호버 효과
      zoomOutButtonG
        .on("mouseenter", function () {
          d3.select(this)
            .select("circle")
            .attr("fill", "var(--bg-hover)")
            .attr("stroke", "var(--border-hover)")
        })
        .on("mouseleave", function () {
          d3.select(this)
            .select("circle")
            .attr("fill", "var(--bg-secondary)")
            .attr("stroke", "var(--border-primary)")
        })

      // Reset 버튼
      const resetButtonG = svg
        .append("g")
        .attr("class", "reset-zoom-btn")
        .attr(
          "transform",
          `translate(${margin.left + chartInnerWidth - 55}, ${margin.top - 25})`
        )
        .style("cursor", "pointer")
        .style("pointer-events", "all")
        .style("font-size", "14px")
        .on("click", (event) => {
          event.stopPropagation()
          resetZoom()
        })

      resetButtonG
        .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 55)
        .attr("height", 20)
        .attr("rx", 4)
        .attr("fill", "var(--bg-secondary)")
        .attr("stroke", "var(--border-primary)")
        .attr("stroke-width", 1)
        .style("filter", "drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.1))")

      resetButtonG
        .append("text")
        .attr("x", 27.5)
        .attr("y", 13)
        .attr("text-anchor", "middle")
        .style("fill", "var(--text-primary)")
        .style("font-size", "20px")
        .style("font-weight", "500")
        .text("Reset")

      // 호버 효과
      resetButtonG
        .on("mouseenter", function () {
          d3.select(this)
            .select("rect")
            .attr("fill", "var(--bg-hover)")
            .attr("stroke", "var(--border-hover)")
        })
        .on("mouseleave", function () {
          d3.select(this)
            .select("rect")
            .attr("fill", "var(--bg-secondary)")
            .attr("stroke", "var(--border-primary)")
        })
    }

    // ---------- Clipping Path ----------
    const clipId = `chart-clip-${chartId}`
    svg
      .append("defs")
      .append("clipPath")
      .attr("id", clipId)
      .append("rect")
      .attr("x", margin.left)
      .attr("y", margin.top)
      .attr("width", chartInnerWidth)
      .attr("height", chartHeight)

    // ---------- Line & Area ----------
    const line = d3
      .line<Item>()
      .x((d) => xScale(parseXValue(d.x)))
      .y((d) => yScale(d.y))
      .defined((d) => d.y !== null && d.y !== undefined && !isNaN(Number(d.y))) // null 값 건너뛰기

    const area = d3
      .area<Item>()
      .x((d) => xScale(parseXValue(d.x)))
      .y0(margin.top + chartHeight)
      .y1((d) => yScale(d.y))
      .defined((d) => d.y !== null && d.y !== undefined && !isNaN(Number(d.y))) // null 값 건너뛰기

    data.forEach((ds, idx) => {
      const gradId = `areaGradient-${chartId}-${idx}`
      const grad = svg
        .append("defs")
        .append("linearGradient")
        .attr("id", gradId)
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "0%")
        .attr("y2", "100%")

      grad
        .append("stop")
        .attr("offset", "0%")
        .attr("stop-color", colorData[idx])
        .attr("stop-opacity", data.length >= 4 ? 0 : 0.2)
      grad
        .append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#000")
        .attr("stop-opacity", 0)

      svg
        .append("path")
        .datum(ds.items)
        .attr("fill", `url(#${gradId})`)
        .attr("d", area)
        .attr("clip-path", `url(#${clipId})`)

      const linePath = svg
        .append("path")
        .datum(ds.items)
        .attr("fill", "none")
        .attr("stroke", ds.label === "Total" ? "#be2727ff" : colorData[idx])
        .attr("stroke-width", 2)
        .attr("d", line)
        .attr("clip-path", `url(#${clipId})`)

      // Total 라인인 경우 점선으로 표시
      if (ds.label === "Total") {
        linePath.attr("stroke-dasharray", "5,5")
      }

      // null 값이 아닌 데이터만 도트로 표시
      const validDots = ds.items.filter(
        (d) => d.y !== null && d.y !== undefined && !isNaN(Number(d.y))
      )
      svg
        .selectAll(`.dot-${idx}`)
        .data(validDots)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("cx", (d) => xScale(parseXValue(d.x)))
        .attr("cy", (d) => yScale(d.y))
        .attr("r", 4)
        .style("fill", ds.label === "Total" ? "#be2727ff" : colorData[idx])
        .style("pointer-events", "none")
        .style("opacity", 0)
        .attr("clip-path", `url(#${clipId})`)
    })

    // ---------- Hover ----------
    // 현재 줌 도메인에 해당하는 X 시간들만 필터링
    const allItems = data.flatMap((ds) => ds.items) // 호버용 전체 아이템
    const allXStr = Array.from(
      new Set(allItems.map((i) => normalizeXValue(i.x)))
    )
      .filter((xStr) => {
        const xDate = parseXValue(xStr)
        return xDate >= currentDomain[0] && xDate <= currentDomain[1]
      })
      .sort()

    // 가장 가까운 시간대를 찾는 함수
    const findClosestTimeIndex = (mouseX: number) => {
      if (allXStr.length === 0) {
        // 줌 도메인 내에 데이터가 없는 경우 기본값 반환
        return { xStr: "", cx: mouseX, distance: 0 }
      }

      const xPositions = allXStr.map((xStr) => ({
        xStr,
        cx: xScale(parseXValue(xStr)),
        distance: Math.abs(xScale(parseXValue(xStr)) - mouseX),
      }))

      return xPositions.reduce((closest, current) =>
        current.distance < closest.distance ? current : closest
      )
    }

    // 드래그 선택 박스
    const dragSelectionRect = svg
      .append("rect")
      .attr("class", "drag-selection")
      .attr("x", 0)
      .attr("y", margin.top)
      .attr("width", 0)
      .attr("height", chartHeight)
      .attr("fill", "rgba(100, 149, 237, 0.3)")
      .attr("stroke", "rgba(100, 149, 237, 0.8)")
      .attr("stroke-width", 1)
      .style("display", "none")
      .style("pointer-events", "none")

    // dragRect를 ref에 저장
    dragStateRef.current.dragRect = dragSelectionRect

    // 전체 차트 영역을 커버하는 하나의 hover 영역 생성
    svg
      .append("rect")
      .attr("class", "chartHoverArea")
      .attr("x", margin.left)
      .attr("y", margin.top)
      .attr("width", chartInnerWidth)
      .attr("height", chartHeight)
      .attr("fill", "transparent")
      .style("cursor", "crosshair")
      .on("mousedown", function (event) {
        const [mouseX] = d3.pointer(event)
        if (mouseX >= margin.left && mouseX <= margin.left + chartInnerWidth) {
          dragStateRef.current = {
            isDragging: true,
            startX: mouseX,
            currentX: mouseX,
            dragRect: dragSelectionRect,
          }
          event.preventDefault()
        }
      })
      .on("dblclick", function (event) {
        // 더블클릭으로 축소
        event.preventDefault()
        zoomOut()
      })
      .on("mousemove", function (event) {
        const [mouseX, mouseY] = d3.pointer(event)

        if (dragStateRef.current.isDragging) {
          // 드래그 중일 때는 tooltip 표시하지 않음
          return
        }

        // 마우스가 차트 영역 내부에 있는지 확인
        if (
          mouseX < margin.left ||
          mouseX > margin.left + chartInnerWidth ||
          mouseY < margin.top ||
          mouseY > margin.top + chartHeight
        ) {
          return
        }

        const closest = findClosestTimeIndex(mouseX)

        // 데이터가 없거나 가장 가까운 시간의 X 좌표가 차트 영역 내부에 있는지 확인
        if (
          !closest.xStr ||
          closest.cx < margin.left ||
          closest.cx > margin.left + chartInnerWidth
        ) {
          // 차트 영역을 벗어난 시간대거나 데이터가 없으면 hover 요소들 모두 숨김
          svg.selectAll(".dot").style("opacity", 0)
          svg.selectAll(".x-line, .y-line").remove()
          d3.select(tooltipRef.current).style("opacity", 0)
          return
        }

        // 모든 점을 숨기고 현재 시간대의 점만 표시
        svg.selectAll(".dot").style("opacity", 0)
        svg
          .selectAll(".dot")
          .filter((dot: any) => normalizeXValue(dot.x) === closest.xStr)
          .style("opacity", 1)

        // X축 점선 (시간대별) - 클리핑 적용
        svg.selectAll(".x-line").remove()
        svg
          .append("line")
          .attr("class", "x-line")
          .attr("x1", closest.cx)
          .attr("y1", margin.top)
          .attr("x2", closest.cx)
          .attr(
            "y2",
            activeHeight - X_AXIS_H - RESERVED_LEGEND_H - LEGEND_OFFSET
          )
          .style("stroke", "#bdbdbdff")
          .style("stroke-width", 1.5)
          .style("stroke-dasharray", "4,4")
          .style("opacity", 0.8)
          .style("pointer-events", "none")
          .raise()

        // Y축 점선 (마우스 Y 위치 기반) - 클리핑 제거하여 전체 차트 너비에 표시
        svg.selectAll(".y-line").remove()
        const yVal = yScale.invert(mouseY)
        svg
          .append("line")
          .attr("class", "y-line")
          .attr("x1", margin.left)
          .attr("y1", yScale(yVal))
          .attr("x2", margin.left + chartInnerWidth)
          .attr("y2", yScale(yVal))
          .style("stroke", "#bdbdbdff")
          .style("stroke-width", 1.5)
          .style("stroke-dasharray", "4,4")
          .style("opacity", 0.8)
          .style("pointer-events", "none")
          .raise()

        showTooltip(event, closest.xStr, activeWidth, activeHeight)
      })
      .on("mouseleave", function () {
        // 차트 영역을 완전히 벗어날 때만 모든 요소 숨김
        d3.select(tooltipRef.current)
          .transition()
          .duration(100)
          .style("opacity", 0)
          .style("z-index", "-999")
        svg.selectAll(".dot").style("opacity", 0)
        svg.selectAll(".x-line, .y-line").remove()

        // React 툴팁도 숨김
        if (tooltipComponent) {
          setTooltipData((prev) => ({ ...prev, visible: false }))
        }
      })

    // ---------- Grid ----------
    const gridTicks = xScale.ticks()
    svg
      .selectAll(".v-grid")
      .data(gridTicks)
      .enter()
      .append("rect")
      .attr("class", "v-grid")
      .attr("x", (d: any) => xScale(d))
      .attr("y", margin.top)
      .attr("width", 0.5)
      .attr("height", chartHeight)
      .attr("fill", "#cececeff")
      .attr("fill-opacity", 0.25)
      .lower()

    // ---------- Legend ---------- refactoring 브랜치 스타일 유지
    if (showLegend) {
      const legendTop = margin.top + chartHeight + X_AXIS_H + LEGEND_OFFSET
      const legendG = svg
        .append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${margin.left}, ${legendTop})`)

      const offsetX = (chartInnerWidth - totalLegendWidth) / 2
      const rowG = legendG
        .append("g")
        .attr("transform", `translate(${offsetX}, 0)`)
      let rowX = 0
      data.forEach((ds, i) => {
        const itemG = rowG.append("g").attr("transform", `translate(${rowX},0)`)

        itemG
          .append("circle")
          .attr("r", 5)
          .attr("cx", 0)
          .attr("cy", 5)
          .style("fill", ds.label === "Total" ? "#be2727ff" : colorData[i])

        itemG
          .append("text")
          .attr("x", 10)
          .attr("y", 9)
          .style("fill", "var(--text-primary)")
          .style("font-size", "12px")
          .text(ds.label)
        rowX += legendWidths[i]
      })
    }
  }

  function showTooltip(
    event: any,
    xStr: string,
    activeW: number,
    activeH: number
  ) {
    if (!tooltipRef.current || !bodyRef.current) return
    const tooltip = d3
      .select(tooltipRef.current)
      .attr("class", "multi-tooltip")
      .style("width", "auto")
      .style("pointer-events", "none")

    let html = ""

    if (tooltipComponent) {
      // 커스텀 툴팁 컴포넌트가 있는 경우
      const currentTooltipData: TooltipData[] = []

      data.forEach((ds, idx) => {
        const item = ds.items.find((it) => normalizeXValue(it.x) === xStr)
        if (item) {
          const bg =
            ds.label === "Total"
              ? "#be2727ff"
              : colorData[idx % colorData.length]

          currentTooltipData.push({
            dataset: ds,
            item: item,
            backgroundColor: bg,
          })
        }
      })

      // 차트 컨테이너의 위치와 크기 정보 가져오기
      const chartRect = bodyRef.current.getBoundingClientRect()
      // const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const [mouseX, mouseY] = d3.pointer(event, bodyRef.current)

      const tooltipRect =
        tooltipCompRef.current && tooltipCompRef.current.getBoundingClientRect()

      const tooltipWidth = tooltipRect ? tooltipRect.width : 200 // 기본값 설정
      const tooltipHeight = tooltipRect ? tooltipRect.height : 100 // 기본값 설정
      const offset = 10 // 마우스와 툴팁 사이 간격
      let tooltipX, tooltipY

      // X 위치 계산 - 차트 영역 내에서 결정
      if (mouseX > chartRect.width / 2) {
        // 오른쪽 공간이 부족하면 마우스 왼쪽에 표시
        tooltipX = mouseX - tooltipWidth - offset
      } else {
        // 오른쪽 공간이 충분하면 마우스 오른쪽에 표시
        tooltipX = mouseX + offset
      }

      // Y 위치 계산 - 차트 영역 내에서 결정
      if (mouseY > chartRect.height / 2) {
        // 아래쪽 공간이 부족하면 마우스 위쪽에 표시
        tooltipY = mouseY - tooltipHeight - offset
      } else {
        // 아래쪽 공간이 충분하면 마우스 아래쪽에 표시
        tooltipY = mouseY + offset
      }

      // 화면 경계를 벗어나지 않도록 추가 보정
      tooltipX = Math.max(0, Math.min(tooltipX, chartRect.width - tooltipWidth))
      tooltipY = Math.max(
        0,
        Math.min(tooltipY, chartRect.height - tooltipHeight)
      )

      // React 컴포넌트를 위한 상태 업데이트
      setTooltipData({
        data: currentTooltipData,
        timeLabel: xStr,
        visible: true,
        x: tooltipX,
        y: tooltipY,
      })

      // 기존 D3 툴팁은 숨김
      tooltip.style("display", "none")
      return
    } else {
      // 기본 툴팁
      html = `<div class="time-txt" style="color: var(--text-primary); font-size: 12px;">${xStr}</div>`

      data.forEach((ds, idx) => {
        const item = ds.items.find((it) => normalizeXValue(it.x) === xStr)
        if (item) {
          const bg =
            ds.label === "Total"
              ? "#be2727ff"
              : colorData[idx % colorData.length]

          html += `<div class="d-multi-item">
            <p class="label-circle" style="background-color:${bg};"></p>
            <span class="label-txt">${ds.label}</span>
            <span class="label-value">${item.y} ${
            item.unit !== undefined ? item.unit : ""
          } </span>
          </div>`
        }
      })
    }

    tooltip.transition().duration(10)
    tooltip.html(html)

    // 차트 컨테이너의 위치와 크기 정보 가져오기
    const chartRect = bodyRef.current.getBoundingClientRect()
    const [mouseX, mouseY] = d3.pointer(event, bodyRef.current)

    // 툴팁의 크기 계산 (DOM에 적용 후)
    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    const tooltipWidth = tooltipRect.width || 200 // 기본값 설정
    const tooltipHeight = tooltipRect.height || 100 // 기본값 설정

    const offset = 10 // 마우스와 툴팁 사이 간격
    let tooltipX, tooltipY

    // X 위치 계산 - 차트 영역 내에서 결정
    if (mouseX + tooltipWidth + offset > chartRect.width) {
      // 오른쪽 공간이 부족하면 마우스 왼쪽에 표시
      tooltipX = event.clientX - tooltipWidth - offset
    } else {
      // 오른쪽 공간이 충분하면 마우스 오른쪽에 표시
      tooltipX = event.clientX + offset
    }

    // Y 위치 계산 - 차트 영역 내에서 결정
    if (mouseY + tooltipHeight + offset > chartRect.height) {
      // 아래쪽 공간이 부족하면 마우스 위쪽에 표시
      tooltipY = event.clientY - tooltipHeight - offset
    } else {
      // 아래쪽 공간이 충분하면 마우스 아래쪽에 표시
      tooltipY = event.clientY + offset
    }

    // 화면 경계를 벗어나지 않도록 최종 조정
    const maxX = window.innerWidth - tooltipWidth - offset
    const minX = offset
    const maxY = window.innerHeight - tooltipHeight - offset
    const minY = offset

    tooltipX = Math.max(minX, Math.min(tooltipX, maxX))
    tooltipY = Math.max(minY, Math.min(tooltipY, maxY))

    tooltip
      .style("left", `${tooltipX}px`)
      .style("top", `${tooltipY}px`)
      .style("opacity", 0.95)
  }

  function makeEmptyMultiLine(
    svg: any,
    activeWidth: number,
    activeHeight: number
  ) {
    const margin = { top: 0, right: 0, bottom: 0, left: 80 }
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 5 * 60 * 60 * 1000)
    const h = activeHeight - 50

    const xScale = d3
      .scaleTime()
      .domain([oneHourAgo, now])
      .range([margin.left, activeWidth - margin.right - 60])
    const yScale = d3.scaleLinear().domain([0, 50]).nice().range([h, 30])

    const fmt = d3.timeFormat("%Y-%m-%d %H:%M:%S")

    const xAxis = d3
      .axisBottom(xScale)
      .tickSize(0)
      .tickPadding(10)
      .tickFormat((d: any, i) =>
        i % 2 === 0 ? xScaleLabel(fmt(d), interval) : ""
      )

    svg
      .append("text")
      .attr("class", "y-text")
      .attr("transform", `translate(${margin.left - 50},5)`)
      .style("fill", "var(--text-secondary)")
      .text(unit)

    const yAxis = d3.axisLeft(yScale).tickPadding(10).tickSize(0).ticks(7)

    const xAxisG = svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${h})`)
      .call(xAxis)
    const yAxisG = svg
      .append("g")
      .attr("class", "y-axis")
      .attr("transform", `translate(${margin.left},0)`)
      .call(yAxis)

    xAxisG.selectAll(".tick text").style("fill", "var(--text-secondary)")
    xAxisG.selectAll(".domain").style("stroke", "var(--border-primary)")
    yAxisG.selectAll(".tick text").style("fill", "var(--text-secondary)")
    yAxisG.selectAll(".domain").style("stroke", "var(--border-primary)")
  }

  return (
    <div
      ref={bodyRef}
      style={{
        position: "absolute",
        top: 0,
        width: width,
        height: height,
        display: "block",
        overflow: "visible", // 상위 래퍼도 잘리지 않도록
      }}
    >
      <svg
        id={`svg-chart-${chartId}`}
        width='100%'
        height='100%'
        ref={svgRef}
        preserveAspectRatio='none'
        style={{ zIndex: 50, overflow: "visible" }}
      />
      {/* {!data && (
        <div style={{ position: "absolute", inset: 0 }}>
          <Loading />
        </div>
      )} */}
      {/* <FloatingMenu>
        <div id='svgDom' ref={tooltipRef} />
      </FloatingMenu> */}

      {/* React 툴팁 컴포넌트 */}
      {tooltipComponent && tooltipData.visible && (
        <div
          style={{
            position: "absolute",
            left: tooltipData.x,
            top: tooltipData.y,
            pointerEvents: "none",
            zIndex: 1000,
          }}
          ref={tooltipCompRef}
        >
          {React.createElement(tooltipComponent, {
            data: tooltipData.data,
            timeLabel: tooltipData.timeLabel,
          })}
        </div>
      )}
    </div>
  )
}

export default function MultiLineChartPage() {
  return (
    <div id='chartContainer'>
      <h1>Multi Line Chart</h1>
      <div style={{ width: "100%", height: "400px", position: "relative" }}>
        <MultiLineChart processData={sampleProcessData} />
      </div>
    </div>
  )
}

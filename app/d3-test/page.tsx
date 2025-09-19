"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"
import useMakeBasicTest from "./hooks/useMakeBasicTest"

export default function D3TestPage() {
  const { svgRef, containerRef, handleButtonTest } = useMakeBasicTest()

  return (
    <div style={{ padding: "20px" }}>
      <h1>🎯 Next.js + TypeScript + D3.js 테스트</h1>

      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={handleButtonTest}
          style={{
            padding: "10px 20px",
            backgroundColor: "#0070f3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          D3로 요소 추가하기
        </button>
      </div>

      <div ref={containerRef} style={{ marginBottom: "30px" }}>
        <h3>D3 DOM 조작 테스트 영역</h3>
      </div>

      <div>
        <h3>SVG 바 차트</h3>
        <svg
          ref={svgRef}
          width='500'
          height='300'
          style={{ border: "1px solid #ccc" }}
        />
      </div>

      <div
        style={{
          marginTop: "30px",
          padding: "20px",
          backgroundColor: "#f5f5f5",
          borderRadius: "8px",
        }}
      >
        <h3>🔍 브라우저 콘솔 테스트</h3>
        <p>F12를 눌러서 콘솔을 열고 다음 명령어들을 시도해보세요:</p>
        <pre
          style={{
            backgroundColor: "white",
            padding: "15px",
            borderRadius: "4px",
            overflow: "auto",
          }}
        >
          {`// D3 버전 확인
d3.version
// 또는
window.d3.version

// 새로운 요소 추가
d3.select("body").append("p").text("콘솔에서 추가한 텍스트!");

// 기존 요소 선택해서 스타일 변경
d3.select("h1").style("color", "purple");

// 데이터 바인딩 테스트
const testData = [5, 10, 15, 20];
d3.select("body")
  .selectAll(".test-div")
  .data(testData)
  .enter()
  .append("div")
  .attr("class", "test-div")
  .style("width", d => d * 10 + "px")
  .style("height", "20px")
  .style("background", "orange")
  .style("margin", "2px")
  .text(d => d);`}
        </pre>
      </div>
    </div>
  )
}

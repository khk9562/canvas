// hooks/useSSE.ts
import { useEffect, useRef, useMemo, useState } from "react"

interface DataPoint {
  timestamp: string
  value: number
  category: "A" | "B" | "C"
}

/**
 * 사용 방법
// DataPoint 타입 대신
const { data, isConnected, isLoading } = useSSE<DataPoint>()

// 또는 다른 타입
const { data, isConnected, isLoading } = useSSE<YourCustomType>()
*/
export default function useSSE<T = DataPoint>(useMockData: boolean = true) {
  const [data, setData] = useState<T[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Mock 데이터 생성 함수
  const generateMockData = (): T => {
    const mockDataPoint = {
      timestamp: new Date().toISOString(),
      value: Math.random() * 100 + Math.sin(Date.now() / 1000) * 20 + 50,
      category: ["A", "B", "C"][Math.floor(Math.random() * 3)] as
        | "A"
        | "B"
        | "C",
    } as DataPoint

    return mockDataPoint as T
  }

  // SSE 연결 및 데이터 수신
  useEffect(() => {
    if (useMockData) {
      // Mock 데이터 모드
      console.log("🔄 Mock SSE 모드로 실행 중...")

      // 초기 로딩 시뮬레이션
      const loadingTimeout = setTimeout(() => {
        setIsLoading(false)
        setIsConnected(true)
        console.log("✅ Mock SSE 연결 완료")
      }, 1000)

      // 1초마다 Mock 데이터 생성
      intervalRef.current = setInterval(() => {
        const mockData = generateMockData()

        setData((prev) => {
          // 최근 50개 데이터만 유지 (성능 최적화)
          const newData = [...prev, mockData].slice(-50)
          return newData
        })
      }, 1000)

      return () => {
        clearTimeout(loadingTimeout)
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
        setIsConnected(false)
      }
    } else {
      // 실제 SSE 모드
      console.log("🌐 실제 SSE API 연결 시도...")

      const eventSource = new EventSource("/api/stream")

      eventSource.onopen = () => {
        setIsConnected(true)
        setIsLoading(false)
        console.log("✅ 실제 SSE 연결됨")
      }

      eventSource.onmessage = (event) => {
        const newData: T = JSON.parse(event.data)

        setData((prev) => {
          // 최근 50개 데이터만 유지 (성능 최적화)
          return [...prev, newData].slice(-50)
        })
      }

      eventSource.onerror = (error) => {
        console.error("❌ SSE error", error)
        setIsConnected(false)

        // 에러 발생시 Mock 모드로 전환 제안
        console.warn(
          "💡 Tip: useMockData=true로 설정하면 Mock 데이터로 테스트 가능합니다."
        )
      }

      return () => {
        eventSource.close()
        setIsConnected(false)
      }
    }
  }, [useMockData])

  return {
    isLoading,
    isConnected,
    data,
    // 추가 정보들
    isMockMode: useMockData,
    dataCount: data.length,
  }
}

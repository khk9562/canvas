import { NextApiRequest, NextApiResponse } from "next"

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // SSE 헤더 설정
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Cache-Control",
  })

  // 랜덤 데이터 생성 함수
  const generateData = () => ({
    timestamp: new Date().toISOString(),
    value: Math.random() * 100 + Math.sin(Date.now() / 1000) * 20 + 50,
    category: ["A", "B", "C"][Math.floor(Math.random() * 3)],
  })

  //   1초마다 데이터 전송
  const interval = setInterval(() => {
    const data = generateData()
    res.write(`data: ${JSON.stringify(data)}\n\n`)
  }, 1000)

  //   클라이언트 연결 종료시 정리
  req.on("close", () => {
    clearInterval(interval)
    res.end()
  })

  req.on("end", () => {
    clearInterval(interval)
    res.end()
  })
}

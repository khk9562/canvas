export function xScaleLabel(dateString: string, interval: string): string {
  const date = new Date(dateString)

  switch (interval) {
    case "1H":
      return date.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit"
      })
    case "1D":
      return date.toLocaleDateString("ko-KR", {
        month: "short",
        day: "numeric"
      })
    case "1W":
      return date.toLocaleDateString("ko-KR", {
        month: "short",
        day: "numeric"
      })
    case "1MO":
      return date.toLocaleDateString("ko-KR", {
        year: "2-digit",
        month: "short"
      })
    case "1Y":
      return date.getFullYear().toString()
    default:
      return date.toLocaleDateString("ko-KR")
  }
}
import { useEffect } from "react"
import setVhProperty from "@/utils/viewport"

export default function useSetViewportHeight() {
  useEffect(() => {
    setVhProperty()
    window.addEventListener("resize", setVhProperty)

    return () => {
      window.removeEventListener("resize", setVhProperty)
    }
  }, [])
}

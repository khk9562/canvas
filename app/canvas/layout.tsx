"use client"
import "bootstrap/dist/css/bootstrap.min.css"
import { PlayListProvider } from "@/providers/playlistProvider"
import { useEffect } from "react"
import Head from "next/head"
import "@/public/static/fonts/style.css"

declare global {
  interface Window {
    Kakao: any
    naver: any
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const setVhProperty = () => {
    const vh = window.innerHeight * 0.01
    document.documentElement.style.setProperty("--vh", `${vh}px`)
  }

  useEffect(() => {
    setVhProperty()
    window.addEventListener("resize", setVhProperty)

    return () => {
      window.removeEventListener("resize", setVhProperty)
    }
  }, [])

  return (
    <PlayListProvider>
      <main>{children}</main>
    </PlayListProvider>
  )
}

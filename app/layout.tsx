"use client"
import "./globals.css"
import "bootstrap/dist/css/bootstrap.min.css"
import { PlayListContext, PlayListProvider } from "@/providers/playlistProvider"
import { usePathname, useRouter } from "next/navigation"
import { useContext, useEffect, useState } from "react"
import Head from "next/head"
import "../public/static/fonts/style.css"

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
  const { showLoginErrorModal, session } = useContext(PlayListContext)
  const pathname = usePathname()

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
    <html lang='ko'>
      <Head>
        <meta http-equiv='Content-Type' content='text/html;charset=UTF-8' />
        <meta http-equiv='X-UA-Compatible' content='IE=edge' />
        <meta name='viewport' content='initial-scale=1, viewport-fit=cover' />
      </Head>

      <body>{children}</body>
    </html>
  )
}

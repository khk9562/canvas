"use client"
import "./globals.css"
import "bootstrap/dist/css/bootstrap.min.css"
import Head from "next/head"
import "../public/static/fonts/style.css"
import useSetViewportHeight from "@/hooks/shared/useSetViewportHeight"

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
  useSetViewportHeight()

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

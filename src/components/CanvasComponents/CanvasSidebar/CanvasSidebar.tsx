"use client"

import React, { useState, useContext, useRef, useEffect } from "react"
import styles from "./CanvasSidebar.module.css"
import { useRouter, usePathname } from "next/navigation"
import { PlayListContext } from "@/providers/playlistProvider"
import SvgClose from "@/public/icons/close.svg"

export default function CanvasSidebar(props: any) {
  const router = useRouter()
  const pathname = usePathname()
  const { kind, children, title, closeOpenState } = props

  return (
    <div className={`${styles.box} ${kind == "modify" && styles.modifybox}`}>
      <h6 className={styles.boxTit}>{title}</h6>
      <button
        type='button'
        onClick={closeOpenState}
        className={`${styles.closeOpenState} ${
          kind == "modify" && styles.modifyClose
        }`}
      >
        <SvgClose className={styles.icon} />
      </button>
      <div className={styles.scroll}>{children}</div>
    </div>
  )
}

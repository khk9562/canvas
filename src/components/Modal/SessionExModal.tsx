"use client"
import React, { useState, useEffect, useContext } from "react"
import { Modal } from "react-bootstrap"
import styles from "./LoginErrorModal.module.css"
import { PlayListContext } from "@/providers/playlistProvider"
import { useRouter } from "next/navigation"
import SvgClose from "@/public/icons/close.svg"

export default function SessionExModal(props: any) {
  const router = useRouter()
  const { showSessionExModal, setShowSessionExModal } =
    useContext(PlayListContext)

  return (
    <Modal
      {...props}
      size='lg'
      aria-labelledby='contained-modal-title-vcenter'
      centered
      show={showSessionExModal}
      className={styles.modal}
    >
      <Modal.Header className={styles.modalHeader}>
        <Modal.Title
          id='contained-modal-title-vcenter'
          style={{ margin: "0 auto" }}
        >
          <h5 className={styles.modalTitle}>세션 만료</h5>
          <button
            onClick={() => {
              setShowSessionExModal(false)
              router.push("/")
            }}
          >
            <SvgClose className={styles.icon} />
          </button>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className={styles.modalBody}>
        <p>
          {`
          토큰이 만료되었습니다:(`}
          <br />
          {`
          다시 로그인해주세요!`}
        </p>
      </Modal.Body>
      <Modal.Footer className={styles.modalFooter}>
        <button
          onClick={() => {
            setShowSessionExModal(false)
            router.push("/")
          }}
        >
          확인
        </button>
      </Modal.Footer>
    </Modal>
  )
}

"use client"
import React, { useState, useEffect, useContext } from "react"
import { Modal } from "react-bootstrap"
import styles from "./LoginErrorModal.module.css"
import { PlayListContext } from "@/providers/playlistProvider"
import SvgClose from "@/public/icons/close.svg"

export default function LoginErrorModal(props: any) {
  const { showLoginErrorModal, setShowLoginErrorModal } =
    useContext(PlayListContext)

  return (
    <Modal
      {...props}
      size='lg'
      aria-labelledby='contained-modal-title-vcenter'
      centered
      show={showLoginErrorModal}
      className={styles.modal}
    >
      <Modal.Header className={styles.modalHeader}>
        <Modal.Title id='contained-modal-title-vcenter'>
          <h5 className={styles.modalTitle}>로그인 에러</h5>
          <button
            onClick={() => {
              setShowLoginErrorModal(false)
            }}
          >
            <SvgClose className={styles.icon} />
          </button>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className={styles.modalBody}>
        <p>
          로그인에 실패했습니다. <br />
          다시 시도해주세요:(
        </p>
      </Modal.Body>
      <Modal.Footer className={styles.modalFooter}>
        <button
          onClick={() => {
            setShowLoginErrorModal(false)
          }}
        >
          확인
        </button>
      </Modal.Footer>
    </Modal>
  )
}

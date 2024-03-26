"use client";
import React, { useState, useEffect, useContext } from "react";
import { Modal } from "react-bootstrap";
import styles from "./LoginErrorModal.module.css";
import { PlayListContext } from "@/app/providers/playlistProvider";
import { useRouter } from "next/navigation";
import SvgClose from "@/public/icons/close.svg";

export default function LoginNeedModal(props: any) {
  const router = useRouter();
  const { showLoginNeedModal, setShowLoginNeedModal } =
    useContext(PlayListContext);

  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      show={showLoginNeedModal}
      className={styles.modal}
    >
      <Modal.Header className={styles.modalHeader}>
        <Modal.Title
          id="contained-modal-title-vcenter"
          style={{ margin: "0 auto" }}
        >
          <h5 className={styles.modalTitle}>경고</h5>
          <button
            onClick={() => {
              setShowLoginNeedModal(false);
              router.push("/");
            }}
          >
            <SvgClose className={styles.icon} />
          </button>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className={styles.modalBody}>
        <p>로그인이 필요한 서비스입니다!</p>
      </Modal.Body>
      <Modal.Footer className={styles.modalFooter}>
        <button
          onClick={() => {
            setShowLoginNeedModal(false);
            router.push("/");
          }}
        >
          확인
        </button>
      </Modal.Footer>
    </Modal>
  );
}

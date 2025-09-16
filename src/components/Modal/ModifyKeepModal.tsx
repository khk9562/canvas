"use client"
import React, { useState, useEffect, useContext } from "react"
import { Modal, Table } from "react-bootstrap"
import styles from "./ModifyKeepModal.module.css"
import { PlayListContext } from "@/providers/playlistProvider"
import { useRouter } from "next/navigation"
import SvgClose from "@/public/icons/close.svg"

interface ModalType {
  tag: string
  show: boolean
  setShow: React.Dispatch<React.SetStateAction<boolean>>
}

export default function ModifyKeepModal({ tag, show, setShow }: ModalType) {
  const { session } = useContext(PlayListContext)

  const [data, setData] = useState<any[]>([])
  const [showModal, setShowModal] = useState<boolean>(false)
  const [selectedItemId, setSelectedItemId] = useState<string>("")

  const getRouletteKeep = async (tag: string) => {
    try {
      const settings: RequestInit = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: session,
        },
        body: JSON.stringify({
          tag: tag,
        }),
      }
      const fetchResponse = await fetch(
        `${process.env.NEXT_PUBLIC_ROOROO_API as string}/roulette/keep/get`,
        settings
      )

      const data = await fetchResponse.json()
      if (data?.ok) {
        setData(data.data)
        // setStickerCate(data?.data);
      }
    } catch (e) {
      console.error("getRouletteKeep", e)
    }
  }

  const deleteRouletteKeep = async (id: string) => {
    try {
      const settings: RequestInit = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: session,
        },
        body: JSON.stringify({
          id: id,
        }),
      }
      const fetchResponse = await fetch(
        `${process.env.NEXT_PUBLIC_ROOROO_API as string}/roulette/keep/del`,
        settings
      )

      const data = await fetchResponse.json()
      if (data?.ok) {
        // setStickerCate(data?.data);
        getRouletteKeep(tag)
      }
    } catch (e) {
      console.error("deleteRouletteKeep", e)
    }
  }

  useEffect(() => {
    getRouletteKeep(tag)
  }, [tag])

  return (
    <>
      <Modal
        size='lg'
        aria-labelledby='contained-modal-title-vcenter'
        centered
        show={show}
        className={styles.modal}
      >
        <Modal.Header className={styles.modalHeader}>
          <h5 className={styles.modalTitle}>킵 목록</h5>

          <button
            type='button'
            onClick={() => {
              setShow(false)
            }}
          >
            <SvgClose className={styles.icon} />
          </button>
        </Modal.Header>
        <Modal.Body className={styles.modalBody}>
          <Table responsive>
            <thead style={{ textAlign: "center" }}>
              <tr>
                <th style={{ width: "10%" }}>NO</th>
                <th style={{ width: "60%" }}>항목</th>
                <th style={{ width: "30%" }}>사용처리</th>
              </tr>
            </thead>
            <tbody style={{ textAlign: "center" }}>
              {data?.map((item: any, index: number) => (
                <tr key={`rouletteKeep${item.id}`}>
                  <td>{index + 1}</td>
                  <td>{item.item}</td>
                  <td>
                    {/* <input type="checkbox" /> */}
                    <button
                      type='button'
                      className={styles.useynBtn}
                      onClick={() => {
                        setSelectedItemId(item.id)
                        setShowModal(true)
                      }}
                    >
                      사용처리
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer className={styles.modalFooter}>
          <button
            onClick={() => {
              setShow(false)
            }}
          >
            확인
          </button>
        </Modal.Footer>
      </Modal>

      <Modal
        className={styles.modal}
        show={showModal}
        size='sm'
        onHide={() => setShowModal(false)}
      >
        <Modal.Header className={styles.modalHeader}>
          <button
            style={{ marginLeft: "auto" }}
            className={styles.ghostModalClose}
            type='button'
            onClick={() => setShowModal(false)}
          >
            <SvgClose className={styles.icon} />
          </button>
        </Modal.Header>

        <Modal.Body>정말 삭제하시겠습니까?</Modal.Body>
        <Modal.Footer>
          <button
            type='button'
            onClick={() => {
              deleteRouletteKeep(selectedItemId)
              setShowModal(false)
            }}
          >
            확인
          </button>
          <button
            type='button'
            onClick={() => {
              setShowModal(false)
            }}
          >
            취소
          </button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

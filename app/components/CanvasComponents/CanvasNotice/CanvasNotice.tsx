"use client";
import styles from "./CanvasNotice.module.css";
import SvgQuestion from "@/public/icons/question.svg";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

export default function CanvasNotice({ open, refName }: any) {
  return (
    <>
      <OverlayTrigger
        placement={"left"}
        overlay={
          <Tooltip>
            <div className={styles.tooltipInfo}>
              {open == "스티커" ? (
                <>
                  <span>
                    {`☝🏻 이미지를 캔버스로 드래그 앤 드롭
                    `}
                  </span>

                  <span>{`✌🏻 이미지를 더블클릭`}</span>
                </>
              ) : (
                <span>
                  {`이미지를 캔버스로 드래그 앤 드롭
              `}
                </span>
              )}
            </div>
          </Tooltip>
        }
      >
        <button type="button" className={styles.infoBtn} ref={refName}>
          <SvgQuestion className={styles.icon} />
        </button>
      </OverlayTrigger>
    </>
  );
}

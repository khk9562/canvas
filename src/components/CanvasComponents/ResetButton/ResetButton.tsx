"use client";
import styles from "./ResetButton.module.css";
import SvgReset from "@/public/icons/canvas/reset.svg";

export default function ResetButton({ kind, fn }: any) {
  return (
    <>
      <button
        type="button"
        className={kind == "notAbsolute" ? "" : styles.resetBtn}
        onClick={fn}
      >
        <SvgReset className={styles.icon} />
      </button>
    </>
  );
}

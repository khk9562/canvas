"use client";
import styles from "./NavBtn.module.css";
export default function NavBtn({ content, fn, classname, children }: any) {
  return (
    <button type="button" className={classname} onClick={fn}>
      {children}
      {content && <span className={styles.tit}>{content}</span>}
    </button>
  );
}

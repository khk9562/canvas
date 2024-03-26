"use client";

import styles from "./StickerCateNav.module.css";
import SvgPrev from "@/public/icons/prev.svg";
import SvgNext from "@/public/icons/next.svg";

export default function StickerCateNav({
  kind,
  refName,
  stickerCate,
  activeStickerTab,
  setActiveStickerTab,
  navScrollLeft,
  navScrollRight,
}: any) {
  return (
    <>
      <nav
        className={styles.stickersnav}
        style={{ width: kind == "modal" ? "100%" : "" }}
      >
        <div ref={refName}>
          {stickerCate?.map((item: any, index: number) => (
            <button
              key={`stickerCate${item.id}`}
              type="button"
              className={activeStickerTab == item.name ? styles.active : ""}
              onClick={() => setActiveStickerTab(item.name)}
            >
              {item.title}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={`${styles.btn} ${styles.lbtn}`}
          onClick={navScrollLeft}
        >
          <SvgPrev className={styles.icon} />
        </button>
        <button
          type="button"
          className={`${styles.btn} ${styles.rbtn}`}
          onClick={navScrollRight}
        >
          <SvgNext className={styles.icon} />
        </button>
      </nav>
    </>
  );
}

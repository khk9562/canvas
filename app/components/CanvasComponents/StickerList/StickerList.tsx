"use client";
import styles from "./StickerList.module.css";
import Image from "next/image";
export default function StickerList({
  moreStickers,
  activeStickerTab,
  currentFixTxt,
  setCurrentFixTxt,
}: any) {
  return (
    <div className={styles.stickerList}>
      {moreStickers
        ?.filter((item: any) => item.category === activeStickerTab)
        ?.map((item: any, index: number) => (
          <div
            key={`sticker-img-${index}`}
            className={styles.stickerImgBox}
            style={
              currentFixTxt.sticker ==
              item.image_thumbnail.replace("https://static.spooncast.net", "")
                ? {
                    boxShadow: "0 0 8px 3px rgba(0,0,0,0.1)",
                    border: "1px solid #ddd",
                    transition: "all 0.3s ease-out",
                  }
                : {}
            }
          >
            <input
              name="sticker"
              type="radio"
              id={`${index}`}
              value={item}
              autoComplete="off"
              className={styles.stickerCheckInput}
              onChange={({ target }) =>
                setCurrentFixTxt({
                  ...currentFixTxt,
                  sticker: item.image_thumbnail.replace(
                    "https://static.spooncast.net",
                    ""
                  ),
                  amount: item.price,
                })
              }
            />
            <label htmlFor={`${index}`} className={styles.stickerCheckLable}>
              <Image
                src={item.image_thumbnail.replace(
                  "https://static.spooncast.net",
                  ""
                )}
                width={80}
                height={80}
                // alt={`스티커이미지${index}`}
                alt={item.image_thumbnail.replace(
                  "https://static.spooncast.net",
                  ""
                )}
              />

              <span>{item.price}</span>
            </label>
          </div>
        ))}
    </div>
  );
}

import styles from "./page.module.scss"
import Link from "next/link"

export default function Page() {
  return (
    <main className={styles.main}>
      <div className={styles.list}>
        <Link href='/canvas'>캔버스 페이지로</Link>
        <Link href='/d3-test'>d3 페이지로</Link>
      </div>
    </main>
  )
}

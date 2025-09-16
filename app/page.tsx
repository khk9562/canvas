import styles from "./page.module.scss"
import Link from "next/link"

export default function Page() {
  return (
    <main className={styles.main}>
      <Link href='/canvas'>캔버스 페이지로</Link>
    </main>
  )
}

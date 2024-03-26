"use client";

import React, { useContext, useEffect, useState } from "react";
import styles from "./Header.module.css";
import { usePathname, useRouter } from "next/navigation";
import { PlayListContext } from "@/app/providers/playlistProvider";
import SvgSearch from "@/public/icons/search.svg";
import SvgLogin from "@/public/icons/login.svg";
import SvgLogout from "@/public/icons/logout.svg";

const Header = (HeaderProps: any) => {
  const router = useRouter();
  const pathname = usePathname();
  const { session, removeSession } = useContext(PlayListContext);

  const [searchVal, setSearchVal] = useState<string>("");

  const getBackgroundColor = (pathname: string) => {
    switch (pathname) {
      // case "/":
      //   return "var(--brown)";
      default:
        return "white";
    }
  };

  return (
    <>
      <header
        className={styles.header}
        style={{ backgroundColor: getBackgroundColor(pathname) }}
      >
        <div className={styles.container}>
          {session && (
            <button className={styles.login} onClick={() => removeSession()}>
              <SvgLogout className={styles.icon} />
            </button>
          )}
          {!session && pathname != "/" && (
            <button className={styles.login} onClick={() => router.push("/")}>
              <SvgLogin className={styles.icon} />
            </button>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;

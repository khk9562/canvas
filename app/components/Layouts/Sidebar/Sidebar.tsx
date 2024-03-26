"use client";

import React, { useState, useContext, useRef, useEffect } from "react";
import styles from "./Sidebar.module.css";
import { useRouter, usePathname } from "next/navigation";
import { PlayListContext } from "@/app/providers/playlistProvider";

import SvgDashboard from "@/public/icons/dashboard.svg";
import SvgCanvas from "@/public/icons/color-palette.svg";
import SvgRoulette from "@/public/icons/roulette.svg";
import SvgChat from "@/public/icons/chat.svg";
import SvgSticker from "@/public/icons/sticker.svg";
import SvgVoiceChat from "@/public/icons/voice-chat.svg";
import SvgVoicePerson from "@/public/icons/voice-command.svg";
import SvgVoiceCommand from "@/public/icons/command.svg";
import SvgSetting from "@/public/icons/setting.svg";
import SvgMemberSetting from "@/public/icons/member-setting.svg";
import SvgHeartLog from "@/public/icons/heartlog.svg";
import SvgQuickMsg from "@/public/icons/quickmsg.svg";
import SvgLogin from "@/public/icons/login.svg";
import SvgLogout from "@/public/icons/logout.svg";
import SvgHamMenu from "@/public/icons/hamburger.svg";
import SvgClose from "@/public/icons/close.svg";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { session, removeSession } = useContext(PlayListContext);
  const navRef = useRef(null);
  const [isNavVisible, setIsNavVisible] = useState<boolean>(false);
  const [mobileMenu, setMobileMenu] = useState<boolean>(false);

  useEffect(() => {
    if (session) {
      setIsNavVisible(true);
    } else {
      setIsNavVisible(false);
    }
  }, [session]);

  return (
    <>
      {isNavVisible && (
        <>
          <nav className={`${styles.nav}`}>
            <div className={styles.container} ref={navRef}>
              <h1 className={styles.company} onClick={() => router.push("/")}>
                루루봇
              </h1>
              <ul className={styles.navCategory}>
                <li
                  className={pathname == "/dashboard" ? styles.active : ""}
                  onClick={() => router.push("/dashboard")}
                >
                  <SvgDashboard
                    className={
                      pathname == "/dashboard" ? styles.iconActive : styles.icon
                    }
                  />

                  <h2>대시보드</h2>
                </li>
                <li
                  onClick={() => router.push("/canvas")}
                  className={pathname == "/canvas" ? styles.active : ""}
                >
                  <SvgCanvas
                    className={
                      pathname == "/canvas" ? styles.iconActive : styles.icon
                    }
                  />

                  <h2>캔버스</h2>
                </li>
                <li
                  onClick={() => router.push("/log/stickerlog")}
                  className={pathname == "/log/stickerlog" ? styles.active : ""}
                >
                  <SvgSticker
                    className={
                      pathname == "/log/stickerlog"
                        ? styles.iconActive
                        : styles.icon
                    }
                  />

                  <h2>스티커로그 조회</h2>
                </li>
                <li
                  onClick={() => router.push("/log/chatlog")}
                  className={pathname == "/log/chatlog" ? styles.active : ""}
                >
                  <SvgChat
                    className={
                      pathname == "/log/chatlog"
                        ? styles.iconActive
                        : styles.icon
                    }
                  />

                  <h2>채팅로그 조회</h2>
                </li>
                <li
                  onClick={() => router.push("/log/heartlog")}
                  className={pathname == "/log/heartlog" ? styles.active : ""}
                >
                  <SvgHeartLog
                    className={
                      pathname == "/log/heartlog"
                        ? styles.iconActive
                        : styles.icon
                    }
                  />

                  <h2>하트로그 조회</h2>
                </li>
                <li
                  className={pathname == "/userlist" ? styles.active : ""}
                  onClick={() => router.push("/userlist")}
                >
                  <SvgMemberSetting
                    className={
                      pathname == "/userlist" ? styles.iconActive : styles.icon
                    }
                  />
                  <h2>사용자목록</h2>
                </li>

                <li
                  className={pathname == "/roulette" ? styles.active : ""}
                  onClick={() => router.push("/roulette")}
                >
                  <SvgRoulette
                    className={
                      pathname == "/roulette" ? styles.iconActive : styles.icon
                    }
                  />
                  <h2>룰렛</h2>
                </li>
                <li
                  className={pathname == "/quickmsg" ? styles.active : ""}
                  onClick={() => router.push("/quickmsg")}
                >
                  <SvgQuickMsg
                    className={
                      pathname == "/quickmsg" ? styles.iconActive : styles.icon
                    }
                  />
                  <h2>퀵메세지</h2>
                </li>
                {/* <li
              className={pathname == "/voicebyspoon" ? styles.active : ""}
              onClick={() => router.push("/voicebyspoon")}
            >
              <SvgVoiceChat
                className={
                  pathname == "/voicebyspoon" ? styles.iconActive : styles.icon
                }
              />
              <h2>스푼별 멘트</h2>
            </li> */}
                <li
                  className={pathname == "/cmtbyperson" ? styles.active : ""}
                  onClick={() => router.push("/cmtbyperson")}
                >
                  <SvgVoicePerson
                    className={
                      pathname == "/cmtbyperson"
                        ? styles.iconActive
                        : styles.icon
                    }
                  />
                  <h2>청취자 목록</h2>
                </li>
                <li
                  className={pathname == "/cmtbycommand" ? styles.active : ""}
                  onClick={() => router.push("/cmtbycommand")}
                >
                  <SvgVoiceCommand
                    className={
                      pathname == "/cmtbycommand"
                        ? styles.iconActive
                        : styles.icon
                    }
                  />
                  <h2>명령어별 멘트</h2>
                </li>

                <li
                  className={pathname == "/settingpage" ? styles.active : ""}
                  onClick={() => router.push("/settingpage")}
                >
                  <SvgSetting
                    className={
                      pathname == "/settingpage"
                        ? styles.iconActive
                        : styles.icon
                    }
                  />
                  <h2>설정</h2>
                </li>
                {session && (
                  <li onClick={() => removeSession()}>
                    <SvgLogout className={styles.loginIcon} />
                  </li>
                )}
              </ul>
            </div>

            <button
              type="button"
              className={styles.loginBtnCont}
              onClick={() => router.push("/")}
            >
              <SvgLogin className={styles.loginIcon} />
            </button>
          </nav>
          <nav className={`${styles.mobileNav}`}>
            <button
              type="button"
              className={styles.mobileMenuBtn}
              onClick={() => setMobileMenu(true)}
            >
              <SvgHamMenu className={styles.icon} />
            </button>
            <h1 onClick={() => router.push("/")}>루루봇</h1>
            <button
              type="button"
              className={styles.loginBtnCont}
              onClick={() => router.push("/")}
            >
              <SvgLogin className={styles.loginIcon} />
            </button>
          </nav>
          {mobileMenu && (
            <nav className={`${styles.mobileMenu} `}>
              <ul>
                <button
                  type="button"
                  className={styles.mobileClose}
                  onClick={() => setMobileMenu(false)}
                >
                  <SvgClose className={styles.icon} />
                </button>
                <li
                  className={pathname == "/dashboard" ? styles.active : ""}
                  onClick={() => {
                    router.push("/dashboard");
                    setMobileMenu(false);
                  }}
                >
                  <SvgDashboard
                    className={
                      pathname == "/dashboard" ? styles.iconActive : styles.icon
                    }
                  />

                  <h2>대시보드</h2>
                </li>
                <li
                  onClick={() => {
                    router.push("/canvas");
                    setMobileMenu(false);
                  }}
                  className={pathname == "/canvas" ? styles.active : ""}
                >
                  <SvgCanvas
                    className={
                      pathname == "/canvas" ? styles.iconActive : styles.icon
                    }
                  />

                  <h2>캔버스</h2>
                </li>
                <li
                  onClick={() => {
                    router.push("/log/stickerlog");
                    setMobileMenu(false);
                  }}
                  className={pathname == "/log/stickerlog" ? styles.active : ""}
                >
                  <SvgSticker
                    className={
                      pathname == "/log/stickerlog"
                        ? styles.iconActive
                        : styles.icon
                    }
                  />

                  <h2>스티커로그 조회</h2>
                </li>
                <li
                  onClick={() => {
                    router.push("/log/chatlog");
                    setMobileMenu(false);
                  }}
                  className={pathname == "/log/chatlog" ? styles.active : ""}
                >
                  <SvgChat
                    className={
                      pathname == "/log/chatlog"
                        ? styles.iconActive
                        : styles.icon
                    }
                  />

                  <h2>채팅로그 조회</h2>
                </li>
                <li
                  onClick={() => {
                    router.push("/log/heartlog");
                    setMobileMenu(false);
                  }}
                  className={pathname == "/log/heartlog" ? styles.active : ""}
                >
                  <SvgHeartLog
                    className={
                      pathname == "/log/heartlog"
                        ? styles.iconActive
                        : styles.icon
                    }
                  />

                  <h2>하트로그 조회</h2>
                </li>
                <li
                  className={pathname == "/userlist" ? styles.active : ""}
                  onClick={() => {
                    router.push("/userlist");
                    setMobileMenu(false);
                  }}
                >
                  <SvgMemberSetting
                    className={
                      pathname == "/userlist" ? styles.iconActive : styles.icon
                    }
                  />
                  <h2>사용자목록</h2>
                </li>

                <li
                  className={pathname == "/roulette" ? styles.active : ""}
                  onClick={() => {
                    router.push("/roulette");
                    setMobileMenu(false);
                  }}
                >
                  <SvgRoulette
                    className={
                      pathname == "/roulette" ? styles.iconActive : styles.icon
                    }
                  />
                  <h2>룰렛</h2>
                </li>
                <li
                  className={pathname == "/quickmsg" ? styles.active : ""}
                  onClick={() => {
                    router.push("/quickmsg");
                    setMobileMenu(false);
                  }}
                >
                  <SvgQuickMsg
                    className={
                      pathname == "/quickmsg" ? styles.iconActive : styles.icon
                    }
                  />
                  <h2>퀵메세지</h2>
                </li>
                {/* <li
              className={pathname == "/voicebyspoon" ? styles.active : ""}
              onClick={() => router.push("/voicebyspoon")}
            >
              <SvgVoiceChat
                className={
                  pathname == "/voicebyspoon" ? styles.iconActive : styles.icon
                }
              />
              <h2>스푼별 멘트</h2>
            </li> */}
                <li
                  className={pathname == "/cmtbyperson" ? styles.active : ""}
                  onClick={() => {
                    router.push("/cmtbyperson");
                    setMobileMenu(false);
                  }}
                >
                  <SvgVoicePerson
                    className={
                      pathname == "/cmtbyperson"
                        ? styles.iconActive
                        : styles.icon
                    }
                  />
                  <h2>청취자 목록</h2>
                </li>
                <li
                  className={pathname == "/cmtbycommand" ? styles.active : ""}
                  onClick={() => {
                    router.push("/cmtbycommand");
                    setMobileMenu(false);
                  }}
                >
                  <SvgVoiceCommand
                    className={
                      pathname == "/cmtbycommand"
                        ? styles.iconActive
                        : styles.icon
                    }
                  />
                  <h2>명령어별 멘트</h2>
                </li>

                <li
                  className={pathname == "/settingpage" ? styles.active : ""}
                  onClick={() => {
                    router.push("/settingpage");
                    setMobileMenu(false);
                  }}
                >
                  <SvgSetting
                    className={
                      pathname == "/settingpage"
                        ? styles.iconActive
                        : styles.icon
                    }
                  />
                  <h2>설정</h2>
                </li>

                <li
                  onClick={() => {
                    setMobileMenu(false);
                    removeSession();
                  }}
                >
                  <SvgLogout className={styles.icon} />
                  <h2>로그아웃</h2>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}
    </>
  );
}

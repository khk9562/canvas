"use client";
import React, { useState, useEffect, useContext } from "react";
import { Toast } from "react-bootstrap";
import styles from "./ToastInfo.module.css";

interface ToastType {
  showSt: boolean;
  setShowSt: React.Dispatch<React.SetStateAction<boolean>>;
  content: string;
}

export default function ToastInfo({ showSt, setShowSt, content }: ToastType) {
  return (
    <Toast
      className={styles.toast}
      onClose={() => setShowSt(false)}
      show={showSt}
      delay={3000}
      autohide
    >
      <Toast.Body>
        <span>{content}</span>
      </Toast.Body>
    </Toast>
  );
}

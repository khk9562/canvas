"use client";

import React, { useState, useEffect, useContext } from "react";
import styles from "./ArticleTit.module.css";
import { usePathname } from "next/navigation";

interface ArticleTitProps {
  title: string;
}

export default function ArticleTit({ title }: ArticleTitProps) {
  return <h1 className={styles.tit}>{title}</h1>;
}

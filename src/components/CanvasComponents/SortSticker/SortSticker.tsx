"use client";
import styles from "./SortSticker.module.css";
import SvgReset from "@/public/icons/canvas/reset.svg";

export default function SortSticker({ setSort, sort }: any) {
  return (
    <label htmlFor="sortFix" style={{ margin: "5px 0" }}>
      <h6>정렬</h6>
      <select
        name="sortFix"
        id="sortFix"
        onChange={(e) => setSort(e.target.value)}
        value={sort}
      >
        <option value="name">이름순</option>
        <option value="spoon">스푼순</option>
      </select>
    </label>
  );
}

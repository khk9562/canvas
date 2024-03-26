"use client";
import styles from "../../../page.module.css";
import CanvasSidebar from "../CanvasSidebar/CanvasSidebar";

export default function ModifyObject({
  show,
  closeOpenState,
  activeType,
  color,
  setColor,
  opacity,
  setOpacity,
  strokeWidth,
  setStrokeWidth,
  strokeColor,
  setStrokeColor,
  strokeOpacity,
  setStrokeOpacity,
}: any) {
  return (
    show && (
      <CanvasSidebar
        kind="modify"
        // title="객체 수정"
        closeOpenState={closeOpenState}
      >
        {activeType == "text" ? (
          <div className={styles.inputBox}>
            <label>
              <h6>색상</h6>
              <input
                type="text"
                style={{
                  borderRadius: "8px",
                  textAlign: "center",
                }}
                value={color}
                placeholder="#rrggbb"
                onChange={setColor}
              />

              <input
                type="color"
                autoComplete="off"
                style={{ marginLeft: "8px" }}
                value={color}
                onChange={setColor}
              />
            </label>
            <label>
              <h6>투명도</h6>
              <div className={styles.rangebox}>
                <span>0</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  autoComplete="off"
                  value={opacity}
                  onChange={setOpacity}
                />
                <span>1</span>
              </div>
              <input
                style={{
                  width: "60px",
                  borderRadius: "8px",
                  textAlign: "center",
                }}
                type="number"
                max={1}
                min={0}
                step={0.05}
                value={opacity}
                onChange={setOpacity}
              />
            </label>
          </div>
        ) : activeType == "rect" ||
          activeType == "circle" ||
          activeType == "triangle" ? (
          <div className={styles.inputBox}>
            <label>
              <h6>색상</h6>
              <input
                type="text"
                style={{
                  borderRadius: "8px",
                  textAlign: "center",
                }}
                value={color}
                placeholder="#rrggbb"
                onChange={(event) => setColor(event.target.value)}
              />

              <input
                type="color"
                autoComplete="off"
                style={{ marginLeft: "8px" }}
                value={color}
                onChange={setColor}
              />
            </label>
            <label>
              <h6>투명도</h6>
              <div className={styles.rangebox}>
                <span>0</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  autoComplete="off"
                  value={opacity}
                  onChange={setOpacity}
                />
                <span>1</span>
              </div>
              <input
                style={{
                  width: "60px",
                  borderRadius: "8px",
                  textAlign: "center",
                }}
                type="number"
                max={1}
                min={0}
                step={0.05}
                value={opacity}
                onChange={setOpacity}
              />
            </label>
            <label>
              <h6>테두리 두께</h6>
              <div className={styles.rangebox}>
                <span>0</span>
                <input
                  type="range"
                  autoComplete="off"
                  min={0}
                  max={10}
                  value={strokeWidth}
                  onChange={setStrokeWidth}
                />
                <span>10</span>
              </div>

              <input
                style={{
                  width: "60px",
                  borderRadius: "8px",
                  textAlign: "center",
                }}
                type="number"
                min={0}
                max={10}
                step={1}
                value={strokeWidth}
                onChange={setStrokeWidth}
              />
            </label>
            <label>
              <h6>테두리 색상</h6>
              <input
                type="text"
                style={{
                  borderRadius: "8px",
                  textAlign: "center",
                }}
                placeholder="#rrggbb"
                value={strokeColor}
                onChange={setStrokeColor}
              />

              <input
                type="color"
                autoComplete="off"
                style={{ marginLeft: "8px" }}
                value={strokeColor}
                onChange={setStrokeColor}
              />
            </label>
            <label>
              <h6>테두리 투명도</h6>
              <div className={styles.rangebox}>
                <span>0</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  autoComplete="off"
                  value={strokeOpacity}
                  onChange={setStrokeOpacity}
                />
                <span>1</span>
              </div>
              <input
                style={{
                  width: "60px",
                  borderRadius: "8px",
                  textAlign: "center",
                }}
                type="number"
                max={1}
                min={0}
                step={0.05}
                value={strokeOpacity}
                onChange={setStrokeOpacity}
              />
            </label>
          </div>
        ) : activeType == "group" ? (
          <div className={styles.inputBox}>
            <label>
              <h6>투명도</h6>
              <div className={styles.rangebox}>
                <span>0</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  autoComplete="off"
                  value={opacity}
                  onChange={setOpacity}
                />
                <span>1</span>
              </div>
              <input
                style={{
                  width: "60px",
                  borderRadius: "8px",
                  textAlign: "center",
                }}
                type="number"
                max={1}
                min={0}
                step={0.05}
                value={opacity}
                onChange={setOpacity}
              />
            </label>
            <label>
              <h6>테두리 두께</h6>
              <div className={styles.rangebox}>
                <span>0</span>
                <input
                  id="changeStStrokeWidth"
                  type="range"
                  autoComplete="off"
                  min={0}
                  max={10}
                  value={strokeWidth}
                  onChange={setStrokeWidth}
                />
                <span>10</span>
              </div>

              <input
                style={{
                  width: "60px",
                  borderRadius: "8px",
                  textAlign: "center",
                }}
                type="number"
                min={0}
                max={10}
                step={1}
                value={strokeWidth}
                onChange={setStrokeWidth}
              />
            </label>
            <label>
              <h6>테두리 색상</h6>
              <input
                type="text"
                style={{
                  borderRadius: "8px",
                  textAlign: "center",
                }}
                placeholder="#rrggbb"
                value={strokeColor}
                onChange={setStrokeColor}
              />

              <input
                type="color"
                autoComplete="off"
                style={{ marginLeft: "8px" }}
                value={strokeColor}
                onChange={setStrokeColor}
              />
            </label>
            <label>
              <h6>테두리 투명도</h6>
              <div className={styles.rangebox}>
                <span>0</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  autoComplete="off"
                  value={strokeOpacity}
                  onChange={setStrokeOpacity}
                />
                <span>1</span>
              </div>
              <input
                style={{
                  width: "60px",
                  borderRadius: "8px",
                  textAlign: "center",
                }}
                type="number"
                max={1}
                min={0}
                step={0.05}
                value={strokeOpacity}
                onChange={setStrokeOpacity}
              />
            </label>
          </div>
        ) : null}
      </CanvasSidebar>
    )
  );
}

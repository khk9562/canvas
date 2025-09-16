"use client"

import React, { useEffect, useState, useContext, useRef } from "react"
import styles from "./page.module.css"
import Image from "next/image"
import axios from "axios"
import Lottie from "lottie-react"
import { useRouter } from "next/navigation"
import { PlayListContext } from "@/providers/playlistProvider"
import { fabric } from "fabric"
import { FabricJSCanvas } from "fabricjs-react"
import { Modal } from "react-bootstrap"

import ArticleTit from "@/layouts/ArticleTit/ArticleTit"
import ToastInfo from "@/components/Modal/ToastInfo"
import CanvasSidebar from "@/components/CanvasComponents/CanvasSidebar/CanvasSidebar"
import CanvasNotice from "@/components/CanvasComponents/CanvasNotice/CanvasNotice"
import StickerCateNav from "@/components/CanvasComponents/StickerCateNav/StickerCateNav"
import ResetButton from "@/components/CanvasComponents/ResetButton/ResetButton"
import SortSticker from "@/components/CanvasComponents/SortSticker/SortSticker"
import NavBtn from "@/components/CanvasComponents/NavBtn/NavBtn"
import StickerList from "@/components/CanvasComponents/StickerList/StickerList"
import ModifyObject from "@/components/CanvasComponents/ModifyObject/ModifyObject"

import SvgPngDownload from "@/public/icons/canvas/import.svg"
import SvgClose from "@/public/icons/close.svg"
import SvgTrash from "@/public/icons/canvas/trash-can.svg"
import SvgResize from "@/public/icons/canvas/aspect-ratio.svg"
import SvgForward from "@/public/icons/canvas/forward.svg"
import SvgBackWard from "@/public/icons/canvas/backward.svg"
import SvgStamp from "@/public/icons/canvas/stamp.svg"
import SvgText from "@/public/icons/canvas/text.svg"
import SvgPlusCircle from "@/public/icons/plus-circle.svg"
import SvgCrop from "@/public/icons/canvas/add-selection.svg"
import SvgShape from "@/public/icons/canvas/shape-builder.svg"
import SvgSquare from "@/public/icons/canvas/square.svg"
import SvgCircle from "@/public/icons/canvas/circle.svg"
import SvgTriangle from "@/public/icons/canvas/triangle.svg"
import SvgDeselect from "@/public/icons/canvas/deselect.svg"
import SvgImage from "@/public/icons/canvas/thumbnail.svg"
import SvgSelectDel from "@/public/icons/canvas/select-del.svg"
import SvgStar from "@/public/icons/star.svg"
import SvgPlus from "@/public/icons/canvas/add-button.svg"
import SvgDown from "@/public/icons/down-arrow.svg"
import SvgUp from "@/public/icons/up-arrow.svg"
import SvgPin from "@/public/icons/canvas/push-pin.svg"
import SvgFlipX from "@/public/icons/canvas/horizontal-flip.svg"
import SvgRedo from "@/public/icons/canvas/redo.svg"
import SvgUndo from "@/public/icons/canvas/undo.svg"
import SvgGroup from "@/public/icons/canvas/group.svg"
import SvgUnGroup from "@/public/icons/canvas/ungroup.svg"
import SvgPlusBtn from "@/public/icons/canvas/plus-sign.svg"
import SvgMinusBtn from "@/public/icons/canvas/minus-sign.svg"
import SvgBoxing from "@/public/icons/canvas/boxing.svg"
import SvgUnBoxing from "@/public/icons/canvas/unboxing.svg"
import SvgCanvasMove from "@/public/icons/canvas/canvas-move.svg"
import SvgCanvasFit from "@/public/icons/canvas/canvas-fit.svg"
import fontFamilyList from "@/constants/fonts"

interface Item {
  id: number
  nickname: string
  amount: number
  combo: string
  sticker: string
  txt: string
}
interface OpenState {
  openResize: boolean
  openText: boolean
  openPictures: boolean
  openFigures: boolean
  openSpoonStickers: boolean
  openSticker: boolean
  openFix: boolean
}

export default function Page() {
  const router = useRouter()
  const {
    setShowLoginNeedModal,
    setShowLoginErrorModal,
    session,
    removeSession,
    setShowSessionExModal,
    newVersion,
    getVersion,
  } = useContext(PlayListContext)

  // refs
  const canvasRef = useRef<fabric.Canvas | null>(null)
  const StickerInfoRef = useRef<any>(null)
  const navScrollRef = useRef<any>(null)
  const lottieRef = useRef<any | null>()

  // 변수
  let firstW = 900
  let firstH = 600
  let moveh: number = 0
  let ani // 로티이미지 캔버스로 드래그 전 업로드 용도

  const [liveIds, setLiveIds] = useState<any[]>([])
  const [selectedLiveId, setSelectedLiveId] = useState<number>(0)

  // Nav
  const [openPlusNav, setOpenPlusNav] = useState<boolean>(true)
  const [openSideNav, setOpenSideNav] = useState<boolean>(true)
  const [openState, setOpenState] = useState<OpenState>({
    openResize: false,
    openText: false,
    openPictures: false,
    openFigures: false,
    openSpoonStickers: false,
    openSticker: false,
    openFix: false,
  })

  // 캔버스 크기 변경
  const [canvasSizeKind, setCanvasSizeKind] = useState<string>("default")
  const [inputWidth, setInputWidth] = useState<number>(firstW)
  const [inputHeight, setInputHeight] = useState<number>(firstH)
  const [canvasWidth, setCanvasWidth] = useState<number>(firstW)
  const [canvasHeight, setCanvasHeight] = useState<number>(firstH)

  // 캔버스를 잡고 움직일 수 있게
  const [zoomInfo, setZoomInfo] = useState<number>(1)
  const [canvasPosition, setCanvasPosition] = useState<any>({
    left: 0,
    top: 0,
  })
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [initialPosition, setInitialPosition] = useState<any>({ x: 0, y: 0 })
  const [isButtonActive, setIsButtonActive] = useState<boolean>(false)

  // canvas history 기록
  const [initialCanvas, setInitialCanvas] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [currentStateIndex, setCurrentStateIndex] = useState<number>(-1)

  // 고정 객체 기록
  const [fixHistory, setFixHistory] = useState<any[]>([])

  // 텍스트
  const [texts, setTexts] = useState<{
    [key: string]: {
      fontFamily: string
      position: { left: number; top: number }
      color: string
    }
  }>({})
  const [showFFnav, setShowFFnav] = useState<boolean>(false)
  const [fontFamily, setFontFamily] = useState<string>("Arial")
  const [inputVal, setInputVal] = useState<string>("")

  // 도형
  const [changeStrokeWidth, setChangeStrokeWidth] = useState<string>("0")

  const [isImg, setIsImg] = useState<string>("") // 캔버스로 드래그 전 이미지 종류 파악용도

  // 이미지
  const [imagesUrls, setImagesUrls] = useState<string[]>([])
  const [selectedImage, setSelectedImage] = useState<fabric.Image | null>(null)
  const [fixImgSize, setFixImgSize] = useState<number>(0.25)
  let imgsize: number // 이미지 종류별로 scale 다르게 설정

  // 스티커
  const [stickers, setStickers] = useState<Item[]>([])
  const [allStickers, setAllStickers] = useState<any[]>([])
  const [sortVal, setSortVal] = useState<string>("")
  const [sortFixVal, setSortFixVal] = useState<string>("")

  // 스티커
  const [stickerCate, setStickerCate] = useState<any[]>([])
  const [moreStickers, setMoreStickers] = useState<any[]>([])
  const [activeStickerTab, setActiveStickerTab] = useState<string>("")
  // 썸네일 스티커 더블클릭시 넣을 데이터
  const [openStickerItems, setOpenStickerItems] = useState<boolean>(false)
  const [selectedMoreStItems, setSelectedMoreStItems] = useState<string[]>([])
  //   Lottie
  const [selectedLottie, setSelectedLottie] = useState<string>("")
  const [animationData, setAnimationData] = useState<any>(null)
  const [lottieSvg, setLottieSvg] = useState<any>()
  const [lottieSvgUrl, setLottieSvgUrl] = useState<string>("")
  const [isSnapShot, setIsSnapShot] = useState<boolean>(true)
  const [currentFrame, setCurrentFrame] = useState<number>(0)

  // 고정 텍스트 수동 추가
  const [openFixModal, setOpenFixModal] = useState<boolean>(false)
  const [fixTxts, setFixTxts] = useState<any[]>([])
  const [currentFixTxt, setCurrentFixTxt] = useState({
    nickname: "",
    amount: "",
    combo: "1",
    sticker: "",
    txt: "스푼",
  })

  // 토스트
  const [showLiveIdToast, setShowLiveIdToast] = useState<boolean>(false)
  const [showLottieErr, setShowLottieErr] = useState<boolean>(false)
  const [alertImgAllowed, setAlertImgAllowed] = useState<boolean>(false)
  const [showCropErr, setShowCropErr] = useState<boolean>(false)
  const [noticeCanvasMove, setNoticeCanvasMove] = useState<boolean>(false)

  // 그룹화
  const [showGroupBtn, setShowGroupBtn] = useState<boolean>(false)
  const [showUnGroupBtn, setShowUnGroupBtn] = useState<boolean>(false)

  // 크롭 기능
  const [showCropBtn, setShowCropBtn] = useState<boolean>(false)
  const [isCropMode, setIsCropMode] = useState<boolean>(false)
  const [cropZone, setCropZone] = useState<fabric.Rect | null>(null)

  // 그룹(스티커) 속성
  const [groupOpacity, setGroupOpacity] = useState<string>("1")

  // 색깔 및 투명도
  const [changeColor, setChangeColor] = useState<string>("#000000")
  const [changeAlpha, setChangeAlpha] = useState<string>("1")
  const [rgbaColor, setRgbaColor] = useState<string>(
    `${changeColor}${Math.round(Number(changeAlpha) * 255)
      .toString(16)
      .padStart(2, "0")}`
  )
  const [changeStrokeColor, setChangeStrokeColor] = useState<string>("#ffffff")
  const [changeStrokeAlpha, setChangeStrokeAlpha] = useState<string>("1")
  const [rgbaStrokeColor, setRgbaStrokeColor] = useState<string>(
    `${changeStrokeColor}${Math.round(Number(changeStrokeAlpha) * 255)
      .toString(16)
      .padStart(2, "0")}`
  )

  const handleColor = (event: any) => {
    setChangeColor(event.target.value)
  }
  const handleOpacity = (event: any) => {
    setChangeAlpha(event.target.value)
  }
  const handleGroupOpacity = (event: any) => {
    setGroupOpacity(event.target.value)
  }

  const handleStrokeWidth = (event: any) => {
    if (activeType == "group") {
      setChangeStStrokeWidth(event.target.value)
    } else setChangeStrokeWidth(event.target.value)
  }
  const handleStrokeColor = (event: any) => {
    if (activeType == "group") {
      setChangeStStrokeColor(event.target.value)
    } else setChangeStrokeColor(event.target.value)
  }
  const handleStrokeOpacity = (event: any) => {
    if (activeType == "group") {
      setChangeStStrokeAlpha(event.target.value)
    } else setChangeStrokeAlpha(event.target.value)
  }

  // 스티커 그룹 테두리
  const [changeStStrokeWidth, setChangeStStrokeWidth] = useState<string>("0")
  const [changeStStrokeColor, setChangeStStrokeColor] =
    useState<string>("#000000")
  const [changeStStrokeAlpha, setChangeStStrokeAlpha] = useState<string>("1")
  const [rgbaStStrokeColor, setRgbaStStrokeColor] = useState<string>(
    `${changeStStrokeColor}${Math.round(Number(changeStStrokeAlpha) * 255)
      .toString(16)
      .padStart(2, "0")}`
  )

  // 캔버스 저장 관련
  const [selectedCanvasId, setSelectedCanvasId] = useState<string>("")
  const [canvasList, setCanvasList] = useState<string[]>([])
  const [selectedCanvasTIt, setSelectedCanvasTit] = useState<string>("")
  const [savedNames, setSavedNames] = useState<string[]>([])

  // 객체 수정 위해 분리 중
  const [activeType, setActiveType] = useState<string>("")
  const [showModify, setShowModify] = useState<boolean>(false)

  ////// 함수

  const onCanvasReady = (canvas: fabric.Canvas) => {
    canvasRef.current = canvas
    canvas.preserveObjectStacking = true
    canvas.setWidth(canvasWidth)
    canvas.setHeight(canvasHeight)
    setInitialCanvas(canvas)
    handleCanvasChange()
    canvas.on("object:modified", () => {
      handleCanvasChange() // 캔버스 실행 기록
    })

    canvas.on("selection:created", () => {
      const activeObject = canvas.getActiveObject()
      if (activeObject) {
        setActiveType(`${activeObject.type}`)
      }
    })

    canvas.on("selection:updated", (e) => {
      const activeObject = canvas.getActiveObject()
      if (activeObject) {
        setActiveType(`${activeObject.type}`)
      }
    })

    canvas.on("selection:cleared", (e) => {
      setActiveType("")
      setShowModify(false)
      if (!isCropMode) {
        setShowCropBtn(false)
        setShowGroupBtn(false)
        setShowUnGroupBtn(false)
        resetSetting()
      }
    })
  }

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      const allowedExtensions = /(\.jpg|\.jpeg|\.png|\.gif|\.svg)$/i
      const formData = new FormData()

      const newFilesUrls = files.map((file) => URL.createObjectURL(file))

      files.forEach((file, i) => {
        if (!allowedExtensions.exec(files[i].name)) {
          // alert("이미지 파일(.jpg, .jpeg, .png, .gif, .svg)만 업로드해주세요.");
          e.target.value = ""
          setAlertImgAllowed(true)
          return
        }
        formData.append(file.name, file)
      })
      try {
        const response = await axios.post("/api/upload", formData)

        if (response.data.success) {
          setImagesUrls((prevImagesUrls) => [
            ...prevImagesUrls,
            ...response.data.urls,
          ])
        } else {
          console.log("업로드 실패:", response.data.message)
        }
      } catch (e) {
        console.error("handleFileSelected", e)
      }
    }
  }

  const deleteImagesUrl = (url: string) => {
    setImagesUrls((prevImagesUrls) =>
      prevImagesUrls.filter((imageUrl) => imageUrl !== url)
    )
  }

  // 캔버스 작업 기록
  const saveCanvasStateHistory = (canvas: fabric.Canvas) => {
    const json = canvas.toJSON()
    setHistory((prevHistory) => [...prevHistory, json])
    setCurrentStateIndex((prevIndex) => prevIndex + 1)
  }
  const handleCanvasChange = () => {
    const canvas = canvasRef.current
    if (canvas) {
      saveCanvasStateHistory(canvas)
    }
  }
  const undo = () => {
    if (currentStateIndex > 0 && initialCanvas) {
      const newStateIndex = currentStateIndex - 1
      const state = history[newStateIndex]
      initialCanvas.loadFromJSON(state, () => {
        initialCanvas.renderAll()
        setCurrentStateIndex(newStateIndex)
      })
    }
  }
  const redo = () => {
    if (currentStateIndex < history.length - 1 && initialCanvas) {
      const newStateIndex = currentStateIndex + 1
      const state = history[newStateIndex]
      initialCanvas.loadFromJSON(state, () => {
        initialCanvas.renderAll()
        setCurrentStateIndex(newStateIndex)
      })
    }
  }

  // 캔버스 확대축소움직이기
  const zoomIn = (w: number, h: number) => {
    const canvas = canvasRef.current
    if (canvas) {
      let zoom = canvas.getZoom()
      zoom += 0.25
      if (zoom > 3) zoom = 3
      canvas.setZoom(zoom)
      canvas.setWidth(w * zoom)
      canvas.setHeight(h * zoom)
      setZoomInfo(zoom)
    }
  }
  const zoomOut = (w: number, h: number) => {
    const canvas = canvasRef.current
    if (canvas) {
      let zoom = canvas.getZoom()
      zoom -= 0.25
      if (zoom < 0.1) zoom = 0.1
      canvas.setZoom(zoom)
      canvas.setWidth(w * zoom)
      canvas.setHeight(h * zoom)
      setZoomInfo(zoom)
    }
  }
  const zoomReset = (w: number, h: number) => {
    const canvas = canvasRef.current
    if (canvas) {
      canvas.setZoom(1)
      setZoomInfo(1)
      canvas.setWidth(w)
      canvas.setHeight(h)
    }
  }
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isButtonActive) return
    setIsDragging(true)
    setInitialPosition({ x: e.clientX, y: e.clientY })
  }
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isButtonActive) return
    if (!isDragging) return

    const deltaX = e.clientX - initialPosition.x
    const deltaY = e.clientY - initialPosition.y

    setCanvasPosition((prevState: any) => ({
      left: prevState.left + deltaX,
      top: prevState.top + deltaY,
    }))

    setInitialPosition({ x: e.clientX, y: e.clientY })
  }
  const handleMouseUp = () => {
    setIsDragging(false)
  }
  const handleButtonClick = () => {
    setIsButtonActive((prevState) => !prevState)
  }

  //   이미지 Png로 캡처 다운로드
  const downloadCanvasAsImage = () => {
    if (!canvasRef.current) return

    const dataUrl = canvasRef.current.toDataURL({
      format: "png",
      multiplier: 4,
    })

    const link = document.createElement("a")
    link.download = "canvas.png"
    link.href = dataUrl

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // PlusNav
  // 앞
  const bringSelectedForward = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const activeObject = canvas.getActiveObject()
      if (activeObject) {
        activeObject.bringForward()
        canvas.requestRenderAll()
      }
    }
  }
  // 뒤
  const sendSelectedBack = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const activeObject = canvas.getActiveObject()
      if (activeObject) {
        activeObject.sendBackwards()
        canvas.requestRenderAll()
      }
    }
  }
  // 맨앞
  const bringToFront = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const activeObject = canvas.getActiveObject()
      if (activeObject) {
        activeObject.bringToFront()
        canvas.requestRenderAll()
      }
    }
  }
  // 맨뒤
  const sendToBack = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const activeObject = canvas.getActiveObject()
      if (activeObject) {
        activeObject.sendToBack()
        canvas.requestRenderAll()
      }
    }
  }
  // 선택해제
  const deSelect = () => {
    const canvas = canvasRef.current
    if (canvas) {
      canvas.discardActiveObject().renderAll()
    }
  }
  // 선택삭제
  const deleteSelected = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const activeObject = canvas.getActiveObject()
    if (activeObject) {
      canvas.remove(activeObject)
      canvas.requestRenderAll()
    }
  }
  // 전부삭제
  const deleteAll = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.getObjects().forEach((obj) => {
      canvas.remove(obj)
    })
    canvas.requestRenderAll()
  }
  // 좌우반전
  const filpX = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const activeObject = canvas.getActiveObject()
      if (activeObject) {
        activeObject.flipX = !activeObject.flipX
      }
      canvas.renderAll()
    }
  }
  // 고정
  const handleFix = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const activeObject = canvas.getActiveObject()
      if (activeObject) {
        deSelect()
        activeObject.set({ selectable: false })
        setFixHistory([...fixHistory, activeObject])
        canvas.requestRenderAll()
      }
    }
  }
  const handleUndoFix = (x: any) => {
    const canvas = canvasRef.current
    if (canvas && fixHistory.length > 0) {
      x.set({
        selectable: true,
      })

      const newFixHistory = fixHistory.filter(
        (item) => item.cacheKey !== x.cacheKey
      )
      setFixHistory(newFixHistory)

      canvas.requestRenderAll()
    }
  }
  // 그룹화
  const groupObjectsInCanvas = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const activeSelection = canvas.getActiveObject() as fabric.ActiveSelection
      if (activeSelection && activeSelection.type === "activeSelection") {
        var group = activeSelection.toGroup()
        canvas.setActiveObject(group)
        setShowGroupBtn(false)
        setShowUnGroupBtn(true)
        canvas.requestRenderAll()
      }
    }
  }
  const unGroupObjectsInCanvas = () => {
    const canvas = canvasRef.current
    if (canvas) {
      var activeObject = canvas.getActiveObject() as fabric.Group
      if (activeObject && activeObject.type === "group") {
        var activeSelection = activeObject.toActiveSelection()
        canvas.setActiveObject(activeSelection)
        setShowGroupBtn(true)
        setShowUnGroupBtn(false)
        canvas.requestRenderAll()
      }
    }
  }
  // 크롭
  const handleCropMode = () => {
    if (showCropBtn) {
      setIsCropMode(true)
      const c = canvasRef.current
      if (c) {
        const ac = c.getActiveObject()
        if (ac && ac.type === "image") {
          ac.selectable = false
          setSelectedImage(ac as fabric.Image)
          c.bringToFront(ac)
        }
        c.discardActiveObject().renderAll()
      }
    } else {
      setSelectedImage(null)
    }
  }

  const handleApplyCrop = async (selectedImage: any) => {
    if (cropZone && selectedImage) {
      const left = cropZone.left ?? 0
      const top = cropZone.top ?? 0
      const width = cropZone.width ?? 0
      const height = cropZone.height ?? 0

      var croppedCanvas = document.createElement("canvas")

      croppedCanvas.width = width / (selectedImage.scaleX || 0)
      croppedCanvas.height = height / (selectedImage.scaleY || 0)

      var context = croppedCanvas.getContext("2d")
      if (!context) {
        console.error("크롭 에러")
        setShowCropErr(true)
      }
      if (context) {
        context.drawImage(
          (selectedImage as any)._element as HTMLImageElement,
          (left - (selectedImage.left || 0)) / (selectedImage.scaleX || 1),
          (top - (selectedImage.top || 0)) / (selectedImage.scaleY || 1),
          width / (selectedImage.scaleX || 1),
          height / (selectedImage.scaleY || 1),
          0,
          0,
          width / (selectedImage.scaleX || 1),
          height / (selectedImage.scaleY || 1)
        )
      }
      ;``

      var croppedImageURL = croppedCanvas.toDataURL()

      fabric.Image.fromURL(croppedImageURL, function (croppedImg) {
        if (canvasRef.current) {
          croppedImg.set({
            left: left,
            top: top,
            scaleX: selectedImage.scaleX,
            scaleY: selectedImage.scaleY,
          })

          canvasRef.current.remove(selectedImage)
          canvasRef.current.remove(cropZone)
          canvasRef.current.add(croppedImg)

          canvasRef.current.renderAll()
          // setIsCropMode(false);
          setCropZone(null)
        }
      })
    }
  }

  // Sidebar Nav
  const toggleState = (stateKey: keyof OpenState) => {
    setOpenState((prevState) => ({
      ...prevState,
      openResize: false,
      openText: false,
      openPictures: false,
      openFigures: false,
      openSpoonStickers: false,
      openSticker: false,
      openFix: false,
      [stateKey]: !prevState[stateKey],
    }))
  }
  const closeOpenState = () => {
    setShowFFnav(false)
    setOpenState({
      openResize: false,
      openText: false,
      openPictures: false,
      openFigures: false,
      openSpoonStickers: false,
      openSticker: false,
      openFix: false,
    })
  }
  const resetSetting = () => {
    setChangeStStrokeAlpha("1")
    setChangeStStrokeWidth("0")
    setChangeStStrokeColor("#000000")
    setInputVal("")
    setFontFamily("Arial")
    setChangeColor("#000000")
    setChangeAlpha("1")
    setChangeStrokeColor("#ffffff")
    setChangeStrokeWidth("0")
    setChangeStrokeAlpha("1")
  }
  // 캔버스 크기 변경
  const handleCanvasSize = (x: number, y: number) => {
    // 스테이트로 x, y 값 전달
    setInputWidth(x)
    setInputHeight(y)
    setCanvasWidth(x)
    setCanvasHeight(y)
    zoomReset(x, y)
  }
  const resizeCanvas = () => {
    // x,y 전달된 스테이트 변경 감지되면 실제로 캔버스 크기 변경
    const canvas = canvasRef.current
    if (canvas) {
      canvas.setWidth(canvasWidth)
      canvas.setHeight(canvasHeight)
      canvas.calcOffset()
      canvas.renderAll()
    }
  }

  //   텍스트 추가
  const addText = async (
    text: string,
    fontFamily: string,
    position: { left: number; top: number },
    rgbaColor: string
  ) => {
    const canvas = canvasRef.current
    if (!canvas) return

    // 폰트가 완전히 로드될 때까지 기다립니다.
    await document.fonts.load(`1em ${fontFamily}`)

    // 텍스트에 포함된 엔터를 줄바꿈으로 인식하도록 수정합니다.
    const formattedText = text.replace(/\\n/g, "\n")

    const newText = new fabric.Text(formattedText, {
      left: position.left,
      top: position.top,
      fontFamily: fontFamily,
      fill: rgbaColor,
      fontWeight: "bold",
      fontSize: 20,
    })
    newText.setCoords()
    canvas.add(newText)
    canvas.requestRenderAll()
  }

  //   이미지 추가
  const addImage = (source: string) => {
    const canvas = canvasRef.current
    if (!canvas) return

    fabric.Image.fromURL(
      source,
      function (img) {
        if (!img) {
          console.error(`Could not create image from ${source}`)
          return
        }

        switch (isImg) {
          case "img":
            // imgsize = 0.07;
            imgsize = 0.2
            break
          case "lottie":
            imgsize = 0.3
            break
          case "":
            imgsize = 0.6
            break
          default:
            imgsize = 0.6
            break
        }

        img
          .scale(imgsize)
          .set({
            left: 0,
            top: 0,
            hasControls: true,
          })
          .setCoords()

        canvas.add(img)
        canvas.requestRenderAll()
      },
      { crossOrigin: "anonymous" }
    )
  }

  // 도형
  const addSquare = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      width: 60,
      height: 60,
      fill: rgbaColor,
      stroke: rgbaStrokeColor,
      strokeWidth: Number(changeStrokeWidth),
      strokeUniform: true,
      originX: "center",
      originY: "center",
    })

    canvas.add(rect)
  }
  const addTriangle = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const triangle = new fabric.Triangle({
      left: 200,
      top: 200,
      fill: rgbaColor,
      stroke: rgbaStrokeColor,
      strokeWidth: Number(changeStrokeWidth),
      width: 60,
      height: 60,
      strokeUniform: true,
      originX: "center",
      originY: "center",
    })

    canvas.add(triangle)
  }
  const addCircle = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const circle = new fabric.Circle({
      left: 300,
      top: 300,
      fill: rgbaColor,
      stroke: rgbaStrokeColor,
      strokeWidth: Number(changeStrokeWidth),
      radius: 30,
      strokeUniform: true,
      originX: "center",
      originY: "center",
    })

    canvas.add(circle)
  }

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null
  }
  const separateRGBA = (type: string, rgba: string) => {
    // rgba 문자열에서 숫자만 분리
    const values = rgba.match(/[\d.]+/g)

    if (!values || values.length !== 4) return

    // RGB 값을 HEX로 변환
    const hex = values
      .slice(0, 3)
      .map((v) => {
        const hex = parseInt(v).toString(16)
        return hex.length === 1 ? "0" + hex : hex
      })
      .join("")

    // 투명도 값 (0에서 1 사이)을 그대로 반환
    const alpha = parseFloat(values[3])

    // return [`#${hex}`, alpha];
    if (type == "stickerStroke") {
      // 고정스티커테두리
      setChangeStStrokeColor(`#${hex}`)
      setChangeStStrokeAlpha(String(alpha))
    } else if (type == "figure") {
      // 도형배경, 글자색
      setChangeColor(`#${hex}`)
      setChangeAlpha(String(alpha))
    } else if (type == "figureStroke") {
      // 도형 테두리
      setChangeStrokeColor(`#${hex}`)
      setChangeStrokeAlpha(String(alpha))
    }
  }
  // 선택 객체 색깔 변경
  const handleChangeColor = (color: string) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const activeObject = canvas.getActiveObject()
    if (activeObject && activeObject.type !== "group") {
      activeObject.set({ fill: color })
    }
    canvas.requestRenderAll()
  }
  const handleStrokeChangeColor = (color: string) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const activeObject = canvas.getActiveObject()
    if (activeObject && activeObject.type !== "group") {
      activeObject.set({ stroke: color })
    }
    canvas.requestRenderAll()
  }
  const handleStStrokeChangeColor = (color: string) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const activeObject = canvas.getActiveObject() as fabric.Group
    if (activeObject) {
      if (activeObject.type == "group") {
        activeObject.getObjects().forEach((object) => {
          if (object.type == "rect") {
            object.set({ stroke: color })
          }
        })
      } else if (activeObject.type == "activeSelection") {
        activeObject.getObjects().forEach((object) => {
          if (object.type == "group") {
            let groupObject = object as fabric.Group
            groupObject.getObjects().every((item) => {
              if (item.type == "rect") {
                item.set({ stroke: color })
              }
            })
          }
        })
      }
    }
    canvas.requestRenderAll()
  }
  const handleStStrokeChangeWidth = (width: string) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const activeObject = canvas.getActiveObject() as fabric.Group
    if (activeObject) {
      switch (activeObject.type) {
        case "group":
          activeObject.getObjects().forEach((object) => {
            if (object.type == "rect") {
              object.set({
                strokeWidth: Number(width),
                strokeUniform: true,
                left: 3,
                top: 0,
                originX: "center",
                originY: "center",
              })
            }
          })
          canvas.requestRenderAll()
          break
        case "activeSelection":
          activeObject.getObjects().forEach((object) => {
            if (object.type == "group") {
              let groupObject = object as fabric.Group
              groupObject.getObjects().every((item) => {
                if (item.type == "rect") {
                  item.set({
                    strokeWidth: Number(width),
                    strokeUniform: true,
                    left: 3,
                    top: 0,
                    originX: "center",
                    originY: "center",
                  })
                }
              })
            }
          })
          canvas.requestRenderAll()
          break
      }
    }
  }

  // 사이드바 스티커 관련
  const navScroll = (type: string) => {
    if (navScrollRef.current) {
      if (type == "left") {
        navScrollRef.current.scroll({
          left: navScrollRef.current.scrollLeft - 110,
          behavior: "smooth",
        })
      } else if (type == "right") {
        navScrollRef.current.scroll({
          left: navScrollRef.current.scrollLeft + 110,
          behavior: "smooth",
        })
      }
    }
  }
  // 더블클릭시 스티커 이미지 배열 처리
  const processString = (inputString: string): string[] => {
    console.log("이거 언제 쓰이는 함수?")
    const regex = /\[([^\]]+)\]/
    const match = inputString.match(regex)

    if (match) {
      const arrayFromRegex = match[1]
        .replace(/'/g, '"') // 따옴표를 쌍따옴표로 변경
        .replace(/\s/g, "") // 공백 제거
        .split(",") // 문자열을 배열로 변환

      return arrayFromRegex.map((item: string) =>
        item.replace(/"/g, "").replace("https://static.spooncast.net", "")
      )
    }

    return []
  }
  // 로티이미지 핸들러
  const lottiePauseHandler = () => {
    lottieRef?.current?.pause()
    setLottieSvg(lottieRef)
  }
  const handleFrameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const frameValue = parseInt(e.target.value, 10)
    setCurrentFrame(frameValue)
    if (lottieRef.current) {
      lottieRef.current.goToAndStop(frameValue, true)
    }
  }
  const handleLottieToSvgFile = async (a: any) => {
    const svgString = new XMLSerializer().serializeToString(a)

    const svgBlob = new Blob([svgString], {
      type: "image/svg+xml;charset=utf-8",
    })

    const svgFile = new File([svgBlob], "lottie.svg", {
      type: "image/svg+xml",
    })

    const formData = new FormData()
    formData.append("file", svgFile)

    try {
      const response = await axios.post("/api/upload", formData)

      if (response.data.success) {
        const imageUrl = response.data.urls
        console.log("업로드")
        setLottieSvgUrl(imageUrl[0])
        setIsSnapShot(false)
      } else {
        console.log("로티 업로드 실패:", response.data.message)
      }
    } catch (e) {
      setShowLottieErr(true)
      console.log("로티 업로드 오류", e)
    }
  }
  const fetchAnimationData = async (path: string) => {
    if (path == "None") return
    try {
      const response = await fetch(`${path}`)
      const data = await response.json()
      ani = data
      setAnimationData(ani)
      // console.log("fetchAnimationData", data);
    } catch (error) {
      console.error("Error loading animation data:", error)
    }
  }

  // 스티커 추가 모달 리셋
  const resetFixModal = () => {
    setOpenFixModal(false)
    setActiveStickerTab(stickerCate[0].name)
    setCurrentFixTxt({
      nickname: "",
      amount: "",
      combo: "1",
      sticker: "",
      txt: "스푼",
    })
  }

  //   고정 텍스트 추가
  const addFixedTxt = (stickerData: any) => {
    // console.log("stickerData", stickerData);
    const canvas = canvasRef.current
    if (!canvas) return
    const x = 40
    const y = moveh + 10
    const height = 55
    const radius = 5
    const bgColor = "#fefefe"
    // const bgColor = "#dddddd";
    const padding = 20

    let textContent1 = `${stickerData.nickname} `
    let textContent2 = `${stickerData.amount} ${stickerData.txt || "스푼"}`
    let textContent3 = stickerData.combo === "1" ? "" : `X ${stickerData.combo}`

    // fabric.Image.fromURL(`/sticker/${stickerData.sticker}.png`, function (img) {
    fabric.Image.fromURL(`${stickerData.sticker}`, function (img) {
      img.scale(fixImgSize).set({
        left: x - img.getScaledWidth(),
        top: y + height / 2 - img.getScaledHeight() / 2 - 2,
      })

      let textBox1 = new fabric.IText(textContent1, {
        left: 10,
        top: y + 13 + 4,
        fontFamily:
          "SF Pro, Noto Sans, Noto Sans Math,system-ui, -apple-system, BlinkMacSystemFont, SFNSText-Regular, sans-serif, Arial",
        fill: "black",
        fontSize: 16,
      })

      let textBox2 = new fabric.IText(textContent2, {
        left: (textBox1.left || 0) + (textBox1.width || 0) + 12,
        top: y + 15 + 4,

        fontFamily:
          "gothic, SF Pro, Roboto, Noto Sans KR, San Francisco, ui-sans-serif, system-ui",
        fill: "tomato",
        fontSize: 13,
        fontWeight: 400,
      })
      let textBox3 = new fabric.IText(textContent3, {
        left: (textBox2.left || 0) + (textBox2.width || 0) + 3,
        top: y + 12 + 2,
        fontWeight: 600,
        fontFamily:
          "gothic, SF Pro, Roboto, Noto Sans KR, San Francisco, ui-sans-serif, system-ui",
        fill: "tomato",
        fontSize: 20,
      })

      let groupText = new fabric.Group([textBox1, textBox2, textBox3], {})

      groupText.setCoords()

      let rectWidth = Math.max(
        5.5 * padding + (groupText.width || 0),
        img.getScaledWidth() + 5.5 * padding
      )

      let rect = new fabric.Rect({
        left: x - img.getScaledWidth() / 2 - padding - 18,
        top: y - 2,
        rx: radius,
        ry: radius,
        fill: bgColor,

        stroke: rgbaStStrokeColor,
        strokeWidth: Number(changeStStrokeWidth),
        strokeUniform: true,
        hasRotatingPoint: false,

        // width: groupText.width
        //   ? rectWidth - 10
        //   : img.getScaledWidth() - padding,
        width: stickerData.combo === "1" ? rectWidth - 18 : rectWidth - 10,
        height: height + Number(changeStStrokeWidth),
      })

      groupText.left = 50

      var mainGroup = new fabric.Group([rect, groupText, img], {
        left: x,
        top: y,
        width: rect.width && rect.width + 20,
        height: height + Number(changeStStrokeWidth) + 15,
      })

      canvas.add(mainGroup)
      canvas.bringToFront(mainGroup)
      moveh += 50
      if (y > canvasHeight - 80) {
        moveh = 0
      }
    })
  }

  useEffect(() => {
    if (!session) {
      setShowLoginNeedModal(true)
    } else {
      setShowLoginNeedModal(false)
      setShowLoginErrorModal(false)
    }
  }, [session])

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvasRef.current) {
      setInitialCanvas(canvasRef.current)
    }

    const saveds = Object.keys(localStorage).filter((key) =>
      key.startsWith("canvas-")
    )
    setSavedNames(saveds)

    window.addEventListener("resize", resizeCanvas)

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  useEffect(() => {
    if (isButtonActive) {
      setNoticeCanvasMove(true)
    }
  }, [isButtonActive])

  useEffect(() => {
    resizeCanvas()
  }, [canvasWidth, canvasHeight])

  useEffect(() => {
    // console.log("activeType", activeType);
    if (isCropMode) return

    if (activeType != "") {
      setShowModify(true)
    }

    const canvas = canvasRef.current
    if (canvas) {
      const activeObject = canvas.getActiveObject()
      if (activeObject) {
        switch (activeType) {
          case "image":
            setShowCropBtn(true)
            break
          case "group":
            setShowUnGroupBtn(true)
            const activeObjGr = canvas.getActiveObject() as fabric.Group
            activeObjGr.getObjects().forEach((object) => {
              if (object.type == "rect") {
                if (object.strokeWidth) {
                  setChangeStStrokeWidth(String(object.strokeWidth))
                }
                if (object.stroke) {
                  separateRGBA("stickerStroke", object.stroke || "")
                }
              }
            })
            break
          case "activeSelection":
            setShowGroupBtn(true)
            const objects = canvas.getActiveObject() as fabric.Group
            objects.getObjects().forEach((object) => {
              if (object.type == "group") {
                let groupObject = object as fabric.Group
                let items = groupObject.getObjects()
                const rectItems = items.filter((item) => item.type === "rect")
                if (
                  rectItems.length > 0 &&
                  rectItems.every(
                    (item) =>
                      item.strokeWidth === rectItems[0].strokeWidth &&
                      item.stroke === rectItems[0].stroke
                  )
                ) {
                  setChangeStStrokeWidth(String(rectItems[0].strokeWidth))
                  if (rectItems[0].stroke) {
                    separateRGBA("stickerStroke", rectItems[0].stroke || "")
                  }
                } else return
              }
            })
            break
          case "rect":
          case "triangle":
          case "circle":
            if (activeObject.fill) {
              separateRGBA("figure", String(activeObject.fill))
            }
            if (activeObject.stroke) {
              separateRGBA("figureStroke", String(activeObject.stroke))
            }
            break
          case "text":
            const activeTxt = activeObject as fabric.Text
            if (activeTxt.fill) {
              separateRGBA("figure", String(activeTxt.fill))
            }
            if (activeTxt.text) {
              setInputVal(activeTxt.text)
            }
            if (activeTxt.fontFamily) {
              setFontFamily(activeTxt.fontFamily)
            }
            break
          default:
            // setShowCropBtn(false);
            // setShowFixBtn(false);
            break
        }
      }
    }
  }, [activeType])

  useEffect(() => {
    const canvas = canvasRef.current

    if (canvas) {
      canvas.getObjects().forEach((obj) => {
        if (isCropMode) {
          obj.selectable = false // 크롭 모드일 때 모든 객체 선택 불가
        } else {
          obj.selectable = true // 크롭 모드가 아닐 때 모든 객체 선택 가능
        }
      })

      canvas.renderAll() // 캔버스 갱신
    }
  }, [isCropMode])

  useEffect(() => {
    const canvas = canvasRef.current

    function handleMouseDown(options: fabric.IEvent) {
      if (!isCropMode || !canvas) return

      const pointer = canvas.getPointer(options.e)

      const rect = new fabric.Rect({
        left: pointer.x,
        top: pointer.y,
        width: 1,
        height: 1,
        fill: "transparent",
        stroke: `black`,
        hasRotatingPoint: false,
      })

      setCropZone(rect)
      canvas.add(rect)
      canvas.setActiveObject(rect)
    }

    function handleMouseMove(options: fabric.IEvent) {
      if (!isCropMode || !canvasRef.current || !cropZone) return

      const pointer = canvasRef.current.getPointer(options.e)

      let posX = Math.min(pointer.x, cropZone.left ?? pointer.x)
      let posY = Math.min(pointer.y, cropZone.top ?? pointer.y)

      let width = Math.abs(pointer.x - (cropZone.left ?? pointer.x))
      let height = Math.abs(pointer.y - (cropZone.top ?? pointer.y))

      cropZone.set({
        left: posX,
        top: posY,
        width: width,
        height: height,
      })

      canvasRef.current.renderAll()
    }

    function handleMouseUp() {
      if (cropZone) {
        handleApplyCrop(selectedImage)
        setIsCropMode(false)
        setCropZone(null)
        if (canvasRef.current) {
          canvasRef.current.discardActiveObject().renderAll()
        }
      }

      if (selectedImage) {
        selectedImage.selectable = true
      }
    }

    if (canvas) {
      canvas.on("mouse:down", handleMouseDown)
      canvas.on("mouse:move", handleMouseMove)
      canvas.on("mouse:up", handleMouseUp)

      return () => {
        canvas.off("mouse:down", handleMouseDown)
        canvas.off("mouse:move", handleMouseMove)
        canvas.off("mouse:up", handleMouseUp)
      }
    }
  }, [isCropMode, selectedImage, cropZone])

  useEffect(() => {
    if (lottieRef.current) {
      if (lottieRef.current?.animationItem) {
        const handleFrame = () => {
          setCurrentFrame(lottieRef.current.animationItem.currentFrame)
        }
        handleFrame()
      }
    }
  }, [lottieRef?.current?.animationItem?.currentFrame])

  useEffect(() => {
    const svgElement = lottieRef.current?.animationItem?.renderer?.svgElement
    if (svgElement) {
      if (lottieSvg) {
        handleLottieToSvgFile(svgElement)
      }
    }
  }, [lottieSvg])

  useEffect(() => {
    let sortedAllStickers = [...allStickers]
    switch (sortVal) {
      case "name":
        sortedAllStickers.sort((a, b) => a.nickname.localeCompare(b.nickname))
        break
      case "spoon":
        sortedAllStickers.sort(
          (a, b) => b.amount * b.combo - a.amount * a.combo
        )
        break
    }
    setAllStickers(sortedAllStickers)
  }, [sortVal])

  useEffect(() => {
    let sortedFixStickers = [...fixTxts]
    switch (sortFixVal) {
      case "name":
        sortedFixStickers.sort((a, b) => a.nickname.localeCompare(b.nickname))
        break
      case "spoon":
        sortedFixStickers.sort(
          (a, b) => b.amount * b.combo - a.amount * a.combo
        )
        break
    }
    setFixTxts(sortedFixStickers)
  }, [sortFixVal])

  ///// 아래로 쭉 색상, 투명도, 테두리 두께 등

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const activeObject = canvas.getActiveObject()
    if (activeObject) {
      activeObject.set({ strokeWidth: Number(changeStrokeWidth) })
      canvas.renderAll()
    }

    // if (activeObject && activeObject.type !== "group") {
    //   activeObject.set({ strokeWidth: Number(changeStrokeWidth) });
    //   canvas.requestRenderAll();
    // }
  }, [changeStrokeWidth])

  useEffect(() => {
    if (changeColor.charAt(0) === "#") {
      const rgb = hexToRgb(changeColor)
      if (rgb) {
        const newRgbaColor = `rgba(${rgb.r},${rgb.g},${rgb.b},${Number(
          changeAlpha
        )})`
        setRgbaColor(newRgbaColor)
      }
    }
  }, [changeColor, changeAlpha])

  useEffect(() => {
    if (changeStrokeColor.charAt(0) === "#") {
      const rgb = hexToRgb(changeStrokeColor)
      if (rgb) {
        const newRgbaColor = `rgba(${rgb.r},${rgb.g},${rgb.b},${Number(
          changeStrokeAlpha
        )})`
        setRgbaStrokeColor(newRgbaColor)
      }
    }
  }, [changeStrokeColor, changeStrokeAlpha])

  useEffect(() => {
    handleChangeColor(rgbaColor)
  }, [rgbaColor])

  useEffect(() => {
    handleStrokeChangeColor(rgbaStrokeColor)
  }, [rgbaStrokeColor])

  // 고정스티커 테두리
  useEffect(() => {
    handleStStrokeChangeWidth(changeStStrokeWidth)
  }, [changeStStrokeWidth])

  useEffect(() => {
    if (changeStStrokeColor.charAt(0) === "#") {
      const rgb = hexToRgb(changeStStrokeColor)
      if (rgb) {
        const newRgbaColor = `rgba(${rgb.r},${rgb.g},${rgb.b},${Number(
          changeStStrokeAlpha
        )})`
        setRgbaStStrokeColor(newRgbaColor)
      }
    }
  }, [changeStStrokeColor, changeStStrokeAlpha])

  useEffect(() => {
    handleStStrokeChangeColor(rgbaStStrokeColor)
  }, [rgbaStStrokeColor])

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      const activeObjects = canvas.getActiveObject() as fabric.Group
      if (activeObjects?.type === "group") {
        activeObjects.set({ opacity: Number(groupOpacity) })
        canvas.requestRenderAll()
      }
    }
  }, [groupOpacity])

  return (
    <section className={styles.cont}>
      {/* 네비게이션 */}
      <>
        <ArticleTit title={"캔버스"} />
        <nav className={styles.canvasHeader}>
          <button
            type='button'
            onClick={undo}
            disabled={currentStateIndex <= 0 || !initialCanvas}
          >
            {/* 되돌리기 전 */}
            <SvgUndo
              className={styles.icon}
              style={
                currentStateIndex <= 0 || !initialCanvas
                  ? {
                      fill: "#bbb",
                    }
                  : {}
              }
            />
          </button>
          <button
            type='button'
            onClick={redo}
            disabled={currentStateIndex >= history.length - 1 || !initialCanvas}
          >
            {/* 되돌리기 후 */}
            <SvgRedo
              className={styles.icon}
              style={
                currentStateIndex >= history.length - 1 || !initialCanvas
                  ? {
                      fill: "#bbb",
                    }
                  : {}
              }
            />
          </button>

          <div className={styles.zoomBox}>
            <div className={styles.zoomInnerBox}>
              <NavBtn fn={() => zoomOut(canvasWidth, canvasHeight)}>
                <SvgMinusBtn className={styles.icon} />
              </NavBtn>
              <span>{Math.floor(zoomInfo * 100)}%</span>
              <NavBtn fn={() => zoomIn(canvasWidth, canvasHeight)}>
                {/* PNG 저장 */}
                <SvgPlusBtn className={styles.icon} />
              </NavBtn>

              <NavBtn fn={handleButtonClick}>
                {isButtonActive ? (
                  <SvgCanvasFit className={styles.icon} />
                ) : (
                  <SvgCanvasMove className={styles.icon} />
                )}
              </NavBtn>

              <ResetButton
                kind='notAbsolute'
                fn={() => {
                  zoomReset(canvasWidth, canvasHeight)
                  setIsButtonActive(false)
                  setCanvasPosition({ left: 0, top: 0 })
                }}
              />
            </div>
          </div>

          <NavBtn fn={downloadCanvasAsImage}>
            {/* PNG 저장 */}
            <SvgPngDownload className={styles.icon} />
          </NavBtn>
        </nav>

        <nav className={styles.plusNav}>
          {showGroupBtn && (
            <NavBtn content='그룹' fn={groupObjectsInCanvas}>
              <SvgGroup className={styles.icon} />
            </NavBtn>
          )}
          {showUnGroupBtn && (
            <NavBtn content='그룹 해제' fn={unGroupObjectsInCanvas}>
              <SvgUnGroup className={styles.icon} />
            </NavBtn>
          )}
          {isCropMode && (
            <NavBtn content='크롭 취소' fn={() => setIsCropMode(false)}>
              <SvgClose className={styles.icon} />
            </NavBtn>
          )}
          {showCropBtn && !isCropMode && (
            <NavBtn
              content='크롭'
              fn={() => {
                handleCropMode()
              }}
            >
              <SvgCrop className={styles.icon} />
            </NavBtn>
          )}
          <NavBtn content='앞' fn={bringSelectedForward}>
            <SvgUp className={styles.icon} />
          </NavBtn>
          <NavBtn content='뒤' fn={sendSelectedBack}>
            <SvgDown className={styles.icon} />
          </NavBtn>
          <NavBtn content='맨앞' fn={bringToFront}>
            <SvgForward className={styles.icon} />
          </NavBtn>
          <NavBtn content='맨뒤' fn={sendToBack}>
            <SvgBackWard className={styles.icon} />
          </NavBtn>
          <NavBtn content='선택해제' fn={deSelect}>
            <SvgDeselect className={styles.icon} />
          </NavBtn>
          <NavBtn content='전부삭제' fn={deleteAll}>
            <SvgTrash className={styles.icon} />
          </NavBtn>
          <NavBtn content='선택삭제' fn={deleteSelected}>
            <SvgSelectDel className={styles.icon} />
          </NavBtn>
          <NavBtn content='좌우반전' fn={filpX}>
            <SvgFlipX className={styles.icon} />
          </NavBtn>
          <NavBtn content='고정' fn={handleFix}>
            <SvgPin className={styles.icon} />
          </NavBtn>
        </nav>

        <nav className={styles.sideNav}>
          <NavBtn fn={() => toggleState("openResize")} content='캔버스'>
            <SvgResize className={styles.icon} />
          </NavBtn>
          <NavBtn fn={() => toggleState("openText")} content='텍스트'>
            <SvgText className={styles.icon} />
          </NavBtn>
          <NavBtn fn={() => toggleState("openFigures")} content='도형'>
            <SvgShape className={styles.icon} />
          </NavBtn>
          <NavBtn fn={() => toggleState("openPictures")} content='사진'>
            <SvgImage className={styles.icon} />
          </NavBtn>
        </nav>
      </>

      {/* 사이드 추가 네비 */}
      <>
        {openState["openResize"] && (
          <CanvasSidebar
            title='캔버스 크기 조정'
            closeOpenState={closeOpenState}
          >
            <ResetButton
              fn={() => {
                handleCanvasSize(firstW, firstH)
                setCanvasSizeKind("default")
              }}
            />
            <div className={styles.canvasSizeKindBtns}>
              <button
                type='button'
                onClick={() => {
                  handleCanvasSize(firstW, firstH)
                  setCanvasSizeKind("default")
                }}
                style={
                  canvasSizeKind == "default"
                    ? {
                        color: "var(--point)",
                        fontWeight: "bolder",
                      }
                    : {}
                }
              >
                기본
              </button>
              <button
                type='button'
                onClick={() => {
                  handleCanvasSize(1000, 1000 / 2.5)
                  setCanvasSizeKind("back")
                }}
                style={
                  canvasSizeKind == "back"
                    ? {
                        color: "var(--point)",
                        fontWeight: "bolder",
                      }
                    : {}
                }
              >
                배경
                <span>2.5 : 1</span>
              </button>
              <button
                type='button'
                onClick={() => {
                  handleCanvasSize(500, 500)
                  setCanvasSizeKind("board")
                }}
                style={
                  canvasSizeKind == "board"
                    ? {
                        color: "var(--point)",
                        fontWeight: "bolder",
                      }
                    : {}
                }
              >
                게시물
                <span>1:1</span>
              </button>
            </div>
            <div className={styles.inputBox}>
              <label htmlFor='cwidth'>
                <h6>가로</h6>
                <input
                  type='number'
                  id='cwidth'
                  autoComplete='off'
                  value={isNaN(inputWidth) ? "" : inputWidth}
                  step={10}
                  onChange={(e) => {
                    setInputWidth(parseInt(e.target.value))
                    if (canvasSizeKind == "back") {
                      setInputHeight(parseInt(e.target.value) / 2.5)
                    } else if (canvasSizeKind == "board") {
                      setInputHeight(parseInt(e.target.value))
                    }
                  }}
                  onKeyUp={(e) => {
                    if (e.key === "Enter") {
                      setCanvasWidth(inputWidth)
                      setCanvasHeight(inputHeight)
                    }
                  }}
                />
              </label>
              <label htmlFor='cheight'>
                <h6>세로</h6>
                <input
                  type='number'
                  id='cheight'
                  autoComplete='off'
                  step={10}
                  value={isNaN(inputHeight) ? "" : inputHeight}
                  onChange={(e) => {
                    setInputHeight(parseInt(e.target.value))
                    if (canvasSizeKind == "back") {
                      setInputHeight(parseInt(e.target.value) * 2.5)
                    } else if (canvasSizeKind == "board") {
                      setInputHeight(parseInt(e.target.value))
                    }
                  }}
                  onKeyUp={(e) => {
                    if (e.key === "Enter") {
                      setCanvasWidth(inputWidth)
                      setCanvasHeight(inputHeight)
                    }
                  }}
                />
              </label>
            </div>

            <button
              className={styles.addButton}
              type='button'
              onClick={() => {
                setCanvasWidth(inputWidth)
                setCanvasHeight(inputHeight)
                closeOpenState()
              }}
            >
              확인
            </button>
          </CanvasSidebar>
        )}

        {openState["openText"] && (
          <CanvasSidebar title='텍스트' closeOpenState={closeOpenState}>
            <ResetButton fn={resetSetting} />
            <span className={styles.ffPreview}>
              <span
                style={{
                  fontFamily: fontFamily,
                  color: rgbaColor,
                  fontWeight: "600",
                  overflow: "hidden",
                }}
              >
                {inputVal ? inputVal : "글꼴미리보기"}
              </span>
            </span>
            <div className={styles.inputBox}>
              <label htmlFor='ff' className={styles.fontFamilyList}>
                <h6>글꼴</h6>
                <input
                  type='button'
                  value={fontFamily}
                  style={{
                    borderRadius: "8px",
                    border: "1px solid #bbb",
                    minHeight: "40px",
                    height: "40px",
                    paddingRight: "15px",
                  }}
                  onClick={() => setShowFFnav(!showFFnav)}
                />
                {showFFnav ? (
                  <SvgUp
                    className={styles.icon}
                    onClick={() => setShowFFnav(false)}
                  />
                ) : (
                  <SvgDown
                    className={styles.icon}
                    onClick={() => setShowFFnav(true)}
                  />
                )}
                {showFFnav && (
                  <nav
                    className={styles.fontNav}
                    onBlur={() => setShowFFnav(false)}
                  >
                    {fontFamilyList.map((item) => (
                      <input
                        className={fontFamily === item ? styles.active : ""}
                        type='button'
                        key={item}
                        value={item}
                        onClick={(e: React.MouseEvent<HTMLInputElement>) => {
                          setFontFamily(e.currentTarget.value)
                          setShowFFnav(false)
                        }}
                      />
                    ))}
                  </nav>
                )}
              </label>

              <label htmlFor='content'>
                <h6>내용</h6>
                <textarea
                  id='content'
                  value={inputVal}
                  autoComplete='off'
                  onChange={(event) => setInputVal(event.target.value)}
                />
              </label>

              <label htmlFor='txtcolor'>
                <h6>색상</h6>
                <input
                  style={{
                    maxWidth: "105px",
                    fontSize: "14px",
                    textAlign: "center",
                  }}
                  id='txtcolor'
                  type='text'
                  placeholder='#rrggbb'
                  value={changeColor}
                  autoComplete='off'
                  onChange={(event) => setChangeColor(event.target.value)}
                />
                <input
                  style={{ marginLeft: "auto" }}
                  id='txtcolor'
                  type='color'
                  value={changeColor}
                  autoComplete='off'
                  onChange={(event) => setChangeColor(event.target.value)}
                />
              </label>

              <label htmlFor='opacity'>
                <h6>투명도</h6>
                <div className={styles.rangebox}>
                  <span style={{ bottom: "-5px" }}>0</span>
                  <input
                    type='range'
                    style={{ width: "85px" }}
                    min={0}
                    max={1}
                    step={0.01}
                    value={changeAlpha}
                    autoComplete='off'
                    onChange={(event) => setChangeAlpha(event.target.value)}
                  />
                  <span style={{ bottom: "-5px" }}>1</span>
                </div>
                <input
                  style={{
                    width: "60px",
                    borderRadius: "8px",
                    textAlign: "center",
                  }}
                  type='number'
                  max={1}
                  min={0}
                  step={0.05}
                  value={changeAlpha}
                  onChange={(e) => {
                    setChangeAlpha(e.target.value)
                  }}
                />
              </label>
            </div>

            <button
              className={styles.addButton}
              type='button'
              onClick={() => {
                setTexts({
                  ...texts,
                  [inputVal]: {
                    fontFamily: fontFamily,
                    position: { left: 10, top: 10 },
                    color: changeColor,
                  },
                })
                addText(inputVal, fontFamily, { left: 10, top: 10 }, rgbaColor)
                setInputVal("")
              }}
            >
              추가
            </button>
          </CanvasSidebar>
        )}

        {openState["openFigures"] && (
          <CanvasSidebar title='도형' closeOpenState={closeOpenState}>
            <ResetButton fn={resetSetting} />

            <div className={styles.inputBox}>
              <label htmlFor='txtcolor'>
                <h6>색상</h6>

                <input
                  id='txtcolor'
                  type='text'
                  placeholder='#rrggbb'
                  value={changeColor}
                  autoComplete='off'
                  onChange={(event) => setChangeColor(event.target.value)}
                />
                <input
                  id='txtcolor'
                  type='color'
                  value={changeColor}
                  autoComplete='off'
                  onChange={(event) => setChangeColor(event.target.value)}
                />
              </label>

              <label htmlFor='opacity'>
                <h6>투명도</h6>
                <div className={styles.rangebox}>
                  <span>0</span>
                  <input
                    type='range'
                    min='0'
                    max='1'
                    step='0.01'
                    style={{ width: "90px" }}
                    value={changeAlpha}
                    autoComplete='off'
                    onChange={(event) => setChangeAlpha(event.target.value)}
                  />
                  <span>1</span>
                </div>
                <input
                  type='number'
                  min={0}
                  max={1}
                  step={0.05}
                  style={{ width: "60px", paddingRight: "0" }}
                  value={changeAlpha}
                  onChange={(e) => {
                    setChangeAlpha(e.target.value)
                  }}
                />
              </label>

              <label htmlFor='strkWidth'>
                <h6>테두리 두께</h6>
                <div className={styles.rangebox}>
                  <span>0</span>
                  <input
                    id='strkWidth'
                    type='range'
                    autoComplete='off'
                    value={changeStrokeWidth}
                    style={{ width: "90px" }}
                    onChange={(e) => {
                      setChangeStrokeWidth(e.target.value)
                    }}
                  />
                  <span>100</span>
                </div>
                <input
                  type='number'
                  min={0}
                  step={1}
                  value={changeStrokeWidth}
                  style={{ width: "60px", paddingRight: "0" }}
                  onChange={(e) => {
                    setChangeStrokeWidth(e.target.value)
                  }}
                />
              </label>

              <label htmlFor='strokecolor'>
                <h6>테두리 색상</h6>
                <input
                  id='strokecolor'
                  type='text'
                  placeholder='#rrggbb'
                  value={changeStrokeColor}
                  autoComplete='off'
                  onChange={(event) => setChangeStrokeColor(event.target.value)}
                />
                <input
                  id='strokecolor'
                  type='color'
                  value={changeStrokeColor}
                  autoComplete='off'
                  onChange={(event) => setChangeStrokeColor(event.target.value)}
                />
              </label>

              <label htmlFor='strokeAlpha'>
                <h6>테두리 투명도</h6>
                <div className={styles.rangebox}>
                  <span>0</span>
                  <input
                    type='range'
                    min={0}
                    id='strokeAlpha'
                    max={1}
                    step={0.01}
                    value={changeStrokeAlpha}
                    style={{ width: "90px" }}
                    autoComplete='off'
                    onChange={(event) =>
                      setChangeStrokeAlpha(event.target.value)
                    }
                  />
                  <span>1</span>
                </div>
                <input
                  type='number'
                  min={0}
                  max={1}
                  step={0.05}
                  value={changeStrokeAlpha}
                  style={{ width: "60px", paddingRight: "0" }}
                  onChange={(e) => {
                    setChangeStrokeAlpha(e.target.value)
                  }}
                />
              </label>

              <div className={styles.figureBtns}>
                <button type='button' onClick={addSquare}>
                  <SvgSquare className={styles.icon} />
                  {/* <span>사각형 추가</span> */}
                </button>
                <button type='button' onClick={addCircle}>
                  <SvgCircle className={styles.icon} />

                  {/* <span>원 추가</span> */}
                </button>
                <button type='button' onClick={addTriangle}>
                  <SvgTriangle className={styles.icon} />
                  {/* <span>삼각형 추가</span> */}
                </button>
              </div>
            </div>
          </CanvasSidebar>
        )}

        {openState["openPictures"] && (
          <CanvasSidebar title='사진' closeOpenState={closeOpenState}>
            <CanvasNotice open='사진' refName={StickerInfoRef} />

            <div className={`${styles.imgsbox} ${styles.stickers}`}>
              {imagesUrls.length == 0 ? (
                <h6 className={styles.stickernotice} style={{ color: "#333" }}>
                  선택된 사진이 없습니다.
                </h6>
              ) : (
                <>
                  {imagesUrls.map((image, index) => (
                    <div
                      className={styles.imgs}
                      key={`image-${index}`}
                      draggable='true'
                      onDragStart={(e) => {
                        setIsImg("img")
                        e.dataTransfer.setData("text/plain", image)
                      }}
                    >
                      <Image
                        src={image}
                        alt={`Image ${index}`}
                        width={180}
                        height={180}
                        style={{
                          objectFit: "contain",
                          objectPosition: "top center",
                        }}
                      />
                      <button
                        type='button'
                        onClick={() => deleteImagesUrl(image)}
                      >
                        <SvgClose className={styles.icon} />
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>
            <label
              htmlFor='CustomFileSelector'
              className={styles.addButton}
              style={{
                position: "sticky",
                bottom: "0",
                margin: "5px 0",
              }}
            >
              추가
              <SvgPlusCircle className={styles.icon} />
              <input
                id='CustomFileSelector'
                type='file'
                multiple
                hidden
                autoComplete='off'
                className={styles.CustomFileSelector}
                onChange={(e) => handleFileSelected(e)}
              />
            </label>
          </CanvasSidebar>
        )}

        {openState["openSticker"] && (
          <CanvasSidebar title='스티커' closeOpenState={closeOpenState}>
            <div>
              <CanvasNotice open='스티커' refName={StickerInfoRef} />
              <StickerCateNav
                refName={navScrollRef}
                stickerCate={stickerCate}
                activeStickerTab={activeStickerTab}
                setActiveStickerTab={setActiveStickerTab}
                navScrollLeft={() => navScroll("left")}
                navScrollRight={() => navScroll("right")}
              />

              <div className={`${styles.stickersbox} ${styles.stickers}`}>
                {moreStickers
                  ?.filter((item) => item.category === activeStickerTab)
                  .map((item: any, index: number) => (
                    <div
                      className={styles.stickeritem}
                      key={`stickerimage-${index}`}
                      onDoubleClick={() => {
                        setSelectedMoreStItems(processString(item.image_urls))
                        setSelectedLottie(
                          item.lottie_url.replace(
                            "https://static.spooncast.net",
                            ""
                          )
                        )
                        fetchAnimationData(
                          item.lottie_url.replace(
                            "https://static.spooncast.net",
                            ""
                          )
                        )
                        setOpenStickerItems(true)
                        setIsSnapShot(false)
                      }}
                      draggable='true'
                      onDragStart={(e) =>
                        e.dataTransfer.setData(
                          "text/plain",
                          item.image_thumbnail.replace(
                            "https://static.spooncast.net",
                            ""
                          )
                        )
                      }
                    >
                      <Image
                        key={item.name}
                        src={`${item.image_thumbnail}`}
                        alt={`${item.image_thumbnail}`}
                        width={50}
                        height={50}
                      />
                      {item.tag !== "NONE" && (
                        <button type='button'>{item.tag}</button>
                      )}
                      <span>{item.price}</span>
                    </div>
                  ))}
              </div>
            </div>
          </CanvasSidebar>
        )}

        {/* 추가 스티커 */}
        {openStickerItems && (
          <CanvasSidebar
            title='추가 스티커'
            closeOpenState={() => {
              setSelectedLottie("")
              setOpenStickerItems(false)
              setAnimationData(null)
              setCurrentFrame(0)
              setSelectedMoreStItems([])
            }}
          >
            <div className={styles.stickersbox}>
              {selectedMoreStItems?.map((item: any, index: number) => (
                <div
                  key={`stickermore${index}`}
                  className={styles.stickeritem}
                  draggable='true'
                  onDragStart={(e) =>
                    e.dataTransfer.setData("text/plain", item)
                  }
                >
                  <Image src={item} alt={item} width={50} height={50} />
                </div>
              ))}
            </div>

            {/* 로티 */}
            {selectedLottie !== "None" && (
              <>
                <div
                  className={styles.aniitem}
                  style={{ backgroundColor: "transparent" }}
                  draggable='true'
                  onDragStart={(e) => {
                    setIsImg("lottie")
                    e.dataTransfer.setData("text/plain", lottieSvgUrl)
                  }}
                >
                  <Lottie
                    className={styles.lottieimg}
                    lottieRef={lottieRef}
                    animationData={animationData}
                    width={50}
                    height={50}
                    loop={false}
                    autoplay={true}
                  />
                </div>

                <div className={styles.aniPlayBtns}>
                  <input
                    type='range'
                    id='frameRange'
                    min='0'
                    max={
                      lottieRef.current?.animationItem
                        ? lottieRef.current.animationItem.totalFrames
                        : 0
                    }
                    step='1'
                    value={currentFrame}
                    onChange={handleFrameChange}
                  />
                  <button
                    type='button'
                    style={{
                      backgroundColor: "#333",
                      color: "#eee",
                      borderRadius: "8px",
                    }}
                    onClick={(e) => {
                      setIsSnapShot(true)
                      lottiePauseHandler()
                    }}
                  >
                    {isSnapShot ? "로딩중" : "스냅샷"}
                  </button>
                </div>
              </>
            )}
          </CanvasSidebar>
        )}

        {openState["openSpoonStickers"] && stickers && (
          <CanvasSidebar title='받은스티커' closeOpenState={closeOpenState}>
            <div className={` ${styles.stickerBox} ${styles.box}`}>
              <CanvasNotice open='받은스티커' refName={StickerInfoRef} />

              <div className={styles.inputBox}>
                <SortSticker setSort={setSortVal} sort={sortVal} />
              </div>

              <div className={styles.imgsbox}>
                {allStickers?.map((item: Item, index: number) => (
                  <ul
                    className={styles.sticker}
                    key={`sticker-${item.nickname}-${item.id}-${index}}`}
                    draggable='true'
                    onDragStart={(e) => {
                      // setChangeStStrokeWidth("0");
                      deSelect()
                      setFixImgSize(0.18)
                      e.dataTransfer.setData(
                        "stickerData",
                        JSON.stringify(item)
                      )
                      // console.log("받은스티커 이름만 들어감");
                    }}
                  >
                    <Image
                      // src={`/sticker/${item.sticker}.png`}
                      src={item.sticker}
                      alt={item.sticker}
                      width={45}
                      height={45}
                    />

                    <li
                      className={styles.stickerNick}
                      style={{
                        fontFamily:
                          "Noto Sans, Noto Sans KR, dotum, Noto Sans Math, SF Pro, Roboto, San Francisco, ui-sans-serif, system-ui",
                      }}
                    >
                      {item.nickname}
                    </li>
                    <li className={styles.stickerSpoon}>
                      {item.amount}
                      {item.txt}
                    </li>
                    {item.combo !== "1" && (
                      <li className={styles.stickerCombo}>
                        X&nbsp;{item.combo}
                      </li>
                    )}
                  </ul>
                ))}
              </div>
            </div>
          </CanvasSidebar>
        )}

        {openState["openFix"] && stickers && (
          <CanvasSidebar
            title='스티커 직접추가'
            closeOpenState={closeOpenState}
          >
            <CanvasNotice open='스티커 직접추가' refName={StickerInfoRef} />

            <div className={styles.inputBox}>
              <SortSticker setSort={setSortFixVal} sort={sortFixVal} />
            </div>

            <div className={styles.imgsbox}>
              {fixTxts?.map((item: Item, index: number) => (
                <ul
                  className={styles.sticker}
                  key={`sticker-${item.nickname}-${item.id}-${index}}`}
                  draggable='true'
                  onDragStart={(e) => {
                    // setChangeStStrokeWidth("0");
                    deSelect()
                    setFixImgSize(0.14)
                    e.dataTransfer.setData("stickerData", JSON.stringify(item))
                    // console.log("스티커직접추가 경로까지 들어감");
                  }}
                >
                  <button
                    type='button'
                    className={styles.fixDel}
                    onClick={(e) => {
                      e.stopPropagation()
                      setFixTxts(fixTxts.filter((fixItem) => fixItem !== item))
                    }}
                  >
                    <SvgTrash className={styles.icon} />
                  </button>
                  <Image
                    // src={`/sticker/${item.sticker}.png`}
                    src={item.sticker}
                    alt={item.sticker}
                    width={45}
                    height={45}
                  />

                  <li
                    className={styles.stickerNick}
                    style={{
                      fontFamily:
                        "SF Pro, SF-Pro, Noto Sans, Noto Sans Math, Roboto, Noto Sans KR, ui-sans-serif, system-ui",
                    }}
                  >
                    {item.nickname}
                  </li>
                  <li className={styles.stickerSpoon}>
                    {item.amount}
                    {item.txt || "스푼"}
                  </li>
                  {item.combo !== "1" && (
                    <li className={styles.stickerCombo}>X&nbsp;{item.combo}</li>
                  )}
                </ul>
              ))}
            </div>
            <button
              type='button'
              className={styles.addButton}
              onClick={() => setOpenFixModal(true)}
              style={{
                position: "sticky",
                bottom: "0",
                margin: "5px 0",
              }}
            >
              추가
              <SvgPlusCircle className={styles.icon} />
            </button>
          </CanvasSidebar>
        )}

        <ModifyObject
          show={showModify}
          closeOpenState={() => setShowModify(false)}
          activeType={activeType}
          color={changeColor}
          setColor={handleColor}
          opacity={activeType == "group" ? groupOpacity : changeAlpha}
          setOpacity={
            activeType == "group" ? handleGroupOpacity : handleOpacity
          }
          strokeWidth={
            activeType == "group" ? changeStStrokeWidth : changeStrokeWidth
          }
          setStrokeWidth={handleStrokeWidth}
          strokeColor={
            activeType == "group" ? changeStStrokeColor : changeStrokeColor
          }
          setStrokeColor={handleStrokeColor}
          strokeOpacity={
            activeType == "group" ? changeStStrokeAlpha : changeStrokeAlpha
          }
          setStrokeOpacity={handleStrokeOpacity}
        />
      </>

      {/* 캔버스 */}
      <article
        className={styles.canvasCont}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <div
          className={styles.canvasBox}
          style={canvasPosition}
          onClick={(e) => {
            setLottieSvgUrl("")
          }}
          onDrop={(e) => {
            e.preventDefault()
            setIsImg("")
            const imageUrl = e.dataTransfer.getData("text/plain")
            const stickerDataString = e.dataTransfer.getData("stickerData")

            if (imageUrl) {
              addImage(imageUrl)
            }
            if (lottieSvgUrl) {
              setLottieSvg(null)
              setLottieSvgUrl("")
            }

            if (stickerDataString) {
              try {
                const stickerData = JSON.parse(stickerDataString)
                addFixedTxt(stickerData)
              } catch (error) {
                console.error("Failed to parse sticker data:", error)
              }
            }
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          <FabricJSCanvas className={styles.canvas} onReady={onCanvasReady} />
        </div>
      </article>

      {/* 스티커 수동 추가 모달 */}
      <Modal
        size='lg'
        className={styles.modal}
        show={openFixModal}
        onHide={() => setOpenFixModal(false)}
      >
        <Modal.Header className={styles.modalHeader}>
          <h4>스티커 수동 추가</h4>
          <button
            type='button'
            className={styles.modalClose}
            onClick={resetFixModal}
          >
            <SvgClose className={styles.icon} />
          </button>
        </Modal.Header>
        <Modal.Body className={styles.modalBody}>
          <StickerCateNav
            kind='modal'
            refName={navScrollRef}
            stickerCate={stickerCate}
            activeStickerTab={activeStickerTab}
            setActiveStickerTab={setActiveStickerTab}
            navScrollLeft={() => navScroll("left")}
            navScrollRight={() => navScroll("right")}
          />
          <StickerList
            moreStickers={moreStickers}
            activeStickerTab={activeStickerTab}
            currentFixTxt={currentFixTxt}
            setCurrentFixTxt={setCurrentFixTxt}
          />
        </Modal.Body>
        <Modal.Footer className={styles.modalFooter}>
          <div className={styles.addtxt}>
            <div>
              <label>스티커</label>

              {currentFixTxt.sticker ? (
                <Image
                  src={currentFixTxt.sticker.replace(
                    "https://static.spooncast.net",
                    ""
                  )}
                  width={60}
                  height={60}
                  alt={currentFixTxt.sticker.replace(
                    "https://static.spooncast.net",
                    ""
                  )}
                />
              ) : (
                <span
                  style={{
                    width: "80px",
                    fontSize: "12px",
                  }}
                >
                  선택없음
                </span>
              )}
            </div>
            <div>
              <label htmlFor='nick'>닉네임</label>
              <input
                type='text'
                value={currentFixTxt.nickname}
                autoComplete='off'
                onChange={({ target }) =>
                  setCurrentFixTxt({
                    ...currentFixTxt,
                    nickname: target.value,
                  })
                }
              />
            </div>

            <div>
              <input
                type='number'
                value={currentFixTxt.amount}
                autoComplete='off'
                min={0}
                onChange={({ target }) =>
                  setCurrentFixTxt({
                    ...currentFixTxt,
                    amount: target.value,
                  })
                }
              />

              <select
                id='spoon'
                style={{
                  border: "0 none",
                  borderBottom: "1px solid #333",
                  color: "#333",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
                onChange={({ target }) =>
                  setCurrentFixTxt({
                    ...currentFixTxt,
                    txt: target.value,
                  })
                }
              >
                <option value='스푼'>스푼</option>
                <option value='개'>개</option>
              </select>
            </div>
            <div>
              <input
                type='number'
                value={currentFixTxt.combo || 1}
                autoComplete='off'
                min={1}
                onChange={({ target }) =>
                  setCurrentFixTxt({
                    ...currentFixTxt,
                    combo: target.value,
                  })
                }
              />
              <label htmlFor='combo' className={styles.labelTxt}>
                콤보
              </label>
            </div>
            <NavBtn
              fn={() =>
                setCurrentFixTxt({
                  nickname: "",
                  amount: "",
                  combo: "1",
                  sticker: "",
                  txt: "스푼",
                })
              }
            >
              <SvgTrash className={styles.icon} />
            </NavBtn>
          </div>
          <div className={styles.btns}>
            <NavBtn
              fn={() => {
                if (
                  !currentFixTxt?.sticker ||
                  !currentFixTxt?.nickname ||
                  !currentFixTxt?.combo
                ) {
                  alert("빠짐없이 선택 및 입력해주세요!")
                  return
                } else if (
                  Number(currentFixTxt?.amount) < 0 ||
                  Number(currentFixTxt?.combo) < 1
                ) {
                  alert("유효한 값을 입력해주세요!")
                } else {
                  setFixTxts([...fixTxts, currentFixTxt])
                  resetFixModal()
                }
              }}
              content='추가'
            />
            <NavBtn content='취소' fn={resetFixModal} />
          </div>
        </Modal.Footer>
      </Modal>

      {/* 토스트 알림들 */}
      <>
        <ToastInfo
          showSt={alertImgAllowed}
          setShowSt={setAlertImgAllowed}
          content='이미지 파일만 업로드해주세요. 가능한 확장자명 :(.jpg, .jpeg, .png, .gif, .svg)'
        />
        <ToastInfo
          showSt={showCropErr}
          setShowSt={setShowCropErr}
          content='크롭 중에 에러가 발생했습니다. 다시 시도해주세요!'
        />
        <ToastInfo
          showSt={noticeCanvasMove}
          setShowSt={setNoticeCanvasMove}
          content='캔버스를 잡아 움직여보세요:)'
        />
      </>
    </section>
  )
}

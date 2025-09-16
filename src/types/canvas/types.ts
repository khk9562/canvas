export interface Item {
  id: number
  nickname: string
  amount: number
  combo: string
  sticker: string
  txt: string
}

export interface OpenState {
  openResize: boolean
  openText: boolean
  openPictures: boolean
  openFigures: boolean
  openSpoonStickers: boolean
  openSticker: boolean
  openFix: boolean
}

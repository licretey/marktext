import { BrowserWindow } from 'electron'
import { edit } from '../../menu/actions/edit'

const getWin = () => BrowserWindow.getFocusedWindow()

export const copyAsMarkdown = () => {
  edit(getWin(), 'copyAsMarkdown')
}

export const copyAsHtml = () => {
  edit(getWin(), 'copyAsHtml')
}

export const pasteAsPlainText = () => {
  edit(getWin(), 'pasteAsPlainText')
}

export const insertParagraph = (direction) => {
  edit(getWin(), direction === 'before' ? 'createParagraph' : 'createParagraph')
}

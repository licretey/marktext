import { UNDO_DEPTH } from '../config'
import { deepCopy } from '../utils'

class History {
  constructor(contentState) {
    this.stack = []
    this.id = -1
    this.index = -1
    this.contentState = contentState
    this.pendingIndex = -1
    this.lastEditIndex = -1
    this.lastInitIndex = -1
  }

  updateFinalEditIndex() {
    for (let i = this.index; i >= 0; i--) {
      if (this.stack[i].cursor.isEdit) {
        this.lastEditIndex = i
        return
      }
    }
    this.lastEditIndex = -1
  }

  undo() {
    this.commitPending()
    if (this.index >= 0) {
      this.index = this.index - 1
      this.updateFinalEditIndex()

      const { blocks, cursor, renderRange } = this.stack[this.index]
      cursor.noHistory = true
      this.contentState.blocks = blocks
      this.contentState.renderRange = renderRange
      this.contentState.cursor = cursor
      this.contentState.clearBlockIndex()
      this.contentState.rebuildBlockIndex()
      this.contentState.markdownCacheDirty = true
      this.contentState.render()
    }
  }

  redo() {
    this.pendingIndex = -1
    const { index, stack } = this
    const len = stack.length
    if (index < len - 1) {
      this.index = index + 1
      this.updateFinalEditIndex()
      const { blocks, cursor, renderRange } = stack[this.index]
      cursor.noHistory = true
      this.contentState.blocks = blocks
      this.contentState.renderRange = renderRange
      this.contentState.cursor = cursor
      this.contentState.clearBlockIndex()
      this.contentState.rebuildBlockIndex()
      this.contentState.markdownCacheDirty = true
      this.contentState.render()
    }
  }

  push(state, isPending = false) {
    if (!isPending) this.pendingIndex = -1
    this.stack.splice(this.index + 1)
    this.id += 1
    this.stack.push(deepCopy(state))
    if (this.stack.length > UNDO_DEPTH) {
      this.stack.shift()
      this.index = this.index - 1
    }
    this.index += 1

    if (state.cursor.isInit) {
      this.lastInitIndex = this.index
    }

    this.updateFinalEditIndex()
    return this.index
  }

  pushPending(state) {
    if (this.pendingIndex === -1) {
      this.pendingIndex = this.push(state, true)
    } else {
      this.stack[this.pendingIndex] = deepCopy(state)
    }
  }

  commitPending() {
    if (this.pendingIndex !== -1) {
      this.pendingIndex = -1
    }
  }

  clearHistory() {
    this.stack = []
    this.index = -1
    this.pendingIndex = -1
    this.lastEditIndex = -1
  }
}

export default History
